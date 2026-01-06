from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
from config import settings
import hashlib

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Mock database
USERS_DB = {
    "aditya161499@gmail.com": {
        "id": "admin-001",
        "email": "aditya161499@gmail.com",
        "password_hash": hashlib.sha256("password".encode()).hexdigest(),
        "role": "admin",
    }
}

def create_access_token(user_id: str, email: str, role: str, expires_delta: timedelta = None):
    """Create JWT token"""
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """User login endpoint"""
    user = USERS_DB.get(request.email)
    
    if not user:
        # Auto-register as patient
        user_id = f"patient-{len(USERS_DB)}"
        USERS_DB[request.email] = {
            "id": user_id,
            "email": request.email,
            "password_hash": hashlib.sha256(request.password.encode()).hexdigest(),
            "role": "patient",
        }
        user = USERS_DB[request.email]
    
    # Verify password
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if user["password_hash"] != password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token(
        user_id=user["id"],
        email=user["email"],
        role=user["role"]
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user["id"],
            "email": user["email"],
            "role": user["role"]
        }
    )

@router.post("/logout")
async def logout():
    """User logout endpoint"""
    return {"message": "Logged out successfully"}
