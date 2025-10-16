
import os
import logging
import time
from unittest import result
from .base import BaseAI
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from setting import Settings
from llms.llm_manager import llm_manager
from prompt.promt_config import PromptConfig
from MCP import get_reflection, retrive_infor_company, retrive_infor_job_posting
from app.chatbot.AgentKatCoder import AgentKatCoder


class AgentOllama(BaseAI):
    def __init__(self, model_name: str = "", **kwargs):
        settings = Settings.load_settings()
        resolved_model = model_name or settings.OLLAMA_MODEL

        super().__init__(model_name=resolved_model, **kwargs)

        # Always use localhost - no Docker support
        default_url = "http://localhost:11434"
        ollama_url = os.getenv("OLLAMA_URL") or settings.OLLAMA_BASE_URL or default_url
        
        logging.info(f"🔗 Connecting to Ollama at: {ollama_url}")

        # Sử dụng LLM Manager để tránh tạo multiple instances
        self.client = llm_manager.get_ollama_client(
            base_url=ollama_url,
            model_name=resolved_model
        )
        
        # Initialize the feature extractor (chỉ tạo khi cần)
        self._feature_extractor = None
        self._ollama_model = resolved_model
        
        # Initialize prompt config
        self.prompt_config = PromptConfig()

    
    def _strip_think(self, text: str) -> str:
        """Remove <think>...</think> sections and trim whitespace."""
        if not text:
            return text
        # Support nested or multiple occurrences
        import re
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
        return cleaned.strip()

    def add_assistant_message(self, message: str):  # override to clean
        super().add_assistant_message(self._strip_think(message))
        
   


    def chat_with_agent(self, message: str, **kwargs) -> str:
        try:
            # Handle CV evaluation request
            if message == "Đánh giá CV cho tôi":
                from tool.extract_cv_to_json import extract_cv_to_json_by_openai
                
                # Get filepath from kwargs
                filepath = kwargs.get('filepath', '')
                
                # Call the function with filepath
                result = extract_cv_to_json_by_openai(filepath)
                
                # Check if there was an error
                if "error" in result:
                    print(f"❌ Error in CV evaluation: {result['error']}")
                    return result
                
                print(f"✅ Returning CV evaluation result")
                return result
            elif message == "Lựa chọn công việc phù hợp dựa trên CV":
                from tool.ner_extract_skills import get_similarity_job_by_skills
                
                # Get filepath from kwargs
                filepath = kwargs.get('filepath', '')
                
                # Call the function with filepath
                result = get_similarity_job_by_skills(filepath, use_kat_coder=False)
                
                # Check if there was an error
                if "error" in result:
                    print(f"❌ Error in job suggestion: {result['error']}")
                    return result
                
                print(f"✅ Returning job suggestion result")
                return result
            
            # Continue with normal agent flow for other messages
            classification_prompt = self.prompt_config.get_prompt("classification_agent_intent", user_input=message)
            intent = self._strip_think(self.client.generate_content([{"role": "user", "content": classification_prompt}]))
            print(f"Intent classified as: {intent}")
  
            if intent == "intent_jd":
                extracted_features_prompt = self.prompt_config.get_prompt("extract_feature_question_about_jd", user_input=message)
                extracted_features = self._strip_think(self.client.generate_content([{"role": "user", "content": extracted_features_prompt}]))
                result = {
                    "intent": intent,
                    "extracted_features": extracted_features
                }
                print(f"Extracted features: {extracted_features}")
                return result  # Return as dict - Flask will handle JSON serialization
            elif intent == "intent_company_info":
                company_info_prompt = self.prompt_config.get_prompt("extract_feature_question_about_company", user_input=message)
                company_info = self._strip_think(self.client.generate_content([{"role": "user", "content": company_info_prompt}]))
                result = {
                    "intent": intent,
                    "extracted_features": company_info
                }
                print(f"Extracted company info: {company_info}")
                return result  # Return as dict - Flask will handle JSON serialization
            elif intent in ["intent_login", "intent_register", "intent_forgot-password", "intent_applications"]:
                # For these intents, just return the chat response
                result = {
                    "intent": intent,
                }
                return result
            else:
                # Fallback for unhandled intents
                print(f"⚠️ Unhandled intent: {intent}")
                return {
                    "intent": "unknown",
                    "message": "Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Vui lòng thử lại."
                }
                
        except ConnectionError as e:
            error_msg = f"Cannot connect to Ollama server. Please ensure Ollama is running at {self.client.base_url}"
            logging.error(f"{error_msg}: {str(e)}")
            return error_msg
        except TimeoutError as e:
            error_msg = f"Connection to Ollama server timed out. Please check your network and Ollama service."
            logging.error(f"{error_msg}: {str(e)}")
            return error_msg
        except Exception as e:
            error_msg = f"Error communicating with Ollama: {str(e)}"
            logging.error(error_msg)
            return error_msg


    def chat(self, message: str, include_history: bool = True) -> str:
        self.add_user_message(message)
        
        # Prepare messages for Ollama API
        if include_history:
            messages = self.conversation_history.copy()
        else:
            messages = [{"role": "user", "content": message}]
        
        try:
            

            summarise_convervation = get_reflection(messages)
            self.clear_conversation_state()  # Clear state before processing new message
            self.add_user_message(summarise_convervation)  # Add summarized message to history
            classification_prompt = self.prompt_config.get_prompt("classification_chat_intent", user_input=summarise_convervation)
            intent = self._strip_think(self.client.generate_content([{"role": "user", "content": classification_prompt}]))
            print(f"Intent classified as: {intent}")
            
            if intent == "intent_chitchat":
                chitchat_prompt = self.prompt_config.get_prompt("intent_chitchat", user_input=summarise_convervation)
                assistant_response = self._strip_think(self.client.generate_content([{"role": "user", "content": chitchat_prompt}]))
                self.add_assistant_message(assistant_response)
                return assistant_response
                
            elif intent == "intent_incomplete_recruitment_question":
                incomplete_prompt = self.prompt_config.get_prompt("recruitment_incomplete", user_input=summarise_convervation)
                assistant_response = self._strip_think(self.client.generate_content([{"role": "user", "content": incomplete_prompt}]))
                self.add_assistant_message(assistant_response)
                return assistant_response
                
            elif intent == "intent_jd":
                data_job_posting = retrive_infor_job_posting(summarise_convervation)
                promt_job_posting = self.prompt_config.get_prompt("intent_jd", user_input=summarise_convervation, data = data_job_posting)
                assistant_response = self._strip_think(self.client.generate_content([{"role": "user", "content": promt_job_posting}]))
                self.add_assistant_message(assistant_response)
                return assistant_response
                
            elif intent == "intent_review_cv":
                # Handle CV review requests
                assistant_response = "Để review CV của bạn, hãy upload file CV hoặc paste nội dung CV vào chat. Tôi sẽ phân tích và đưa ra những lời khuyên cụ thể."
                self.add_assistant_message(self._strip_think(assistant_response))
                return assistant_response
                
            elif intent == "intent_suggest_job":
                # Handle job suggestion requests based on CV
                assistant_response = "Để gợi ý công việc phù hợp, tôi cần thông tin về CV của bạn. Hãy chia sẻ CV hoặc mô tả kỹ năng, kinh nghiệm của bạn."
                self.add_assistant_message(self._strip_think(assistant_response))
                return assistant_response
                
            elif intent == "intent_candidate":
                # Handle candidate search requests (for employers)
                assistant_response = "Tôi sẽ giúp bạn tìm kiếm ứng viên phù hợp. Hãy mô tả rõ yêu cầu vị trí công việc, kỹ năng cần thiết và kinh nghiệm mong muốn."
                self.add_assistant_message(self._strip_think(assistant_response))
                return assistant_response
                
            elif intent == "intent_company_info":
                # Handle company information requests
                data_company = retrive_infor_company(summarise_convervation)
                prompt_company = self.prompt_config.get_prompt("intent_company_info", user_input=summarise_convervation, data = data_company)
                assistant_response = self._strip_think(self.client.generate_content([{"role": "user", "content": prompt_company}]))
                self.add_assistant_message(assistant_response)
                return assistant_response
                
            elif intent == "intent_guide":
                # Handle website usage guide requests
                assistant_response = "Tôi có thể hướng dẫn bạn sử dụng website tuyển dụng. Bạn cần hỗ trợ về vấn đề gì? (Đăng ký tài khoản, tìm kiếm việc làm, đăng tin tuyển dụng, etc.)"
                self.add_assistant_message(self._strip_think(assistant_response))
                return assistant_response
                
            elif intent == "intent_feedback":
                # Handle feedback collection
                assistant_response = "Cảm ơn bạn muốn đóng góp ý kiến! Hãy chia sẻ phản hồi của bạn về trải nghiệm sử dụng website và dịch vụ của chúng tôi."
                self.add_assistant_message(self._strip_think(assistant_response))
                return assistant_response
            
            # Default fallback
            assistant_response = self._strip_think(self.client.generate_content(messages))
            self.add_assistant_message(assistant_response)
            return assistant_response
            
        except Exception as e:
            error_msg = f"Error communicating with Ollama: {str(e)}"
            self.add_assistant_message(error_msg)
            return error_msg
        
    

    def _format_extracted_features(self, features: dict) -> str:
        """Format extracted features for user display"""
        formatted_parts = []
        
        if "title" in features:
            formatted_parts.append(f"• Vị trí: {features['title']}")
        
        if "company" in features:
            formatted_parts.append(f"• Công ty: {features['company']}")
            
        if "location" in features:
            formatted_parts.append(f"• Địa điểm: {features['location']}")
            
        if "skills" in features:
            formatted_parts.append(f"• Kỹ năng: {features['skills']}")
            
        if "experience" in features:
            formatted_parts.append(f"• Kinh nghiệm: {features['experience']}")
            
        if "description" in features:
            formatted_parts.append(f"• Mô tả: {features['description']}")
        
        return "\n".join(formatted_parts) if formatted_parts else "Thông tin yêu cầu tuyển dụng của bạn"

    def classify_intent(self, message: str) -> str:
        """
        Classify the intent of a user message using the LLM
        
        Args:
            message: The user message to classify
            
        Returns:
            The classified intent as a string
        """
        try:
            # Use the LLM to classify the intent
            classification_prompt = self.prompt_config.get_prompt("classification_chat_intent", user_input=message)
            intent = self._strip_think(self.client.generate_content([{"role": "user", "content": classification_prompt}]))
            return intent.strip()
        except Exception as e:
            logging.error(f"Error in intent classification: {str(e)}")
            # Return a default intent in case of error
            return "intent_chitchat"