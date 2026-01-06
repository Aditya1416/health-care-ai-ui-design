-- Reordering tables to ensure parent tables are created first, adding ON DELETE CASCADE for data integrity

DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS medical_images CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS disease_knowledge CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table first (parent table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create patients table (depends on users)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    allergies TEXT,
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create doctors table (depends on users)
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    clinic_address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create disease knowledge table (no dependencies)
CREATE TABLE disease_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_name VARCHAR(255) UNIQUE,
    symptoms TEXT ARRAY,
    severity_level INT,
    environmental_risk_factors TEXT ARRAY,
    treatment_guidelines TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health metrics (depends on patients)
CREATE TABLE health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    metric_type VARCHAR(100),
    value FLOAT,
    unit VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medical images (depends on patients)
CREATE TABLE medical_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    image_type VARCHAR(100),
    file_path VARCHAR(500),
    analysis_result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create predictions (depends on patients and doctors)
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    predicted_disease VARCHAR(255),
    confidence_score FLOAT,
    severity_level INT,
    explanation TEXT,
    environmental_factors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reports (depends on patients and doctors)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    report_pdf BYTEA,
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments (depends on patients and doctors)
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP,
    appointment_type VARCHAR(100),
    status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_patient_user ON patients(user_id);
CREATE INDEX idx_doctor_user ON doctors(user_id);
CREATE INDEX idx_metrics_patient ON health_metrics(patient_id);
CREATE INDEX idx_images_patient ON medical_images(patient_id);
CREATE INDEX idx_predictions_patient ON predictions(patient_id);
CREATE INDEX idx_reports_patient ON reports(patient_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
