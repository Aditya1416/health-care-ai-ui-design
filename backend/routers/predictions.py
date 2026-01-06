from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
import numpy as np
from ml.models import SymptomDiseasePredictor

router = APIRouter()

class PredictionRequest(BaseModel):
    age: float
    temperature: float
    cough_severity: float
    fatigue: float
    body_ache: float
    aqi: float
    humidity: float
    temperature_env: float

class DiseaseInfo(BaseModel):
    disease: str
    confidence: float
    severity: int

class PredictionResponse(BaseModel):
    predictions: List[DiseaseInfo]
    explanation: str

# Initialize predictor
predictor = SymptomDiseasePredictor()
try:
    predictor.load()
except:
    pass

@router.post("/diagnose", response_model=PredictionResponse)
async def diagnose(request: PredictionRequest):
    """Get AI disease prediction"""
    features = np.array([[
        request.age,
        request.temperature,
        request.cough_severity,
        request.fatigue,
        request.body_ache,
        request.aqi,
        request.humidity,
        request.temperature_env
    ]])
    
    result = predictor.predict(features)
    
    predictions = [
        DiseaseInfo(**pred) for pred in result["predictions"]
    ]
    
    return PredictionResponse(
        predictions=predictions,
        explanation=result["explanation"]
    )
