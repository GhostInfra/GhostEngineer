"""
Cache Service - Redis-backed caching for repo analysis results.

Analyzing repositories repeatedly is expensive (cloning, parsing, LLM calls).
This service caches analysis results so repeated requests for the same repo
return instantly from Redis instead of re-running the full pipeline.
"""

import json
import hashlib
from typing import Optional

import redis

from backend.utils.logger import get_logger

logger = get_logger(__name__)

# Default TTL: 1 hour (repo analysis results stay fresh for a reasonable window)
DEFAULT_TTL_SECONDS = 3600

# Redis key prefix to namespace all GhostEngineer cache entries
CACHE_PREFIX = "ghostengineer:"


class CacheService:
    """Redis-backed cache for storing and retrieving analysis results."""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        ttl: int = DEFAULT_TTL_SECONDS,
    ):
        """
        Initialize the Redis cache connection.

        Args:
            host: Redis server host.
            port: Redis server port.
            db: Redis database index.
            password: Optional Redis password.
            ttl: Default time-to-live for cache entries in seconds.
        """
        self.ttl = ttl
        self.client = redis.Redis(
            host=host,
            port=port,
            db=db,
            password=password,
            decode_responses=True,
        )
        logger.info(f"Redis cache initialized — {host}:{port}/{db}")

    @staticmethod
    def _make_key(repo_url: str) -> str:
        """
        Generate a deterministic cache key from a repo URL.

        Args:
            repo_url: The GitHub repository URL.

        Returns:
            A namespaced, hashed cache key.
        """
        url_hash = hashlib.sha256(repo_url.strip().lower().encode()).hexdigest()[:16]
        return f"{CACHE_PREFIX}{url_hash}"

    def get(self, repo_url: str) -> Optional[dict]:
        """
        Retrieve a cached analysis result for a repository.

        Args:
            repo_url: The GitHub repository URL.

        Returns:
            The cached result as a dict, or None if not found / expired.
        """
        key = self._make_key(repo_url)
        try:
            data = self.client.get(key)
            if data:
                logger.info(f"Cache HIT for {repo_url}")
                return json.loads(data)
            logger.info(f"Cache MISS for {repo_url}")
            return None
        except redis.RedisError as e:
            logger.error(f"Redis GET error: {e}")
            return None

    def set(self, repo_url: str, result: dict, ttl: Optional[int] = None) -> bool:
        """
        Store an analysis result in the cache.

        Args:
            repo_url: The GitHub repository URL.
            result: The analysis result to cache.
            ttl: Optional custom TTL in seconds (defaults to instance TTL).

        Returns:
            True if successfully cached, False otherwise.
        """
        key = self._make_key(repo_url)
        ttl = ttl or self.ttl
        try:
            self.client.setex(key, ttl, json.dumps(result))
            logger.info(f"Cached result for {repo_url} (TTL: {ttl}s)")
            return True
        except redis.RedisError as e:
            logger.error(f"Redis SET error: {e}")
            return False

    def invalidate(self, repo_url: str) -> bool:
        """
        Remove a cached result for a repository (e.g. when re-analysis is requested).

        Args:
            repo_url: The GitHub repository URL.

        Returns:
            True if the key was deleted, False otherwise.
        """
        key = self._make_key(repo_url)
        try:
            deleted = self.client.delete(key)
            logger.info(f"Cache invalidated for {repo_url} (deleted={deleted})")
            return bool(deleted)
        except redis.RedisError as e:
            logger.error(f"Redis DELETE error: {e}")
            return False

    def ping(self) -> bool:
        """Check if the Redis connection is healthy."""
        try:
            return self.client.ping()
        except redis.RedisError:
            return False
