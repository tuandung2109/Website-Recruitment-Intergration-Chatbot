import os
import json
import re
import sys
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
    
    extract_features_cv_raw = """
    {
  "questions": [
    "Bạn có thể giải thích cách bạn áp dụng mô hình MVC trong dự án Shooter Zombie Top Down 3D không? Mỗi phần (Model, View, Controller) bạn đã triển khai cụ thể như thế nào trong Unity?",
    "Trong dự án của bạn, bạn đã sử dụng State Machine để quản lý hành vi của nhân vật hoặc AI. Hãy mô tả cách bạn thiết kế và triển khai hệ thống này trong Unity.",
    "Pooling Object là một kỹ thuật tối ưu hiệu suất. Bạn có thể giải thích cách bạn áp dụng nó trong game của mình và lợi ích cụ thể mà nó mang lại không?",
    "Trong dự án Dự đoán cảm xúc người dùng, bạn đã sử dụng ML.NET để xử lý NLP. Hãy mô tả quy trình huấn luyện mô hình và cách bạn đánh giá độ chính xác 75%.",
    "Khi làm việc với Unity UI và UI Toolkit, bạn thấy sự khác biệt chính giữa hai công cụ này là gì? Trong trường hợp nào bạn chọn sử dụng mỗi loại?",
    "Bạn hãy chia sẻ cách bạn sử dụng Git/GitHub để quản lý các dự án game cá nhân, ví dụ như cách bạn xử lý các nhánh (branches), commit, hoặc merge code khi làm việc nhóm."
  ]
}

    """

    
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
        **extract_features_cv
    }
    
    return result

if __name__ == "__main__":
    """
    Test simulate_interview_based_on_cv function
    """
    sample_filepath = "path/to/sample_cv.pdf"
    interview_questions = simulate_interview_based_on_cv(sample_filepath)
    print("Generated Interview Questions:")
    for idx, question in enumerate(interview_questions.get("questions", []), 1):
        print(f"{idx}. {question}")                
