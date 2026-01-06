from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime

router = APIRouter()

class ReportRequest(BaseModel):
    patient_name: str
    patient_id: str
    disease_prediction: str
    confidence: float
    environmental_data: dict
    recommendations: list

@router.post("/generate-pdf")
async def generate_pdf_report(request: ReportRequest):
    """Generate PDF diagnostic report"""
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Add content
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "Healthcare AI - Diagnostic Report")
    
    c.setFont("Helvetica", 10)
    c.drawString(50, 730, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawString(50, 710, f"Patient: {request.patient_name} (ID: {request.patient_id})")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 680, "AI Assessment:")
    
    c.setFont("Helvetica", 10)
    c.drawString(70, 660, f"Predicted Condition: {request.disease_prediction}")
    c.drawString(70, 640, f"Confidence Score: {request.confidence:.2%}")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 610, "Environmental Factors:")
    
    y_position = 590
    for key, value in request.environmental_data.items():
        c.drawString(70, y_position, f"• {key}: {value}")
        y_position -= 20
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y_position - 20, "Recommendations:")
    
    y_position -= 40
    for i, rec in enumerate(request.recommendations, 1):
        c.drawString(70, y_position, f"{i}. {rec}")
        y_position -= 20
    
    c.setFont("Helvetica-Italic", 8)
    c.drawString(50, 50, "This report is AI-generated for clinical assistant purposes only. Not for diagnosis.")
    
    c.save()
    buffer.seek(0)
    
    return {
        "filename": f"report_{request.patient_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
        "content": buffer.getvalue()
    }
