-- Healthcare AI Demo Data Seeding Script
-- This script seeds demo data matching the LIVE database schema

DO $$ 
DECLARE
  v_admin_user_id UUID;
  v_patient_id UUID;
  v_doctor_id UUID;
BEGIN
  -- Get or create admin user (assumes user exists in auth.users)
  -- Using a known UUID for the admin user
  v_admin_user_id := '550e8400-e29b-41d4-a716-446655440000'::UUID;
  
  -- Create a patient record if it doesn't exist
  INSERT INTO patients (user_id, gender, blood_type, date_of_birth, medical_history, allergies, created_at)
  VALUES (
    v_admin_user_id,
    'Male',
    'O+',
    '1990-01-15'::DATE,
    'No significant medical history',
    'Penicillin',
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  -- Get the patient ID
  SELECT id INTO v_patient_id FROM patients WHERE user_id = v_admin_user_id LIMIT 1;
  
  -- Create a doctor record if it doesn't exist
  INSERT INTO doctors (user_id, specialization, license_number, phone, clinic_address, created_at)
  VALUES (
    v_admin_user_id,
    'General Practitioner',
    'LIC-123456',
    '+1-555-0100',
    '123 Medical Center, Healthcare City',
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  -- Get the doctor ID
  SELECT id INTO v_doctor_id FROM doctors WHERE user_id = v_admin_user_id LIMIT 1;
  
  -- Seed 15 health metrics
  INSERT INTO health_metrics (patient_id, metric_type, value, unit, recorded_at)
  VALUES
    (v_patient_id, 'blood_pressure_systolic', 120, 'mmHg', NOW() - INTERVAL '7 days'),
    (v_patient_id, 'blood_pressure_diastolic', 80, 'mmHg', NOW() - INTERVAL '7 days'),
    (v_patient_id, 'heart_rate', 72, 'bpm', NOW() - INTERVAL '6 days'),
    (v_patient_id, 'temperature', 37.2, 'C', NOW() - INTERVAL '5 days'),
    (v_patient_id, 'blood_glucose', 95, 'mg/dL', NOW() - INTERVAL '4 days'),
    (v_patient_id, 'oxygen_saturation', 98, '%', NOW() - INTERVAL '3 days'),
    (v_patient_id, 'bmi', 23.5, 'kg/m2', NOW() - INTERVAL '2 days'),
    (v_patient_id, 'weight', 75, 'kg', NOW() - INTERVAL '1 day'),
    (v_patient_id, 'height', 180, 'cm', NOW() - INTERVAL '1 day'),
    (v_patient_id, 'cholesterol', 180, 'mg/dL', NOW() - INTERVAL '1 day'),
    (v_patient_id, 'blood_pressure_systolic', 118, 'mmHg', NOW()),
    (v_patient_id, 'blood_pressure_diastolic', 78, 'mmHg', NOW()),
    (v_patient_id, 'heart_rate', 70, 'bpm', NOW()),
    (v_patient_id, 'temperature', 37, 'C', NOW()),
    (v_patient_id, 'blood_glucose', 92, 'mg/dL', NOW())
  ON CONFLICT DO NOTHING;
  
  -- Seed 5 appointments
  INSERT INTO appointments (patient_id, doctor_id, appointment_type, status, appointment_date, notes)
  VALUES
    (v_patient_id, v_doctor_id, 'Routine Checkup', 'completed', NOW() - INTERVAL '30 days', 'Annual physical - all normal'),
    (v_patient_id, v_doctor_id, 'Follow-up', 'completed', NOW() - INTERVAL '14 days', 'Blood work results reviewed'),
    (v_patient_id, v_doctor_id, 'Consultation', 'scheduled', NOW() + INTERVAL '7 days', 'Discuss medication adjustment'),
    (v_patient_id, v_doctor_id, 'Lab Work', 'scheduled', NOW() + INTERVAL '14 days', 'Quarterly blood test'),
    (v_patient_id, v_doctor_id, 'Routine Checkup', 'scheduled', NOW() + INTERVAL '60 days', 'Next annual checkup')
  ON CONFLICT DO NOTHING;
  
  -- Seed 8 health predictions
  INSERT INTO health_predictions (user_id, prediction_type, predicted_disease, confidence_score, risk_level, contributing_factors, recommendations)
  VALUES
    (v_admin_user_id, 'preventive', 'Hypertension', 0.15, 'low', ARRAY['family history', 'age'], ARRAY['regular exercise', 'reduce salt intake']),
    (v_admin_user_id, 'preventive', 'Type 2 Diabetes', 0.08, 'low', ARRAY['sedentary lifestyle'], ARRAY['increase activity', 'balanced diet']),
    (v_admin_user_id, 'risk_assessment', 'Cardiovascular Disease', 0.22, 'moderate', ARRAY['cholesterol', 'stress'], ARRAY['Mediterranean diet', 'stress management']),
    (v_admin_user_id, 'preventive', 'Osteoporosis', 0.12, 'low', ARRAY['age', 'gender'], ARRAY['calcium intake', 'weight bearing exercise']),
    (v_admin_user_id, 'preventive', 'Sleep Apnea', 0.18, 'low', ARRAY['BMI'], ARRAY['weight management', 'sleep study']),
    (v_admin_user_id, 'risk_assessment', 'Metabolic Syndrome', 0.25, 'moderate', ARRAY['waist circumference', 'triglycerides'], ARRAY['lifestyle modification', 'medical management']),
    (v_admin_user_id, 'preventive', 'Cognitive Decline', 0.10, 'low', ARRAY['age'], ARRAY['mental stimulation', 'physical activity']),
    (v_admin_user_id, 'risk_assessment', 'Seasonal Affective Disorder', 0.20, 'moderate', ARRAY['season', 'stress'], ARRAY['light therapy', 'counseling'])
  ON CONFLICT DO NOTHING;
  
  -- Seed 10 environmental readings
  INSERT INTO environmental_data (user_id, temperature_celsius, humidity_percent, aqi_index, aqi_level, pm25, pm10, pollen_level, recorded_at)
  VALUES
    (v_admin_user_id, 22.5, 45, 35, 'Good', 8.5, 15, 'Low', NOW() - INTERVAL '10 days'),
    (v_admin_user_id, 23.1, 50, 42, 'Good', 10.2, 18, 'Moderate', NOW() - INTERVAL '9 days'),
    (v_admin_user_id, 21.8, 48, 55, 'Moderate', 15.5, 25, 'High', NOW() - INTERVAL '8 days'),
    (v_admin_user_id, 24.2, 40, 38, 'Good', 9.1, 14, 'Low', NOW() - INTERVAL '7 days'),
    (v_admin_user_id, 22.9, 52, 48, 'Good', 12.3, 20, 'Moderate', NOW() - INTERVAL '6 days'),
    (v_admin_user_id, 23.5, 46, 62, 'Moderate', 18.7, 32, 'High', NOW() - INTERVAL '5 days'),
    (v_admin_user_id, 22.1, 49, 45, 'Good', 11.5, 19, 'Moderate', NOW() - INTERVAL '4 days'),
    (v_admin_user_id, 24.8, 38, 35, 'Good', 8.2, 13, 'Low', NOW() - INTERVAL '3 days'),
    (v_admin_user_id, 23.3, 51, 50, 'Good', 13.8, 23, 'Moderate', NOW() - INTERVAL '1 day'),
    (v_admin_user_id, 22.7, 47, 42, 'Good', 10.5, 17, 'Low', NOW())
  ON CONFLICT DO NOTHING;
  
  -- Seed 5 medical records
  INSERT INTO medical_records (user_id, record_type, title, description, recorded_date)
  VALUES
    (v_admin_user_id, 'lab_result', 'Complete Blood Count', 'CBC results within normal range', NOW()::DATE - INTERVAL '30 days'),
    (v_admin_user_id, 'lab_result', 'Lipid Panel', 'Cholesterol levels controlled', NOW()::DATE - INTERVAL '20 days'),
    (v_admin_user_id, 'vaccination', 'Flu Vaccination 2025', 'Annual flu shot administered', NOW()::DATE - INTERVAL '10 days'),
    (v_admin_user_id, 'note', 'Medication Review', 'All medications reviewed and continued', NOW()::DATE - INTERVAL '5 days'),
    (v_admin_user_id, 'diagnosis', 'Seasonal Allergies', 'Diagnosed with seasonal allergies, prescribed antihistamine', NOW()::DATE - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Demo data seeded successfully';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error seeding data: %', SQLERRM;
END $$;
