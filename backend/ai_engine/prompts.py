"""
Prompts - Centralized prompt templates for the AI engine.
"""

SYSTEM_PROMPT = """You are GhostEngineer, an AI assistant that analyzes GitHub
repositories and generates architecture insights, documentation, and
onboarding guides."""

SUMMARIZE_PROMPT = """Analyze the following repository structure and file
contents. Generate a comprehensive summary.

NOTE: Some files may be marked as (SKELETON). This means the file was too large, 
and only imports, classes, and function signatures were extracted to save space. 
Use these signatures to infer the file's purpose.

1. **Architecture Overview** – High-level design and key components.
2. **Tech Stack** – Languages, frameworks, and tooling detected.
3. **Key Files** – Important files and their roles.
4. **Onboarding Guide** – Steps for a new developer to get started.

Repository Structure:
{structure}

File Contents:
{file_contents}
"""
