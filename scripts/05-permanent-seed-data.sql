-- Removed window functions from WHERE clause and fixed LPAD syntax
-- Complete permanent data initialization - runs once and stays in database

DELETE FROM predictions WHERE doctor_id IN (
  SELECT id FROM doctors WHERE specialization IN ('Pulmonologist', 'Radiologist', 'Cardiologist', 'Neurologist', 'Gastroenterologist')
);
DELETE FROM patients WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'patient%@healthcare.tn' OR email LIKE 'doctor%@healthcare.tn'
);
DELETE FROM doctors WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'doctor%@healthcare.tn'
);
DELETE FROM users WHERE email LIKE '%@healthcare.tn';

-- Create patient users first
INSERT INTO users (email, password_hash, role, full_name, is_active)
SELECT 
  'patient' || num || '@healthcare.tn',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36lI6UUm',
  'patient',
  'Patient ' || num,
  true
FROM generate_series(1, 200) AS num
ON CONFLICT (email) DO NOTHING;

-- Create doctor users
INSERT INTO users (email, password_hash, role, full_name, is_active)
SELECT 
  'doctor' || num || '@healthcare.tn',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36lI6UUm',
  'doctor',
  'Dr. Doctor ' || num,
  true
FROM generate_series(1, 25) AS num
ON CONFLICT (email) DO NOTHING;

-- Create doctors linked to users
INSERT INTO doctors (user_id, specialization, clinic_address, phone, license_number)
SELECT 
  u.id,
  'Pulmonologist',
  'Chennai Medical Center, Tamil Nadu',
  '+91-' || LPAD((1000000000 + ((num - 1) * 1000))::text, 10, '0'),
  'LIC-CHENNAI-' || LPAD(num::text, 4, '0')
FROM generate_series(1, 25) AS num
JOIN users u ON u.email = 'doctor' || num || '@healthcare.tn'
ON CONFLICT (license_number) DO NOTHING;

-- Create 200 patients with environmental data
INSERT INTO patients (user_id, gender, date_of_birth, blood_type, medical_history, allergies, aqi_index, pm25_level, temperature, humidity, occupational_hazard, years_of_exposure, smoking_status, scan_image_url)
SELECT 
  u.id,
  CASE (num % 2) WHEN 0 THEN 'Male' ELSE 'Female' END,
  CURRENT_DATE - INTERVAL '1 day' * (18 * 365 + (num % 50)),
  CASE (num % 4) 
    WHEN 0 THEN 'O+' 
    WHEN 1 THEN 'A+' 
    WHEN 2 THEN 'B+' 
    ELSE 'AB+' 
  END,
  'Patient with ' || CASE (num % 5)
    WHEN 0 THEN 'respiratory issues'
    WHEN 1 THEN 'cardiovascular concerns'
    WHEN 2 THEN 'asthma history'
    WHEN 3 THEN 'chronic cough'
    ELSE 'environmental sensitivity'
  END,
  CASE (num % 3)
    WHEN 0 THEN 'Penicillin'
    WHEN 1 THEN 'Aspirin'
    ELSE NULL
  END,
  100 + (num % 300),
  35 + ((num % 100) / 2.0),
  25 + (num % 15),
  40 + (num % 60),
  CASE (num % 4)
    WHEN 0 THEN 'Construction dust'
    WHEN 1 THEN 'Chemical exposure'
    WHEN 2 THEN 'Textile dust'
    ELSE 'None'
  END,
  num % 40,
  CASE (num % 3)
    WHEN 0 THEN 'Current'
    WHEN 1 THEN 'Former'
    ELSE 'Never'
  END,
  CASE (num % 3)
    WHEN 0 THEN 'https://ysbqauiigryinhzjvzzr.supabase.co/storage/v1/object/public/reference_xrays/Pneumonia/pneumonia_' || LPAD((num % 10)::text, 2, '0') || '.jpg'
    WHEN 1 THEN 'https://ysbqauiigryinhzjvzzr.supabase.co/storage/v1/object/public/reference_xrays/Nodule/nodule_' || LPAD((num % 8)::text, 2, '0') || '.jpg'
    ELSE NULL
  END
FROM generate_series(1, 200) AS num
JOIN users u ON u.email = 'patient' || num || '@healthcare.tn'
ON CONFLICT DO NOTHING;

-- Create 200 predictions
INSERT INTO predictions (patient_id, doctor_id, predicted_disease, confidence_score, severity_level, explanation)
SELECT 
  p.id,
  d.id,
  CASE (ROW_NUMBER() OVER (ORDER BY p.id) % 5)
    WHEN 0 THEN 'Pneumonia'
    WHEN 1 THEN 'Tuberculosis'
    WHEN 2 THEN 'COPD'
    WHEN 3 THEN 'Asthma'
    ELSE 'Nodule'
  END,
  0.75 + ((ROW_NUMBER() OVER (ORDER BY p.id) % 20) / 100.0),
  CASE (ROW_NUMBER() OVER (ORDER BY p.id) % 4)
    WHEN 0 THEN 1
    WHEN 1 THEN 2
    WHEN 2 THEN 3
    ELSE 4
  END,
  'AI-assisted diagnosis based on clinical presentation and environmental factors.'
FROM patients p
CROSS JOIN (SELECT id FROM doctors LIMIT 1) d
LIMIT 200
ON CONFLICT DO NOTHING;
