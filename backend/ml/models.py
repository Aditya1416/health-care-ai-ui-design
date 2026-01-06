import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
from typing import Dict, List, Tuple

class SymptomDiseasePredictor:
    """Multi-model ensemble for disease prediction"""
    
    def __init__(self, model_path: str = "models/"):
        self.model_path = model_path
        os.makedirs(model_path, exist_ok=True)
        
        self.scaler = StandardScaler()
        self.lr_model = LogisticRegression(max_iter=1000)
        self.rf_model = RandomForestClassifier(n_estimators=100)
        self.xgb_model = XGBClassifier(n_estimators=100)
        self.mlp_model = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=500)
        
        self.diseases = [
            "Common Cold", "Flu", "COVID-19", "Pneumonia", 
            "Bronchitis", "Asthma", "Allergies", "Migraine"
        ]
        self.feature_names = [
            "age", "temperature", "cough_severity", "fatigue",
            "body_ache", "aqi", "humidity", "temperature_env"
        ]
    
    def train(self, X: np.ndarray, y: np.ndarray):
        """Train all models"""
        X_scaled = self.scaler.fit_transform(X)
        
        self.lr_model.fit(X_scaled, y)
        self.rf_model.fit(X_scaled, y)
        self.xgb_model.fit(X_scaled, y)
        self.mlp_model.fit(X_scaled, y)
        
        self.save()
    
    def predict(self, X: np.ndarray) -> Dict:
        """Ensemble prediction with confidence scores"""
        X_scaled = self.scaler.transform(X)
        
        # Get predictions from all models
        lr_proba = self.lr_model.predict_proba(X_scaled)[0]
        rf_proba = self.rf_model.predict_proba(X_scaled)[0]
        xgb_proba = self.xgb_model.predict_proba(X_scaled)[0]
        mlp_proba = self.mlp_model.predict_proba(X_scaled)[0]
        
        # Ensemble: average probabilities
        ensemble_proba = (lr_proba + rf_proba + xgb_proba + mlp_proba) / 4
        
        # Get top predictions
        top_indices = np.argsort(ensemble_proba)[-3:][::-1]
        
        predictions = []
        for idx in top_indices:
            predictions.append({
                "disease": self.diseases[idx],
                "confidence": float(ensemble_proba[idx]),
                "severity": self._calculate_severity(ensemble_proba[idx])
            })
        
        return {
            "predictions": predictions,
            "explanation": self._generate_explanation(X[0])
        }
    
    def _calculate_severity(self, confidence: float) -> int:
        """Map confidence to severity level"""
        if confidence > 0.8:
            return 5
        elif confidence > 0.6:
            return 4
        elif confidence > 0.4:
            return 3
        elif confidence > 0.2:
            return 2
        else:
            return 1
    
    def _generate_explanation(self, features: np.ndarray) -> str:
        """Generate human-readable explanation"""
        explanations = []
        for i, feature in enumerate(self.feature_names):
            value = features[i]
            if feature == "temperature" and value > 38:
                explanations.append(f"High temperature detected ({value}°C)")
            elif feature == "cough_severity" and value > 5:
                explanations.append(f"Moderate to severe cough reported")
            elif feature == "aqi" and value > 150:
                explanations.append(f"Poor air quality index ({value})")
        
        return " | ".join(explanations) if explanations else "Standard symptom profile"
    
    def save(self):
        """Save trained models"""
        joblib.dump(self.scaler, os.path.join(self.model_path, "scaler.pkl"))
        joblib.dump(self.lr_model, os.path.join(self.model_path, "lr_model.pkl"))
        joblib.dump(self.rf_model, os.path.join(self.model_path, "rf_model.pkl"))
        joblib.dump(self.xgb_model, os.path.join(self.model_path, "xgb_model.pkl"))
        joblib.dump(self.mlp_model, os.path.join(self.model_path, "mlp_model.pkl"))
    
    def load(self):
        """Load pre-trained models"""
        self.scaler = joblib.load(os.path.join(self.model_path, "scaler.pkl"))
        self.lr_model = joblib.load(os.path.join(self.model_path, "lr_model.pkl"))
        self.rf_model = joblib.load(os.path.join(self.model_path, "rf_model.pkl"))
        self.xgb_model = joblib.load(os.path.join(self.model_path, "xgb_model.pkl"))
        self.mlp_model = joblib.load(os.path.join(self.model_path, "mlp_model.pkl"))
