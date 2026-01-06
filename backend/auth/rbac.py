from enum import Enum
from typing import List
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import jwt
from config import settings
from datetime import datetime, timedelta
from auth.models import UserRole, TokenData

security = HTTPBearer()

class Permission(str, Enum):
    # Patient permissions
    VIEW_OWN_RECORDS = "view_own_records"
    EDIT_OWN_RECORDS = "edit_own_records"
    VIEW_OWN_PREDICTIONS = "view_own_predictions"
    UPLOAD_SCANS = "upload_scans"
    
    # Doctor permissions
    VIEW_ASSIGNED_PATIENTS = "view_assigned_patients"
    VIEW_PREDICTIONS = "view_predictions"
    GENERATE_REPORTS = "generate_reports"
    PRESCRIBE = "prescribe"
    
    # Admin permissions
    VIEW_ALL_DATA = "view_all_data"
    MANAGE_USERS = "manage_users"
    MANAGE_MODELS = "manage_models"
    VIEW_ANALYTICS = "view_analytics"

# Role-Permission Mapping
ROLE_PERMISSIONS = {
    UserRole.PATIENT: [
        Permission.VIEW_OWN_RECORDS,
        Permission.EDIT_OWN_RECORDS,
        Permission.VIEW_OWN_PREDICTIONS,
        Permission.UPLOAD_SCANS,
    ],
    UserRole.DOCTOR: [
        Permission.VIEW_ASSIGNED_PATIENTS,
        Permission.VIEW_PREDICTIONS,
        Permission.GENERATE_REPORTS,
        Permission.PRESCRIBE,
    ],
    UserRole.ADMIN: [p for p in Permission],
}

def create_access_token(user_id: str, email: str, role: UserRole, expires_delta: timedelta = None):
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    expire = datetime.utcnow() + expires_delta
    token_data = TokenData(user_id=user_id, email=email, role=role, exp=expire.timestamp())
    
    encoded_jwt = jwt.encode(
        token_data.dict(),
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)) -> TokenData:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role")
        
        if not all([user_id, email, role]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        return TokenData(user_id=user_id, email=email, role=UserRole(role), exp=payload.get("exp"))
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def require_role(*allowed_roles: UserRole):
    async def role_checker(token: TokenData = Depends(verify_token)) -> TokenData:
        if token.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return token
    return role_checker

def require_permission(permission: Permission):
    async def permission_checker(token: TokenData = Depends(verify_token)) -> TokenData:
        role_permissions = ROLE_PERMISSIONS.get(token.role, [])
        if permission not in role_permissions:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Missing permission: {permission}")
        return token
    return permission_checker
