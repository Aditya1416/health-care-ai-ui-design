-- Healthcare AI System Database Schema
-- Clean, production-ready schema with proper RLS policies

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (fresh start)
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS disease_knowledge CASCADE;

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_type VARCHAR(10),
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Disease Knowledge Base
CREATE TABLE disease_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disease_name VARCHAR(255) NOT NULL,
  symptoms TEXT[] NOT NULL,
  risk_factors TEXT[] NOT NULL,
  description TEXT,
  severity_level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Health Metrics Table
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50),
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_recorded_at ON health_metrics(recorded_at);

-- Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  doctor_name VARCHAR(255),
  appointment_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Medical Records Table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  record_type VARCHAR(100),
  title VARCHAR(255),
  description TEXT,
  file_url VARCHAR(500),
  record_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);

-- Predictions Table (for AI predictions)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  predicted_disease VARCHAR(255),
  confidence_score DECIMAL(5, 2),
  contributing_factors TEXT[] NOT NULL,
  severity_level INT,
  recommendation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles - Users can only see their own profile
CREATE POLICY user_profile_select ON user_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY user_profile_insert ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_profile_update ON user_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for health_metrics - Users can only see their own metrics
CREATE POLICY health_metrics_select ON health_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY health_metrics_insert ON health_metrics FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY health_metrics_update ON health_metrics FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for appointments - Users can only see their own appointments
CREATE POLICY appointments_select ON appointments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY appointments_insert ON appointments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY appointments_update ON appointments FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for medical_records - Users can only see their own records
CREATE POLICY medical_records_select ON medical_records FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY medical_records_insert ON medical_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY medical_records_update ON medical_records FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for predictions - Users can only see their own predictions
CREATE POLICY predictions_select ON predictions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY predictions_insert ON predictions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS for admin access (disable for service role)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
