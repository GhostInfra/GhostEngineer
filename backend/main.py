"""
GhostEngineer Backend - Main Entry Point

FastAPI server exposing the repository analysis pipeline.
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from dotenv import load_dotenv

load_dotenv()

from backend.services.analysis_service import analyze_repository
from backend.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="GhostEngineer API",
    description="AI-powered GitHub repository analysis and documentation generator.",
    version="0.1.0"
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    repo_url: str
    bypass_cache: bool = False


@app.get("/")
def read_root():
    return {"message": "👻 GhostEngineer API is alive", "status": "active"}


@app.post("/api/analyze")
async def analyze_repo_endpoint(request: AnalysisRequest):
    """
    Endpoint to trigger analysis of a GitHub repository.
    """
    try:
        logger.info(f"Received analysis request for: {request.repo_url}")
        result = analyze_repository(request.repo_url, bypass_cache=request.bypass_cache)
        return result
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        logger.error(f"Execution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.critical(f"Uncaught exception: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


def main():
    """Start the GhostEngineer backend server using Uvicorn."""
    logger.info("🚀 Starting GhostEngineer backend server...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
