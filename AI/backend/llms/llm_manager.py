# -*- coding: utf-8 -*-
"""
LLM Manager - Singleton pattern để quản lý các LLM instances
"""
import os
import logging
from typing import Dict, Optional
from .ollama_llms import OllamaLLMs


class LLMManager:
    """Singleton manager for LLM instances"""
    
    _instance = None
    _instances: Dict[str, OllamaLLMs] = {}
    
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


# Global instance
llm_manager = LLMManager()