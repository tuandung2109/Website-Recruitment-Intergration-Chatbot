import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from mcp.server.fastmcp import FastMCP
from pymongo import MongoClient
from typing import List, Dict, Any
from setting import Settings


# 1️⃣ Tạo server
server = FastMCP("demo-mcp")

# Load settings
settings = Settings.load_settings()

# connect to MongoDB (example, adjust as needed)
mongo_client = MongoClient(settings.DATABASE_HOST)
db = mongo_client[settings.DATABASE_NAME]

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

#MongoDB
@server.tool()
def find_documents(collection: str, query: Dict[str, Any] = {}) -> List[Dict[str, Any]]:
    """
    find documents in mongoDB
    Args:
        collection: name of the collection on mongoDB
        query: fillter query (vd: {"name": "Alice"})
    """
    col = db[collection]
    docs = list(col.find(query))
    
    for d in docs:
        d["_id"] = str(d["_id"])
    return docs

# Tool trích xuất đặc trưng từ câu hỏi về JD
@server.tool()
def extract_features_from_question(query: str, prompt_type: str) -> Dict[str, Any]:
    """
    Trích xuất các đặc trưng từ câu hỏi về JD
    Args:
        query: câu hỏi của user
        prompt_type: loại prompt để trích xuất (vd: "extract_features_question_aboout_job")
    Returns:
        dict: các đặc trưng đã trích xuất
    """
    from tool.extract_feature_question_about_jd import ExtractFeatureQuestion
    extractor = ExtractFeatureQuestion(
        model_name=os.getenv("OLLAMA_MODEL", "hf.co/Cactus-Compute/Qwen3-1.7B-Instruct-GGUF:Q4_K_M"),
        validate_response=["title", "skills", "company", "location", "experience"]
    )
    features = extractor.extract(query, prompt_type)
    return features


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
def enhance_question(query: str) -> str:
    """
    Nâng cấp câu hỏi từ incomplete -> complete
    Args:
        query: câu hỏi của user
    Returns:
        str: câu hỏi đã được nâng cấp
    """
    from tool.question_enhancer import QuestionEnhancer
    enhancer = QuestionEnhancer()
    print(f"\nCâu hỏi: '{query}'")
    info_status = enhancer.analyze_incomplete_question(query)
    missing_info = enhancer.get_priority_missing_info(info_status)
    follow_up = enhancer.generate_follow_up_question(missing_info)
        
    print(f"Thông tin thiếu: {[info.value for info in missing_info]}")
    print(f"Câu hỏi follow-up: {follow_up}")
    return follow_up


@server.tool()
def get_prompt(prompt_name: str, **kwargs) -> str:
    """
    Lấy prompt text. Nếu có kwargs thì format các placeholder.
    Ví dụ: get_prompt("extract_features_question_aboout_job", user_input="Tìm việc ở Hà Nội")
    """
    from prompt.promt_config import PromptConfig
    prompt_config = PromptConfig()
    prompt_text = prompt_config.get_prompt(prompt_name, **kwargs)
    return prompt_text

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
    ollama_url = os.getenv("OLLAMA_URL", default_url)
    ollama_model = os.getenv("OLLAMA_MODEL", "hf.co/Cactus-Compute/Qwen3-1.7B-Instruct-GGUF:Q4_K_M")
    
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
def search_similar_jobs(query_vector: List[float], top_k: int = 5):
    """
    Tìm kiếm các JD tương tự trong Qdrant dựa trên vector truy vấn
    Args:
        query_vector: vector truy vấn
        top_k: số lượng kết quả trả về
    Returns:
        list: danh sách các JD tương tự
    """
    URL_QDRANT = settings.URL_QDRANT
    API_KEY_QDRANT = settings.API_KEY_QDRANT
    from tool.database import QDrant
    try:
        qdrant_client = QDrant(
            url=URL_QDRANT,
            api_key=API_KEY_QDRANT
        )
        results = qdrant_client.search_vectors(
            collection_name=settings.COLLECTION_JOB,
            query_vector=query_vector,
            top_k=top_k
        )
        print(f"✅ Found {len(results)} similar jobs.")
        return results
    except Exception as e:
        print(f"❌ Error in searching similar jobs: {str(e)}")
        return []


@server.tool()
def get_companies_grouped_by_industries() -> List[Dict[str, Any]]:
    """
    Lấy danh sách công ty đã được nhóm theo ngành nghề từ PostgreSQL/Supabase
    Returns:
        List[Dict]: danh sách công ty với ngành nghề đã nhóm
    """
    from tool.database.postgest import PostgreSQLClient
    
    try:
        # Khởi tạo PostgreSQL client (chỉ cần Supabase)
        pg_client = PostgreSQLClient(
            url=os.getenv("SUPABASE_URL"),
            key=os.getenv("SUPABASE_ANON_KEY")
        )
        
        # Lấy dữ liệu từ procedure (đã được gom nhóm)
        companies_data = pg_client.get_data_from_procedures("get_cong_ty_full", limit=1000)
        
        print(f"✅ Retrieved {len(companies_data)} grouped companies")
        return companies_data
        
    except Exception as e:
        print(f"❌ Error getting grouped companies: {str(e)}")
        return []


@server.tool()
def upsert_companies_to_qdrant_optimized(limit: int = 100):
    """
    Lấy công ty từ PostgreSQL, tạo embedding và lưu vào Qdrant (sử dụng LLMManager tối ưu)
    Args:
        limit: số lượng công ty để xử lý
    Returns:
        dict: Kết quả thêm dữ liệu
    """
    from tool.database.postgest import PostgreSQLClient
    
    try:
        # Định nghĩa extractors
        def company_text_extractor(record: Dict[str, Any]) -> str:
            text_parts = []
            
            if record.get('ten_cong_ty'):
                text_parts.append(f"Công ty: {record['ten_cong_ty']}")
            
            if record.get('ds_nganh_nghe'):
                text_parts.append(f"Ngành nghề: {record['ds_nganh_nghe']}")
            
            if record.get('linh_vuc'):
                text_parts.append(f"Lĩnh vực: {record['linh_vuc']}")
            
            if record.get('mo_ta'):
                text_parts.append(f"Mô tả: {record['mo_ta']}")
            
            return ". ".join(text_parts)
        
        def company_id_extractor(record: Dict[str, Any]) -> str:
            return f"company_{record['ma_cong_ty']}"
        
        # Khởi tạo PostgreSQL client với Qdrant
        pg_client = PostgreSQLClient(
            url=os.getenv("SUPABASE_URL"),
            key=os.getenv("SUPABASE_ANON_KEY"),
            qdrant_url=settings.QDRANT_URL,
            qdrant_api_key=settings.QDRANT_API_KEY
        )
        
        # Sử dụng embedding method tích hợp
        result = pg_client.embed_data_to_qdrant(
            procedure_name="get_cong_ty_full",
            collection_name=getattr(settings, 'COLLECTION_COMPANY', 'companies'),
            text_extractor=company_text_extractor,
            id_extractor=company_id_extractor,
            limit=limit,
            batch_size=20
        )
        
        print(f"✅ Embedding completed: {result}")
        return result
        
    except Exception as e:
        print(f"❌ Error in optimized embedding: {str(e)}")
        return {"status": "error", "message": str(e)}


@server.tool()
def search_similar_companies_optimized(query: str, top_k: int = 5):
    """
    Tìm kiếm các công ty tương tự (sử dụng PostgreSQLClient tối ưu)
    Args:
        query: văn bản tìm kiếm
        top_k: số lượng kết quả trả về
    Returns:
        list: danh sách các công ty tương tự
    """
    from tool.database.postgest import PostgreSQLClient
    
    try:
        # Khởi tạo client với Qdrant
        pg_client = PostgreSQLClient(
            url=os.getenv("SUPABASE_URL"),
            key=os.getenv("SUPABASE_ANON_KEY"),
            qdrant_url=settings.QDRANT_URL,
            qdrant_api_key=settings.QDRANT_API_KEY
        )
        
        # Tìm kiếm sử dụng method tích hợp
        results = pg_client.search_similar_records(
            collection_name=getattr(settings, 'COLLECTION_COMPANY', 'companies'),
            query_text=query,
            top_k=top_k,
            score_threshold=0.4
        )
        
        print(f"✅ Found {len(results)} similar companies for: '{query}'")
        return results
        
    except Exception as e:
        print(f"❌ Error in optimized search: {str(e)}")
        return []

# 3️⃣ Chạy server qua STDIO
if __name__ == "__main__":
    server.run()
