-- Delete predictions with no valid patient
DELETE FROM predictions 
WHERE patient_id NOT IN (SELECT id FROM patients);

-- Delete predictions with no valid doctor
DELETE FROM predictions 
WHERE doctor_id NOT IN (SELECT id FROM doctors);

-- Delete predictions with NULL critical fields
DELETE FROM predictions 
WHERE predicted_disease IS NULL 
  OR confidence_score IS NULL 
  OR explanation IS NULL;

-- Verify remaining predictions count
SELECT COUNT(*) as valid_predictions_remaining FROM predictions;

-- Show remaining predictions for verification
SELECT 
  p.id,
  p.predicted_disease,
  p.confidence_score,
  pat.id as patient_exists,
  doc.id as doctor_exists
FROM predictions p
LEFT JOIN patients pat ON p.patient_id = pat.id
LEFT JOIN doctors doc ON p.doctor_id = doc.id
ORDER BY p.created_at DESC
LIMIT 10;
