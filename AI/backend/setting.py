from loguru import logger

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"  # Ignore extra fields from .env that are not defined in Settings
    )

    # MongoDB settings
    DATABASE_HOST: str = "mongodb+srv://thanhthanh10012004:dH4KeOCy74suqJLk@rag-cluster.ssgkce4.mongodb.net/?retryWrites=true&w=majority&appName=rag-cluster"
    DATABASE_NAME: str = "rag"
    COLLECTION_JOB: str = ""

    # Supabase settings
    SUPABASE_URL: str = "https://qchjxqztegziqllwgnwb.supabase.co"  # Thêm URL Supabase của bạn
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjaGp4cXp0ZWd6aXFsbHdnbndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzQ1ODcsImV4cCI6MjA3NDk1MDU4N30.OYDnnwl16E6noozGMne71lH4Sdea-4q_9dV5VL8nbR4"  # Thêm anon key của bạn

    QDRANT_URL: str = "https://76be067b-34d1-4b20-8ea6-b8b2dcf182a0.europe-west3-0.gcp.cloud.qdrant.io:6333"
    QDRANT_API_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.xXuZydLh-KDtwCz562thgAXW0CAX-ILC933xztO2OIQ"
    QDRANT_VECTOR_SIZE: int = 768  # for dangvantuan/vietnamese-document-embedding (384 for all-MiniLM-L6-v2)
    COLLECTION_JOB: str = "job_descriptions"
    COLLECTION_COMPANY: str = "companies"  # Collection cho công ty

    RAG_MODEL_DEVICE: str = "cpu"
    
    # Performance optimization settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M"  # Add this field
    OLLAMA_TIMEOUT: int = 120
    MODEL_KEEP_ALIVE: int = 600  # Giữ model trong 10 phút
    ENABLE_MODEL_PRELOAD: bool = True
    BATCH_SIZE: int = 32  # Batch size cho embedding
    MAX_WORKERS: int = 4  # Số threads cho parallel processing
    
    EMBEDDING_MODE: str = "dangvantuan/vietnamese-document-embedding"  # Mặc định sử dụng embedding tiếng Việt
    BASE_URL_OPENAI: str = "https://vanchin.streamlake.ai/api/gateway/v1/endpoints"
    API_KEY_OPENAI: str = "UoMaZSDIoUhEHNAJIqzszg_xqwyZ5gOaGebPE7c2EA4"
    MODE_KAT_CODER: str = "ep-4gojfr-1760317712505142118"
    
    
    MONGO_DB_URI : str = "mongodb+srv://thanhthanh10012004:10012004@rag-cluster.ssgkce4.mongodb.net/?retryWrites=true&w=majority&appName=rag-cluster"
    DATABASE_MONGO_NAME : str = "rag"


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