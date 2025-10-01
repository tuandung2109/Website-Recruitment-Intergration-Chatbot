
import os
import logging
from typing import List, Dict, Union, Callable, Any, Optional
from .base import BaseChatbot
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from llms.llm_manager import llm_manager
from llms.tools import list_available_tools
from MCP.server import server, intent_classification, enhance_question, get_reflection
from prompt.promt_config import PromptConfig
from tool.extract_feature_question_about_jd import ExtractFeatureQuestion

class ChatbotOllama(BaseChatbot):
    def __init__(self, model_name: str = "", **kwargs):
        super().__init__(model_name=model_name, **kwargs)
        
        default_url = "http://host.docker.internal:11434" if os.getenv("DOCKER_ENV") == "true" else "http://localhost:11434"
        ollama_url = os.getenv("OLLAMA_URL", default_url)
        ollama_model = os.getenv("OLLAMA_MODEL", "")
        
        logging.info(f"Initializing Ollama client with URL: {ollama_url}, Model: {ollama_model}")
        
        # Sử dụng LLM Manager để tránh tạo multiple instances
        self.client = llm_manager.get_ollama_client(
            base_url=ollama_url,
            model_name=ollama_model
        )
        
        # Initialize the feature extractor (chỉ tạo khi cần)
        self._feature_extractor = None
        self._ollama_model = ollama_model
        
        # Initialize prompt config
        self.prompt_config = PromptConfig()
    
    @property
    def feature_extractor(self):
        """Lazy loading cho feature extractor"""
        if self._feature_extractor is None:
            self._feature_extractor = ExtractFeatureQuestion(model_name=self._ollama_model)
        return self._feature_extractor
    
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
    

    def chat(self, message: str, include_history: bool = True) -> str:
        self.add_user_message(message)
        
        # Prepare messages for Ollama API
        if include_history:
            messages = self.conversation_history.copy()
        else:
            messages = [{"role": "user", "content": message}]
        
        try:
            

            summarise_convervation = get_reflection(messages)
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
                try:
                    # Extract job features from the user's message
                    extracted_features = self.feature_extractor.extract(
                        query=summarise_convervation,
                        prompt_type="extract_features_question_about_job"
                    )
                    
                    if extracted_features:
                        # Process the extracted features and generate response
                        features_text = self._format_extracted_features(extracted_features)
                        assistant_response = f"Tôi đã hiểu yêu cầu của bạn:\n{features_text}\n\nTôi sẽ tìm kiếm các công việc phù hợp cho bạn."
                        self.add_assistant_message(assistant_response)
                        return assistant_response
                    else:
                        # Fallback if no features extracted
                        incomplete_prompt = self.prompt_config.get_prompt("recruitment_incomplete", user_input=summarise_convervation)
                        assistant_response = self._strip_think(self.client.generate_content([{"role": "user", "content": incomplete_prompt}]))
                        self.add_assistant_message(assistant_response)
                        return assistant_response
                        
                except Exception as extraction_error:
                    logging.error(f"Error in feature extraction: {str(extraction_error)}")
                    # Fallback to normal generation
                    assistant_response = self._strip_think(self.client.generate_content(messages))
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
                assistant_response = "Bạn muốn tìm hiểu thông tin về công ty nào? Hãy cho tôi biết tên công ty và tôi sẽ cung cấp thông tin chi tiết."
                self.add_assistant_message(self._strip_think(assistant_response))
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