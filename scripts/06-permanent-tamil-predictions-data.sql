-- Permanent data migration for Healthcare AI Tamil Nadu
-- This creates 25 doctors, 200 patients, and 200 predictions once
-- Data remains in database permanently and doesn't need re-seeding

-- Step 1: Create doctor users (if not exist)
INSERT INTO users (email, password_hash, role, full_name, is_active)
SELECT 
  'doctor' || num || '@healthcare.tn',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36lI6UUm',
  'doctor',
  'Dr. Doctor ' || num,
  true
FROM generate_series(1, 25) AS num
ON CONFLICT (email) DO NOTHING;

-- Step 2: Create doctor records linked to users
-- Fixed JOIN logic - now properly references both the users table and the generated series
INSERT INTO doctors (user_id, specialization, clinic_address, phone, license_number)
SELECT 
  u.id,
  'Pulmonologist',
  'Medical Center, Tamil Nadu',
  '+91-9' || LPAD((FLOOR(RANDOM() * 1000000000))::text, 9, '0'),
  'LIC-TN-' || TO_CHAR(num, '0000')
FROM generate_series(1, 25) AS num
CROSS JOIN (SELECT id, email FROM users WHERE role = 'doctor' AND email LIKE 'doctor%@healthcare.tn' ORDER BY email LIMIT 25) AS u
WHERE u.email = 'doctor' || num || '@healthcare.tn'
ON CONFLICT (license_number) DO NOTHING;

-- Step 3: Create 200 patients with demographic factors
INSERT INTO users (email, password_hash, role, full_name, is_active)
SELECT 
  'patient' || num || '@healthcare.tn',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36lI6UUm',
  'patient',
  'Patient ' || num,
  true
FROM generate_series(1, 200) AS num
ON CONFLICT (email) DO NOTHING;

-- Fixed patient data JOIN with proper medical X-ray image URLs from medical imaging sources
INSERT INTO patients (user_id, gender, date_of_birth, blood_type, medical_history, allergies, aqi_index, pm25_level, temperature, humidity, occupational_hazard, years_of_exposure, smoking_status, scan_image_url)
SELECT 
  u.id,
  CASE (num % 2) WHEN 0 THEN 'M' ELSE 'F' END,
  CURRENT_DATE - ((20 + num % 50) || ' years')::interval,
  (ARRAY['A+', 'B+', 'O+', 'AB+'])[num % 4 + 1],
  'Medical history for patient ' || num,
  NULL,
  80 + (num % 100),
  40 + (num % 50),
  28,
  65,
  CASE (num % 3) WHEN 0 THEN 'Dust' WHEN 1 THEN 'Chemicals' ELSE 'None' END,
  num % 30,
  (ARRAY['Never', 'Former', 'Current'])[num % 3 + 1],
  -- Use actual medical imaging URLs for X-ray visualizations instead of non-existent bucket files
  CASE (num % 5)
    WHEN 0 THEN 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop'
    WHEN 1 THEN 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800&h=600&fit=crop'
    WHEN 2 THEN 'https://images.unsplash.com/photo-1576091160723-967ccc079ced?w=800&h=600&fit=crop'
    WHEN 3 THEN 'https://images.unsplash.com/photo-1579154204601-01d82979d485?w=800&h=600&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800&h=600&fit=crop'
  END
FROM generate_series(1, 200) AS num
CROSS JOIN (SELECT id, email FROM users WHERE role = 'patient' AND email LIKE 'patient%@healthcare.tn' ORDER BY email LIMIT 200) AS u
WHERE u.email = 'patient' || num || '@healthcare.tn'
ON CONFLICT DO NOTHING;

-- Step 4: Create 200 predictions
-- Simplified prediction creation - uses LIMIT to get patient and doctor IDs reliably
INSERT INTO predictions (patient_id, doctor_id, predicted_disease, confidence_score, severity_level, explanation)
SELECT 
  p.id,
  (SELECT id FROM doctors LIMIT 1),
  (ARRAY['Pneumonia', 'Tuberculosis', 'COPD', 'Asthma', 'Nodule'])[((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 5) + 1],
  0.70 + RANDOM() * 0.20,
  ((ROW_NUMBER() OVER (ORDER BY p.id) - 1) % 4) + 1,
  'AI prediction with environmental risk analysis'
FROM (SELECT id FROM patients ORDER BY created_at DESC LIMIT 200) AS p
ON CONFLICT DO NOTHING;
