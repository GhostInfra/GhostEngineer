"""
GhostEngineer - Auth Service

Handles user registration, authentication, and JWT token management.
"""

import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from backend.services.database import get_connection
from backend.utils.logger import get_logger

logger = get_logger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET", "ghostengineer-dev-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_user(email: str, password: str) -> dict:
    """Create a new user in the database."""
    conn = get_connection()
    try:
        password_hash = hash_password(password)
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email.lower().strip(), password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        logger.info(f"User created: {email}")
        return {"id": user_id, "email": email.lower().strip()}
    except Exception as e:
        if "UNIQUE constraint" in str(e):
            raise ValueError("An account with this email already exists.")
        logger.error(f"Error creating user: {e}")
        raise
    finally:
        conn.close()


def authenticate_user(email: str, password: str) -> dict:
    """Authenticate a user by email and password."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?",
            (email.lower().strip(),)
        ).fetchone()
        
        if not row:
            raise ValueError("Invalid email or password.")
        
        if not verify_password(password, row["password_hash"]):
            raise ValueError("Invalid email or password.")
        
        logger.info(f"User authenticated: {email}")
        return {"id": row["id"], "email": row["email"]}
    finally:
        conn.close()


def create_access_token(user_id: int, email: str) -> str:
    """Generate a JWT access token."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(token: str) -> dict:
    """Decode a JWT token and return the user info."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {"id": int(payload["sub"]), "email": payload["email"]}
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token.")
