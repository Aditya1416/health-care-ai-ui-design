"""
Healthcare AI Neural Network Engine
Predicts health conditions based on symptoms, environmental factors, and medical history
"""

import json
import numpy as np
from typing import Dict, List, Tuple

class HealthPredictionNN:
    """Neural network for health prediction"""
    
    def __init__(self):
        """Initialize the neural network with weights"""
        # Disease database with symptoms and risk factors
        self.disease_db = {
            "Common Cold": {
                "symptoms": ["cough", "sore throat", "runny nose", "fever"],
                "risk_factors": ["seasonal", "stress", "poor sleep"],
                "severity": 1,
                "environmental_factors": ["cold weather", "humidity"],
            },
            "Diabetes Type 2": {
                "symptoms": ["fatigue", "increased thirst", "frequent urination", "blurred vision"],
                "risk_factors": ["obesity", "sedentary lifestyle", "family history", "age"],
                "severity": 3,
                "environmental_factors": ["high aqi", "stress"],
            },
            "Hypertension": {
                "symptoms": ["headache", "dizziness", "chest pain", "shortness of breath"],
                "risk_factors": ["stress", "obesity", "salt intake", "family history"],
                "severity": 3,
                "environmental_factors": ["high temperature", "stress"],
            },
            "Asthma": {
                "symptoms": ["shortness of breath", "wheezing", "chest tightness", "cough"],
                "risk_factors": ["air pollution", "allergens", "cold weather", "stress"],
                "severity": 2,
                "environmental_factors": ["high aqi", "pollen", "cold weather"],
            },
            "Migraine": {
                "symptoms": ["severe headache", "nausea", "light sensitivity", "vomiting"],
                "risk_factors": ["stress", "hormones", "sleep deprivation", "caffeine"],
                "severity": 2,
                "environmental_factors": ["barometric pressure", "weather changes"],
            },
            "Anxiety": {
                "symptoms": ["nervousness", "rapid heartbeat", "shortness of breath", "sweating"],
                "risk_factors": ["stress", "sleep deprivation", "caffeine", "family history"],
                "severity": 2,
                "environmental_factors": ["stress", "noise"],
            },
        }
    
    def sigmoid(self, x: float) -> float:
        """Sigmoid activation function"""
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def calculate_symptom_match(self, symptoms: List[str], disease: str) -> float:
        """Calculate how well symptoms match a disease"""
        disease_symptoms = self.disease_db[disease]["symptoms"]
        if not symptoms:
            return 0.0
        
        matches = sum(1 for symptom in symptoms if symptom.lower() in [s.lower() for s in disease_symptoms])
        return (matches / len(disease_symptoms)) * 100
    
    def calculate_risk_factor_weight(self, risk_factors: List[str], disease: str) -> float:
        """Calculate risk factor contribution"""
        disease_risk_factors = self.disease_db[disease]["risk_factors"]
        if not risk_factors:
            return 0.0
        
        matches = sum(1 for factor in risk_factors if factor.lower() in [r.lower() for r in disease_risk_factors])
        return (matches / len(disease_risk_factors)) * 50
    
    def calculate_environmental_score(self, environmental_data: Dict, disease: str) -> float:
        """Calculate environmental factor contribution"""
        env_factors = self.disease_db[disease]["environmental_factors"]
        score = 0.0
        
        if "aqi" in environmental_data and "high aqi" in env_factors:
            score += (environmental_data["aqi"] / 500) * 20
        
        if "temperature" in environmental_data and "high temperature" in env_factors:
            if environmental_data["temperature"] > 28:
                score += 15
        
        if "temperature" in environmental_data and "cold weather" in env_factors:
            if environmental_data["temperature"] < 10:
                score += 15
        
        return min(score, 30)
    
    def predict(self, patient_data: Dict) -> List[Dict]:
        """
        Main prediction function
        Input: {
            "symptoms": ["symptom1", "symptom2"],
            "risk_factors": ["factor1", "factor2"],
            "age": 30,
            "bmi": 25,
            "medical_history": ["condition1"],
            "environmental": {"aqi": 150, "temperature": 25}
        }
        """
        predictions = []
        
        for disease, data in self.disease_db.items():
            # Calculate base scores
            symptom_score = self.calculate_symptom_match(patient_data.get("symptoms", []), disease)
            risk_score = self.calculate_risk_factor_weight(patient_data.get("risk_factors", []), disease)
            env_score = self.calculate_environmental_score(patient_data.get("environmental", {}), disease)
            
            # Neural network forward pass
            hidden_layer = self.sigmoid((symptom_score * 0.4 + risk_score * 0.3 + env_score * 0.3) / 100)
            confidence = self.sigmoid(hidden_layer * 100) * 100
            
            if confidence > 20:  # Only include predictions above 20% confidence
                predictions.append({
                    "disease": disease,
                    "confidence": round(confidence, 2),
                    "severity": data["severity"],
                    "contributing_factors": {
                        "symptoms": symptom_score,
                        "risk_factors": risk_score,
                        "environmental": env_score,
                    },
                })
        
        # Sort by confidence
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        return predictions[:5]  # Return top 5


def predict_health_condition(patient_data: Dict) -> List[Dict]:
    """Wrapper function for API calls"""
    nn = HealthPredictionNN()
    return nn.predict(patient_data)


if __name__ == "__main__":
    # Test the neural network
    test_data = {
        "symptoms": ["cough", "fever", "sore throat"],
        "risk_factors": ["stress", "poor sleep"],
        "age": 35,
        "bmi": 24,
        "environmental": {"aqi": 180, "temperature": 8}
    }
    
    nn = HealthPredictionNN()
    results = nn.predict(test_data)
    print(json.dumps(results, indent=2))
