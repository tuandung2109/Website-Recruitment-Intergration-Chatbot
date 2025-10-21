import os
import json
import re
import sys

from numpy import extract
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))


def simulate_interview_based_on_cv(filepath: str):
    """
    Extract and evaluate CV from a PDF file using AI
    
    Args:
        filepath: Path to the CV file
        
    Returns:
        dict: Evaluation result with intent and extracted features
    """
    # from tool import extract_text_from_pdf
    # from setting import Settings
    # from app.chatbot.AgentKatCoder import AgentKatCoder
    # from prompt.promt_config import PromptConfig
    
#     extract_features_cv_raw = """
#     {
#   "questions": [
#     "Bạn có thể giải thích cách bạn áp dụng mô hình MVC trong dự án Shooter Zombie Top Down 3D không? Mỗi phần (Model, View, Controller) bạn đã triển khai cụ thể như thế nào trong Unity?",
#     "Trong dự án của bạn, bạn đã sử dụng State Machine để quản lý hành vi của nhân vật hoặc AI. Hãy mô tả cách bạn thiết kế và triển khai hệ thống này trong Unity.",
#     "Pooling Object là một kỹ thuật tối ưu hiệu suất. Bạn có thể giải thích cách bạn áp dụng nó trong game của mình và lợi ích cụ thể mà nó mang lại không?",
#     "Trong dự án Dự đoán cảm xúc người dùng, bạn đã sử dụng ML.NET để xử lý NLP. Hãy mô tả quy trình huấn luyện mô hình và cách bạn đánh giá độ chính xác 75%.",
#     "Khi làm việc với Unity UI và UI Toolkit, bạn thấy sự khác biệt chính giữa hai công cụ này là gì? Trong trường hợp nào bạn chọn sử dụng mỗi loại?",
#     "Bạn hãy chia sẻ cách bạn sử dụng Git/GitHub để quản lý các dự án game cá nhân, ví dụ như cách bạn xử lý các nhánh (branches), commit, hoặc merge code khi làm việc nhóm."
#   ]
# }

#     """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    
    
    from setting import Settings
    from app.chatbot.AgentKatCoder import AgentKatCoder
    from prompt.promt_config import PromptConfig
    from tool import extract_text_from_pdf
    
    settings = Settings.load_settings()
    agent_kat_coder = AgentKatCoder(model_name=settings.MODE_KAT_CODER)

    prompt_config = PromptConfig()
    prompt_text = prompt_config.get_prompt("stimulate_interview_based_on_cv", user_input=extract_text_from_pdf(filepath))

    # Call the agent to simulate the interview
    # generate_content expects a list of messages
    messages = [{"role": "user", "content": prompt_text}]
    response = agent_kat_coder.generate_content(messages)

    print("📝 Raw response from AI:", response)

    # Clean and parse JSON from markdown code blocks
    # Remove markdown code blocks (```json ... ``` or ``` ... ```)
    cleaned_text = re.sub(r'```json\s*', '', response)
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
        **extract_features_cv
    }
    
    return result

if __name__ == "__main__":
    """
    Test simulate_interview_based_on_cv function
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

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
