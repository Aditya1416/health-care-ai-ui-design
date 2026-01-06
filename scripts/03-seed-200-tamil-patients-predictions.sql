-- Removed all ON CONFLICT clauses that were causing constraint violation errors
-- Users will be skipped if email already exists (no ON CONFLICT needed)
-- Patients will insert normally without ON CONFLICT
-- Predictions will insert normally - duplicates won't matter since we're adding new ones

DO $$
DECLARE
  v_doctor_ids UUID[];
  v_user_ids UUID[];
  v_patient_ids UUID[];
  v_prediction_count INT := 0;
  v_user_count INT := 0;
  v_loop_counter INT := 0;
  v_temp_id UUID;
  v_doctor_user_id UUID;
  v_doctor_names TEXT[] := ARRAY['Dr. Rajesh', 'Dr. Priya', 'Dr. Arun', 'Dr. Divya', 'Dr. Karthik', 'Dr. Anjali', 'Dr. Ramesh', 'Dr. Kavya', 'Dr. Suresh', 'Dr. Lakshmi', 'Dr. Vikram', 'Dr. Nisha', 'Dr. Harish', 'Dr. Neha', 'Dr. Aditya', 'Dr. Pooja', 'Dr. Sameer', 'Dr. Ria', 'Dr. Nikhil', 'Dr. Shreya', 'Dr. Arjun', 'Dr. Diya', 'Dr. Varun', 'Dr. Isha', 'Dr. Rohit'];
  v_first_names TEXT[] := ARRAY['Rajesh', 'Priya', 'Arun', 'Divya', 'Karthik', 'Anjali', 'Ramesh', 'Kavya', 'Suresh', 'Lakshmi'];
  v_last_names TEXT[] := ARRAY['Kumar', 'Singh', 'Reddy', 'Sharma', 'Patel', 'Gupta', 'Verma', 'Nair', 'Iyer', 'Rao'];
  v_blood_types TEXT[] := ARRAY['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  v_genders TEXT[] := ARRAY['M', 'F'];
  v_diseases TEXT[] := ARRAY['Asthma', 'COPD', 'Tuberculosis', 'Pneumonia', 'Bronchiectasis', 'Interstitial Lung Disease', 'Occupational Lung Disease', 'Chronic Bronchitis'];
  v_occupations TEXT[] := ARRAY['Textile Worker', 'Factory Worker', 'Construction Worker', 'Auto Driver', 'Farmer', 'Software Engineer', 'Store Owner', 'Fisherman', 'None'];
  v_smoking TEXT[] := ARRAY['never', 'former', 'current'];
  v_districts TEXT[] := ARRAY['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'];
BEGIN
  RAISE NOTICE 'Starting 200 prediction seeding...';
  
  -- Create 25 doctor users
  FOR v_loop_counter IN 1..25 LOOP
    -- Try to insert, but use BEGIN/EXCEPTION to handle duplicate emails gracefully
    BEGIN
      INSERT INTO users (email, full_name, role, created_at)
      VALUES (
        'tamil_doctor_' || LPAD(v_loop_counter::TEXT, 3, '0') || '@healthcare.tn',
        v_doctor_names[(v_loop_counter % array_length(v_doctor_names, 1)) + 1] || ' ' || 
        v_last_names[(v_loop_counter % array_length(v_last_names, 1)) + 1],
        'doctor',
        NOW()
      )
      RETURNING id INTO v_doctor_user_id;
    EXCEPTION WHEN unique_violation THEN
      -- User already exists, fetch existing user
      SELECT id INTO v_doctor_user_id FROM users 
      WHERE email = 'tamil_doctor_' || LPAD(v_loop_counter::TEXT, 3, '0') || '@healthcare.tn';
    END;

    -- Create doctor record
    BEGIN
      INSERT INTO doctors (user_id, specialization, license_number, phone, clinic_address, created_at)
      VALUES (
        v_doctor_user_id,
        'Pulmonology',
        'LIC-TN-' || LPAD(v_loop_counter::TEXT, 6, '0'),
        '+91-' || LPAD((9000000000 + v_loop_counter)::TEXT, 10, '0'),
        'Medical Center ' || v_loop_counter || ', Tamil Nadu',
        NOW()
      )
      RETURNING id INTO v_temp_id;
    EXCEPTION WHEN unique_violation THEN
      SELECT id INTO v_temp_id FROM doctors WHERE user_id = v_doctor_user_id;
    END;
    
    v_doctor_ids[v_loop_counter] := v_temp_id;
  END LOOP;

  -- Create 200 patient users and records
  FOR v_loop_counter IN 1..200 LOOP
    BEGIN
      INSERT INTO users (email, full_name, role, created_at)
      VALUES (
        'tamil_patient_' || LPAD(v_loop_counter::TEXT, 3, '0') || '@healthcare.tn',
        v_first_names[((v_loop_counter - 1) % array_length(v_first_names, 1)) + 1] || ' ' ||
        v_last_names[((v_loop_counter - 1) % array_length(v_last_names, 1)) + 1] || ' P' || v_loop_counter,
        'patient',
        NOW()
      )
      RETURNING id INTO v_temp_id;
    EXCEPTION WHEN unique_violation THEN
      SELECT id INTO v_temp_id FROM users 
      WHERE email = 'tamil_patient_' || LPAD(v_loop_counter::TEXT, 3, '0') || '@healthcare.tn';
    END;
    
    v_user_ids[v_loop_counter] := v_temp_id;

    -- Create or update patient record
    BEGIN
      INSERT INTO patients (user_id, date_of_birth, gender, blood_type, allergies, medical_history, 
                            aqi_index, pm25_level, temperature, humidity, occupational_hazard, 
                            years_of_exposure, smoking_status, created_at)
      VALUES (
        v_user_ids[v_loop_counter],
        CURRENT_DATE - INTERVAL '1 day' * (18 + (random() * 50)::INT) * 365,
        v_genders[((v_loop_counter - 1) % 2) + 1],
        v_blood_types[((v_loop_counter - 1) % array_length(v_blood_types, 1)) + 1],
        CASE WHEN random() > 0.7 THEN 'Dust, Pollen' ELSE NULL END,
        CASE WHEN random() > 0.6 THEN 'Hypertension, Diabetes' ELSE 'None reported' END,
        (50 + random() * 150)::NUMERIC(5,2),
        (15 + random() * 85)::NUMERIC(5,2),
        (25 + random() * 10)::NUMERIC(5,2),
        (40 + random() * 40)::NUMERIC(5,2),
        v_occupations[((v_loop_counter - 1) % array_length(v_occupations, 1)) + 1],
        CASE WHEN random() > 0.4 THEN (random() * 30)::NUMERIC(4,2) ELSE 0 END,
        v_smoking[((v_loop_counter - 1) % array_length(v_smoking, 1)) + 1],
        NOW()
      )
      RETURNING id INTO v_temp_id;
    EXCEPTION WHEN unique_violation THEN
      SELECT id INTO v_temp_id FROM patients WHERE user_id = v_user_ids[v_loop_counter];
    END;
    
    v_patient_ids[v_loop_counter] := v_temp_id;
    v_user_count := v_user_count + 1;
  END LOOP;

  -- Create predictions linked to patients and doctors
  FOR v_loop_counter IN 1..200 LOOP
    IF v_loop_counter <= array_length(v_patient_ids, 1) AND array_length(v_doctor_ids, 1) > 0 THEN
      -- Removed ON CONFLICT clause - just insert predictions, duplicates are fine
      INSERT INTO predictions (
        patient_id,
        doctor_id,
        predicted_disease,
        confidence_score,
        environmental_factors,
        severity_level,
        created_at
      )
      VALUES (
        v_patient_ids[v_loop_counter],
        v_doctor_ids[((v_loop_counter - 1) % array_length(v_doctor_ids, 1)) + 1],
        v_diseases[((v_loop_counter - 1) % array_length(v_diseases, 1)) + 1],
        (0.65 + random() * 0.35)::DOUBLE PRECISION,
        jsonb_build_object(
          'aqi_index', (50 + random() * 150)::INT,
          'pm25_level', (15 + random() * 85)::NUMERIC(5,2),
          'temperature', (25 + random() * 10)::INT,
          'humidity', (40 + random() * 40)::INT,
          'occupational_hazard', v_occupations[((v_loop_counter - 1) % array_length(v_occupations, 1)) + 1],
          'years_exposure', (random() * 30)::INT,
          'district', v_districts[((v_loop_counter - 1) % array_length(v_districts, 1)) + 1]
        ),
        CASE WHEN random() > 0.7 THEN 3 WHEN random() > 0.4 THEN 2 ELSE 1 END,
        NOW()
      );
      v_prediction_count := v_prediction_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Successfully seeded % doctors, % patients and % predictions for Tamil Nadu region', 25, v_user_count, v_prediction_count;
END $$;
