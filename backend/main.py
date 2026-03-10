"""
GhostEngineer Backend - Main Entry Point

FastAPI server exposing the repository analysis pipeline.
"""

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

from backend.services.analysis_service import analyze_repository
from backend.services.database import init_db
from backend.services.auth import (
    create_user,
    authenticate_user,
    create_access_token,
    get_current_user,
)
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


# --- Models ---

class AnalysisRequest(BaseModel):
    repo_url: str
    bypass_cache: bool = False


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# --- Startup ---

@app.on_event("startup")
def on_startup():
    """Initialize the database on server startup."""
    init_db()
    logger.info("🗄️ Database ready.")


# --- Root ---

@app.get("/")
def read_root():
    return {"message": "👻 GhostEngineer API is alive", "status": "active"}


# --- Analysis (Public) ---

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


# --- Auth Endpoints ---

@app.post("/api/auth/signup", status_code=201)
async def signup(request: SignupRequest):
    """Register a new user."""
    if not request.email or not request.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    
    try:
        user = create_user(request.email, request.password)
        token = create_access_token(user["id"], user["email"])
        return {"user": user, "token": token}
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create account.")


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Authenticate a user and return a JWT token."""
    try:
        user = authenticate_user(request.email, request.password)
        token = create_access_token(user["id"], user["email"])
        return {"user": user, "token": token}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed.")


@app.get("/api/auth/me")
async def get_me(authorization: Optional[str] = Header(None)):
    """Get the currently authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    
    token = authorization.split(" ")[1]
    try:
        user = get_current_user(token)
        return {"user": user}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


def main():
    """Start the GhostEngineer backend server using Uvicorn."""
    logger.info("🚀 Starting GhostEngineer backend server...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
