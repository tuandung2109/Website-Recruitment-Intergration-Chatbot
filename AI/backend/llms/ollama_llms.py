# -*- coding: utf-8 -*-
import ollama
import requests
import json
import logging
from typing import List, Dict, Optional, Callable, Any, Union
from .base import BaseLLM
from setting import Settings



class OllamaLLMs(BaseLLM):
    # Class-level cache để tránh multiple warm-up
    _warmed_models = set()  # Cache các models đã warm-up
    _client_cache = {}  # Cache các client instances
    
    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "", **kwargs):
        """
        Ollama client với function calling support và connection optimization.
        base_url: URL Ollama server (mặc định: http://localhost:11434)
        model_name: tên model đã pull về trong Ollama
        """
        settings = Settings.load_settings()

        resolved_model = model_name or settings.OLLAMA_MODEL
        resolved_base_url = base_url or settings.OLLAMA_BASE_URL or "http://localhost:11434"

        super().__init__(model_name=resolved_model, **kwargs)
        self.base_url = resolved_base_url.rstrip("/")
        
        # Create cache key
        self.cache_key = f"{self.base_url}#{self.model_name}"
        
        # Reuse existing client if available
        if self.cache_key in self.__class__._client_cache:
            cached_client = self.__class__._client_cache[self.cache_key]
            self.client = cached_client['client']
            self.session = cached_client['session']
            self.logger = cached_client['logger']
            self.logger.info(f"♻️ Reusing cached Ollama client for {self.model_name}")
        else:
            # Initialize new Ollama client with connection pooling and timeout
            # Use longer timeout for large models (4B model needs more time)
            timeout_seconds = getattr(settings, 'OLLAMA_TIMEOUT', 60)  # Increased default to 60s
            self.client = ollama.Client(
                host=self.base_url,
                timeout=timeout_seconds  # Configurable timeout
            )
            
            # Tạo session với connection pooling cho HTTP requests
            self.session = requests.Session()
            self.session.headers.update({
                'Content-Type': 'application/json',
                'Connection': 'keep-alive'
            })
            
            # Setup logging
            self.logger = logging.getLogger(__name__)
            
            # Cache the client
            self.__class__._client_cache[self.cache_key] = {
                'client': self.client,
                'session': self.session,
                'logger': self.logger
            }
        
        # Only warm-up if not already warmed
        if self.cache_key not in self.__class__._warmed_models:
            self._ensure_model_loaded()
            self.__class__._warmed_models.add(self.cache_key)
        else:
            self.logger.info(f"⚡ Model {self.model_name} already warmed up, skipping...")
    
    def _ensure_model_loaded(self):
        """
        Đảm bảo model đã được load vào memory (warm-up)
        """
        try:
            # Test connection first
            import requests
            response = requests.get(f"{self.base_url}/api/version", timeout=5)
            if response.status_code != 200:
                raise Exception(f"Ollama server not responding: {response.status_code}")
            
            # Warm-up với timeout dài hơn cho model lớn
            warmup_response = self.client.chat(
                model=self.model_name,
                messages=[{"role": "user", "content": "Hi"}],
                options={
                    "num_predict": 1,  # Chỉ generate 1 token
                    "timeout": 30  # 30 seconds timeout for warmup
                }
            )
            self.logger.info(f"🔥 Model {self.model_name} warmed up successfully")
        except Exception as e:
            self.logger.warning(f"⚠️ Model warm-up failed: {e}")
            # Not a critical error - continue without warm-up
    
    def keep_alive(self, duration: int = 300):
        """
        Giữ model trong memory trong khoảng thời gian nhất định
        Args:
            duration: Thời gian giữ model (giây), -1 = vĩnh viễn
        """
        try:
            payload = {
                "model": self.model_name,
                "keep_alive": duration if duration > 0 else -1
            }
            self.session.post(f"{self.base_url}/api/generate", json=payload)
            self.logger.info(f"🔄 Model {self.model_name} keep-alive set to {duration}s")
        except Exception as e:
            self.logger.warning(f"⚠️ Keep-alive failed: {e}")

    def generate_content(self, prompt: List[Dict[str, str]]) -> str:
        """
        Generate content using the legacy API (backward compatibility)
        """
        messages = "\n".join([f"{p['role']}: {p['content']}" for p in prompt])

        payload = {
            "model": self.model_name,
            "prompt": messages,
            "stream": False,
        }

        resp = requests.post(
            f"{self.base_url}/api/generate",
            json=payload,
        )

        if resp.status_code != 200:
            raise ValueError(f"Ollama request failed: {resp.status_code}, {resp.text}")

        data = resp.json()
        return data.get("response", "")

    def chat(self, messages: List[Dict[str, str]], **options) -> str:
        """
        Chat using Ollama 0.4 API without tools
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            **options: Additional options (temperature, etc.)
        
        Returns:
            str: Generated response
        """
        
        try:
            response = self.client.chat(
                model=self.model_name,
                messages=messages,
                **options
            )
            return response['message']['content']
        except Exception as e:
            self.logger.error(f"Chat error: {e}")
            raise ValueError(f"Chat request failed: {str(e)}")

    

    @classmethod
    def clear_cache(cls):
        """Clear all cached clients and warm-up status"""
        cls._warmed_models.clear()
        cls._client_cache.clear()
        logging.getLogger(__name__).info("🧹 Cleared Ollama client cache")
    
    @classmethod
    def get_cache_info(cls) -> Dict[str, Any]:
        """Get information about cached clients"""
        return {
            "warmed_models": list(cls._warmed_models),
            "cached_clients": list(cls._client_cache.keys()),
            "cache_count": len(cls._client_cache)
        }
    
    def is_warmed_up(self) -> bool:
        """Check if this model instance is warmed up"""
        return self.cache_key in self.__class__._warmed_models
