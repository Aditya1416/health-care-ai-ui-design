import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { patientId, predictionId, disease, question, patientInfo, confidence } = await req.json()

    // Build context from patient data
    const context = `
Patient ID: ${patientId}
Prediction ID: ${predictionId}
Predicted Disease: ${disease}
AI Confidence: ${(confidence * 100).toFixed(1)}%

Patient Information:
- Name: ${patientInfo?.name || 'Unknown'}
- Age: ${patientInfo?.age || 'Unknown'}
- Smoking Status: ${patientInfo?.smoking || 'Unknown'}
- Occupational Exposure: ${patientInfo?.occupational || 'N/A'}
- AQI Level: ${patientInfo?.aqi || 'N/A'}
- PM2.5 Level: ${patientInfo?.pm25 || 'N/A'}

User Question: ${question}
`

    // Call your Colab backend chat API or Claude/GPT
    // For now, returning a structured response based on the question
    let response = ''

    if (question.toLowerCase().includes('risk') || question.toLowerCase().includes('factor')) {
      response = `Based on this patient's profile for ${disease}:\n\n` +
        `• Environmental Risk: High (AQI ${patientInfo?.aqi}, PM2.5 ${patientInfo?.pm25})\n` +
        `• Occupational Exposure: ${patientInfo?.occupational}\n` +
        `• Smoking Status: ${patientInfo?.smoking}\n` +
        `• AI Confidence Score: ${(confidence * 100).toFixed(1)}%\n\n` +
        `These factors combined suggest monitoring is recommended.`
    } else if (question.toLowerCase().includes('gradcam') || question.toLowerCase().includes('heatmap')) {
      response = `The GradCAM heatmap shows the regions of the X-ray where the AI detected abnormalities. ` +
        `Red areas indicate high attention regions that contributed to the ${disease} prediction. ` +
        `Compare these highlighted areas with the reference disease pattern on the right side of the screen. ` +
        `The stronger the overlap between GradCAM highlighting and reference patterns, the higher the likelihood of disease.`
    } else if (question.toLowerCase().includes('next') || question.toLowerCase().includes('management')) {
      response = `Recommended next steps:\n\n` +
        `1. Confirm diagnosis with radiologist review\n` +
        `2. Check clinical symptoms alignment\n` +
        `3. Consider additional imaging if confidence is borderline\n` +
        `4. Develop treatment plan based on confirmed diagnosis\n\n` +
        `Current AI confidence is ${(confidence * 100).toFixed(1)}%, which is ` +
        `${confidence >= 0.7 ? 'HIGH - recommend immediate action' : 'MODERATE - consider additional tests'}`
    } else if (question.toLowerCase().includes('confident')) {
      response = `The AI confidence score for ${disease} is ${(confidence * 100).toFixed(1)}%. ` +
        `${confidence >= 0.7 ? 'This is HIGH confidence.' : confidence >= 0.5 ? 'This is MODERATE confidence.' : 'This is LOW confidence.'} ` +
        `The prediction is based on analysis of the X-ray image and patient environmental/demographic factors. ` +
        `Always validate AI predictions with clinical judgment and additional tests.`
    } else {
      response = `Regarding your question about this ${disease} case:\n\n` +
        `This patient shows an AI-predicted risk of ${disease} with ${(confidence * 100).toFixed(1)}% confidence. ` +
        `The diagnosis is based on:\n` +
        `• X-ray pattern analysis\n` +
        `• Environmental factors (AQI: ${patientInfo?.aqi})\n` +
        `• Patient demographics and risk factors\n\n` +
        `Please review the X-ray comparison tab to visualize the GradCAM heatmap and reference disease patterns.`
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
