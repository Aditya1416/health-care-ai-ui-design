-- Seed 200 realistic patient records with demographic data for Tamil Nadu
-- Uses correct schema based on actual database structure

DO $$
DECLARE
  v_user_id UUID;
  v_patient_id UUID;
  v_loop INT := 0;
  v_first_names TEXT[] := ARRAY['Rajesh', 'Priya', 'Arun', 'Divya', 'Karthik', 'Anjali', 'Ramesh', 'Kavya', 'Suresh', 'Lakshmi'];
  v_last_names TEXT[] := ARRAY['Kumar', 'Singh', 'Reddy', 'Sharma', 'Patel', 'Gupta', 'Verma', 'Nair', 'Iyer', 'Rao'];
  v_blood_types TEXT[] := ARRAY['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  v_genders TEXT[] := ARRAY['M', 'F'];
  v_occupations TEXT[] := ARRAY['Textile Worker', 'Factory Worker', 'Construction Worker', 'Auto Driver', 'Farmer', 'Software Engineer', 'Store Owner', 'Fisherman', 'None'];
  v_smoking TEXT[] := ARRAY['never', 'former', 'current'];
BEGIN
  -- Delete existing test data
  DELETE FROM predictions WHERE patient_id IN (
    SELECT p.id FROM patients p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.email ILIKE '%tamil_patient_%'
  );
  
  DELETE FROM patients WHERE user_id IN (
    SELECT id FROM users WHERE email ILIKE '%tamil_patient_%'
  );
  
  DELETE FROM users WHERE email ILIKE '%tamil_patient_%';

  -- Seed 200 patients
  FOR v_loop IN 1..200 LOOP
    -- Create user account first, then link to patient record
    INSERT INTO users (
      email,
      full_name,
      role,
      created_at
    )
    VALUES (
      'tamil_patient_' || v_loop || '@healthcareai.local',
      v_first_names[((v_loop - 1) % array_length(v_first_names, 1)) + 1] || ' ' || 
      v_last_names[((v_loop - 1) % array_length(v_last_names, 1)) + 1] || ' P' || v_loop,
      'patient',
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user_id;

    -- Create patient record with demographic data matching actual schema
    INSERT INTO patients (
      user_id,
      date_of_birth,
      gender,
      blood_type,
      allergies,
      medical_history,
      aqi_index,
      pm25_level,
      temperature,
      humidity,
      occupational_hazard,
      years_of_exposure,
      smoking_status,
      created_at
    )
    VALUES (
      v_user_id,
      CURRENT_DATE - INTERVAL '1 day' * ((18 + (random() * 50)::INT) * 365),
      v_genders[((v_loop - 1) % 2) + 1],
      v_blood_types[((v_loop - 1) % array_length(v_blood_types, 1)) + 1],
      CASE WHEN random() > 0.7 THEN 'Dust, Pollen, Shellfish' ELSE NULL END,
      CASE WHEN random() > 0.6 THEN 'Hypertension, Diabetes, Previous respiratory infections' ELSE 'No significant history' END,
      (50 + random() * 150)::NUMERIC(5,2),
      (15 + random() * 85)::NUMERIC(5,2),
      (25 + random() * 10)::NUMERIC(5,2),
      (40 + random() * 40)::NUMERIC(5,2),
      v_occupations[((v_loop - 1) % array_length(v_occupations, 1)) + 1],
      CASE WHEN v_occupations[((v_loop - 1) % array_length(v_occupations, 1)) + 1] != 'None' THEN (random() * 30)::NUMERIC(4,2) ELSE 0 END,
      v_smoking[((v_loop - 1) % array_length(v_smoking, 1)) + 1],
      NOW()
    )
    RETURNING id INTO v_patient_id;

    IF v_loop % 50 = 0 THEN
      RAISE NOTICE 'Seeded % patients', v_loop;
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully seeded 200 realistic patients for Tamil Nadu region';
END $$;
