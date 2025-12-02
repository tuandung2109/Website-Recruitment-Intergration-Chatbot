"""
Flask app for AI Recruitment System using AgentKatCoder (OpenAI)
"""
from flask import Flask, jsonify, request, render_template, send_from_directory, session
from flask_cors import CORS
import os
import sys
import time
import uuid
from datetime import datetime

# Add backend to path BEFORE importing backend modules
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from app.chatbot.AgentKatCoder import AgentKatCoder  # Using AgentKatCoder from AgentKatCoder.py
from setting import Settings
from tool.embeddings import sync_entities_embeddings
import logging

# Template folder for local development only
template_folder = '../../frontend/templates'

app = Flask(__name__, template_folder=template_folder)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# Enable CORS for all routes
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'], 
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def initialize_openai_agent():
    """Initialize OpenAI-based agent from AgentKatCoder"""
    settings = Settings.load_settings()
    
    logger.info(f"🔗 Initializing OpenAI Agent")
    logger.info(f"   Base URL: {settings.BASE_URL_OPENAI}")
    logger.info(f"   Model: {settings.MODE_KAT_CODER}")

    try:
        # Create agent instance - it uses OpenAI internally
        agent = AgentKatCoder(model_name=settings.MODE_KAT_CODER)
        
        logger.info("✅ OpenAI Agent initialized successfully")
        return agent
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize OpenAI Agent: {e}")
        raise


# Initialize the agent
try:
    openai_agent = initialize_openai_agent()
except Exception as e:
    logger.error(f"Failed to initialize agent on startup: {e}")
    openai_agent = None


def sync_embeddings_on_startup():
    """Ensure embeddings are refreshed when the app starts."""
    try:
        settings = Settings.load_settings()
        
        # Sync unified entities collection (companies + job postings)
        logger.info("Starting unified entities embedding sync...")
        summary = sync_entities_embeddings(settings=settings, collection_name="entities")
      
        logger.info(
            "Entities embedding sync completed: status=%s collection=%s companies=%s job_postings=%s upserted=%s",
            summary.get("status"),
            summary.get("collection"),
            summary.get("companies"),
            summary.get("job_postings"),
            summary.get("upserted"),
        )
        
        if summary.get("skipped_ids"):
            logger.warning(
                "Skipped %s records during sync: %s",
                summary.get("skipped_count", 0),
                summary.get("skipped_ids")[:5]  # Show first 5 skipped IDs
            )
            
    except Exception as exc:  # pragma: no cover - startup resilience
        logger.warning("Entities embedding sync failed: %s", exc)


sync_embeddings_on_startup()

# Dictionary to store chatbot instances for each user session
user_chatbots = {}

def get_session_id():
    """Get or create session ID for current user"""
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
        session['created_at'] = datetime.now().isoformat()
    return session['session_id']

def get_user_chatbot(session_id):
    """Get or create chatbot instance for specific user session"""
    if session_id not in user_chatbots:
        try:
            # Create new agent instance using AgentKatCoder (OpenAI)
            settings = Settings.load_settings()
            chatbot = AgentKatCoder(model_name=settings.MODE_KAT_CODER)

            user_chatbots[session_id] = {
                'chatbot': chatbot,
                'created_at': datetime.now(),
                'last_activity': datetime.now(),
                'filepath': ""  # Track uploaded file per session
            }
            logger.info(f"✅ Created new OpenAI-based chatbot for session: {session_id}")
        except Exception as e:
            logger.error(f"❌ Failed to create chatbot for session {session_id}: {e}")
            return None
    
    # Update last activity
    user_chatbots[session_id]['last_activity'] = datetime.now()
    return user_chatbots[session_id]['chatbot']

def cleanup_inactive_sessions():
    """Remove inactive user sessions (older than 1 hour)"""
    current_time = datetime.now()
    inactive_sessions = []
    
    for session_id, data in user_chatbots.items():
        time_diff = current_time - data['last_activity']
        if time_diff.total_seconds() > 3600:  # 1 hour
            inactive_sessions.append(session_id)
    
    for session_id in inactive_sessions:
        del user_chatbots[session_id]
        logger.info(f"🧹 Cleaned up inactive session: {session_id}")
    
    return len(inactive_sessions)


@app.route('/')
def index():
    """Serve the chat interface"""
    return render_template('chat.html')


@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "AI Recruitment Agent (OpenAI - AgentKatCoder)",
        "version": "2.0.0",  
        "timestamp": time.time(),
        "cors_enabled": True,
        "agent_type": "OpenAI"
    })


@app.route('/api/test', methods=['GET', 'POST'])
def test_endpoint():
    """Simple test endpoint for debugging connectivity"""
    return jsonify({
        "message": "Connection successful! (AgentKatCoder/OpenAI)",
        "method": request.method,
        "timestamp": time.time(),+
        "origin": request.headers.get('Origin', 'unknown')
    })


@app.route('/api/stimulate/interview', methods=['POST'])
def handleEvaluateInterview():
    """Endpoint to evaluate result after interview"""
    try:
        session_id = get_session_id()
        get_user_chatbot(session_id)
        filepath = user_chatbots[session_id].get('filepath', '')
        data = request.get_json()
        bot = get_user_chatbot(session_id)
        
        response = bot.evaluate_result_interview(answers=data, path=filepath)
        return jsonify({
                "response": response,
                "session_id": session_id,
                "status": "success",
                "agent_type": "OpenAI"
            })
        print(f"Received data: {data}")
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500
        
        

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint for recruitment conversations using AgentKatCoder (OpenAI)"""
    try:
        # Support both JSON requests and multipart/form-data uploads (PDF)
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle file upload
            user_message = request.form.get('message', '')
            mode = request.form.get('mode', 'chat')
            uploaded_file = request.files.get('file')
            job_description = request.form.get('job_description', '')

            if uploaded_file:
                # Validate file type (case-insensitive)
                filename_lower = uploaded_file.filename.lower()
                if not filename_lower.endswith('.pdf'):
                    return jsonify({
                        "error": "Only PDF files are allowed",
                        "status": "error"
                    }), 400

                # Save file temporarily
                upload_folder = os.path.join(backend_path, 'uploads')
                os.makedirs(upload_folder, exist_ok=True)

                session_id = get_session_id()
                # Ensure chatbot/session entry exists
                get_user_chatbot(session_id)

                filename = f"{session_id}_cv.pdf"
                filepath = os.path.join(upload_folder, filename)
                uploaded_file.save(filepath)
                
                # Verify file was saved correctly
                if not os.path.exists(filepath):
                    logger.error(f"❌ File was not saved correctly: {filepath}")
                    return jsonify({
                        "error": "Failed to save uploaded file",
                        "status": "error"
                    }), 500
                
                # Store file path in session data
                user_chatbots[session_id]['filepath'] = filepath
                logger.info(f"📄 File uploaded: {filename} ({os.path.getsize(filepath)} bytes)")
                logger.info(f"✅ File path stored in session: {filepath}")
                
                # Log job description if present
                if job_description:
                    logger.info(f"📋 Job Description received: {job_description[:100]}...")
                else:
                    logger.warning(f"⚠️ No Job Description received in form data")
        else:
            data = request.get_json()
            
            if not data or 'message' not in data:
                return jsonify({"error": "Message is required"}), 400
            
            user_message = data['message']
            mode = data.get('mode', 'chat')




        # Get user's session and chatbot
        session_id = get_session_id()
        bot = get_user_chatbot(session_id)
        
        if bot is None:
            return jsonify({
                "error": "Chatbot service is not available. Please check OpenAI configuration.",
                "status": "service_unavailable"
            }), 503
        
        try:
            # Generate response using chatbot
            if mode == "agent":
                logger.info("Using agent mode for response")
                filepath = user_chatbots[session_id].get('filepath', '')
                logger.info(f"📂 Filepath from session: '{filepath}'")
                logger.info(f"📝 User message: '{user_message}'")
                logger.info(f"📋 Job Description parameter: '{job_description[:100] if job_description else 'EMPTY'}'...")
                
                response = bot.chat_with_agent(user_message, filepath=filepath, job_description=job_description)
                logger.info(f"✅ Agent response type: {type(response)}")
                
                # Check if response is a dictionary (structured agent response)
                if isinstance(response, dict):
                    # Return structured response for agent mode
                    return jsonify({
                        "response": response,
                        "session_id": session_id,
                        "status": "success",
                        "mode": "agent",
                        "agent_type": "OpenAI"
                    })
            else:
                logger.info(f"💬 Using chat mode for response")
                response = bot.chat_enhance(user_message)
                logger.info(f"📤 Chat response: {response[:100]}...")  # Log first 100 chars

            # Clean response (remove thinking tags if present)
            if isinstance(response, str) and "<think>" in response:
                response = response.split("</think>")[-1].strip()
            
            # Cleanup inactive sessions periodically
            if len(user_chatbots) > 10:  # Only cleanup when we have many sessions
                cleaned = cleanup_inactive_sessions()
                if cleaned > 0:
                    logger.info(f"🧹 Cleaned up {cleaned} inactive sessions")
            
            return jsonify({
                "response": response,
                "session_id": session_id,
                "status": "success",
                "mode": mode,
                "agent_type": "OpenAI"
            })
            
        except Exception as llm_error:
            logger.error(f"❌ Chatbot error: {llm_error}")
            
            # Check if it's an OpenAI API error
            error_msg = str(llm_error).lower()
            if "api" in error_msg or "authentication" in error_msg or "api key" in error_msg:
                return jsonify({
                    "error": "OpenAI API error. Please check API configuration.",
                    "status": "api_error",
                    "suggestion": "Verify API key and base URL in settings",
                    "technical_details": str(llm_error)
                }), 503
            else:
                return jsonify({
                    "error": f"Chatbot processing error: {str(llm_error)}",
                    "status": "processing_error"
                }), 500
        
    except Exception as e:
        logger.error(f"❌ Chat endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    """Get conversation history for current user session"""
    try:
        session_id = get_session_id()
        bot = get_user_chatbot(session_id)
        
        if bot is None:
            return jsonify({
                "error": "Chatbot service is not available",
                "status": "service_unavailable"
            }), 503
        
        history = bot.get_history()
        return jsonify({
            "history": history,
            "total_messages": len(history),
            "session_id": session_id,
            "status": "success",
            "agent_type": "OpenAI"
        })
        
    except Exception as e:
        logger.error(f"❌ History endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


@app.route('/api/chat/clear', methods=['POST'])
def clear_chat_history():
    """Clear conversation history for current user session"""
    try:
        session_id = get_session_id()
        bot = get_user_chatbot(session_id)
        
        if bot is None:
            return jsonify({
                "error": "Chatbot service is not available",
                "status": "service_unavailable"
            }), 503
        
        bot.clear_history()
        # Re-add system message
        bot.add_system_message(
            "Bạn là một trợ lý thân thiện trong lĩnh vực tuyển dụng. "
            "Hãy giúp đỡ ứng viên về việc làm, phỏng vấn và tư vấn nghề nghiệp. "
            "Trả lời ngắn gọn và hữu ích."
        )
        
        return jsonify({
            "message": "Conversation history cleared",
            "session_id": session_id,
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"❌ Clear history endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


@app.route('/api/sessions', methods=['GET'])
def get_sessions_info():
    """Get information about active sessions (admin endpoint)"""
    try:
        # Cleanup inactive sessions first
        cleaned_up = cleanup_inactive_sessions()
        
        sessions_info = []
        for session_id, data in user_chatbots.items():
            history_length = len(data['chatbot'].get_history())
            sessions_info.append({
                "session_id": session_id[:8] + "...",  # Truncate for privacy
                "created_at": data['created_at'].isoformat(),
                "last_activity": data['last_activity'].isoformat(),
                "history_length": history_length
            })
        
        return jsonify({
            "active_sessions": len(user_chatbots),
            "cleaned_up_sessions": cleaned_up,
            "sessions": sessions_info,
            "status": "success",
            "agent_type": "OpenAI"
        })
        
    except Exception as e:
        logger.error(f"❌ Sessions info endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


@app.route('/api/session/info', methods=['GET'])
def get_current_session_info():
    """Get current user's session information"""
    try:
        session_id = get_session_id()
        
        if session_id in user_chatbots:
            data = user_chatbots[session_id]
            history_length = len(data['chatbot'].get_history())
            
            return jsonify({
                "session_id": session_id,
                "created_at": data['created_at'].isoformat(),
                "last_activity": data['last_activity'].isoformat(),
                "history_length": history_length,
                "status": "active",
                "agent_type": "OpenAI"
            })
        else:
            return jsonify({
                "session_id": session_id,
                "status": "new",
                "message": "No chatbot instance created yet"
            })
            
    except Exception as e:
        logger.error(f"❌ Session info endpoint error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500


@app.route('/api/models', methods=['GET'])
def list_models():
    """Get current OpenAI model information"""
    try:
        settings = Settings.load_settings()
        
        return jsonify({
            "current_model": settings.MODE_KAT_CODER,
            "base_url": settings.BASE_URL_OPENAI,
            "status": "available",
            "agent_type": "OpenAI",
            "timestamp": time.time()
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Failed to get model info: {str(e)}",
            "status": "error"
        }), 500


@app.route('/api/health/openai', methods=['GET'])
def openai_health():
    """Check OpenAI service health"""
    try:
        settings = Settings.load_settings()
        
        # Test basic connectivity with a simple request
        start_time = time.time()
        
        try:
            # Try to create a simple test message
            from openai import OpenAI
            client = OpenAI(
                base_url=settings.BASE_URL_OPENAI,
                api_key=settings.API_KEY_OPENAI
            )
            
            # Simple test request
            test_response = client.chat.completions.create(
                model=settings.MODE_KAT_CODER,
                messages=[{"role": "user", "content": "test"}],
                max_tokens=5
            )
            
            response_time = time.time() - start_time
            
            return jsonify({
                "status": "healthy",
                "base_url": settings.BASE_URL_OPENAI,
                "model": settings.MODE_KAT_CODER,
                "response_time_seconds": response_time,
                "test_success": True,
                "timestamp": time.time()
            })
            
        except Exception as e:
            response_time = time.time() - start_time
            return jsonify({
                "status": "unhealthy",
                "error": str(e),
                "base_url": settings.BASE_URL_OPENAI,
                "model": settings.MODE_KAT_CODER,
                "response_time_seconds": response_time,
                "test_success": False,
                "timestamp": time.time()
            }), 503
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }), 503


@app.route('/api/embeddings/sync', methods=['POST'])
def sync_embeddings():
    """Manually trigger embeddings sync to Qdrant"""
    try:
        settings = Settings.load_settings()
        
        # Get optional parameters from request
        data = request.json or {}
        collection_name = data.get('collection_name', 'entities')
        batch_size = data.get('batch_size', 64)
        limit = data.get('limit', None)
        
        logger.info(f"📊 Manual embedding sync triggered for collection '{collection_name}'")
        
        # Sync unified entities collection
        summary = sync_entities_embeddings(
            settings=settings,
            collection_name=collection_name,
            batch_size=batch_size,
            limit=limit
        )
        
        return jsonify({
            "status": "success",
            "message": "Embeddings synced successfully",
            "sync_summary": summary,
            "timestamp": time.time()
        })
        
    except Exception as e:
        logger.error(f"❌ Embedding sync failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        }), 500


@app.route('/api/embeddings/status', methods=['GET'])
def embeddings_status():
    """Get status of embeddings in Qdrant"""
    try:
        from tool.database import QDrant
        
        settings = Settings.load_settings()
        qdrant = QDrant(Settings=settings)
        qdrant_client = qdrant.get_client()
        
        collection_name = request.args.get('collection_name', 'entities')
        
        try:
            collection_info = qdrant_client.get_collection(collection_name=collection_name)
            
            # Get collection statistics
            points_count = collection_info.points_count
            vectors_config = collection_info.config.params.vectors
            
            if isinstance(vectors_config, dict):
                vector_size = vectors_config.get('size')
                distance = vectors_config.get('distance')
            else:
                vector_size = getattr(vectors_config, 'size', None)
                distance = getattr(vectors_config, 'distance', None)
            
            # Count entities by type
            company_count = qdrant_client.count(
                collection_name=collection_name,
                count_filter={
                    "must": [
                        {"key": "entity_type", "match": {"value": "company"}}
                    ]
                }
            ).count
            
            job_posting_count = qdrant_client.count(
                collection_name=collection_name,
                count_filter={
                    "must": [
                        {"key": "entity_type", "match": {"value": "job_posting"}}
                    ]
                }
            ).count
            
            return jsonify({
                "status": "success",
                "collection": collection_name,
                "total_points": points_count,
                "companies": company_count,
                "job_postings": job_posting_count,
                "vector_size": vector_size,
                "distance_metric": str(distance),
                "timestamp": time.time()
            })
            
        except Exception as e:
            return jsonify({
                "status": "not_found",
                "collection": collection_name,
                "error": f"Collection not found or error accessing: {str(e)}",
                "timestamp": time.time()
            }), 404
    except Exception as e:
        logger.error(f"❌ Failed to get embeddings status: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        }), 500


@app.route('/api/cache/status', methods=['GET'])
def cache_status():
    """Get cache status and statistics for AgentKatCoder"""
    try:
        manager_info = {
            "active_sessions": len(user_chatbots),
            "sessions": []
        }
        
        for session_id, data in user_chatbots.items():
            history_length = len(data['chatbot'].get_history())
            manager_info["sessions"].append({
                "session_id": session_id[:8] + "...",
                "history_length": history_length,
                "has_file": bool(data.get('filepath'))
            })
        
        return jsonify({
            "status": "success",
            "cache_info": manager_info,
            "agent_type": "OpenAI",
            "timestamp": time.time()
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        }), 500


@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all caches for AgentKatCoder"""
    try:
        # Optional: Clear user chatbots
        clear_sessions = request.json.get('clear_sessions', False) if request.json else False
        if clear_sessions:
            user_chatbots.clear()
            logger.info("🧹 Cleared user chatbot sessions")
        
        return jsonify({
            "status": "success",
            "message": "Cache cleared successfully",
            "cleared_sessions": clear_sessions,
            "agent_type": "OpenAI",
            "timestamp": time.time()
        })
        
    except Exception as e:
        return jsonify({
            "status": "error", 
            "error": str(e),
            "timestamp": time.time()
        }), 500


@app.route('/api/reflection/test', methods=['POST'])
def test_reflection():
    """Test reflection functionality (both Ollama and OpenAI versions)"""
    try:
        data = request.get_json() or {}
        history = data.get('history', [
            {"role": "user", "content": "Tìm việc ở Hà Nội"},
            {"role": "assistant", "content": "Bạn muốn tìm công việc gì ở Hà Nội?"},
            {"role": "user", "content": "Developer"}
        ])
        use_openai = data.get('use_openai', True)  # Default to OpenAI
        
        if use_openai:
            from MCP import get_reflection_openai
            logger.info("🔄 Testing OpenAI reflection...")
            result = get_reflection_openai(history)
            reflection_type = "OpenAI"
        else:
            from MCP import get_reflection
            logger.info("🔄 Testing Ollama reflection...")
            result = get_reflection(history)
            reflection_type = "Ollama"
        
        return jsonify({
            "status": "success",
            "reflection_type": reflection_type,
            "original_history": history,
            "reflected_query": result,
            "timestamp": time.time()
        })
        
    except Exception as e:
        logger.error(f"❌ Reflection test failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": time.time()
        }), 500
        
@app.route('/api/evaluate/jd', methods=['POST'])
def evaluate_job_description():
    """Evaluate job description quality using AgentKatCoder"""
    try:
        data = request.get_json()
        
        if not data or 'job_id' not in data:
            return jsonify({
                "error": "job_id is required",
                "status": "error"
            }), 400
        
        job_id = data['job_id']
        
        # Validate job_id is a valid integer
        try:
            job_id = int(job_id)
        except (ValueError, TypeError):
            return jsonify({
                "error": "job_id must be a valid integer",
                "status": "error"
            }), 400
        
        logger.info(f"📋 Evaluating job description for ID: {job_id}")
        
        # Import AgentKatCoder
        from app.chatbot.AgentKatCoder import AgentKatCoder
        
        # Create AgentKatCoder instance
        settings = Settings.load_settings()
        agent = AgentKatCoder(model_name=settings.MODE_KAT_CODER)
        
        # Call evaluate_job_description method
        evaluation_result = agent.evaluate_job_description(job_id)
        
        # Check if evaluation was successful
        if evaluation_result and not (isinstance(evaluation_result, str) and evaluation_result.startswith("Error")):
            return jsonify({
                "status": "success",
                "job_id": job_id,
                "evaluation": evaluation_result,
                "timestamp": time.time()
            })
        else:
            return jsonify({
                "status": "error",
                "job_id": job_id,
                "error": evaluation_result or "Failed to evaluate job description",
                "timestamp": time.time()
            }), 500
        
    except Exception as e:
        logger.error(f"Job description evaluation error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "timestamp": time.time()
        }), 500


@app.route('/api/evaluate/cv-features', methods=['POST'])
def evaluate_cv_based_on_features():
    """Evaluate CV based on extracted features and job description using AgentKatCoder"""
    try:
        data = request.get_json()
        
        # Validate required parameters (cv_id is now optional)
        required_fields = ['account_id', 'job_posting_id', 'job_application_id']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}",
                "status": "error"
            }), 400
        
        # Extract and validate parameters
        try:
            account_id = int(data['account_id'])
            job_posting_id = int(data['job_posting_id'])
            job_application_id = int(data['job_application_id'])
            
            # cv_id is optional - can be None or omitted
            cv_id = None
            if 'cv_id' in data and data['cv_id'] is not None:
                cv_id = int(data['cv_id'])
                
        except (ValueError, TypeError) as e:
            return jsonify({
                "error": "Parameters must be valid integers",
                "status": "error",
                "details": str(e)
            }), 400
        
        logger.info(f"🔍 Evaluating CV based on features - Account: {account_id}, Job: {job_posting_id}, CV: {cv_id}, Application: {job_application_id}")
        
        # Import AgentKatCoder
        from app.chatbot.AgentKatCoder import AgentKatCoder
        
        # Create AgentKatCoder instance
        settings = Settings.load_settings()
        agent = AgentKatCoder(model_name=settings.MODE_KAT_CODER)
        
        # Call handle_ai_evaluation_based_on_features method
        evaluation_result = agent.handle_ai_evaluation_based_on_features(
            p_account_id=account_id,
            p_job_posting_id=job_posting_id,
            p_cv_id=cv_id,
            job_application_id=job_application_id
        )
        
        # Check if evaluation was successful
        if evaluation_result and not (isinstance(evaluation_result, str) and evaluation_result.startswith("Error")):
            response_data = {
                "status": "success",
                "account_id": account_id,
                "job_posting_id": job_posting_id,
                "job_application_id": job_application_id,
                "evaluation": evaluation_result,
                "timestamp": time.time()
            }
            
            # Only include cv_id in response if it was provided
            if cv_id is not None:
                response_data["cv_id"] = cv_id
                
            return jsonify(response_data)
        else:
            return jsonify({
                "status": "error",
                "error": evaluation_result or "Failed to evaluate CV based on features",
                "timestamp": time.time()
            }), 500
        
    except Exception as e:
        logger.error(f"❌ CV evaluation based on features error: {e}")
        return jsonify({
            "error": str(e),
            "status": "error",
            "timestamp": time.time()
        }), 500


@app.route('/api/evaluate/cv-jd-match', methods=['POST'])
def evaluate_cv_jd_match():
    """Evaluate CV against Job Description with similarity scores and detailed analysis"""
    try:
        # Check if file is present
        if 'cv_file' not in request.files:
            return jsonify({
                "error": "No CV file provided",
                "status": "error"
            }), 400
        
        cv_file = request.files['cv_file']
        job_description = request.form.get('job_description', '')
        job_title = request.form.get('job_title', '')
        
        if not cv_file.filename:
            return jsonify({
                "error": "No file selected",
                "status": "error"
            }), 400
        
        if not job_description:
            return jsonify({
                "error": "Job description is required",
                "status": "error"
            }), 400
        
        # Validate file type
        allowed_extensions = {'pdf'}
        if not cv_file.filename.lower().endswith('.pdf'):
            return jsonify({
                "error": "Only PDF files are allowed",
                "status": "error"
            }), 400
        
        # Save uploaded file temporarily
        upload_folder = os.path.join(backend_path, 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = cv_file.filename.rsplit('.', 1)[1].lower()
        temp_filename = f"{file_id}.{file_extension}"
        temp_filepath = os.path.join(upload_folder, temp_filename)
        
        cv_file.save(temp_filepath)
        logger.info(f"📄 CV file saved temporarily: {temp_filepath}")
        
        try:
            # Import AgentKatCoder
            from app.chatbot.AgentKatCoder import AgentKatCoder
            
            # Create AgentKatCoder instance
            settings = Settings.load_settings()
            agent = AgentKatCoder(model_name=settings.MODE_KAT_CODER)
            
            # Call extract_features_cv_and_jd method
            logger.info(f"🔍 Analyzing CV against job description...")
            result = agent.extract_features_cv_and_jd(temp_filepath, job_description)
            
            # Check if result is an error string
            if isinstance(result, str) and result.startswith("Error"):
                return jsonify({
                    "status": "error",
                    "error": result,
                    "timestamp": time.time()
                }), 500
            
            # Transform the result to match the frontend expected format
            similarity_scores = result.get('similarity_scores', {})
            evaluation = result.get('evaluation', {})
            
            # Convert similarity scores (0-1 range) to 0-10 scale for frontend
            frontend_response = {
                "status": "success",
                "job_title": job_title or evaluation.get('job_title', 'Job Position'),
                "skill": round(similarity_scores.get('skills', 0) * 10, 1),
                "education": round(similarity_scores.get('education', 0) * 10, 1),
                "position": round(similarity_scores.get('positions', 0) * 10, 1),
                "experiences": round(similarity_scores.get('experience', 0) * 10, 1),
                "general": round(similarity_scores.get('general', 0) * 10, 1),
                "weak": evaluation.get('weak', ''),
                "strong": evaluation.get('strong', ''),
                "interview_question": evaluation.get('interview_question', ''),
                "detail_analysis": evaluation.get('detail_analysis', ''),
                "created_at": evaluation.get('created_at', datetime.utcnow().isoformat() + 'Z'),
                "skill_matches": evaluation.get('skill_matches', []),
                "raw_similarity_scores": similarity_scores,  # Keep original scores for reference
                "extracted_features": result.get('extracted_features', {}),
                "timestamp": time.time()
            }
            
            logger.info(f"✅ CV evaluation completed successfully")
            return jsonify(frontend_response)
            
        finally:
            # Clean up temporary file
            try:
                if os.path.exists(temp_filepath):
                    os.remove(temp_filepath)
                    logger.info(f"🗑️  Temporary file removed: {temp_filepath}")
            except Exception as cleanup_error:
                logger.warning(f"⚠️  Failed to remove temporary file: {cleanup_error}")
        
    except Exception as e:
        logger.error(f"❌ CV-JD match evaluation error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "status": "error",
            "timestamp": time.time()
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))  # Use different port (5001) to avoid conflict
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"🚀 Starting AI Recruitment Agent (OpenAI/AgentKatCoder) on port {port}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
