-- Idempotent seed script for reference data - safe to re-run multiple times
BEGIN;

-- Seed disease knowledge (from Tabular Health Datasets)
INSERT INTO disease_knowledge (id, disease_name, symptoms, treatment_guidelines, environmental_risk_factors, severity_level, created_at)
VALUES 
  (gen_random_uuid(), 'Pneumonia', ARRAY['Chest pain', 'Cough', 'Fever', 'Shortness of breath'], 'Antibiotics, rest, oxygen therapy', ARRAY['Air pollution', 'Smoking'], 3, NOW()),
  (gen_random_uuid(), 'Asthma', ARRAY['Wheezing', 'Shortness of breath', 'Chest tightness'], 'Inhalers, corticosteroids, bronchodilators', ARRAY['High AQI', 'Pollen', 'Dust'], 2, NOW()),
  (gen_random_uuid(), 'COVID-19', ARRAY['Fever', 'Cough', 'Loss of taste'], 'Antiviral drugs, supportive care', ARRAY['Air transmission'], 3, NOW()),
  (gen_random_uuid(), 'Diabetes', ARRAY['Fatigue', 'Increased thirst', 'Weight loss'], 'Insulin, metformin, lifestyle changes', ARRAY['High humidity', 'Heat stress'], 2, NOW()),
  (gen_random_uuid(), 'Hypertension', ARRAY['Headache', 'Dizziness', 'Fatigue'], 'ACE inhibitors, beta-blockers', ARRAY['Heat', 'Stress'], 2, NOW()),
  (gen_random_uuid(), 'Tuberculosis', ARRAY['Persistent cough', 'Chest pain', 'Hemoptysis'], 'Isoniazid, rifampicin combination therapy', ARRAY['Indoor air quality'], 3, NOW()),
  (gen_random_uuid(), 'Skin Infection', ARRAY['Rash', 'Itching', 'Redness'], 'Topical antibiotics, antifungals', ARRAY['Humidity', 'Poor hygiene'], 1, NOW()),
  (gen_random_uuid(), 'Heart Disease', ARRAY['Chest pain', 'Shortness of breath'], 'Statins, ACE inhibitors, aspirin', ARRAY['Air pollution', 'Heat'], 3, NOW())
ON CONFLICT DO NOTHING;

-- Seed hospitals (reference data - Chennai specific)
INSERT INTO hospitals (id, name, city, state, address, phone, email, website, total_beds, available_beds, departments, latitude, longitude, established_year, accreditation, created_at, updated_at)
VALUES 
  ('apollo-chennai', 'Apollo Hospitals Chennai', 'Chennai', 'Tamil Nadu', '21, Off Greams Road', '+91-44-28298888', 'info@apollohospitals.com', 'www.apollohospitals.com', 500, 150, ARRAY['Cardiology', 'Neurology', 'Oncology', 'Radiology'], 13.0827, 80.2707, 1983, 'NABH', NOW(), NOW()),
  ('fortis-chennai', 'Fortis Malar Hospital', 'Chennai', 'Tamil Nadu', '52, 1st Main Road, Saidapet', '+91-44-42888888', 'info@fortismalar.com', 'www.fortismalar.com', 300, 80, ARRAY['Emergency', 'Imaging', 'Orthopedics'], 13.0033, 80.2514, 1995, 'NABH', NOW(), NOW()),
  ('dr-relas-hospital', 'Dr. Rela Institute', 'Chennai', 'Tamil Nadu', 'CIT Colony, Madras 600036', '+91-44-43000000', 'contact@drrela.com', 'www.drrela.com', 400, 120, ARRAY['Transplant', 'Gastroenterology', 'Hepatology'], 13.0169, 80.2360, 2002, 'NABH', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed reference medical images (from Chest X-ray + Skin Lesion Datasets)
INSERT INTO reference_images (id, file_path, image_type, anatomical_region, condition, diagnosis, age_group, outcome, dataset_name, source_url, metadata, created_at, confidence_score)
VALUES 
  ('chest-xray-pneumonia-001', '/reference_images/chest_xray_pneumonia_001.jpg', 'Chest X-Ray', 'Chest', 'Pneumonia', 'Bacterial Pneumonia', '45-55', 'Positive', 'NIH ChestXray14', 'https://catalog.data.gov/dataset/nih-chest-x-rays', '{"model":"ResNet50", "dataset":"NIH"}', NOW(), 0.92),
  ('chest-xray-normal-001', '/reference_images/chest_xray_normal_001.jpg', 'Chest X-Ray', 'Chest', 'Normal', 'No abnormality', '30-40', 'Negative', 'MIMIC-CXR-JPG', 'https://physionet.org/content/mimic-cxr-jpg/', '{"model":"ResNet50"}', NOW(), 0.95),
  ('skin-lesion-melanoma-001', '/reference_images/skin_lesion_melanoma_001.jpg', 'Dermoscopy', 'Skin', 'Melanoma', 'Malignant Melanoma', '50-60', 'Positive', 'HAM10000', 'https://dataverse.harvard.edu/dataset.xhtml', '{"magnification":"10x"}', NOW(), 0.88),
  ('wound-image-healing-001', '/reference_images/wound_healing_001.jpg', 'Wound Photography', 'Wound', 'Healing Ulcer', 'Diabetic Ulcer', '55-65', 'Improving', 'ISIC Archive', 'https://www.isic-archive.com/', '{"wound_type":"diabetic", "stage":"healing"}', NOW(), 0.85)
ON CONFLICT DO NOTHING;

-- Seed model versions (for ML inference)
INSERT INTO model_versions (id, version, model_type, disease_code, released_at, released, model_path_s3, training_data_info, metrics, created_at)
VALUES 
  ('model-chest-xray-v1', 'v1.0.0', 'Chest X-Ray Classification', 'J18', NOW(), true, 's3://healthcare-ai/models/chest_xray_v1.0.0', '{"dataset":"NIH ChestXray14", "samples":112000}', '{"accuracy":0.93, "auc":0.96}', NOW()),
  ('model-skin-lesion-v1', 'v1.0.0', 'Skin Lesion Classification', 'L89', NOW(), true, 's3://healthcare-ai/models/skin_v1.0.0', '{"dataset":"HAM10000", "samples":10000}', '{"accuracy":0.88, "auc":0.92}', NOW()),
  ('model-disease-prediction-v2', 'v2.0.0', 'Disease Risk Prediction', 'GENERAL', NOW(), true, 's3://healthcare-ai/models/disease_prediction_v2', '{"dataset":"EHR Synthetic", "samples":50000}', '{"auc":0.89, "recall":0.87}', NOW()),
  ('model-aqi-health-v1', 'v1.0.0', 'Environmental Health Risk', 'ENVIRO', NOW(), true, 's3://healthcare-ai/models/aqi_health_v1', '{"dataset":"Chennai AQI", "samples":365}', '{"rmse":0.15}', NOW())
ON CONFLICT DO NOTHING;

COMMIT;
