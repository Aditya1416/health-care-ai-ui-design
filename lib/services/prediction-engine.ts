/**
 * ML Symptom Prediction Engine
 * Predicts likely disease categories based on:
 * - Patient symptoms
 * - Environmental exposure data
 * - Medical history
 * - Demographic factors
 *
 * Uses Bayesian reasoning similar to how doctors reason diagnostically
 */

import { createServerClient } from "@/lib/supabase/server"

export interface PredictionRequest {
  userId: string
  symptoms: Array<{
    name: string
    severity: "mild" | "moderate" | "severe"
    duration_days: number
  }>
  environmentalDataId?: string
  medicalHistory?: string[]
  age?: number
  gender?: string
}

export interface DiseasePrediction {
  icd10_code: string
  disease_name: string
  confidence_score: number
  reasoning: string
  contributing_factors: string[]
  recommended_actions: string[]
}

export interface PredictionResult {
  predictions: DiseasePrediction[]
  overall_confidence: number
  environmental_risk_factors: string[]
  recommendation: string
  warning_signs: string[]
}

/**
 * Main prediction function - correlates symptoms, environment, and medical knowledge
 */
export async function predictDiseaseCategories(request: PredictionRequest): Promise<PredictionResult> {
  const supabase = await createServerClient()

  // Get disease knowledge base
  const { data: diseaseKB, error: kbError } = await supabase.from("disease_knowledge_base").select("*").limit(100)

  if (kbError) {
    console.error("Error fetching disease knowledge base:", kbError)
    throw kbError
  }

  // Get environmental data if provided
  let envData: any = null
  if (request.environmentalDataId) {
    const { data, error } = await supabase
      .from("environmental_data")
      .select("*")
      .eq("id", request.environmentalDataId)
      .single()

    if (error) {
      console.error("Error fetching environmental data:", error)
    } else {
      envData = data
    }
  }

  // Calculate symptom-disease correlations
  const predictions: DiseasePrediction[] = []

  for (const disease of diseaseKB || []) {
    // Score based on symptom match
    const symptomScore = calculateSymptomMatch(request.symptoms, disease)

    // Score based on environmental factors
    const envScore = envData ? calculateEnvironmentalRisk(envData, disease) : 0

    // Score based on medical history
    const historyScore = calculateHistoryRelevance(request.medicalHistory || [], disease)

    // Score based on demographics
    const demoScore = calculateDemographicRelevance(request.age, request.gender, disease)

    // Weighted composite score (Bayesian-like reasoning)
    const confidence =
      symptomScore * 0.5 + // Symptoms are most important
      envScore * 0.25 + // Environmental factors matter
      historyScore * 0.15 + // Medical history provides context
      demoScore * 0.1 // Demographics are supporting evidence

    if (confidence > 0.3) {
      // Only include predictions above threshold
      const contributing = getContributingFactors(request.symptoms, envData, disease, confidence)

      predictions.push({
        icd10_code: disease.icd10_code,
        disease_name: disease.disease_name,
        confidence_score: Math.min(confidence, 0.99),
        reasoning: generateReasoning(disease, request.symptoms, contributing),
        contributing_factors: contributing,
        recommended_actions: generateRecommendations(disease),
      })
    }
  }

  // Sort by confidence and limit to top 5
  predictions.sort((a, b) => b.confidence_score - a.confidence_score)
  const topPredictions = predictions.slice(0, 5)

  // Get environmental risk factors
  const environmentalRisks = envData ? identifyEnvironmentalRisks(envData) : []

  // Generate warning signs
  const warningSignsSet = new Set<string>()
  for (const pred of topPredictions) {
    if (pred.confidence_score > 0.7) {
      warningSignsSet.add(`High confidence prediction: ${pred.disease_name}`)
    }
  }
  if (environmentalRisks.length > 0) {
    warningSignsSet.add("Environmental risk factors detected - may exacerbate symptoms")
  }

  return {
    predictions: topPredictions,
    overall_confidence: topPredictions[0]?.confidence_score || 0,
    environmental_risk_factors: environmentalRisks,
    recommendation: generateFinalRecommendation(topPredictions),
    warning_signs: Array.from(warningSignsSet),
  }
}

/**
 * Calculate how well symptoms match a disease
 */
function calculateSymptomMatch(
  symptoms: Array<{ name: string; severity: "mild" | "moderate" | "severe"; duration_days: number }>,
  disease: any,
): number {
  let matchScore = 0
  let matchCount = 0

  for (const symptom of symptoms) {
    // Check primary symptoms
    if (disease.primary_symptoms?.includes(symptom.name)) {
      matchScore += 0.8 // Strong match

      // Boost if severity matches typical disease progression
      if (symptom.severity === "moderate" || symptom.severity === "severe") {
        matchScore += 0.1
      }

      matchCount++
    }
    // Check secondary symptoms
    else if (disease.secondary_symptoms?.includes(symptom.name)) {
      matchScore += 0.4 // Weaker match

      matchCount++
    }
  }

  // Normalize score (0-1)
  if (matchCount === 0) return 0

  return Math.min(matchScore / (symptoms.length * 0.8), 1)
}

/**
 * Calculate environmental risk relevance
 */
function calculateEnvironmentalRisk(envData: any, disease: any): number {
  let riskScore = 0

  // Check AQI sensitivity
  if (disease.pollution_sensitivity && envData.aqi > 100) {
    riskScore += 0.3
  }

  // Check temperature sensitivity
  if (disease.temperature_sensitivity) {
    if (envData.temperature_c < 5 || envData.temperature_c > 35) {
      riskScore += 0.3
    }
  }

  // Check humidity sensitivity
  if (disease.humidity_sensitivity) {
    if (envData.humidity_percent > 70 || envData.humidity_percent < 30) {
      riskScore += 0.2
    }
  }

  // Check environmental triggers
  if (disease.environmental_triggers) {
    for (const trigger of disease.environmental_triggers) {
      if (trigger === "high_aqi" && envData.aqi > 150) riskScore += 0.2
      if (trigger === "cold_weather" && envData.temperature_c < 10) riskScore += 0.2
      if (trigger === "high_pollen" && envData.pollen_level === "High") riskScore += 0.2
    }
  }

  return Math.min(riskScore, 1)
}

/**
 * Calculate relevance based on medical history
 */
function calculateHistoryRelevance(medicalHistory: string[], disease: any): number {
  let score = 0

  // Exact matches
  if (medicalHistory.some((h) => h.toLowerCase().includes(disease.disease_name.toLowerCase()))) {
    score += 0.4
  }

  // Related conditions (chronic conditions predispose to certain diseases)
  if (medicalHistory.some((h) => h.toLowerCase().includes("chronic"))) {
    if (disease.prevalence_percent > 10) {
      score += 0.1
    }
  }

  return Math.min(score, 1)
}

/**
 * Calculate demographic relevance
 */
function calculateDemographicRelevance(age: number | undefined, gender: string | undefined, disease: any): number {
  let score = 0

  // Age range check
  if (age && disease.age_range) {
    const [minAge, maxAge] = disease.age_range.split("-").map((a) => Number.parseInt(a))
    if (age >= minAge && age <= maxAge) {
      score += 0.3
    }
  }

  // Gender check
  if (gender && disease.gender_association) {
    if (disease.gender_association === "Both" || disease.gender_association === gender) {
      score += 0.2
    }
  }

  return score
}

/**
 * Identify which factors contributed to the prediction
 */
function getContributingFactors(symptoms: any[], envData: any, disease: any, confidence: number): string[] {
  const factors: string[] = []

  // Symptom factors
  const symptomNames = symptoms.map((s) => s.name)
  const matchingPrimary = disease.primary_symptoms?.filter((s: string) => symptomNames.includes(s)) || []
  if (matchingPrimary.length > 0) {
    factors.push(`Matching primary symptoms: ${matchingPrimary.join(", ")}`)
  }

  // Environmental factors
  if (envData) {
    if (disease.pollution_sensitivity && envData.aqi > 100) {
      factors.push(`High AQI (${envData.aqi}) detected`)
    }
    if (disease.temperature_sensitivity) {
      factors.push(`Temperature ${envData.temperature_c}°C`)
    }
    if (disease.humidity_sensitivity) {
      factors.push(`Humidity level ${envData.humidity_percent}%`)
    }
  }

  // Add confidence-based factor
  if (confidence > 0.7) {
    factors.push("Strong symptom-disease correlation")
  }

  return factors
}

/**
 * Generate natural language reasoning
 */
function generateReasoning(disease: any, symptoms: any[], contributing_factors: string[]): string {
  return `This disease is predicted based on the presented symptoms correlating with known medical patterns for ${disease.disease_name}. ${contributing_factors.join(". ")}. This is a preliminary assessment to assist in clinical reasoning - professional medical evaluation is required for definitive diagnosis.`
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(disease: any): string[] {
  const recommendations: string[] = []

  recommendations.push(`Consult a healthcare provider for evaluation of suspected ${disease.disease_name}`)

  if (disease.prevention_measures && disease.prevention_measures.length > 0) {
    recommendations.push(`Consider prevention measures: ${disease.prevention_measures.slice(0, 2).join(", ")}`)
  }

  recommendations.push("Maintain detailed health logs and environmental exposure records")
  recommendations.push("Avoid self-diagnosis - this is preliminary analysis only")

  return recommendations
}

/**
 * Identify environmental risk factors
 */
function identifyEnvironmentalRisks(envData: any): string[] {
  const risks: string[] = []

  if (envData.aqi > 150) {
    risks.push("Poor air quality (unhealthy)")
  } else if (envData.aqi > 100) {
    risks.push("Moderate air quality concerns")
  }

  if (envData.temperature_c < 0) {
    risks.push("Extreme cold weather")
  } else if (envData.temperature_c < 5) {
    risks.push("Cold weather conditions")
  }

  if (envData.humidity_percent > 80) {
    risks.push("Very high humidity - mold risk")
  }

  if (envData.uv_index > 8) {
    risks.push("High UV index - sun exposure risk")
  }

  if (envData.pollen_level === "High" || envData.pollen_level === "Very High") {
    risks.push(`High pollen levels: ${envData.pollen_types?.join(", ")}`)
  }

  return risks
}

/**
 * Generate final recommendation for user
 */
function generateFinalRecommendation(predictions: DiseasePrediction[]): string {
  if (predictions.length === 0) {
    return "No strong disease predictions. Monitor symptoms and consult a healthcare provider if symptoms persist."
  }

  if (predictions[0].confidence_score > 0.8) {
    return `Strong evidence suggests possible ${predictions[0].disease_name}. Seek medical evaluation promptly.`
  } else if (predictions[0].confidence_score > 0.6) {
    return `Moderate possibility of ${predictions[0].disease_name}. Schedule a consultation with a healthcare provider.`
  } else {
    return `Multiple factors detected. Medical professional consultation recommended for accurate diagnosis.`
  }
}

/**
 * Save prediction to database
 */
export async function savePrediction(
  userId: string,
  symptomIds: string[],
  environmentalDataId: string | null,
  result: PredictionResult,
) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("ai_predictions").insert({
    user_id: userId,
    prediction_type: "symptom_to_disease",
    symptoms_analyzed: symptomIds,
    environmental_data_id: environmentalDataId,
    predicted_conditions: result.predictions.map((p) => p.disease_name),
    condition_icd10_codes: result.predictions.map((p) => p.icd10_code),
    confidence_scores: result.predictions.map((p) => p.confidence_score),
    reasoning: JSON.stringify(result),
    contributing_factors: result.environmental_risk_factors,
    feature_importance: {
      symptoms: 0.5,
      environment: 0.25,
      history: 0.15,
      demographics: 0.1,
    },
  })

  if (error) {
    console.error("Error saving prediction:", error)
    throw error
  }
}
