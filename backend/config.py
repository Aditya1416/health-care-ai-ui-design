from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Healthcare AI"
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/healthcare_ai")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # ML Models
    MODEL_PATH: str = "models/"
    ENABLE_GPU: bool = os.getenv("ENABLE_GPU", "False") == "True"
    
    # AWS/Storage
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME: str = os.getenv("AWS_STORAGE_BUCKET_NAME", "healthcare-ai")
    
    class Config:
        env_file = ".env"

settings = Settings()
