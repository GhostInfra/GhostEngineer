"""
File Extractor - Extracts and reads file contents from a repository.
"""

import os
from typing import Dict, List, Optional
from backend.utils.logger import get_logger

logger = get_logger(__name__)

# Default allowed extensions for text-based source files
DEFAULT_ALLOWED_EXTENSIONS = {
    '.py', '.js', '.ts', '.tsx', '.jsx', '.html', '.css', 
    '.md', '.json', '.yaml', '.yml', '.txt', '.sh', '.go', '.rs'
}

# Directories to ignore (sync with structure_parser.py)
IGNORE_DIRS = {
    ".git", ".github", ".vscode", ".idea", 
    "node_modules", "bower_components",
    "venv", ".venv", "env", "__pycache__",
    "dist", "build", "out", ".next", "target"
}

# Maximum file size to read (50KB by default) to avoid memory issues
MAX_FILE_SIZE = 50 * 1024


from backend.analyzer.skeletonizer import skeletonize

def extract_files(
    repo_path: str, 
    extensions: Optional[List[str]] = None, 
    max_size: int = MAX_FILE_SIZE
) -> List[Dict]:
    """
    Extract file contents from a repository, filtered by extension and size.
    Large files are 'skeletonized' (summarized) instead of skipped.

    Args:
        repo_path: Path to the root of the cloned repository.
        extensions: Optional list of file extensions to include.
        max_size: Maximum file size in bytes to read fully.

    Returns:
        A list of dicts with 'path', 'content', and 'type' keys.
    """
    allowed_extensions = set(extensions) if extensions else DEFAULT_ALLOWED_EXTENSIONS
    repo_path = os.path.abspath(repo_path)
    extracted_files = []

    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            _, ext = os.path.splitext(file)
            if ext.lower() in allowed_extensions:
                file_path = os.path.join(root, file)
                
                try:
                    stats = os.stat(file_path)
                    
                    # Read content
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Store relative path for cleaner output
                    relative_path = os.path.relpath(file_path, repo_path)
                    
                    if stats.st_size > max_size:
                        # Large file: extract skeleton
                        content = skeletonize(content, file)
                        file_type = "skeleton"
                        logger.info(f"Skeletonized large file: {relative_path} ({stats.st_size} bytes)")
                    else:
                        file_type = "full"
                        
                    extracted_files.append({
                        "path": relative_path,
                        "content": content,
                        "type": file_type
                    })
                except Exception as e:
                    logger.error(f"Error reading {file_path}: {e}")
                    continue

    return extracted_files
