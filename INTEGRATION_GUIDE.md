# Healthcare AI UI - Integration Guide

## Project Overview
This is a comprehensive healthcare AI diagnostic platform with patient management, ML-based disease prediction, X-ray analysis with GradCAM visualization, and clinical decision support.

## Quick Start

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Environment Setup
Create a `.env.local` file in the frontend root directory:

```env
# Frontend Base URL (local development)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Local Backend (VS Code FastAPI)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## Backend Integration Points

### Key API Endpoints Expected

#### From Supabase (Database)
- `SELECT * FROM predictions` - Patient predictions with confidence scores
- `SELECT * FROM reference_images` - Disease reference X-rays for comparison
- `SELECT * FROM patients` - Patient demographics
- `SELECT * FROM heatmaps` - GradCAM heatmap data

#### From Colab Backend (ML Inference)
Your Colab FastAPI backend should expose these endpoints:

```
POST /predict
  - Input: X-ray image (multipart/form-data)
  - Output: { disease: string, confidence: number, gradcam: array }

GET /patients/{id}/predictions
  - Output: Array of predictions with confidence scores

GET /patient/{id}/heatmap
  - Output: { heatmap_image_url: string, disease: string }

POST /analyze
  - Input: { patient_id, prediction_id }
  - Output: { analysis_result: object, recommendations: array }
```

---

## Frontend Architecture

### Pages Structure

#### Public Pages
- `/` - Landing page
- `/auth/login` - User authentication
- `/auth/sign-up` - New user registration
- `/auth/check-email` - Email verification

#### Patient Dashboard (`/dashboard`)
- `/dashboard` - Main patient health overview
- `/dashboard/metrics` - Health metrics tracking
- `/dashboard/appointments` - Appointment management
- `/dashboard/imaging` - X-ray image viewer
- `/dashboard/records` - Medical records access
- `/dashboard/ai-assistant` - AI chatbot for health queries

#### Doctor Dashboard (`/doctor`)
- `/doctor` - Doctor's patient list
- `/doctor/patient/[id]` - Detailed patient view with predictions

#### Admin Dashboard (`/admin`)
- `/admin` - Admin home with system overview
- `/admin/patient-analysis` - **MAIN ANALYSIS PAGE** (Primary deliverable)
  - Select patient from Supabase
  - View 3-column X-ray comparison:
    1. Patient's X-ray
    2. GradCAM heatmap (AI attention)
    3. Reference disease X-ray
  - Predictions with confidence scores
  - Clinical chat with AI
- `/admin/predictions` - All predictions dashboard
- `/admin/patients` - Patient management
- `/admin/doctors` - Doctor management
- `/admin/appointments` - Appointment scheduling
- `/admin/imaging` - Image analysis dashboard
- `/admin/metrics` - System metrics dashboard

#### Research Pages (`/research`)
- `/research` - ML architecture documentation
- `/research/reference-images` - Reference image gallery
- `/research/ml-architecture` - Model explanation
- `/research/comparison` - Disease comparison tool
- `/research/simulation` - ML simulation environment

---

## Key Features & Deliverables

### 1. Patient Authentication
- Sign up with email/password
- Email verification
- Session management via Supabase Auth
- Role-based access control (Patient, Doctor, Admin)

### 2. AI-Powered Predictions
- Uploaded X-ray analysis
- Disease probability scores
- Confidence intervals
- GradCAM heatmap visualization
- Risk stratification (High/Medium/Low)

### 3. X-ray Comparison Analysis
- **Main deliverable**: Side-by-side X-ray comparison
- Patient's X-ray vs disease reference image
- GradCAM attention heatmap overlay
- Similarity scoring
- Affected areas highlighting

### 4. Clinical Chat
- AI-powered chatbot for patient queries
- Context-aware responses based on:
  - Patient demographics
  - Prediction results
  - Confidence scores
  - Environmental factors
- Example questions:
  - "What are my risk factors?"
  - "What does the heatmap show?"
  - "What's next?"

### 5. Dashboard Analytics
- Patient statistics
- Prediction confidence distribution
- Disease prevalence charts
- Environmental factor analysis
- Model performance metrics

### 6. Medical Records
- Patient history
- Appointment management
- Health metrics tracking
- Environmental data logging

---

## Data Models

### Predictions Table (Supabase)
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  predicted_disease TEXT,
  confidence_score FLOAT,
  icd10_code TEXT,
  risk_level TEXT, -- 'High', 'Medium', 'Low'
  gradcam_url TEXT, -- URL to heatmap image
  reference_image_url TEXT, -- URL to comparison image
  created_at TIMESTAMP,
  metadata JSONB -- Additional data
);
```

### Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  user_id UUID,
  age INT,
  gender TEXT,
  medical_history TEXT,
  environmental_factors JSONB,
  created_at TIMESTAMP
);
```

### Reference Images Table
```sql
CREATE TABLE reference_images (
  id UUID PRIMARY KEY,
  disease_name TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP
);
```

---

## Local Development with VS Code Backend

### Backend Setup (VS Code)

#### 1. Start Your FastAPI Backend
In VS Code terminal:
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend should be running at: `http://localhost:8000`

#### 2. Enable CORS for Local Development
In your FastAPI `main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3. Check FastAPI Docs
Visit: `http://localhost:8000/docs` to see all endpoints

### Frontend Setup (VS Code)

#### 1. Open Frontend in VS Code
```bash
# In another terminal window
cd frontend  # or path to downloaded frontend

# Install dependencies
npm install

# Update .env.local with local backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### 2. Start Development Server
```bash
npm run dev
# Frontend runs at: http://localhost:3000
```

#### 3. Test Integration
- Go to `http://localhost:3000/admin/patient-analysis`
- Check browser console for API calls
- Backend should respond with patient data

### Backend Expected Endpoints (Update as Needed)

Make sure your VS Code FastAPI backend has these endpoints:

```python
# endpoints.py

@app.get("/patients")
def get_patients():
    """Fetch all patients"""
    return [...]

@app.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    """Get single patient details"""
    return {...}

@app.get("/patient/{patient_id}/predictions")
def get_predictions(patient_id: str):
    """Get patient predictions"""
    return [...]

@app.get("/patient/{patient_id}/images")
def get_patient_images(patient_id: str):
    """Get X-rays, heatmaps, reference images"""
    return {
        "patient_xray": "url_to_patient_xray.jpg",
        "predictions": [
            {
                "disease": "Tuberculosis",
                "probability": 0.85,
                "gradcam_heatmap": "url_to_heatmap.jpg",
                "reference_image": "url_to_reference.jpg",
                "similarity_score": 0.88
            }
        ]
    }

@app.post("/chat")
def chat(patient_id: str, question: str):
    """Clinical chat endpoint"""
    return {"response": "AI-generated response..."}
```

### Database Setup (Supabase)
- [ ] Create `predictions` table with columns:
  - id, patient_id, predicted_disease, confidence_score
  - icd10_code, risk_level, gradcam_url, reference_image_url
  - created_at, metadata

- [ ] Create `patients` table
- [ ] Create `reference_images` table
- [ ] Create `heatmaps` table for GradCAM data
- [ ] Enable Row Level Security (RLS) policies

### Colab Backend Integration
- [ ] Deploy FastAPI backend to Colab
- [ ] Setup ngrok tunnel for public access
- [ ] Implement `/predict` endpoint for X-ray analysis
- [ ] Implement `/patients/{id}/predictions` endpoint
- [ ] Implement `/patient/{id}/heatmap` endpoint
- [ ] Add CORS middleware for v0 preview domain
- [ ] Add ngrok warning header bypass:
  ```python
  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*", "ngrok-skip-browser-warning"]
  )
  ```

### Environment Variables
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `NEXT_PUBLIC_COLAB_API_URL` (ngrok URL)
- [ ] Set `NEXT_PUBLIC_API_URL` for local API routes

---

## API Routes (Frontend)

### Chat API
**Route:** `/app/api/chat/route.ts`
- POST `/api/chat`
- Accepts: `{ patientId, disease, question, confidence, patientInfo }`
- Returns: `{ response: string }`

### Backend API Client
**File:** `/lib/backend/api.ts`
Exported functions:
- `getPatients()` - Fetch all patients
- `getPatientDetails(id)` - Get patient info
- `getPatientImages(id)` - Get X-rays, heatmaps, reference images
- `askChatbot(id, question)` - Send chat message
- `fetchFromColab(endpoint, options)` - Generic Colab request

---

## Component Structure

### Core Components
- `/components/ui/*` - Shadcn UI components (buttons, cards, tabs, etc.)
- `/components/dashboard/*` - Dashboard layout components
- `/components/patient/*` - Patient-specific components
- `/components/medical/*` - Medical visualization components
  - `chest-xray-analysis-panel.tsx` - X-ray display
  - `gradcam-heatmap.tsx` - Heatmap visualization
- `/components/doctor/*` - Doctor interface components

### Key Pages
- `/app/admin/patient-analysis/page.tsx` - **Main analysis page with 3 tabs:**
  1. AI Analysis - Predictions table
  2. X-ray Comparison - Side-by-side images
  3. Clinical Chat - AI chatbot

---

## Deployment

### Deploy to Vercel
```bash
vercel deploy
# Or connect GitHub repo to Vercel for auto-deployment
```

### Environment Variables on Vercel
Add these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_COLAB_API_URL`
- `NEXT_PUBLIC_API_URL`

---

## Troubleshooting

### "Failed to fetch" Error
- Check ngrok URL is active: `https://your-ngrok-url.ngrok-free.app`
- Verify CORS is enabled in Colab backend
- Check network tab in browser DevTools

### "Missing Supabase Environment Variables"
- Ensure all `NEXT_PUBLIC_SUPABASE_*` vars are set
- Check `.env.local` file exists locally
- Verify vars are set in Vercel dashboard for production

### Chat Not Working
- Check `/api/chat` endpoint is accessible
- Verify patient data is loaded before sending messages
- Check browser console for error details

### X-ray Images Not Loading
- Verify `reference_image_url` is set in database
- Check image URLs are publicly accessible
- Ensure Supabase storage is configured for public access

---

## Next Steps for Codex/Backend Developer

When implementing the backend, connect these endpoints:

1. **Modify `/lib/backend/api.ts`**
   - Update API_BASE_URL to your Colab backend
   - Implement proper authentication tokens
   - Add error handling for each endpoint

2. **Create Database Migrations**
   - Run SQL scripts in `/scripts/` folder
   - Create RLS policies for security
   - Seed reference images

3. **Implement Colab Endpoints**
   - Ensure GradCAM returns proper heatmap array
   - Reference images should match disease names in predictions
   - Return similarity scores between patient and reference X-rays

4. **Test Integration**
   - Go to `/test-connection` to verify backend connectivity
   - Check `/admin/patient-analysis` for full flow
   - Verify 3-column comparison displays correctly

---

## File Structure

```
├── /app
│   ├── /admin
│   │   ├── /patient-analysis (MAIN PAGE)
│   │   ├── /predictions
│   │   ├── /patients
│   │   └── ...
│   ├── /dashboard
│   ├── /doctor
│   ├── /auth
│   ├── /research
│   ├── /api
│   │   └── /chat (Chat endpoint)
│   └── layout.tsx
├── /components
│   ├── /ui (Shadcn components)
│   ├── /medical (Medical analysis)
│   ├── /dashboard
│   └── ...
├── /lib
│   ├── /backend
│   │   └── api.ts (API client)
│   └── /supabase (Supabase client)
└── /scripts (Database migrations)
```

---

## Support

For issues or questions:
1. Check the debug logs: `browser console` → Application tab
2. Review Supabase logs: https://supabase.com/dashboard
3. Check Colab ngrok status: `https://dashboard.ngrok.com`
4. Review error messages in `/api/chat` responses
