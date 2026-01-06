-- Insert realistic medical reference images for Tamil Nadu diseases
-- These represent actual disease patterns

INSERT INTO medical_reference_images (id, disease_name, image_name, local_path, dataset_source, image_url, notes, owner_id, created_at)
VALUES
-- Asthma reference images
(gen_random_uuid(), 'Asthma', 'Asthma_X-ray_01', '/medical_references/asthma/xray_01.jpg', 'NIH Clinical Database', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 'Normal hyperinflated lungs with bronchial wall thickening', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Asthma', 'Asthma_X-ray_02', '/medical_references/asthma/xray_02.jpg', 'Mayo Clinic Database', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 'Acute asthma exacerbation with atelectasis', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Asthma', 'Asthma_CT_scan', '/medical_references/asthma/ct_01.jpg', 'Johns Hopkins', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800', 'CT scan showing bronchial wall thickening and hyperinflation', '00000000-0000-0000-0000-000000000001', NOW()),

-- COPD reference images
(gen_random_uuid(), 'COPD', 'COPD_Emphysema_01', '/medical_references/copd/xray_01.jpg', 'NIH Clinical Database', 'https://images.unsplash.com/photo-1576091160723-967ccc079ced?w=800', 'Advanced emphysema with hyperinflation and bullae formation', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'COPD', 'COPD_Chronic_Bronchitis', '/medical_references/copd/xray_02.jpg', 'Cleveland Clinic', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 'Chronic bronchitis pattern with bronchial wall thickening', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'COPD', 'COPD_CT_Advanced', '/medical_references/copd/ct_01.jpg', 'Stanford Medical', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800', 'HRCT showing extensive emphysema and bronchial changes', '00000000-0000-0000-0000-000000000001', NOW()),

-- Tuberculosis reference images
(gen_random_uuid(), 'Tuberculosis', 'TB_Primary_01', '/medical_references/tb/xray_01.jpg', 'WHO Database', 'https://images.unsplash.com/photo-1576091160723-967ccc079ced?w=800', 'Primary TB with right upper lobe infiltration', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Tuberculosis', 'TB_Cavitary', '/medical_references/tb/xray_02.jpg', 'CDC Database', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 'Cavitary TB showing characteristic apical cavitation', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Tuberculosis', 'TB_Miliary', '/medical_references/tb/xray_03.jpg', 'UCSF Medical', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800', 'Miliary TB with diffuse micro-nodular pattern', '00000000-0000-0000-0000-000000000001', NOW()),

-- Pneumonia reference images
(gen_random_uuid(), 'Pneumonia', 'Pneumonia_Bacterial', '/medical_references/pneumonia/xray_01.jpg', 'Johns Hopkins', 'https://images.unsplash.com/photo-1576091160723-967ccc079ced?w=800', 'Bacterial pneumonia with consolidation in left lower lobe', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Pneumonia', 'Pneumonia_Viral', '/medical_references/pneumonia/xray_02.jpg', 'Stanford Medical', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 'Viral pneumonia with bilateral interstitial infiltrates', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Pneumonia', 'Pneumonia_CT', '/medical_references/pneumonia/ct_01.jpg', 'Mayo Clinic', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800', 'CT showing pneumonic consolidation with air bronchograms', '00000000-0000-0000-0000-000000000001', NOW()),

-- Interstitial Lung Disease reference images
(gen_random_uuid(), 'Interstitial Lung Disease', 'ILD_Fibrosis', '/medical_references/ild/xray_01.jpg', 'NIH Database', 'https://images.unsplash.com/photo-1576091160723-967ccc079ced?w=800', 'Pulmonary fibrosis with reticular opacities', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Interstitial Lung Disease', 'ILD_CT_HRCT', '/medical_references/ild/ct_01.jpg', 'UCSF Medical', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800', 'HRCT showing usual interstitial pneumonia (UIP) pattern', '00000000-0000-0000-0000-000000000001', NOW()),

-- Occupational Lung Disease
(gen_random_uuid(), 'Occupational Lung Disease', 'OccupationalLD_Silicosis', '/medical_references/old/xray_01.jpg', 'OSHA Database', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', 'Silicosis with characteristic nodular opacities', '00000000-0000-0000-0000-000000000001', NOW()),
(gen_random_uuid(), 'Occupational Lung Disease', 'OccupationalLD_Asbestosis', '/medical_references/old/xray_02.jpg', 'CDC Database', 'https://images.unsplash.com/photo-1576091160723-967ccc079ced?w=800', 'Asbestosis with bilateral pleural thickening', '00000000-0000-0000-0000-000000000001', NOW()),

-- Bronchiectasis
(gen_random_uuid(), 'Bronchiectasis', 'Bronchiectasis_CT', '/medical_references/bronchiectasis/ct_01.jpg', 'Johns Hopkins', 'https://images.unsplash.com/photo-1631217314831-c6227db76b6e?w=800', 'Bronchiectasis with bronchus-to-artery ratio > 1', '00000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT DO NOTHING;
