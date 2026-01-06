import random
import psycopg2
from datetime import datetime, timedelta
import json
from faker import Faker

fake = Faker()

# Database connection
conn = psycopg2.connect(
    dbname="healthcare_ai",
    user="postgres",
    password="password",
    host="localhost"
)
cursor = conn.cursor()

# Disease data
DISEASES = [
    {"name": "Common Cold", "severity": 1, "symptoms": ["cough", "runny_nose", "sore_throat"]},
    {"name": "Flu", "severity": 2, "symptoms": ["fever", "cough", "body_ache", "fatigue"]},
    {"name": "COVID-19", "severity": 3, "symptoms": ["fever", "cough", "loss_of_taste", "fatigue"]},
    {"name": "Pneumonia", "severity": 4, "symptoms": ["severe_cough", "chest_pain", "fever"]},
    {"name": "Asthma", "severity": 2, "symptoms": ["shortness_of_breath", "wheezing", "chest_tightness"]},
    {"name": "Allergies", "severity": 1, "symptoms": ["itching", "sneezing", "runny_nose"]},
    {"name": "Bronchitis", "severity": 2, "symptoms": ["persistent_cough", "mucus", "fatigue"]},
    {"name": "Migraine", "severity": 2, "symptoms": ["severe_headache", "nausea", "sensitivity_to_light"]},
]

def generate_users(n=50):
    """Generate admin, doctor, and patient users"""
    # Admin
    cursor.execute(
        "INSERT INTO users (email, password_hash, role, full_name) VALUES (%s, %s, %s, %s)",
        ("aditya161499@gmail.com", "hashed_password", "admin", "Aditya Admin")
    )
    
    # Doctors
    for i in range(int(n * 0.2)):
        email = f"doctor_{i+1}@healthcare.com"
        cursor.execute(
            "INSERT INTO users (email, password_hash, role, full_name) VALUES (%s, %s, %s, %s)",
            (email, "hashed_password", "doctor", fake.name())
        )
    
    # Patients
    for i in range(int(n * 0.8)):
        email = f"patient_{i+1}@example.com"
        cursor.execute(
            "INSERT INTO users (email, password_hash, role, full_name) VALUES (%s, %s, %s, %s)",
            (email, "hashed_password", "patient", fake.name())
        )

def generate_disease_knowledge():
    """Populate disease knowledge base"""
    for disease in DISEASES:
        cursor.execute(
            "INSERT INTO disease_knowledge (disease_name, symptoms, severity_level, environmental_risk_factors) VALUES (%s, %s, %s, %s)",
            (disease["name"], disease["symptoms"], disease["severity"], ["high_pollution", "cold_weather", "stress"])
        )

def generate_health_metrics(patient_id, n=500):
    """Generate health metrics for a patient"""
    for i in range(n):
        days_ago = random.randint(1, 365)
        recorded_at = datetime.now() - timedelta(days=days_ago)
        
        metric_type = random.choice(["temperature", "blood_pressure", "heart_rate", "blood_sugar"])
        
        if metric_type == "temperature":
            value = round(36 + random.gauss(0.5, 0.5), 1)
            unit = "°C"
        elif metric_type == "blood_pressure":
            value = f"{random.randint(110, 140)}/{random.randint(70, 90)}"
            unit = "mmHg"
        elif metric_type == "heart_rate":
            value = random.randint(60, 100)
            unit = "bpm"
        else:
            value = round(random.gauss(100, 20), 1)
            unit = "mg/dL"
        
        cursor.execute(
            "INSERT INTO health_metrics (patient_id, metric_type, value, unit, recorded_at) VALUES (%s, %s, %s, %s, %s)",
            (patient_id, metric_type, value, unit, recorded_at)
        )

if __name__ == "__main__":
    print("Generating database...")
    
    generate_users(50)
    generate_disease_knowledge()
    
    # Get patient IDs
    cursor.execute("SELECT id FROM patients LIMIT 40")
    patients = cursor.fetchall()
    
    for patient_id, in patients:
        generate_health_metrics(patient_id, 500)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("Data generation complete!")
