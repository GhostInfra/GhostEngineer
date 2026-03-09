"""
Analysis Service - Orchestrates the full repo analysis pipeline.

Uses Redis cache to avoid re-analyzing the same repository repeatedly,
since cloning, parsing, and LLM calls are expensive operations.
"""

import tempfile
from typing import Optional

from backend.analyzer.repo_cloner import clone_repo
from backend.analyzer.structure_parser import parse_structure
from backend.analyzer.file_extractor import extract_files
from backend.ai_engine.summarizer import summarize_repo
from backend.services.cache_service import CacheService
from backend.utils.logger import get_logger

logger = get_logger(__name__)

# Shared cache instance
cache = CacheService()


def analyze_repository(repo_url: str, bypass_cache: bool = False) -> dict:
    """
    Run the full analysis pipeline on a GitHub repository.

    Results are cached in Redis so repeated requests for the same repo
    return instantly without re-running the expensive pipeline.

    Args:
        repo_url: The URL of the GitHub repository to analyze.
        bypass_cache: If True, skip cache lookup and force re-analysis.

    Returns:
        A dict containing the analysis report.
    """
    # Check cache first (unless bypassed)
    if not bypass_cache:
        cached = cache.get(repo_url)
        if cached:
            logger.info(f"Returning cached result for {repo_url}")
            return cached

    # Run the full pipeline
    logger.info(f"Starting fresh analysis for {repo_url}")

    # Use a temporary directory for cloning
    with tempfile.TemporaryDirectory() as temp_dir:
        logger.info(f"Created temporary directory for {repo_url}: {temp_dir}")

        # 1. Clone the repo
        repo_path = clone_repo(repo_url, temp_dir)

        # TODO: Implement the rest of the pipeline once modules are ready
        # 2. Parse structure
        # structure = parse_structure(repo_path)
        # 3. Extract files
        # files = extract_files(repo_path)
        # 4. Summarize with AI
        # result = summarize_repo(structure, files)

        # Placeholder result until full pipeline is implemented
        result = {
            "status": "success",
            "repo_url": repo_url,
            "message": "Repository cloned successfully. Analysis modules coming soon.",
            "path": repo_path
        }

        # Cache the result before returning
        cache.set(repo_url, result)

        return result
