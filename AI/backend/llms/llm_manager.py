# -*- coding: utf-8 -*-
"""
LLM Manager - Singleton pattern để quản lý các LLM instances
"""
import os
import logging
from typing import Dict, Optional, Any
from .ollama_llms import OllamaLLMs

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None


class LLMManager:
    """Singleton manager for LLM instances and embedding models"""
    
    _instance = None
    _instances: Dict[str, OllamaLLMs] = {}
    _embedding_models: Dict[str, Any] = {}  # Use Any instead of SentenceTransformer for type safety
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LLMManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self.logger = logging.getLogger(__name__)
        self._initialized = True
    
    def get_ollama_client(self, 
                         base_url: Optional[str] = None, 
                         model_name: Optional[str] = None) -> OllamaLLMs:
        """
        Get or create Ollama client instance
        
        Args:
            base_url: Ollama server URL
            model_name: Model name
            
        Returns:
            OllamaLLMs: Cached or new instance
        """
        # Use environment defaults if not provided
        if base_url is None:
            default_url = "http://host.docker.internal:11434" if os.getenv("DOCKER_ENV") == "true" else "http://localhost:11434"
            base_url = os.getenv("OLLAMA_URL", default_url)
        
        if model_name is None:
            model_name = os.getenv("OLLAMA_MODEL", "hf.co/Cactus-Compute/Qwen3-1.7B-Instruct-GGUF:Q4_K_M")
        
        # Create instance key
        instance_key = f"{base_url}#{model_name}"
        
        # Return existing instance if available
        if instance_key in self._instances:
            self.logger.info(f"♻️ Reusing existing Ollama client for {model_name}")
            return self._instances[instance_key]
        
        # Create new instance
        self.logger.info(f"🔥 Creating new Ollama client for {model_name}")
        client = OllamaLLMs(base_url=base_url, model_name=model_name)
        self._instances[instance_key] = client
        
        return client
    
    def clear_cache(self):
        """Clear all cached instances"""
        self._instances.clear()
        self.logger.info("🧹 Cleared all LLM instances cache")
    
    def get_instance_count(self) -> int:
        """Get number of cached instances"""
        return len(self._instances)
    
    def list_instances(self) -> Dict[str, str]:
        """List all cached instances"""
        return {key: str(instance) for key, instance in self._instances.items()}
    
    def get_embedding_model(self, model_name: str = 'all-MiniLM-L6-v2') -> Optional[Any]:
        """
        Get or create embedding model instance
        
        Args:
            model_name: Name of the embedding model
            
        Returns:
            SentenceTransformer: Cached or new embedding model instance
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            self.logger.error("❌ sentence-transformers not available. Please install: pip install sentence-transformers")
            return None
        
        # Return existing model if available
        if model_name in self._embedding_models:
            self.logger.info(f"♻️ Reusing existing embedding model: {model_name}")
            return self._embedding_models[model_name]
        
        # Create new embedding model
        try:
            self.logger.info(f"🔥 Loading new embedding model: {model_name}")
            model = SentenceTransformer(model_name)
            self._embedding_models[model_name] = model
            self.logger.info(f"✅ Successfully loaded embedding model: {model_name}")
            return model
        except Exception as e:
            self.logger.error(f"❌ Failed to load embedding model {model_name}: {str(e)}")
            # Fallback to default model
            try:
                fallback_model = 'all-MiniLM-L6-v2'
                if fallback_model != model_name and fallback_model not in self._embedding_models:
                    self.logger.info(f"🔄 Trying fallback model: {fallback_model}")
                    model = SentenceTransformer(fallback_model)
                    self._embedding_models[fallback_model] = model
                    self.logger.info(f"✅ Successfully loaded fallback model: {fallback_model}")
                    return model
                elif fallback_model in self._embedding_models:
                    return self._embedding_models[fallback_model]
            except Exception as fallback_error:
                self.logger.error(f"❌ Failed to load fallback model: {str(fallback_error)}")
            return None
    
    def clear_embedding_cache(self):
        """Clear all cached embedding models"""
        self._embedding_models.clear()
        self.logger.info("🧹 Cleared all embedding models cache")
    
    def get_embedding_model_count(self) -> int:
        """Get number of cached embedding models"""
        return len(self._embedding_models)
    
    def list_embedding_models(self) -> Dict[str, str]:
        """List all cached embedding models"""
        return {name: str(model) for name, model in self._embedding_models.items()}


# Global instance
llm_manager = LLMManager()