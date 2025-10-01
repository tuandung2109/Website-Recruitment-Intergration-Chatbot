from loguru import logger
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # MongoDB settings
    DATABASE_HOST: str = "mongodb+srv://thanhthanh10012004:dH4KeOCy74suqJLk@rag-cluster.ssgkce4.mongodb.net/?retryWrites=true&w=majority&appName=rag-cluster"
    DATABASE_NAME: str = "rag"
    COLLECTION_JOB: str = ""

    # Supabase settings
    SUPABASE_URL: str = "https://ahctwmizutnngwmswdbf.supabase.co"  # Thêm URL Supabase của bạn
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3R3bWl6dXRubmd3bXN3ZGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzY1OTIsImV4cCI6MjA3NDcxMjU5Mn0.PYeFefHRpoi-JcBUdX2An-qCyFe3s8lItX8vcjigWYc"  # Thêm anon key của bạn

    QDRANT_URL: str = "https://76be067b-34d1-4b20-8ea6-b8b2dcf182a0.europe-west3-0.gcp.cloud.qdrant.io:6333"
    QDRANT_API_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.xXuZydLh-KDtwCz562thgAXW0CAX-ILC933xztO2OIQ"
    QDRANT_VECTOR_SIZE: int = 384  # for all-MiniLM-L6-v2
    COLLECTION_JOB: str = "job_descriptions"
    COLLECTION_COMPANY: str = "companies"  # Collection cho công ty

    # LLM and Embedding settings
    TEXT_EMBEDDING_MODEL_ID: str = "dangvantuan/vietnamese-document-embedding"  # Model tiếng Việt tốt hơn
    RERANKING_CROSS_ENCODER_MODEL_ID: str = "cross-encoder/ms-marco-MiniLM-L-4-v2"
    RAG_MODEL_DEVICE: str = "cpu"
    RAG_MODEL_ID: str = "hf.co/unsloth/Qwen3-1.7B-GGUF:IQ4_XS"
    
    # Performance optimization settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_TIMEOUT: int = 120
    MODEL_KEEP_ALIVE: int = 600  # Giữ model trong 10 phút
    ENABLE_MODEL_PRELOAD: bool = True
    BATCH_SIZE: int = 32  # Batch size cho embedding
    MAX_WORKERS: int = 4  # Số threads cho parallel processing
    
    
    @classmethod
    def load_settings(cls) -> "Settings":
        """
        Tries to load settings from environment variables and .env file
        """
        try:
            settings = cls()
            logger.info("Settings loaded successfully")
            return settings
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            raise