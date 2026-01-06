from fastapi import APIRouter

router = APIRouter()

@router.get("/statistics")
async def get_statistics():
    """Get admin dashboard statistics"""
    return {
        "total_patients": 10250,
        "total_doctors": 145,
        "total_scans": 5680,
        "total_predictions": 45320,
        "model_accuracy": 0.87,
        "system_uptime": "99.8%",
        "active_users": 234
    }

@router.get("/model-performance")
async def get_model_performance():
    """Get ML model performance metrics"""
    return {
        "logistic_regression": {"accuracy": 0.82, "f1_score": 0.79},
        "random_forest": {"accuracy": 0.88, "f1_score": 0.86},
        "xgboost": {"accuracy": 0.89, "f1_score": 0.87},
        "neural_network": {"accuracy": 0.85, "f1_score": 0.83},
        "ensemble": {"accuracy": 0.91, "f1_score": 0.89}
    }
