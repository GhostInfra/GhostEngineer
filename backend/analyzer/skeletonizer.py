import re
import os
from typing import List

def skeletonize(content: str, filename: str) -> str:
    """
    Extracts the 'skeleton' of a file (classes, functions, imports) 
    to provide context for files that exceed the size limit.
    """
    ext = os.path.splitext(filename)[1].lower()
    
    if ext in ['.py']:
        return _skeletonize_python(content)
    elif ext in ['.js', '.jsx', '.ts', '.tsx']:
        return _skeletonize_javascript(content)
    
    # Fallback: Just return the first 100 lines
    lines = content.splitlines()
    return "\n".join(lines[:100]) + "\n\n... [File truncated: too large for full extraction] ..."

def _skeletonize_python(content: str) -> str:
    """Extract class and function signatures for Python."""
    skeleton = []
    lines = content.splitlines()
    
    # Matches: imports, class definitions, function definitions
    # Regex for def/class with indentation capture to help with structure
    pattern = re.compile(r'^(?P<indent>\s*)(?P<type>class|def|async def|import|from)\s+(?P<name>[\w\.]+).*')
    
    for line in lines:
        match = pattern.match(line)
        if match:
            # We keep imports and signatures, but discard the body
            # If it's a def or class, we just keep the signature line (up to the colon)
            if match.group('type') in ['class', 'def', 'async def']:
                # Find the ending colon of the signature
                sig_end = line.find(':')
                if sig_end != -1:
                    skeleton.append(line[:sig_end+1])
                else:
                    skeleton.append(line)
            else:
                # Keep imports
                skeleton.append(line)
                
    return "\n".join(skeleton) + "\n\n# ... Body content removed to save space ..."

def _skeletonize_javascript(content: str) -> str:
    """Extract exports, classes, and function signatures for JS/TS."""
    skeleton = []
    lines = content.splitlines()
    
    # Matches: exports, imports, classes, functions, const/let/var declarations
    patterns = [
        r'^import .*',
        r'^export .*',
        r'^(?:export\s+)?(?:async\s+)?function\s+\w+\s*\(.*',
        r'^(?:export\s+)?class\s+\w+.*',
        r'^(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*(?:\(.*\)|function|=>).*'
    ]
    combined_pattern = re.compile('|'.join(f'(?:{p})' for p in patterns))
    
    for line in lines:
        stripped = line.strip()
        if combined_pattern.match(stripped):
            # For signatures, we want to stop BEFORE the function/class body starts '{'
            # Heuristic: split on the last '{' ONLY if it's at the end of the line 
            # or follows ')' or '=>'
            if '{' in line:
                # Find the start of the block. Usually ends with ') {' or '=> {' or 'class ... {'
                # We'll take everything before the LAST '{' if there are multiple.
                # This covers ({ prop }) => { correctly as long as the body brace is the last one.
                parts = line.rsplit('{', 1)
                if len(parts) > 1 and (stripped.endswith('{') or ')' in parts[0] or '=>' in parts[0]):
                    skeleton.append(parts[0].strip())
                else:
                    skeleton.append(line)
            else:
                skeleton.append(line)
            
    return "\n".join(skeleton) + "\n\n// ... Body content removed to save space ..."
