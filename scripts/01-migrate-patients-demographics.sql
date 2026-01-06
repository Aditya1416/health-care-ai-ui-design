-- Add demographic columns to patients table if they don't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS aqi_index NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS pm25_level NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS temperature NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS humidity NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS occupational_hazard VARCHAR(255),
ADD COLUMN IF NOT EXISTS years_of_exposure NUMERIC(4,2),
ADD COLUMN IF NOT EXISTS smoking_status VARCHAR(50);

-- Add scan_image_url to store patient's X-ray/scan
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS scan_image_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
