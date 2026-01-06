from enum import Enum
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    PATIENT = "patient"

class User(BaseModel):
    id: str
    email: str
    role: UserRole
    created_at: datetime
    is_active: bool = True

class TokenData(BaseModel):
    user_id: str
    email: str
    role: UserRole
    exp: float

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User
