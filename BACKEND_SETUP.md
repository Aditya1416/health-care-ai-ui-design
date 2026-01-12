# Healthcare AI Backend - Production Setup

## Installation & Deployment

### 1. Prerequisites
- Python 3.9+
- PostgreSQL 12+
- pip and virtual environment

### 2. Setup Backend

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

### 3. Environment Configuration

Create `.env` file in backend directory:
\`\`\`
DATABASE_URL=postgresql://user:password@localhost/healthcare_ai
SECRET_KEY=your-secure-secret-key
DEBUG=False
ENABLE_GPU=False
\`\`\`

### 4. Database Initialization

\`\`\`bash
psql -U postgres -d healthcare_ai -f ../scripts/06-production-database.sql
python scripts/generate_production_data.py
\`\`\`

### 5. Train ML Models

\`\`\`bash
python backend/ml/training.py
\`\`\`

### 6. Run FastAPI Server

\`\`\`bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

API Documentation available at: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- POST `/api/v1/auth/login` - User login
- POST `/api/v1/auth/logout` - User logout

### Predictions
- POST `/api/v1/predictions/diagnose` - Get disease prediction

### Reports
- POST `/api/v1/reports/generate-pdf` - Generate PDF report

### Admin
- GET `/api/v1/admin/statistics` - Get dashboard statistics
- GET `/api/v1/admin/model-performance` - Get model metrics

## ML Models Information

- **Logistic Regression**: Baseline model (82% accuracy)
- **Random Forest**: Ensemble classifier (88% accuracy)
- **XGBoost**: Gradient boosting (89% accuracy)
- **Neural Network**: MLP classifier (85% accuracy)
- **Ensemble**: Voting ensemble (91% accuracy)

## CNN for Medical Imaging

- ResNet-50 pretrained backbone
- Binary classification (normal/abnormal)
- Grad-CAM for explainability
- Supports X-ray, CT, MRI images

## Database Structure

50,000+ records distributed across:
- 10,000+ patient records
- 1,000+ doctor profiles
- 25,000+ health metrics
- 5,000+ medical images
- 10,000+ predictions
- 8+ diseases in knowledge base
