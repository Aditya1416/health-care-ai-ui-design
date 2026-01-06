import numpy as np
import pandas as pd
from models import SymptomDiseasePredictor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def generate_synthetic_training_data(n_samples: int = 10000):
    """Generate synthetic training data for demo"""
    np.random.seed(42)
    
    # Features: age, temperature, cough_severity, fatigue, body_ache, aqi, humidity, temperature_env
    X = np.random.rand(n_samples, 8) * 100
    X[:, 1] = 36 + np.random.randn(n_samples) * 2  # temperature
    X[:, 5] = np.random.rand(n_samples) * 200  # AQI
    
    # Generate labels with some correlation to features
    y = np.zeros(n_samples, dtype=int)
    for i in range(n_samples):
        score = 0
        if X[i, 1] > 38: score += 3
        if X[i, 2] > 5: score += 2
        if X[i, 5] > 150: score += 2
        y[i] = min(score // 2, 7)  # Assign disease type 0-7
    
    return X, y

def train_models():
    """Train and save ML models"""
    print("Generating training data...")
    X, y = generate_synthetic_training_data(10000)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print("Training models...")
    predictor = SymptomDiseasePredictor()
    predictor.train(X_train, y_train)
    
    # Evaluate
    predictions = []
    for sample in X_test:
        result = predictor.predict(sample.reshape(1, -1))
        top_prediction = result["predictions"][0]["disease"]
        disease_index = predictor.diseases.index(top_prediction)
        predictions.append(disease_index)
    
    predictions = np.array(predictions)
    accuracy = accuracy_score(y_test, predictions)
    
    print(f"Model Accuracy: {accuracy:.4f}")
    print("Models saved successfully!")

if __name__ == "__main__":
    train_models()
