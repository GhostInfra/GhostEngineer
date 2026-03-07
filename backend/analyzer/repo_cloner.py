"""
Repo Cloner - Handles cloning GitHub repositories for analysis.
"""

import os
import re
from typing import Optional

import git

from backend.utils.logger import get_logger

logger = get_logger(__name__)

# Basic regex for GitHub HTTPS and SSH URLs
GITHUB_URL_PATTERN = re.compile(
    r"^https?://github\.com/[\w.-]+/[\w.-]+(?:\.git)?/?$|"  # HTTPS
    r"^(?:git@github\.com:|https://github\.com/)[\w.-]+/[\w.-]+(?:\.git)?/?$"  # SSH/General
)


def is_valid_github_url(url: str) -> bool:
    """
    Check if a string is a valid GitHub repository URL.

    Args:
        url: The URL to validate.

    Returns:
        True if the URL format matches GitHub, False otherwise.
    """
    if not url:
        return False
    return bool(GITHUB_URL_PATTERN.match(url.strip()))


def clone_repo(repo_url: str, target_dir: str) -> str:
    """
    Clone a GitHub repository to a local directory using a shallow clone.

    Args:
        repo_url: The URL of the GitHub repository.
        target_dir: The local directory to clone into.

    Returns:
        The absolute path to the cloned repository.

    Raises:
        ValueError: If the repository URL is invalid.
        RuntimeError: If cloning fails (e.g., repo not found, network error).
    """
    if not is_valid_github_url(repo_url):
        logger.error(f"Invalid GitHub URL provided: {repo_url}")
        raise ValueError(f"Invalid GitHub repository URL: {repo_url}")

    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)

    logger.info(f"Cloning {repo_url} into {target_dir}...")

    try:
        # depth=1 performs a shallow clone (faster, no large history)
        git.Repo.clone_from(repo_url, target_dir, depth=1)
        repo_abs_path = os.path.abspath(target_dir)
        logger.info(f"Successfully cloned {repo_url} to {repo_abs_path}")
        return repo_abs_path

    except git.exc.GitCommandError as e:
        logger.error(f"Git cloning error for {repo_url}: {str(e)}")
        raise RuntimeError(f"Failed to clone repository: {repo_url}. Ensure it is public.") from e
    except Exception as e:
        logger.error(f"Unexpected error during cloning: {str(e)}")
        raise RuntimeError(f"An unexpected error occurred while cloning {repo_url}") from e
