-- Comprehensive cleanup script to remove all orphaned and invalid data
-- This ensures only predictions with complete patient and doctor data remain

-- Delete predictions without valid patient or doctor references
DELETE FROM predictions
WHERE patient_id NOT IN (SELECT id FROM patients)
   OR doctor_id NOT IN (SELECT id FROM doctors)
   OR patient_id IS NULL
   OR doctor_id IS NULL;

-- Delete patients without valid user references
DELETE FROM patients
WHERE user_id NOT IN (SELECT id FROM users);

-- Delete doctors without valid user references
DELETE FROM doctors
WHERE user_id NOT IN (SELECT id FROM users);

-- Log completion
SELECT COUNT(*) as remaining_predictions FROM predictions;
SELECT COUNT(*) as remaining_patients FROM patients;
SELECT COUNT(*) as remaining_doctors FROM doctors;
