"""
Structure Parser - Parses repository file structure and generates a tree map.
"""

import os
from typing import Dict, List, Union

# Directories that are ignored during parsing to avoid noise
IGNORE_LIST = {
    ".git", ".github", ".vscode", ".idea", 
    "node_modules", "bower_components",
    "venv", ".venv", "env", "__pycache__",
    "dist", "build", "out", ".next", "target"
}

# Directories that are considered key architectural components
KEY_DIRECTORIES = {
    "src", "api", "controllers", "models", "routes", 
    "config", "services", "utils", "pages", "components",
    "lib", "middleware", "types", "db"
}


def parse_structure(repo_path: str, max_depth: int = 5) -> Dict:
    """
    Recursively parse the directory structure of a cloned repository.

    Args:
        repo_path: Path to the root of the cloned repository.
        max_depth: Maximum recursion depth to avoid infinite loops or massive trees.

    Returns:
        A dictionary representing the file/folder hierarchy.
    """
    repo_path = os.path.abspath(repo_path)
    return _build_tree(repo_path, repo_path, 0, max_depth)


def _build_tree(root_path: str, current_path: str, current_depth: int, max_depth: int) -> Dict:
    """
    Internal helper to recursively build the tree dictionary.
    """
    node_name = os.path.basename(current_path) or current_path
    
    # Root node edge case
    if current_path == root_path:
        node_name = "root"

    # Handle files
    if os.path.isfile(current_path):
        return {
            "name": node_name,
            "type": "file"
        }

    # Handle directories
    if os.path.isdir(current_path):
        # Base case for depth
        if current_depth > max_depth:
            return {
                "name": node_name,
                "type": "directory",
                "message": "Max depth reached"
            }

        children = []
        try:
            # Sort for deterministic output
            items = sorted(os.listdir(current_path))
            for item in items:
                # Skip ignored items
                if item in IGNORE_LIST:
                    continue
                
                child_path = os.path.join(current_path, item)
                children.append(_build_tree(root_path, child_path, current_depth + 1, max_depth))
        except PermissionError:
            return {
                "name": node_name,
                "type": "directory",
                "message": "Permission denied"
            }

        # Identify if this is a key directory
        is_key = node_name.lower() in KEY_DIRECTORIES

        return {
            "name": node_name,
            "type": "directory",
            "is_key": is_key,
            "children": children
        }

    return {}
