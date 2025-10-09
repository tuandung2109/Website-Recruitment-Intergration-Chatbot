import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from mcp.server.fastmcp import FastMCP

from typing import List, Dict, Any
from setting import Settings


# 1️⃣ Tạo server
server = FastMCP("demo-mcp")

# Load settings
settings = Settings.load_settings()


# 🚀 Preload models để tăng tốc độ response
print("🚀 Initializing models...")
from tool.model_manager import model_manager
model_manager.preload_models()
print("✅ Models preloaded successfully!")

# 2️⃣ Định nghĩa tool
@server.tool()
def hello(name: str) -> str:
    """Say hello to a user"""
    return f"Hello, {name}!"


@server.tool()
def intent_classification(query: str) -> str:
    """
    Phân loại intent của câu hỏi (sử dụng cached models)
    Args:
        query: câu hỏi của user
    Returns:
        str: intent đã phân loại (vd: "recruitment", "salary", "company_info", ...)
    """
    from tool.model_manager import model_manager
    
    try:
        # Lấy semantic router từ cache
        semantic_router = model_manager.get_semantic_router()
        
        # Phân loại intent
        print(f"\n🔍 Classifying query: {query}")
        score, route_name = semantic_router.guide(query)
        print(f"✅ Classification result: {route_name} (score: {score:.4f})")
        
        return route_name
        
    except Exception as e:
        print(f"❌ Error in intent classification: {str(e)}")
        return "unknown"

@server.tool()
def get_reflection(history: List[Dict[str, str]]) -> str:
    """
    Sử dụng Reflection để tự đánh giá và cải thiện câu trả lời
    Args:
        history: lịch sử hội thoại
        question: câu hỏi hiện tại
        max_iterations: số lần lặp tối đa để cải thiện câu trả lời
    Returns:
        str: câu trả lời đã được cải thiện
    """
    from tool.reflection import Reflection
    from llms.llm_manager import llm_manager
    
    # Sử dụng LLM Manager thay vì tạo instance mới
    default_url = "http://host.docker.internal:11434" if os.getenv("DOCKER_ENV") == "true" else "http://localhost:11434"
    ollama_url = os.getenv("OLLAMA_URL", settings.OLLAMA_BASE_URL or default_url)
    ollama_model = settings.OLLAMA_MODEL
    
    # Reuse existing LLM instance từ manager
    llm = llm_manager.get_ollama_client(base_url=ollama_url, model_name=ollama_model)
    reflection = Reflection(llm=llm)
    
    try:
        improved_answer = reflection.__call__(history)
        if "<think>" in improved_answer:
                improved_answer = improved_answer.split("</think>")[-1].strip()
        print("Reflection completed.", {"improved_answer": improved_answer})
        return improved_answer
    except Exception as e:
        print(f"❌ Error in reflection process: {str(e)}")
        return "Error in reflection process."
    
@server.tool()
def retrive_infor_company(query: str) -> List[Dict[str, Any]]:
    """
    Truy xuất thông tin công ty từ Qdrant dựa trên câu hỏi của user
    Args:
        query: câu hỏi của user
    Returns:
        List[Dict]: danh sách công ty liên quan

    """
    from qdrant_client.models import Filter, FieldCondition, MatchValue
    try:

        # Lấy Qdrant client
        from tool.database import QDrant
        qdrant_client = QDrant(Settings=settings)
        
        scroll_filter = Filter(
        must=[
        FieldCondition(
            key="entity_type",
            match=MatchValue(value="company")
        ),
        ]
        )
        

        # Tìm kiếm trong Qdrant
        results = qdrant_client.search_vectors_with_filter(settings, query, "entities", top_k=7, filter=scroll_filter)
        
        # Trích xuất thông tin công ty từ kết quả
        companies = []
        for res in results:
            payload = res.payload
            if payload:
                companies.append(payload)
        
        print(f"✅ Retrieved {len(companies)} companies related to the query.")
        return companies
        
    except Exception as e:
        print(f"❌ Error retrieving company info: {str(e)}")
        return []
    
@server.tool()
def retrive_infor_job_posting(query: str) -> List[Dict[str, Any]]:
    """
    Truy xuất thông tin job posting từ Qdrant dựa trên câu hỏi của user
    Args:
        query: câu hỏi của user
    Returns:
        List[Dict]: danh sách job posting liên quan

    """
    from qdrant_client.models import Filter, FieldCondition, MatchValue
    try:

        # Lấy Qdrant client
        from tool.database import QDrant
        qdrant_client = QDrant(Settings=settings)
        
        scroll_filter = Filter(
        must=[
        FieldCondition(
            key="entity_type",
            match=MatchValue(value="job_posting")
        ),
        ]
        )
        
        # Tìm kiếm trong Qdrant
        results = qdrant_client.search_vectors_with_filter(settings, query, "entities", top_k=7, filter=scroll_filter)
        
        # Trích xuất thông tin job posting từ kết quả
        job_postings = []
        for res in results:
            payload = res.payload
            if payload:
                job_postings.append(payload)
        
        print(f"✅ Retrieved {len(job_postings)} job postings related to the query.")
        return job_postings
        
    except Exception as e:
        print(f"❌ Error retrieving job posting info: {str(e)}")
        return []



# 3️⃣ Chạy server qua STDIO
if __name__ == "__main__":
    server.run()
