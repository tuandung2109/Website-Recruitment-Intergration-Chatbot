
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
    
    
    def chat_with_agent(self, message: str) -> str:
        try:
            # Handle CV evaluation request with hardcoded data (for testing)
            if message == "Đánh giá CV cho tôi":
                print("🎯 CV Evaluation request detected - returning hardcoded data")
                time.sleep(2)  # Simulate processing time
                
                extract_features_cv = {
                    "summary": "Nguyễn Thế Thành là một sinh viên ngành Công nghệ Phần mềm tại Đại học Mở Hà Nội, có định hướng rõ ràng trở thành Game Developer với nền tảng kỹ thuật tốt trong Unity, C# và các công cụ phát triển game. Anh có kinh nghiệm thực tế qua nhiều dự án cá nhân sử dụng các mẫu thiết kế và công nghệ hiện đại như UI Toolkit, MVC, Object Pooling, State Machine, đồng thời thể hiện sự đa dạng khi tham gia cả lĩnh vực AI với dự án xử lý ngôn ngữ tự nhiên. Tuy nhiên, CV còn thiếu cấu trúc chuyên nghiệp và chi tiết cụ thể về đóng góp cá nhân trong từng dự án.",
                    "scores": {
                        "clarity": 5,
                        "relevance": 7,
                        "skills": 7,
                        "projects": 7,
                        "professionalism": 5,
                        "overall": 6
                    },
                    "strengths": [
                        "Có mục tiêu nghề nghiệp rõ ràng và thể hiện đam mê với phát triển game",
                        "Kỹ năng công nghệ đa dạng: thành thạo Unity 3D/2D, C#, các design pattern (MVC, State Machine, Object Pooling)",
                        "Thực hành tốt với nhiều dự án cá nhân: từ game 2D/3D đến ứng dụng AI sử dụng ML.NET",
                        "Sử dụng các công cụ chuyên nghiệp: Git, Firebase, Google AdMob SDK, DOTween, UI Toolkit",
                        "Có kiến thức nền tảng về cả web (Blazor, HTML, CSS, JS) và mobile (Kotlin)",
                        "Từng nhận học bổng và giải thưởng học thuật, cho thấy tinh thần học hỏi và năng lực",
                        "Thể hiện tư duy kỹ thuật qua việc áp dụng OOP, SOLID, Design Patterns"
                    ],
                    "weaknesses": [
                        "CV thiếu cấu trúc rõ ràng, trình bày lộn xộn, không theo chuẩn nghề nghiệp",
                        "Thiếu thông tin chi tiết về vai trò, trách nhiệm và kết quả cụ thể trong từng dự án",
                        "Không có kinh nghiệm làm việc nhóm, thực tập hay đóng góp cộng đồng (như GitHub hoạt động thực sự)",
                        "Thiếu phần kỹ năng mềm (giao tiếp, làm việc nhóm, tiếng Anh...)",
                        "Liên kết demo và GitHub đều ghi là 'Link' – không có link thực tế, làm giảm độ tin cậy",
                        "Thiếu thông tin ngôn ngữ (tiếng Anh trình độ gì?), sở thích, hoặc hoạt động ngoại khóa",
                        "Không có phần chứng chỉ hoặc khóa học bổ trợ"
                    ],
                    "recommendations": [
                        "Tái cấu trúc CV theo thứ tự chuẩn: Thông tin cá nhân → Mục tiêu nghề nghiệp → Kỹ năng → Dự án → Học vấn → Giải thưởng",
                        "Thay thế các 'Link' bằng liên kết thật tới GitHub và demo game để tăng độ tin cậy",
                        "Bổ sung mô tả chi tiết vai trò, trách nhiệm, công nghệ sử dụng và kết quả đạt được trong từng dự án (ví dụ: 'Tự phát triển toàn bộ gameplay và UI, tối ưu hiệu năng bằng Object Pooling, giảm 40% lag khi spawn zombie')",
                        "Thêm phần kỹ năng mềm và trình độ ngoại ngữ",
                        "Ghi rõ thời gian chính xác (ngày bắt đầu/kết thúc) cho từng dự án",
                        "Cân nhắc tham gia thực tập hoặc đóng góp open-source để tăng kinh nghiệm làm việc nhóm",
                        "Tạo portfolio cá nhân hoặc trang web giới thiệu dự án để gây ấn tượng với nhà tuyển dụng"
                    ],
                    "suggested_job_roles": [
                        "Unity Game Developer (Intern/Junior)",
                        "Gameplay Programmer",
                        "Mobile Game Developer (Unity)",
                        "Junior Software Developer (C#/.NET)",
                        "AI Developer (ML.NET, NLP - entry level)",
                        "Full-stack Developer (nếu phát triển thêm web)"
                    ]
                }
                
                result = {
                    "intent": "evaluate_cv",
                    "extracted_features": extract_features_cv
                }
                
                print(f"✅ Returning CV evaluation result: {result}")
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