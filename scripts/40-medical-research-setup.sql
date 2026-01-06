-- Medical Imaging Research Platform Setup
-- Creates tables and views for medical reference images and analysis

-- Table: medical_reference_images (already exists, recreated for reference)
CREATE TABLE IF NOT EXISTS medical_reference_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_name TEXT NOT NULL,
    image_name TEXT NOT NULL,
    image_url TEXT,
    local_path TEXT,
    dataset_source TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: image_embeddings (store CNN feature vectors)
CREATE TABLE IF NOT EXISTS image_embeddings (
    id CHARACTER VARYING PRIMARY KEY,
    image_id UUID REFERENCES medical_reference_images(id) ON DELETE CASCADE,
    embedding_vector BYTEA NOT NULL,
    embedding_type CHARACTER VARYING DEFAULT 'densenet121',
    model_version CHARACTER VARYING DEFAULT 'v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: similarity_scores (cache computed similarities)
CREATE TABLE IF NOT EXISTS similarity_scores (
    id CHARACTER VARYING PRIMARY KEY,
    image_id_1 UUID REFERENCES medical_reference_images(id),
    image_id_2 UUID REFERENCES medical_reference_images(id),
    similarity_score NUMERIC,
    distance_euclidean NUMERIC,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- View: Top similar reference pairs
CREATE OR REPLACE VIEW similar_reference_pairs AS
SELECT 
    i1.disease_name AS disease_1,
    i1.image_name AS image_1,
    i2.disease_name AS disease_2,
    i2.image_name AS image_2,
    s.similarity_score,
    s.distance_euclidean
FROM similarity_scores s
JOIN medical_reference_images i1 ON s.image_id_1 = i1.id
JOIN medical_reference_images i2 ON s.image_id_2 = i2.id
WHERE s.similarity_score > 0.7
ORDER BY s.similarity_score DESC;

-- Create public read policy for medical_reference_images
ALTER TABLE medical_reference_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY reference_images_select ON medical_reference_images
    FOR SELECT USING (true);

-- Index for performance
CREATE INDEX idx_medical_reference_images_disease ON medical_reference_images(disease_name);
CREATE INDEX idx_similarity_scores ON similarity_scores(similarity_score DESC);
