-- Healthcare AI System - Complete Database Setup
-- Run this ONCE to initialize everything

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing tables if they exist (clean start)
DROP TABLE IF EXISTS health_predictions CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS medical_imaging CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS disease_knowledge CASCADE;
DROP TABLE IF EXISTS environmental_data CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  height_cm DECIMAL,
  weight_kg DECIMAL,
  blood_type TEXT,
  medical_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  medications TEXT[] DEFAULT ARRAY[]::TEXT[],
  emergency_contact TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create health_metrics table
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL,
  height_cm DECIMAL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature_celsius DECIMAL,
  blood_glucose INTEGER,
  oxygen_saturation DECIMAL,
  bmi DECIMAL,
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT,
  appointment_type TEXT,
  appointment_date TIMESTAMP,
  appointment_time TEXT,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT,
  title TEXT,
  description TEXT,
  file_url TEXT,
  recorded_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create disease_knowledge table
CREATE TABLE disease_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disease_name TEXT UNIQUE NOT NULL,
  symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
  severity TEXT,
  duration_days INTEGER,
  complications TEXT[] DEFAULT ARRAY[]::TEXT[],
  treatments TEXT[] DEFAULT ARRAY[]::TEXT[],
  prevention TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create environmental_data table
CREATE TABLE environmental_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  temperature_celsius DECIMAL,
  humidity_percent DECIMAL,
  aqi_index INTEGER,
  aqi_level TEXT,
  pm25 DECIMAL,
  pm10 DECIMAL,
  pollen_level TEXT,
  recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create medical_imaging table
CREATE TABLE medical_imaging (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_type TEXT,
  file_url TEXT,
  analysis_result JSONB,
  abnormalities_detected TEXT[] DEFAULT ARRAY[]::TEXT[],
  confidence_score DECIMAL,
  uploaded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create health_predictions table
CREATE TABLE health_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prediction_type TEXT,
  predicted_disease TEXT,
  confidence_score DECIMAL,
  contributing_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
  risk_level TEXT,
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  prediction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_recorded_at ON health_metrics(recorded_at);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX idx_environmental_data_user_id ON environmental_data(user_id);
CREATE INDEX idx_medical_imaging_user_id ON medical_imaging(user_id);
CREATE INDEX idx_health_predictions_user_id ON health_predictions(user_id);
CREATE INDEX idx_disease_knowledge_name ON disease_knowledge(disease_name);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_imaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "user_profiles_select" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_update" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "health_metrics_select" ON health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "health_metrics_insert" ON health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_select" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "appointments_insert" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments_update" ON appointments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "medical_records_select" ON medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "medical_records_insert" ON medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "environmental_data_select" ON environmental_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "environmental_data_insert" ON environmental_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "medical_imaging_select" ON medical_imaging FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "medical_imaging_insert" ON medical_imaging FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "health_predictions_select" ON health_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "health_predictions_insert" ON health_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Disease knowledge is public readable
ALTER TABLE disease_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disease_knowledge_select" ON disease_knowledge FOR SELECT USING (TRUE);

-- Seed admin user
INSERT INTO admin_users (email, password_hash) VALUES 
('aditya161499@gmail.com', 'password')
ON CONFLICT (email) DO NOTHING;

-- Seed disease knowledge base
INSERT INTO disease_knowledge (disease_name, symptoms, severity, treatments, prevention) VALUES
('Flu', ARRAY['fever', 'cough', 'sore throat', 'fatigue'], 'moderate', ARRAY['rest', 'fluids', 'antiviral medications'], ARRAY['flu vaccine', 'hand hygiene']),
('Common Cold', ARRAY['runny nose', 'sneezing', 'sore throat', 'cough'], 'mild', ARRAY['rest', 'fluids', 'decongestants'], ARRAY['hand hygiene', 'avoid contact']),
('Asthma', ARRAY['shortness of breath', 'wheezing', 'chest tightness', 'cough'], 'moderate', ARRAY['inhalers', 'corticosteroids'], ARRAY['avoid triggers', 'exercise']),
('Diabetes', ARRAY['increased thirst', 'frequent urination', 'fatigue', 'blurred vision'], 'moderate', ARRAY['insulin', 'metformin', 'diet control'], ARRAY['healthy diet', 'exercise']),
('Hypertension', ARRAY['headache', 'shortness of breath', 'chest pain'], 'high', ARRAY['ACE inhibitors', 'diuretics', 'lifestyle changes'], ARRAY['salt reduction', 'exercise']),
('Anxiety Disorder', ARRAY['nervousness', 'panic attacks', 'insomnia', 'sweating'], 'mild', ARRAY['therapy', 'SSRIs', 'meditation'], ARRAY['stress management', 'exercise']),
('Migraine', ARRAY['severe headache', 'nausea', 'light sensitivity'], 'moderate', ARRAY['triptans', 'NSAIDs', 'rest'], ARRAY['hydration', 'sleep']),
('COVID-19', ARRAY['fever', 'cough', 'loss of taste', 'loss of smell', 'difficulty breathing'], 'high', ARRAY['rest', 'oxygen therapy', 'antivirals'], ARRAY['vaccination', 'mask wearing'])
ON CONFLICT (disease_name) DO NOTHING;
