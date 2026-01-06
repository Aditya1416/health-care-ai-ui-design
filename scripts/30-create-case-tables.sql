-- Clinical Case Analysis & Image Comparison System
-- Add to Supabase to enable case-centric workflows

-- 1. Case Management Table
CREATE TABLE IF NOT EXISTS clinical_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  case_title TEXT NOT NULL,
  case_description TEXT,
  status VARCHAR DEFAULT 'open', -- open, in-review, closed, archived
  priority VARCHAR DEFAULT 'normal', -- low, normal, high, critical
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Case Artifacts (uploads: images, PDFs, scans)
CREATE TABLE IF NOT EXISTS case_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES clinical_cases(id) ON DELETE CASCADE,
  artifact_type VARCHAR NOT NULL, -- 'scan', 'xray', 'mri', 'ct', 'ultrasound', 'pdf_report'
  artifact_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR,
  uploaded_by UUID REFERENCES doctors(id),
  upload_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Case Reference Mappings (links to reference diseases)
CREATE TABLE IF NOT EXISTS case_reference_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES clinical_cases(id) ON DELETE CASCADE,
  reference_disease_id UUID NOT NULL REFERENCES disease_knowledge(id) ON DELETE RESTRICT,
  reference_image_id VARCHAR NOT NULL REFERENCES reference_images(id) ON DELETE RESTRICT,
  match_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Image Comparison Results (similarity analysis)
CREATE TABLE IF NOT EXISTS image_comparison_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_artifact_id UUID NOT NULL REFERENCES case_artifacts(id) ON DELETE CASCADE,
  reference_image_id VARCHAR NOT NULL REFERENCES reference_images(id) ON DELETE CASCADE,
  reference_disease_id UUID NOT NULL REFERENCES disease_knowledge(id) ON DELETE CASCADE,
  similarity_score NUMERIC(5,2), -- 0-100 percentage
  feature_distance NUMERIC(10,4), -- Euclidean distance in embedding space
  top_k_match_rank INTEGER, -- 1st match, 2nd match, etc
  confidence_score NUMERIC(5,2), -- Model confidence 0-100
  heatmap_url TEXT, -- Generated heatmap overlay
  influential_regions JSONB, -- [{x, y, width, height, influence_score}, ...]
  model_version VARCHAR,
  inference_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Case AI Analysis & Explanations
CREATE TABLE IF NOT EXISTS case_ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES clinical_cases(id) ON DELETE CASCADE,
  analysis_type VARCHAR, -- 'similarity_analysis', 'risk_assessment', 'feature_extraction'
  predicted_findings TEXT[],
  confidence_scores JSONB, -- {finding_name: score, ...}
  feature_importance JSONB, -- {feature_name: importance_score, ...}
  explanation_text TEXT, -- Human-readable AI explanation
  model_version VARCHAR,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Case Audit Trail
CREATE TABLE IF NOT EXISTS case_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES clinical_cases(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL, -- 'created', 'updated', 'artifact_added', 'analysis_run', 'download', 'shared'
  actor_id UUID REFERENCES doctors(id),
  actor_role VARCHAR, -- 'doctor', 'radiologist', 'admin'
  details JSONB,
  action_timestamp TIMESTAMP DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_clinical_cases_patient_id ON clinical_cases(patient_id);
CREATE INDEX idx_clinical_cases_doctor_id ON clinical_cases(doctor_id);
CREATE INDEX idx_clinical_cases_status ON clinical_cases(status);
CREATE INDEX idx_case_artifacts_case_id ON case_artifacts(case_id);
CREATE INDEX idx_case_reference_mappings_case_id ON case_reference_mappings(case_id);
CREATE INDEX idx_image_comparison_results_case_artifact ON image_comparison_results(case_artifact_id);
CREATE INDEX idx_image_comparison_results_similarity ON image_comparison_results(similarity_score DESC);
CREATE INDEX idx_case_ai_analysis_case_id ON case_ai_analysis(case_id);
CREATE INDEX idx_case_audit_log_case_id ON case_audit_log(case_id);

-- Enable RLS
ALTER TABLE clinical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_reference_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_comparison_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Doctors can see cases for their patients
CREATE POLICY "cases_read_own" ON clinical_cases FOR SELECT 
  USING (doctor_id = (SELECT id FROM doctors WHERE user_id = auth.uid()) OR 
         patient_id = (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "cases_insert_own" ON clinical_cases FOR INSERT 
  WITH CHECK (doctor_id = (SELECT id FROM doctors WHERE user_id = auth.uid()));

CREATE POLICY "artifacts_read_own_case" ON case_artifacts FOR SELECT 
  USING (case_id IN (SELECT id FROM clinical_cases WHERE doctor_id = (SELECT id FROM doctors WHERE user_id = auth.uid())));

CREATE POLICY "artifacts_insert_own_case" ON case_artifacts FOR INSERT 
  WITH CHECK (case_id IN (SELECT id FROM clinical_cases WHERE doctor_id = (SELECT id FROM doctors WHERE user_id = auth.uid())));

-- Admin can see everything
CREATE POLICY "admin_bypass" ON clinical_cases FOR ALL 
  USING ((SELECT is_admin FROM user_profiles WHERE user_id = auth.uid()) = true);
