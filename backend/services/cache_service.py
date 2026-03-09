"""
Cache Service - Handles caching of analysis results using Redis with local file fallback.
"""

import os
import json
import hashlib
import redis
from typing import Optional, Dict, Any
from backend.utils.logger import get_logger

logger = get_logger(__name__)

# Cache configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CACHE_DIR = os.path.join(os.getcwd(), ".cache")


class CacheService:
    """Handles caching of repo analysis results with Redis and local file fallback."""

    def __init__(self, ttl: int = 86400):
        """
        Initialize the cache service.
        
        Args:
            ttl: Time-to-live in seconds (default 24 hours).
        """
        self.ttl = ttl
        self.cache_dir = CACHE_DIR
        
        # Ensure local cache directory exists
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
            logger.info(f"Created local cache directory: {self.cache_dir}")

        # Initialize Redis client (optional)
        try:
            self.client = redis.from_url(REDIS_URL, decode_responses=True)
            # Test connection
            self.client.ping()
            logger.info(f"Redis cache initialized — {REDIS_URL}")
        except Exception:
            logger.warning("Redis connection refused. Falling back to local file cache.")
            self.client = None

    def _get_key(self, repo_url: str) -> str:
        """Generate a stable cache key for a repository URL."""
        return hashlib.md5(repo_url.strip().lower().encode()).hexdigest()

    def get(self, repo_url: str) -> Optional[Dict[str, Any]]:
        """Retrieve analysis result from cache."""
        key = self._get_key(repo_url)
        
        # 1. Try Redis
        if self.client:
            try:
                cached_data = self.client.get(key)
                if cached_data:
                    logger.info(f"Cache hit (Redis): {repo_url}")
                    return json.loads(cached_data)
            except Exception as e:
                logger.error(f"Redis GET error: {e}")

        # 2. Try Local File Fallback
        cache_file = os.path.join(self.cache_dir, f"{key}.json")
        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r") as f:
                    data = json.load(f)
                    logger.info(f"Cache hit (Local File): {repo_url}")
                    return data
            except Exception as e:
                logger.error(f"Local cache read error: {e}")

        return None

    def set(self, repo_url: str, result: Dict[str, Any]) -> bool:
        """Store analysis result in cache."""
        key = self._get_key(repo_url)
        data_str = json.dumps(result)
        
        # 1. Store in Redis
        if self.client:
            try:
                self.client.setex(key, self.ttl, data_str)
                logger.info(f"Result cached in Redis: {repo_url}")
            except Exception as e:
                logger.error(f"Redis SET error: {e}")

        # 2. Store in Local File Fallback
        cache_file = os.path.join(self.cache_dir, f"{key}.json")
        try:
            with open(cache_file, "w") as f:
                f.write(data_str)
            logger.info(f"Result cached in local file: {repo_url}")
            return True
        except Exception as e:
            logger.error(f"Local cache write error: {e}")
            return False
