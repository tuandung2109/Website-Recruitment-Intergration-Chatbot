import os
import json
import re
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))


def extract_cv_to_json_by_openai(filepath: str):
    """
    Extract and evaluate CV from a PDF file using AI
    
    Args:
        filepath: Path to the CV file
        
    Returns:
        dict: Evaluation result with intent and extracted features
    """
    from tool import extract_text_from_pdf
    from setting import Settings
    from app.chatbot.AgentKatCoder import AgentKatCoder
    from prompt.promt_config import PromptConfig
    
    print("🎯 CV Evaluation request detected")
    
    # Validate filepath
    if not filepath or not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return {
            "intent": "evaluate_cv",
            "error": "Không tìm thấy file CV. Vui lòng upload file CV trước khi yêu cầu đánh giá."
        }
    
    print(f"📄 Extracting text from: {filepath}")
    cv = extract_text_from_pdf(filepath)
    print(f"✅ Extracted {len(cv)} characters from CV")
    
    # Initialize agent with correct model
    settings = Settings.load_settings()
    agent_kat_coder = AgentKatCoder(model_name=settings.MODE_KAT_CODER)
    
    # Initialize prompt config
    prompt_config = PromptConfig()
    
    print("🤖 Generating CV evaluation with AI...")
    prompt = prompt_config.get_prompt("extract_features_cvssss", user_input=cv)
    extract_features_cv_raw = agent_kat_coder.generate_content([{"role": "user", "content": prompt}])
    print(f"✅ CV evaluation completed: {len(str(extract_features_cv_raw))} characters")
    
    # Clean and parse JSON from markdown code blocks
    # Remove markdown code blocks (```json ... ``` or ``` ... ```)
    cleaned_text = re.sub(r'```json\s*', '', extract_features_cv_raw)
    cleaned_text = re.sub(r'```\s*', '', cleaned_text)
    cleaned_text = cleaned_text.strip()
    
    try:
        # Parse JSON string to dict
        extract_features_cv = json.loads(cleaned_text)
        print(f"✅ Successfully parsed JSON with keys: {list(extract_features_cv.keys())}")
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON: {e}")
        print(f"Raw text: {cleaned_text[:200]}...")
        # Fallback: return raw text
        extract_features_cv = {
            "summary": "Lỗi phân tích CV. Vui lòng thử lại.",
            "scores": {"clarity": 0, "relevance": 0, "skills": 0, "projects": 0, "professionalism": 0, "overall": 0},
            "strengths": [],
            "weaknesses": [],
            "recommendations": [],
            "suggested_job_roles": [],
            "error": str(e)
        }
    
    result = {
        "intent": "evaluate_cv",
        "extracted_features": extract_features_cv
    }
    
    return result                
