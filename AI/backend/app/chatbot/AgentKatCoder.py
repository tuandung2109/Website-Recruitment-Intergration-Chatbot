
import os
import logging
from unittest import result
import re
import json

from .base import BaseAI
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from setting import Settings
from llms.llm_manager import llm_manager
from prompt.promt_config import PromptConfig
from MCP import get_reflection, get_reflection_openai, retrive_infor_company, retrive_infor_job_posting, retrive_information_relative
from tool import download_and_extract_pdf
from openai import OpenAI

class AgentKatCoder(BaseAI):
    def __init__(self, model_name: str = "", **kwargs):
        self.settings = Settings.load_settings()
        resolved_model = model_name or self.settings.MODE_KAT_CODER

        super().__init__(model_name=resolved_model, **kwargs)
        
        self.client = OpenAI(
            base_url=self.settings.BASE_URL_OPENAI,
            api_key=self.settings.API_KEY_OPENAI
        )

        self.prompt_config = PromptConfig()

    
    def _strip_think(self, text: str) -> str:
        """Remove <think>...</think> sections and trim whitespace."""
        if not text:
            return text
        # Support nested or multiple occurrences
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
        return cleaned.strip()

    def add_assistant_message(self, message: str):  # override to clean
        super().add_assistant_message(self._strip_think(message))
        
        
    def generate_content(self, messages: list) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages   )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"Error generating content: {str(e)}")
            raise
        
    def evaluate_job_description(self, id) -> str:
        """Evaluate job description quality using LLM"""
        try:
            from tool.database.postgest import PostgreSQLClient
            from tool.database.mongodb import MongoDBClient
            from tool import generate_evaluation_key
            from bson import ObjectId
            
            pg_client = PostgreSQLClient(Settings=Settings.load_settings())
            
            job_description = pg_client.get_job_posting_info_by_id(id)
            
            # mongo_client = MongoDBClient(Settings=self.settings)
            
            # key = generate_evaluation_key(job_description)
            
            # result_by_key = mongo_client.read_documents(
            #     "recruitment website intergrate ai", 
            #     filter_query={"key": key, "id": id}
            # )
            
            # # If found existing evaluation, return it
            # if result_by_key:
            #     # result_by_key is a list, get the first document
            #     evaluation_data = result_by_key[0]
                
            #     # Convert ObjectId to string for JSON serialization
            #     if '_id' in evaluation_data:
            #         evaluation_data['_id'] = str(evaluation_data['_id'])
                
            #     return evaluation_data  # Return the dict data
            
            # If no existing evaluation found, could generate new one here
            prompt = self.prompt_config.get_prompt("evaluate_jd", user_input=job_description)
            evaluation = self._strip_think(self.generate_content([{"role": "user", "content": prompt}]))
            
            # mongo_client.delete_document(
            #     "recruitment website intergrate ai",
            #     filter_query={"id": id}
            # )

            # Clean markdown code blocks
            cleaned_output = re.sub(r"```(?:json)?", "", evaluation).strip()
            
            # Try to extract JSON object from the response
            # Look for the first { and last }
            json_start = cleaned_output.find('{')
            json_end = cleaned_output.rfind('}')
            
            if json_start != -1 and json_end != -1:
                json_str = cleaned_output[json_start:json_end + 1]
            else:
                json_str = cleaned_output
            
            # Parse thành JSON thật
            try:
                data = json.loads(json_str)
            except json.JSONDecodeError as e:
                logging.error(f"JSON parse error: {str(e)}")
                logging.error(f"Cleaned output: {cleaned_output[:500]}...")
                logging.error(f"Attempted JSON: {json_str[:500]}...")
                raise
            
            # mongo_client.create_document(
            #     "recruitment website intergrate ai",
            #     {
            #         "key": key,
            #         "id": id,
            #         **data
            #     }
            # )
            return data
            
        except Exception as e:
            logging.error(f"Error evaluating job description: {str(e)}")
            return f"Error evaluating job description: {str(e)}"

    def evaluate_result_interview(self, answers: dict, path: str):
        """Evaluate interview results using LLM"""
        try:
            from tool import extract_text_from_pdf
            cv = extract_text_from_pdf(path)
            print(f"câu trả lời: {answers}")
            prompt = self.prompt_config.get_prompt("AI_interview_result_evaluation", user_input=cv, answers=answers)
            evaluation = self._strip_think(self.generate_content([{"role": "user", "content": prompt}]))

            cleaned_text = re.sub(r'```json\s*', '', evaluation)
            cleaned_text = re.sub(r'```\s*', '', cleaned_text)
            cleaned_text = cleaned_text.strip()
            mock_result = json.loads(cleaned_text)
            return {
                    "answers": answers,
                    "results": mock_result
                }
                
            
            
        except Exception as e:
            logging.error(f"Error evaluating interview results: {str(e)}")
            return f"Error evaluating interview results: {str(e)}"


    def handle_ai_evaluation_cv(self, filepath: str) -> str:
        """Handle AI evaluation of CV given a file path"""
        try:
            from tool.extract_cv_to_json import extract_cv_to_json_by_openai
            from tool.database.mongodb import MongoDBClient
            from tool import extract_text_from_pdf
            from tool import generate_evaluation_key    

            # text_content = extract_text_from_pdf(filepath)

            # key = generate_evaluation_key(text_content)

            # mongo_client = MongoDBClient(Settings=self.settings)
            # print(f"Evaluating CV with key: {key}")
            
            # # Check if evaluation already exists
            # existing_evaluation = mongo_client.read_documents("cv_evaluation", filter_query={"key": key})
        
            
            # print(existing_evaluation)
            
            # if existing_evaluation:
            #     evaluation_data = existing_evaluation[0]
                
            #     # Convert ObjectId to string for JSON serialization
            #     if '_id' in evaluation_data:
            #         evaluation_data['_id'] = str(evaluation_data['_id'])
                    
            #     return {
            #         "intent": "evaluate_cv",
            #         "extracted_features": evaluation_data
            #     }  
        
            result = extract_cv_to_json_by_openai(filepath)
            
            # mongo_client.create_document(
            #     "cv_evaluation",
            #     {
            #         "key": key,
            #         **result
            #     }
            # )
            return {
                "intent": "evaluate_cv",
                "extracted_features": result
            }

        except Exception as e:
            logging.error(f"Error evaluating CV: {str(e)}")
            return f"Error evaluating CV: {str(e)}"
    
    def handle_ai_evaluation_based_on_features(self,  
                           p_account_id: int,
                           p_job_posting_id: int,
                           p_cv_id: int,
                           job_application_id: int) -> bool:
        """Handle AI evaluation based on extracted features from CV"""
        from tool.database.postgest import PostgreSQLClient

        try:
            pg_client = PostgreSQLClient(Settings=self.settings)

            information = pg_client.get_cv_job_detail(p_account_id, p_job_posting_id, p_cv_id)

            job_description = []
            job_description.append("Vị trí: " + information['position_name'])
            job_description.append("Mô tả công việc: " + information['job_description'])
            job_description.append("Yêu cầu: " + information['requirements'])
            job_description.append("Kinh nghiệm: " + str(information['experience_years']) + " năm")
            job_description.append("Trình độ học vấn: " + information['education_level'])
            job_description.append("Kỹ năng: " + information['skills'])
            
            cv_url = information['cv_url']
            if not cv_url:
                cv_url = information['file_url']

            cv_text = download_and_extract_pdf(cv_url)

            prompt_extracted_features = self.prompt_config.get_prompt("intent_extract_features_from_cv", cv=cv_text)
        
            extracted_features = self._strip_think(self.generate_content([{"role": "user", "content": prompt_extracted_features}]))

            extracted_features_json = self.paste_to_json(extracted_features)

            prompt_evaluation = self.prompt_config.get_prompt("intent_evaluate_cv_base_on_jd", jd="\n".join(job_description), cv=extracted_features_json.get('general', ""))

            evaluation_result = self._strip_think(self.generate_content([{"role": "user", "content": prompt_evaluation}]))

            evaluation_result_json = self.paste_to_json(evaluation_result)

            evaluation_data = extracted_features_json.get("evaluation", {})
            
            pg_client.insert_ai_evaluate_cv(job_application_id, 
                                            p_cv_id,
                                            evaluation_result_json.get("skills", 0),
                                            evaluation_result_json.get("education", 0),
                                            evaluation_result_json.get("positions", 0),
                                            evaluation_result_json.get("experience", 0),
                                            8,
                                            ", ".join(evaluation_data.get("weaknesses", [])),
                                            ", ".join(evaluation_data.get("strengths", [])),
                                            ", ".join(evaluation_data.get("interview_questions", [])),
                                            ", ".join(evaluation_data.get("detail_analysis", []))
                                            )

            return {
                "intent": "evaluate_cv",
                "extracted_features": extracted_features_json,
                "evaluation_result": evaluation_result_json
            }

        except Exception as e:
            logging.error(f"Error evaluating based on features: {str(e)}")
            return f"Error evaluating based on features: {str(e)}"
    
    def paste_to_json(self, text: str) -> str:
        cleaned_text = re.sub(r'```json\s*', '', text)
        cleaned_text = re.sub(r'```\s*', '', cleaned_text)
        cleaned_text = cleaned_text.strip()
        mock_result = json.loads(cleaned_text)
        return mock_result


    def chat_with_agent(self, message: str, **kwargs) -> str:
        try:
            if message == "Đánh giá CV cho tôi":
                # Get filepath from kwargs
                filepath = kwargs.get('filepath', '')

                return self.handle_ai_evaluation_cv(filepath)
            
            elif message == "Lựa chọn công việc phù hợp dựa trên CV":
                from tool.ner_extract_skills import get_similarity_job_by_skills
                
                # Get filepath from kwargs
                filepath = kwargs.get('filepath', '')
                
                # Call the function with filepath
                result = get_similarity_job_by_skills(filepath, use_kat_coder=True)
                
                # Check if there was an error
                if "error" in result:
                    print(f"❌ Error in job suggestion: {result['error']}")
                    return result
                
                print(f"✅ Returning job suggestion result")
                return result
            
            elif message == "Mô phỏng phỏng vấn dựa trên CV":
                from tool.stimulate_interview_based_on_cv import simulate_interview_based_on_cv
                filepath = kwargs.get('filepath', '')
                return {
                    "intent": "simulate_interview",
                    "extracted_features": simulate_interview_based_on_cv(filepath)
                    
                }
                
            classification_prompt = self.prompt_config.get_prompt("classification_agent_intent", user_input=message)
            intent = self._strip_think(self.generate_content([{"role": "user", "content": classification_prompt}]))
            print(f"Intent classified as: {intent}")
  
            if intent == "intent_jd":
                extracted_features_prompt = self.prompt_config.get_prompt("extract_feature_question_about_jd", user_input=message)
                extracted_features = self._strip_think(self.generate_content([{"role": "user", "content": extracted_features_prompt}]))
                result = {
                    "intent": intent,
                    "extracted_features": extracted_features
                }
                print(f"Extracted features: {extracted_features}")
                return result  # Return as dict - Flask will handle JSON serialization
            elif intent == "intent_company_info":
                company_info_prompt = self.prompt_config.get_prompt("extract_feature_question_about_company", user_input=message)
                company_info = self._strip_think(self.generate_content([{"role": "user", "content": company_info_prompt}]))
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
        except ConnectionError as e:
            error_msg = f"Cannot connect to AI server. Please check your connection: {str(e)}"
            logging.error(f"{error_msg}")
            return error_msg
        except TimeoutError as e:
            error_msg = f"Connection to AI server timed out. Please check your network."
            logging.error(f"{error_msg}: {str(e)}")
            return error_msg
        except Exception as e:
            error_msg = f"Error processing request: {str(e)}"
            logging.error(error_msg)
            import traceback
            logging.error(traceback.format_exc())
            return error_msg


    def chat(self, message: str, include_history: bool = True) -> str:
        self.add_user_message(message)
        
        # Prepare messages for API
        if include_history:
            messages = self.conversation_history.copy()
        else:
            messages = [{"role": "user", "content": message}]
        
        try:
        
            summarise_convervation = get_reflection_openai(messages)
            self.clear_conversation_state()  # Clear state before processing new message
            self.add_user_message(summarise_convervation)  # Add summarized message to history
            classification_prompt = self.prompt_config.get_prompt("classification_chat_intent", user_input=summarise_convervation)
            intent = self._strip_think(self.generate_content([{"role": "user", "content": classification_prompt}]))
            print(f"Intent classified as: {intent}")
            
            if intent == "intent_chitchat":
                chitchat_prompt = self.prompt_config.get_prompt("intent_chitchat", user_input=summarise_convervation)
                assistant_response = self._strip_think(self.generate_content([{"role": "user", "content": chitchat_prompt}]))
                self.add_assistant_message(assistant_response)
                return assistant_response
                
            elif intent == "intent_incomplete_recruitment_question":
                incomplete_prompt = self.prompt_config.get_prompt("recruitment_incomplete", user_input=summarise_convervation)
                assistant_response = self._strip_think(self.generate_content([{"role": "user", "content": incomplete_prompt}]))
                self.add_assistant_message(assistant_response)
                return assistant_response
                
            elif intent == "intent_jd":
                data_job_posting = retrive_infor_job_posting(summarise_convervation)
                promt_job_posting = self.prompt_config.get_prompt("intent_jd", user_input=summarise_convervation, data = data_job_posting)
                assistant_response = self._strip_think(self.generate_content([{"role": "user", "content": promt_job_posting}]))
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
                assistant_response = self._strip_think(self.generate_content([{"role": "user", "content": prompt_company}]))
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
            
            # Default fallback - use general conversation
            fallback_prompt = self.prompt_config.get_prompt("intent_chitchat", user_input=summarise_convervation)
            assistant_response = self._strip_think(self.generate_content([{"role": "user", "content": fallback_prompt}]))
            self.add_assistant_message(assistant_response)
            return assistant_response
            
        except Exception as e:
            error_msg = f"Error processing chat request: {str(e)}"
            logging.error(error_msg)
            import traceback
            logging.error(traceback.format_exc())
            self.add_assistant_message(error_msg)
            return error_msg
        
    def chat_enhance(self, message: str, include_history: bool = True) -> str:
        print(f"Received message for enhanced chat: {message}")
        self.add_user_message(message)
        query = message
        
        # Prepare messages for API
        if include_history:
            messages = self.conversation_history.copy()
        else:
            messages = [{"role": "user", "content": message}]
        
        try:
            data = retrive_information_relative(query)
            prompt = self.prompt_config.get_prompt("intent_chatbot_recruitment", history=messages, data=data)

            assistant_response = self._strip_think(self.generate_content([{"role": "user", "content": prompt}]))
            self.add_assistant_message(assistant_response)
            return assistant_response

             
        except Exception as e:
            error_msg = f"Error processing chat request: {str(e)}"
            logging.error(error_msg)
            import traceback
            logging.error(traceback.format_exc())
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
            intent = self._strip_think(self.generate_content([{"role": "user", "content": classification_prompt}]))
            return intent.strip()
        except Exception as e:
            logging.error(f"Error in intent classification: {str(e)}")
            # Return a default intent in case of error
            return "intent_chitchat"
    
    def get_reflection(self, history: list) -> str:
        """
        Use Reflection to self-evaluate and improve the response
        
        Args:
            history: The conversation history
            
        Returns:
            The improved response as a string
        """
        try:
            
            improved_answer = self.generate_content(history)
            return improved_answer
        except Exception as e:
            logging.error(f"Error in reflection process: {str(e)}")
            return "Error in reflection process."

    def get_reflection_openai(self, history: list) -> str:
        """
        Use OpenAI-based Reflection to self-evaluate and improve the response
        
        Args:
            history: The conversation history
            
        Returns:
            The improved response as a string
        """
        try:
            # Sử dụng OpenAI client có sẵn từ __init__
            from tool.reflection import Reflection
            
            # Tạo wrapper class để tương thích với Reflection
            class OpenAIWrapper:
                def __init__(self, client, model_name):
                    self.client = client
                    self.model_name = model_name
                
                def generate_content(self, messages):
                    try:
                        response = self.client.chat.completions.create(
                            model=self.model_name,
                            messages=messages
                        )
                        return response.choices[0].message.content
                    except Exception as e:
                        logging.error(f"Error generating content with OpenAI: {str(e)}")
                        raise
            
            # Tạo wrapper với client và model có sẵn
            openai_wrapper = OpenAIWrapper(self.client, self.model_name)
            reflection = Reflection(llm=openai_wrapper)
            
            # Sử dụng reflection để cải thiện câu trả lời
            improved_answer = reflection(history)
            
            # Làm sạch các tag thinking nếu có
            if "<think>" in improved_answer:
                improved_answer = improved_answer.split("</think>")[-1].strip()
            
            return improved_answer.strip()
            
        except Exception as e:
            logging.error(f"Error in OpenAI reflection process: {str(e)}")
            return "Error in OpenAI reflection process."
        
        
if __name__ == "__main__":
    """
    Test AgentKatCoder functionality
    """
    from app.chatbot.AgentKatCoder import AgentKatCoder
    from tool import extract_text_from_pdf
    cv = extract_text_from_pdf("C:\\Users\\myth\\Downloads\\NGUYEN THE THANH (1).pdf")
    answers = """
    [{'question': 'Bạn đã sử dụng ML.NET để xây dựng mô hình phân loại cảm xúc từ đánh giá văn bản. Hãy trình bày chi tiết quy trình tiền xử lý ngôn ngữ tự nhiên (NLP) mà bạn đã thực hiện, bao gồm tokenization, loại bỏ stopword và trích xuất đặc trưng TF-IDF?', 'answer': 'Quy trình là tokenization, loại bỏ stopword và trích xuất đặc trưng TF-IDF'}, {'question': 'Trong dự án phân loại ung thư phổi với CNN trên Google Colab, bạn đạt được độ chính xác 98%. Hãy giải thích cách bạn xử lý dữ liệu đầu vào, kỹ thuật tăng cường dữ liệu (augmentation) đã sử dụng, và tại sao bạn chọn kiến trúc mạng CNN thay vì các mô hình khác?', 'answer': 'kỹ thuật tăng cường dữ liệu là 1 ảnh có thể thay đổi nhiều cách khác nhau như làm mờ, xoay trái phải để tăng cường dữ liệu cũng như tăng độ chính xác cho mô hình. Kiến trúc mạng CNN sử dụng nhiều layer để lấy các đặc trưng'}, {'question': 'Bạn có kinh nghiệm phát triển smart contract bằng Solidity và tích hợp DApp với Web3.js. Hãy mô tả một ví dụ cụ thể về cách bạn triển khai và triển khai một smart contract lên testnet, cũng như cách frontend tương tác với nó?', 'answer': 'Deploy smart contract. Lấy abi và mã key sau khi deploy. Liến kết với frontend bằng ethejs. và web3.js. Sử dụng các thuộc tính public từ smart contract để hiển thị lên frontend'}, {'question': 'Bạn từng làm Unity Intern Developer tại Onechain Technology. Hãy chia sẻ một thách thức kỹ thuật bạn gặp phải khi làm việc với Unity và cách bạn giải quyết nó?', 'answer': 'Thách thức là quá vui'}, {'question': 'Trong các dự án AI/ML bạn đã thực hiện, làm thế nào bạn xác định và lựa chọn đặc trưng (feature selection) để cải thiện độ chính xác mô hình? Hãy lấy ví dụ từ dự án Customer Sentiment Analysis?', 'answer': 'sử dụng một vài kỹ thuật, hiển thị '}, {'question': 'Bạn có mục tiêu trở thành một AI Engineer sáng tạo và thực tiễn. Theo bạn, làm thế nào để cân bằng giữa việc áp dụng các mô hình học máy chuẩn hóa và việc sáng tạo, tùy chỉnh mô hình phù hợp với bài toán cụ thể?', 'answer': 'Tôi xem việc áp dụng mô hình chuẩn như “bệ phóng an toàn”, còn sáng tạo chính là “động cơ giúp bay xa hơn” – cả hai cần song hành để tạo ra mô hình vừa hiệu quả kỹ thuật, vừa phù hợp với bài toán thực tế'}]
    """
    agent = AgentKatCoder()
    prompt = agent.prompt_config.get_prompt("AI_interview_result_evaluation", user_input=cv, answers=answers)
    messages = [{"role": "user", "content": prompt}]
    response = agent.generate_content(messages)
    print(response)