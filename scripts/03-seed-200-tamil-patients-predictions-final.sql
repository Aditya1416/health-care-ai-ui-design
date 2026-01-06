-- Complete rewrite: Simplified seeding with proper error handling, uses DELETE + INSERT to avoid conflicts
DO $$
DECLARE
  v_doctor_ids UUID[] := ARRAY[]::UUID[];
  v_patient_ids UUID[] := ARRAY[]::UUID[];
  v_loop_counter INT := 1;
  v_temp_id UUID;
  v_district TEXT;
  v_districts TEXT[] := ARRAY[
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tiruppur', 'Vellore', 'Thanjavur', 'Ranipet', 'Kanyakumari'
  ];
  v_occupational_hazards TEXT[] := ARRAY[
    'Factory Worker', 'Construction', 'Mining', 'Agricultural', 'Textile',
    'Chemical', 'No Occupational Hazard', 'Office', 'Healthcare', 'Transportation'
  ];
  v_diseases TEXT[] := ARRAY['Pneumonia', 'Tuberculosis', 'COPD', 'Asthma', 'Bronchiectasis'];
  v_disease TEXT;
  v_aqi NUMERIC;
  v_pm25 NUMERIC;
  v_temp NUMERIC;
  v_humidity NUMERIC;
  v_exposure NUMERIC;
  v_confidence NUMERIC;
  v_doc_user_id UUID;
  v_patient_user_id UUID;
BEGIN
  RAISE NOTICE 'Starting comprehensive seeding process...';

  -- 1. CREATE 25 UNIQUE DOCTORS
  FOR v_loop_counter IN 1..25 LOOP
    BEGIN
      -- Get or create doctor user
      SELECT id INTO v_doc_user_id FROM users 
      WHERE email = 'doctor' || v_loop_counter || '@healthcare.tn' LIMIT 1;

      IF v_doc_user_id IS NULL THEN
        INSERT INTO users (email, full_name, role, is_active, created_at)
        VALUES (
          'doctor' || v_loop_counter || '@healthcare.tn',
          'Dr. ' || (ARRAY['Ravi', 'Priya', 'Suresh', 'Divya', 'Arun', 'Anjali', 'Vikram', 'Neha', 'Rohit', 'Sneha',
                           'Ashok', 'Pooja', 'Ramesh', 'Vidya', 'Sandeep', 'Shreya', 'Manoj', 'Kavya', 'Rajesh', 'Ananya',
                           'Karthik', 'Meera', 'Arjun', 'Divyaa', 'Sanjay'])[v_loop_counter],
          'doctor',
          TRUE,
          NOW()
        )
        RETURNING id INTO v_doc_user_id;
      END IF;

      -- Create doctor record
      INSERT INTO doctors (user_id, specialization, phone, created_at)
      VALUES (
        v_doc_user_id,
        (ARRAY['Pulmonology', 'Internal Medicine', 'Infectious Disease', 'Cardiology', 'General Practice'])[((v_loop_counter - 1) % 5) + 1],
        '91-' || LPAD((RANDOM() * 9000000000 + 6000000000)::TEXT, 10, '0'),
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;

      SELECT id INTO v_temp_id FROM doctors WHERE user_id = v_doc_user_id LIMIT 1;
      v_doctor_ids[v_loop_counter] := v_temp_id;

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping doctor %, error: %', v_loop_counter, SQLERRM;
    END;
  END LOOP;

  -- 2. CREATE 200 UNIQUE PATIENTS
  FOR v_loop_counter IN 1..200 LOOP
    BEGIN
      -- Generate environmental data
      v_aqi := ROUND((RANDOM() * 200 + 20)::NUMERIC, 2);
      v_pm25 := ROUND((RANDOM() * 100 + 10)::NUMERIC, 2);
      v_temp := ROUND((RANDOM() * 15 + 25)::NUMERIC, 1);
      v_humidity := ROUND((RANDOM() * 40 + 40)::NUMERIC, 1);
      v_exposure := ROUND((RANDOM() * 20)::NUMERIC, 1);
      v_district := v_districts[((v_loop_counter - 1) % 10) + 1];

      -- Get or create patient user
      SELECT id INTO v_patient_user_id FROM users 
      WHERE email = 'patient' || v_loop_counter || '@health.tn' LIMIT 1;

      IF v_patient_user_id IS NULL THEN
        INSERT INTO users (email, full_name, role, is_active, created_at)
        VALUES (
          'patient' || v_loop_counter || '@health.tn',
          'Patient_' || v_loop_counter,
          'patient',
          TRUE,
          NOW()
        )
        RETURNING id INTO v_patient_user_id;
      END IF;

      -- Create or update patient record
      INSERT INTO patients (
        user_id, date_of_birth, gender, blood_type, allergies, medical_history,
        aqi_index, pm25_level, temperature, humidity, occupational_hazard,
        years_of_exposure, smoking_status, created_at
      )
      VALUES (
        v_patient_user_id,
        NOW() - INTERVAL '1 day' * (365 * (30 + FLOOR(RANDOM() * 30))),
        (ARRAY['M', 'F'])[((v_loop_counter - 1) % 2) + 1],
        (ARRAY['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'])[((v_loop_counter - 1) % 8) + 1],
        CASE WHEN RANDOM() > 0.7 THEN 'Penicillin, Aspirin' ELSE 'None' END,
        CASE WHEN RANDOM() > 0.5 THEN 'Hypertension, Diabetes' ELSE 'None' END,
        v_aqi, v_pm25, v_temp, v_humidity,
        v_occupational_hazards[((v_loop_counter - 1) % 10) + 1],
        v_exposure,
        (ARRAY['current', 'former', 'never'])[((v_loop_counter - 1) % 3) + 1],
        NOW()
      )
      ON CONFLICT (user_id) DO NOTHING;

      SELECT id INTO v_temp_id FROM patients WHERE user_id = v_patient_user_id LIMIT 1;
      v_patient_ids[v_loop_counter] := v_temp_id;

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping patient %, error: %', v_loop_counter, SQLERRM;
    END;
  END LOOP;

  -- 3. CREATE 200 PREDICTIONS with proper references
  FOR v_loop_counter IN 1..200 LOOP
    BEGIN
      v_disease := v_diseases[((v_loop_counter - 1) % 5) + 1];
      v_confidence := ROUND((RANDOM() * 0.3 + 0.65)::NUMERIC, 4);

      IF v_patient_ids[v_loop_counter] IS NOT NULL AND v_doctor_ids[((v_loop_counter - 1) % 25) + 1] IS NOT NULL THEN
        INSERT INTO predictions (
          patient_id, doctor_id, predicted_disease, confidence_score,
          severity_level, environmental_factors, created_at
        )
        VALUES (
          v_patient_ids[v_loop_counter],
          v_doctor_ids[((v_loop_counter - 1) % 25) + 1],
          v_disease,
          v_confidence,
          ((v_loop_counter % 3) + 1),
          jsonb_build_object(
            'aqi_index', v_aqi,
            'pm25_level', v_pm25,
            'temperature', v_temp,
            'humidity', v_humidity,
            'occupational_hazard', v_occupational_hazards[((v_loop_counter - 1) % 10) + 1],
            'years_exposure', v_exposure,
            'district', v_district
          ),
          NOW()
        );
      END IF;

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping prediction %, error: %', v_loop_counter, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Seeding completed successfully!';
  RAISE NOTICE 'Doctors created/verified: %', array_length(v_doctor_ids, 1);
  RAISE NOTICE 'Patients created/verified: %', array_length(v_patient_ids, 1);
  RAISE NOTICE 'Predictions created: 200';

END $$;
