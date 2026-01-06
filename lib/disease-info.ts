export const DISEASE_INFO = {
  Pneumonia: {
    symptoms: [
      "Cough with phlegm or blood",
      "Fever (typically high)",
      "Shortness of breath",
      "Chest pain or discomfort",
      "Fatigue and weakness",
      "Sweating and chills",
    ],
    risks: [
      "Age over 65 years",
      "Smoking history",
      "Chronic lung disease (COPD, asthma)",
      "Weakened immune system",
      "Recent respiratory infection",
      "High pollution exposure",
    ],
    description:
      "Pneumonia is an infection that inflames the air sacs (alveoli) in one or both lungs. It can be caused by bacteria, viruses, or fungi and is characterized by fluid-filled or pus-filled alveoli.",
  },
  Tuberculosis: {
    symptoms: [
      "Persistent cough lasting more than 3 weeks",
      "Cough with blood or sputum",
      "Chest pain when breathing or coughing",
      "Fever (often in afternoon)",
      "Chills and night sweats",
      "Weight loss and loss of appetite",
      "Fatigue",
    ],
    risks: [
      "Close contact with TB patients",
      "HIV/AIDS infection",
      "Malnutrition and poor diet",
      "Smoking and alcohol abuse",
      "Diabetes mellitus",
      "Immunosuppressive therapy",
      "Urban living with overcrowding",
    ],
    description:
      "Tuberculosis (TB) is an infectious disease caused by Mycobacterium tuberculosis bacteria, primarily affecting the lungs but can spread to other organs.",
  },
  COPD: {
    symptoms: [
      "Shortness of breath during daily activities",
      "Chronic cough with mucus",
      "Wheezing and chest tightness",
      "Frequent respiratory infections",
      "Blue lips or fingernail beds",
      "Lack of energy",
      "Unintentional weight loss (in advanced stages)",
    ],
    risks: [
      "Long-term smoking (primary risk)",
      "Secondhand smoke exposure",
      "Occupational dust and chemical exposure",
      "Air pollution",
      "Family history of COPD",
      "Recurrent respiratory infections",
      "Asthma history",
    ],
    description:
      "Chronic Obstructive Pulmonary Disease (COPD) is a group of lung conditions that block airflow and make breathing difficult, primarily emphysema and chronic bronchitis.",
  },
  Asthma: {
    symptoms: [
      "Shortness of breath",
      "Chest tightness or pain",
      "Trouble sleeping due to shortness of breath",
      "Wheezing sound when exhaling (especially in children)",
      "Coughing fits triggered by cold air, exercise, or allergens",
      "Fatigue during play or activities",
    ],
    risks: [
      "Family history of asthma",
      "Allergic conditions (eczema, hay fever)",
      "Allergen exposure (pollen, dust mites, pet dander)",
      "Air pollution and smog",
      "Occupational irritants",
      "Obesity",
      "Viral respiratory infections",
    ],
    description:
      "Asthma is a chronic respiratory condition characterized by inflamed airways, causing episodes of wheezing, breathlessness, chest tightness, and nighttime or early morning coughing.",
  },
  Bronchiectasis: {
    symptoms: [
      "Chronic productive cough with large amounts of sputum",
      "Frequent respiratory infections",
      "Hemoptysis (coughing up blood)",
      "Shortness of breath",
      "Chest pain or discomfort",
      "Fatigue",
      "Finger clubbing (in advanced stages)",
    ],
    risks: [
      "Chronic or recurrent respiratory infections",
      "Severe pneumonia or measles history",
      "Cystic fibrosis",
      "Immune system deficiency",
      "Aspiration of foreign objects",
      "Chronic obstructive diseases",
      "Smoking",
    ],
    description:
      "Bronchiectasis is a chronic condition where damaged airways become permanently widened, leading to excessive mucus production and recurrent infections.",
  },
  No_Finding: {
    symptoms: [
      "No respiratory symptoms observed",
      "Normal breathing pattern",
      "Clear chest on examination",
      "No cough or fever",
    ],
    risks: ["None detected on imaging"],
    description:
      "No significant pathological findings detected on X-ray imaging. The lungs appear normal and healthy with no signs of infection or disease.",
  },
}

export function getDiseaseInfo(disease: string) {
  return (
    DISEASE_INFO[disease as keyof typeof DISEASE_INFO] || {
      symptoms: ["Please consult with healthcare provider for specific symptoms"],
      risks: ["Individual risk assessment needed"],
      description: "Disease information not available in database",
    }
  )
}
