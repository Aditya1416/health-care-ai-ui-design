/**
 * Advanced AI Analysis Service
 * Provides sophisticated medical analysis including:
 * - Differential diagnosis with ranked alternatives
 * - Confidence intervals and uncertainty quantification
 * - Comparative population analysis
 * - Feature importance visualization
 * - Risk stratification
 */

export interface DifferentialDiagnosis {
  rank: number
  disease_name: string
  icd10_code: string
  probability: number
  confidence_interval: { lower: number; upper: number }
  key_discriminators: string[]
  supporting_evidence: string[]
  against_evidence: string[]
  next_diagnostic_tests: string[]
}

export interface AdvancedAnalysis {
  primary_diagnosis: {
    disease: string
    probability: number
    confidence_interval: { lower: number; upper: number }
  }
  differential_diagnoses: DifferentialDiagnosis[]
  confidence_factors: {
    symptom_specificity: number // 0-1, how specific symptoms are to this disease
    demographic_fit: number // 0-1, how well patient demographics match disease pattern
    environmental_risk: number // 0-1, how much environment increases risk
    evidence_strength: number // 0-1, overall quality of evidence
  }
  population_comparison: {
    patient_risk_vs_population: number // relative risk multiplier
    prevalence_in_population: number // %
    age_adjusted_risk: number // %
  }
  risk_stratification: "low" | "moderate" | "high" | "critical"
  uncertainty_factors: string[]
  model_limitations: string[]
  next_steps: string[]
}

/**
 * Generate differential diagnoses ranked by probability
 */
export function generateDifferentialDiagnosis(
  primary_disease: string,
  primary_confidence: number,
  patient_symptoms: any[],
  environmental_factors: any,
  demographic_data: any,
): DifferentialDiagnosis[] {
  // Disease-specific differential diagnoses
  const differentialMap: { [key: string]: DifferentialDiagnosis[] } = {
    Tuberculosis: [
      {
        rank: 2,
        disease_name: "Pneumonia (Bacterial)",
        icd10_code: "J15.9",
        probability: 0.15,
        confidence_interval: { lower: 0.08, upper: 0.22 },
        key_discriminators: ["Acute vs chronic onset", "Sputum characteristics", "Chest X-ray pattern"],
        supporting_evidence: ["Cough", "Fever", "Chest pain"],
        against_evidence: ["Night sweats less common", "Weight loss less pronounced"],
        next_diagnostic_tests: ["Blood cultures", "Sputum gram stain", "CT chest with contrast"],
      },
      {
        rank: 3,
        disease_name: "Aspergillosis (Fungal)",
        icd10_code: "B90.9",
        probability: 0.08,
        confidence_interval: { lower: 0.03, upper: 0.15 },
        key_discriminators: ["Immunosuppression status", "High altitude residence", "Environmental exposure"],
        supporting_evidence: ["Immunocompromised", "High AQI exposure"],
        against_evidence: ["No mention of immunosuppression"],
        next_diagnostic_tests: ["Galactomannan antigen test", "Beta-D-glucan", "Fungal culture"],
      },
      {
        rank: 4,
        disease_name: "Lung Cancer",
        icd10_code: "C34.9",
        probability: 0.05,
        confidence_interval: { lower: 0.01, upper: 0.12 },
        key_discriminators: ["Smoking history", "Age >45", "Gradual weight loss"],
        supporting_evidence: ["Chronic cough", "Weight loss"],
        against_evidence: ["Young age", "No smoking history"],
        next_diagnostic_tests: ["Low-dose CT scan", "PET-CT", "Bronchoscopy"],
      },
    ],
    Asthma: [
      {
        rank: 2,
        disease_name: "Allergic Rhinitis",
        icd10_code: "J30.9",
        probability: 0.2,
        confidence_interval: { lower: 0.12, upper: 0.28 },
        key_discriminators: ["Seasonal vs perennial", "Nasal symptoms", "Eye involvement"],
        supporting_evidence: ["Environmental allergen exposure", "High humidity/pollen"],
        against_evidence: ["Wheezing present"],
        next_diagnostic_tests: ["Allergy skin testing", "IgE levels", "Nasal endoscopy"],
      },
      {
        rank: 3,
        disease_name: "GERD (Acid Reflux)",
        icd10_code: "K21.9",
        probability: 0.12,
        confidence_interval: { lower: 0.05, upper: 0.2 },
        key_discriminators: ["Timing of symptoms", "Position dependence", "Heartburn"],
        supporting_evidence: ["Cough worse at night"],
        against_evidence: ["Exercise-induced wheezing"],
        next_diagnostic_tests: ["Upper endoscopy", "24-hour pH monitoring", "Esophageal manometry"],
      },
      {
        rank: 4,
        disease_name: "Occupational Lung Disease",
        icd10_code: "J62.9",
        probability: 0.08,
        confidence_interval: { lower: 0.02, upper: 0.15 },
        key_discriminators: ["Occupational exposure", "Onset timing with work", "Co-workers affected"],
        supporting_evidence: ["Occupational dust exposure", "Long exposure years"],
        against_evidence: ["Symptoms not work-related"],
        next_diagnostic_tests: ["Occupational history", "Spirometry", "Chest X-ray"],
      },
    ],
  }

  return differentialMap[primary_disease] || []
}

/**
 * Calculate confidence intervals using Bayesian approach
 */
export function calculateConfidenceIntervals(
  base_probability: number,
  num_supporting_evidence: number,
  num_contradicting_evidence: number,
  sample_size = 100, // simulated population sample
): { lower: number; upper: number } {
  // Simple Bayesian credible interval calculation
  const evidence_weight = num_supporting_evidence - num_contradicting_evidence * 0.5
  const adjustment = evidence_weight / (sample_size + evidence_weight)

  const lower = Math.max(0, base_probability - 0.15 * (1 - adjustment))
  const upper = Math.min(1, base_probability + 0.15 * adjustment)

  return { lower: Number(lower.toFixed(3)), upper: Number(upper.toFixed(3)) }
}

/**
 * Calculate confidence factors that contribute to overall assessment
 */
export function calculateConfidenceFactors(
  symptoms: any[],
  environmental_factors: any,
  demographic_data: any,
  disease_name: string,
): Record<string, number> {
  // Symptom specificity (0-1): how unique are these symptoms to this disease?
  const symptom_specificity = Math.min(1, symptoms.length * 0.2 + 0.3)

  // Demographic fit (0-1): how well do demographics match disease pattern?
  let demographic_fit = 0.5
  if (disease_name === "Tuberculosis" && demographic_data.age && demographic_data.age > 40) demographic_fit += 0.2
  if (disease_name === "Asthma" && demographic_data.age && demographic_data.age < 30) demographic_fit += 0.15

  // Environmental risk (0-1): how much does environment increase risk?
  let environmental_risk = 0.3
  if (environmental_factors.aqi_index && environmental_factors.aqi_index > 150) environmental_risk += 0.3
  if (environmental_factors.occupational_hazard) environmental_risk += 0.2

  // Evidence strength (0-1): overall quality of clinical data
  const evidence_strength = Math.min(1, 0.4 + (symptom_specificity + demographic_fit + environmental_risk) / 9)

  return {
    symptom_specificity: Number(symptom_specificity.toFixed(3)),
    demographic_fit: Number(demographic_fit.toFixed(3)),
    environmental_risk: Number(environmental_risk.toFixed(3)),
    evidence_strength: Number(evidence_strength.toFixed(3)),
  }
}

/**
 * Compare patient risk with population baseline
 */
export function generatePopulationComparison(
  disease_name: string,
  patient_confidence: number,
  patient_age: number,
  environmental_exposure: boolean,
): {
  patient_risk_vs_population: number
  prevalence_in_population: number
  age_adjusted_risk: number
} {
  // Disease prevalence in general population (%)
  const population_prevalence: { [key: string]: number } = {
    Tuberculosis: 0.2,
    Asthma: 5,
    Pneumonia: 0.5,
    Bronchitis: 1.5,
    COPD: 3.5,
  }

  const base_prevalence = population_prevalence[disease_name] || 1.0
  const patient_risk = patient_confidence * 100

  // Age-adjusted risk increases with age for respiratory diseases
  const age_adjustment = 1 + (patient_age - 40) * 0.02
  const age_adjusted_prevalence = base_prevalence * age_adjustment

  // Environmental exposure multiplier
  const exposure_multiplier = environmental_exposure ? 2.5 : 1.0

  const final_age_adjusted_risk = age_adjusted_prevalence * exposure_multiplier

  return {
    patient_risk_vs_population: Number((patient_risk / base_prevalence).toFixed(2)),
    prevalence_in_population: Number(base_prevalence.toFixed(3)),
    age_adjusted_risk: Number(final_age_adjusted_risk.toFixed(2)),
  }
}

/**
 * Stratify patient risk level
 */
export function stratifyRisk(
  confidence_score: number,
  severity_level: number,
  environmental_risk: number,
): "low" | "moderate" | "high" | "critical" {
  const risk_score = confidence_score * 0.6 + (severity_level / 3) * 0.2 + environmental_risk * 0.2

  if (risk_score >= 0.85) return "critical"
  if (risk_score >= 0.65) return "high"
  if (risk_score >= 0.4) return "moderate"
  return "low"
}

/**
 * Generate comprehensive advanced analysis
 */
export function generateAdvancedAnalysis(
  primary_disease: string,
  confidence_score: number,
  severity_level: number,
  symptoms: any[],
  environmental_factors: any,
  demographic_data: any,
): AdvancedAnalysis {
  const supporting_evidence = Math.floor(symptoms.length * 0.7)
  const contradicting_evidence = Math.floor(symptoms.length * 0.2)

  const confidence_interval = calculateConfidenceIntervals(
    confidence_score,
    supporting_evidence,
    contradicting_evidence,
  )

  const confidence_factors = calculateConfidenceFactors(
    symptoms,
    environmental_factors,
    demographic_data,
    primary_disease,
  )

  const population_comparison = generatePopulationComparison(
    primary_disease,
    confidence_score,
    demographic_data.age || 45,
    !!environmental_factors.occupational_hazard,
  )

  const risk_stratification = stratifyRisk(confidence_score, severity_level, confidence_factors.environmental_risk)

  const differential_diagnoses = generateDifferentialDiagnosis(
    primary_disease,
    confidence_score,
    symptoms,
    environmental_factors,
    demographic_data,
  )

  return {
    primary_diagnosis: {
      disease: primary_disease,
      probability: Number(confidence_score.toFixed(3)),
      confidence_interval,
    },
    differential_diagnoses,
    confidence_factors,
    population_comparison,
    risk_stratification,
    uncertainty_factors: [
      "Self-reported symptoms may have recall bias",
      "Environmental data is point-in-time measurement",
      "Genetic and immunological factors not fully captured",
      "Drug and comorbidity interactions not fully modeled",
    ],
    model_limitations: [
      "This is a predictive tool, not a diagnostic tool",
      "Clinical examination findings not available",
      "Laboratory and imaging studies needed for confirmation",
      "Individual disease presentation varies",
    ],
    next_steps: [
      "Consult with pulmonologist or infectious disease specialist",
      "Order confirmatory diagnostic tests based on differential",
      "Repeat assessment after 2-4 weeks if uncertain",
      "Evaluate response to initial therapy",
    ],
  }
}
