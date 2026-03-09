"""
Summarizer - Uses LLM to generate architecture insights & documentation.
"""

import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional
from backend.ai_engine.prompts import SYSTEM_PROMPT, SUMMARIZE_PROMPT
from backend.utils.logger import get_logger

logger = get_logger(__name__)

# Initialize the Gemini client
# Note: In production, we'd want this initialized once or at least better managed.
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOGLE_API_KEY and GOOGLE_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GOOGLE_API_KEY)
    # Using gemini-flash-lite-latest (1.5 Flash 8B) for better quota accessibility on the free tier.
    llm_model = genai.GenerativeModel(
        model_name="gemini-flash-lite-latest",
        system_instruction=SYSTEM_PROMPT
    )
else:
    logger.warning("GOOGLE_API_KEY not found or default value used. AI summarization will be disabled.")
    llm_model = None


def summarize_repo(structure: Dict, file_contents: List[Dict]) -> str:
    """
    Generate an AI-powered summary of the repository.

    Args:
        structure: The parsed directory structure.
        file_contents: Extracted file contents (list of {path, content}).

    Returns:
        A markdown-formatted summary of the repository.
    """
    if not llm_model:
        return "⚠️ AI Summarization is disabled. Please provide a valid GOOGLE_API_KEY in your .env file."

    logger.info("Generating AI summary...")

    try:
        # 1. Prepare the structure string (simplified JSON)
        structure_str = json.dumps(structure, indent=2)

        # 2. Prepare the file contents string (formatted as path: content)
        files_str = ""
        for file in file_contents:
            file_type_label = f" ({file.get('type', 'full').upper()})" if file.get('type') == 'skeleton' else ""
            files_str += f"--- FILE: {file['path']}{file_type_label} ---\n"
            files_str += f"{file['content']}\n\n"

        # 3. Format the prompt
        prompt = SUMMARIZE_PROMPT.format(
            structure=structure_str,
            file_contents=files_str
        )

        # 4. Generate content
        response = llm_model.generate_content(prompt)

        if not response.text:
            logger.error("Empty response from Gemini API.")
            return "Error: The AI model returned an empty response."

        logger.info("AI summary generated successfully.")
        return response.text

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error during AI summarization: {error_msg}")
        
        if "429" in error_msg:
            return "Error: AI Quota Exceeded. You are using the Free Tier of Google AI Studio. Please wait 60 seconds and try again, or check your limits at https://aistudio.google.com/app/plan"
            
        return f"Error: Failed to generate AI summary. ({error_msg})"
