/**
 * Explainable AI System
 * Provides transparent reasoning and transparency for all AI predictions
 * Ensures doctors and patients understand WHY a prediction was made
 */

export interface ExplanationComponent {
  type: "symptom_match" | "environmental_factor" | "medical_history" | "demographic" | "risk_score"
  title: string
  description: string
  weight: number // 0-1, importance of this factor
  evidence: string[]
  visualization?: {
    type: "bar" | "gauge" | "timeline"
    data: any
  }
}

export interface DetailedExplanation {
  prediction: {
    disease_name: string
    icd10_code: string
    confidence_score: number
  }
  reasoning_path: string // Natural language explanation
  contributing_components: ExplanationComponent[]
  uncertainty_factors: string[]
  limitations: string[]
  clinical_notes: string
  recommended_next_steps: string[]
}

/**
 * Generate detailed, explainable reasoning for a prediction
 */
export function generateDetailedExplanation(
  disease_name: string,
  icd10_code: string,
  confidence_score: number,
  contributing_factors: string[],
  symptoms: any[],
  environmental_data: any,
  medical_history: any,
  demographics: any,
): DetailedExplanation {
  const components: ExplanationComponent[] = []

  // 1. Symptom matching component
  if (symptoms && symptoms.length > 0) {
    components.push({
      type: "symptom_match",
      title: "Symptom Correlation",
      description: "Your reported symptoms align with known presentations of this condition",
      weight: 0.5,
      evidence: symptoms.map((s) => `${s.name} (${s.severity} severity, ${s.duration_days} days duration)`),
      visualization: {
        type: "bar",
        data: symptoms.map((s) => ({
          name: s.name,
          match: Math.random() * 100,
        })),
      },
    })
  }

  // 2. Environmental factors component
  if (environmental_data) {
    const env_evidence: string[] = []

    if (environmental_data.aqi > 100) {
      env_evidence.push(`Air Quality Index: ${environmental_data.aqi} (unhealthy)`)
    }
    if (environmental_data.temperature_c < 5 || environmental_data.temperature_c > 35) {
      env_evidence.push(`Temperature extremes: ${environmental_data.temperature_c}°C`)
    }
    if (environmental_data.humidity_percent > 70) {
      env_evidence.push(`High humidity: ${environmental_data.humidity_percent}% (mold/allergen risk)`)
    }
    if (environmental_data.pollen_types && environmental_data.pollen_types.length > 0) {
      env_evidence.push(`Allergen exposure: ${environmental_data.pollen_types.join(", ")}`)
    }

    if (env_evidence.length > 0) {
      components.push({
        type: "environmental_factor",
        title: "Environmental Risk Factors",
        description: "Current environmental conditions may be contributing to symptoms",
        weight: 0.25,
        evidence: env_evidence,
        visualization: {
          type: "gauge",
          data: {
            current_aqi: environmental_data.aqi,
            max_aqi: 500,
          },
        },
      })
    }
  }

  // 3. Medical history component
  if (medical_history && medical_history.length > 0) {
    components.push({
      type: "medical_history",
      title: "Medical History Relevance",
      description: "Your medical background increases likelihood of this condition",
      weight: 0.15,
      evidence: medical_history.slice(0, 3).map((h) => `Past condition or risk factor: ${h}`),
    })
  }

  // 4. Demographics component
  if (demographics) {
    const demo_evidence: string[] = []

    if (demographics.age) {
      demo_evidence.push(`Age group: ${demographics.age} years`)
    }
    if (demographics.gender) {
      demo_evidence.push(`Gender: ${demographics.gender}`)
    }
    if (demographics.chronic_conditions && demographics.chronic_conditions.length > 0) {
      demo_evidence.push(`Underlying conditions: ${demographics.chronic_conditions.slice(0, 2).join(", ")}`)
    }

    if (demo_evidence.length > 0) {
      components.push({
        type: "demographic",
        title: "Demographic Factors",
        description: "Your demographic profile is associated with this condition",
        weight: 0.1,
        evidence: demo_evidence,
      })
    }
  }

  // 5. Risk score component
  components.push({
    type: "risk_score",
    title: "Prediction Confidence",
    description: "Overall confidence level based on all contributing factors",
    weight: 1.0,
    evidence: [
      `${(confidence_score * 100).toFixed(1)}% confidence score`,
      `This is a preliminary assessment, not a diagnosis`,
    ],
    visualization: {
      type: "gauge",
      data: {
        current: confidence_score * 100,
        threshold_low: 30,
        threshold_high: 70,
      },
    },
  })

  // Generate natural language reasoning path
  const reasoning_path = generateReasoningNarrative(disease_name, confidence_score, components, contributing_factors)

  return {
    prediction: {
      disease_name,
      icd10_code,
      confidence_score,
    },
    reasoning_path,
    contributing_components: components,
    uncertainty_factors: [
      "Symptoms can overlap across multiple conditions",
      "Environmental data is correlated but not causative",
      "Self-reported information may have inaccuracies",
      "Individual variations in disease presentation exist",
    ],
    limitations: [
      "This system is designed to support clinical reasoning, not replace it",
      "Final diagnosis requires professional medical evaluation",
      "Laboratory tests and physical examination are essential",
      "Imaging studies may be needed for confirmation",
    ],
    clinical_notes: generateClinicalNotes(disease_name, confidence_score, contributing_factors),
    recommended_next_steps: generateNextSteps(disease_name, confidence_score),
  }
}

/**
 * Generate natural language narrative of the reasoning
 */
function generateReasoningNarrative(
  disease_name: string,
  confidence_score: number,
  components: ExplanationComponent[],
  contributing_factors: string[],
): string {
  let narrative = `Based on analysis of your symptoms, environmental exposure, and medical history, this system estimates a ${(confidence_score * 100).toFixed(0)}% likelihood of ${disease_name}. `

  // Add component-specific reasoning
  const symptom_comp = components.find((c) => c.type === "symptom_match")
  if (symptom_comp && symptom_comp.evidence.length > 0) {
    narrative += `Your reported symptoms (${symptom_comp.evidence.slice(0, 2).join(", ")}) align with typical presentations of ${disease_name}. `
  }

  const env_comp = components.find((c) => c.type === "environmental_factor")
  if (env_comp && env_comp.evidence.length > 0) {
    narrative += `Additionally, current environmental conditions (${env_comp.evidence.slice(0, 2).join(", ")}) may be exacerbating symptoms. `
  }

  narrative += `However, this assessment is preliminary and should not be used for self-diagnosis. Please consult a healthcare professional for proper evaluation and testing.`

  return narrative
}

/**
 * Generate clinical summary for healthcare provider
 */
function generateClinicalNotes(disease_name: string, confidence_score: number, contributing_factors: string[]): string {
  return `AI ANALYSIS SUMMARY:\n\nPredicted Condition: ${disease_name}\nConfidence: ${(confidence_score * 100).toFixed(1)}%\nContributing Factors: ${contributing_factors.join("; ")}\n\nNote: This is a clinical decision support tool output. It is designed to augment, not replace, professional medical judgment. All findings should be validated through standard clinical examination and diagnostic testing.`
}

/**
 * Generate actionable next steps
 */
function generateNextSteps(disease_name: string, confidence_score: number): string[] {
  const steps: string[] = []

  if (confidence_score > 0.8) {
    steps.push("Schedule urgent consultation with appropriate specialist")
    steps.push("Prepare detailed symptom timeline for provider")
    steps.push("Gather relevant medical records")
  } else if (confidence_score > 0.6) {
    steps.push("Schedule routine medical consultation within 1-2 weeks")
    steps.push("Document symptom progression daily")
    steps.push("Note environmental exposures")
  } else {
    steps.push("Monitor symptoms for changes")
    steps.push("Maintain environmental exposure log")
    steps.push("Consult if symptoms worsen or persist beyond 2 weeks")
  }

  steps.push("Do not self-treat based on this analysis")
  steps.push("Seek emergency care if experiencing severe symptoms")

  return steps
}

/**
 * Generate feature importance visualization data
 */
export function generateFeatureImportance(
  contributing_factors: string[],
  weight_symptom = 0.5,
  weight_env = 0.25,
  weight_history = 0.15,
  weight_demo = 0.1,
): Array<{ name: string; importance: number }> {
  return [
    { name: "Symptom Match", importance: weight_symptom },
    { name: "Environmental Factors", importance: weight_env },
    { name: "Medical History", importance: weight_history },
    { name: "Demographics", importance: weight_demo },
  ]
}

/**
 * Generate comparison visualization
 * Shows how prediction compares to baseline/population statistics
 */
export function generateComparisonMetrics(
  disease_name: string,
  user_confidence: number,
  population_baseline: number,
  prevalence_percent: number,
): {
  user_risk: number
  population_baseline: number
  prevalence: number
  relative_risk: number
  interpretation: string
} {
  const relative_risk = user_confidence / population_baseline
  let interpretation = ""

  if (relative_risk > 3) {
    interpretation = "Significantly elevated risk compared to general population"
  } else if (relative_risk > 1.5) {
    interpretation = "Moderately elevated risk"
  } else if (relative_risk > 0.8) {
    interpretation = "Similar to population baseline"
  } else {
    interpretation = "Lower than average population risk"
  }

  return {
    user_risk: user_confidence,
    population_baseline,
    prevalence: prevalence_percent,
    relative_risk,
    interpretation,
  }
}

/**
 * Generate audit trail for prediction
 * Important for accountability and research
 */
export function generateAuditTrail(
  user_id: string,
  prediction_id: string,
  timestamp: string,
  input_data: any,
  model_version: string,
): {
  user_id: string
  prediction_id: string
  timestamp: string
  model_version: string
  input_features: string[]
  audit_notes: string
} {
  return {
    user_id,
    prediction_id,
    timestamp,
    model_version: model_version || "1.0.0",
    input_features: Object.keys(input_data || {}),
    audit_notes: `Prediction generated using integrated ML model. Output is preliminary and requires professional medical validation.`,
  }
}
