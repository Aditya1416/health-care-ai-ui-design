/**
 * Medical Imaging Service
 * Handles medical image uploads, storage, and CNN-based analysis
 * Supports X-rays, CT scans, MRI, and ultrasounds
 */

import { createServerClient } from "@/lib/supabase/server"

export interface MedicalImage {
  id?: string
  user_id: string
  image_type: "xray" | "ct_scan" | "mri" | "ultrasound" | "radiograph" | "other"
  body_part: string
  image_date: string
  image_url: string
  thumbnail_url?: string
  image_size_bytes?: number
  mime_type: string
  ordering_provider?: string
  indication?: string
  findings_text?: string
}

export interface ImageAnalysisResult {
  image_id: string
  abnormalities_detected: string[]
  confidence_score: number
  analysis_text: string
  requires_followup: boolean
  recommendations: string[]
  comparison_images: string[]
}

/**
 * Upload a medical image to Supabase storage
 */
export async function uploadMedicalImage(
  userId: string,
  file: File,
  imageType: "xray" | "ct_scan" | "mri" | "ultrasound" | "radiograph" | "other",
  bodyPart: string,
  imageDate: string,
  metadata?: {
    ordering_provider?: string
    indication?: string
  },
): Promise<MedicalImage> {
  const supabase = await createServerClient()

  // Create unique filename
  const timestamp = Date.now()
  const filename = `${userId}/${imageType}/${bodyPart}-${timestamp}-${file.name}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("medical-images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) {
    console.error("Error uploading medical image:", uploadError)
    throw uploadError
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("medical-images").getPublicUrl(filename)

  // Store metadata in database
  const { data: imageData, error: dbError } = await supabase
    .from("medical_images")
    .insert({
      user_id: userId,
      image_type: imageType,
      body_part: bodyPart,
      image_date: imageDate,
      image_url: publicUrl,
      image_size_bytes: file.size,
      mime_type: file.type,
      ordering_provider: metadata?.ordering_provider,
      indication: metadata?.indication,
    })
    .select()
    .single()

  if (dbError) {
    console.error("Error saving image metadata:", dbError)
    throw dbError
  }

  return imageData
}

/**
 * Analyze medical image using mock CNN model
 * In production, this would integrate with actual deep learning models
 */
export async function analyzeMedialImage(
  imageId: string,
  imageUrl: string,
  imageType: string,
  bodyPart: string,
): Promise<ImageAnalysisResult> {
  try {
    // Mock CNN analysis - simulates pixel-level pattern detection
    const analysis = generateMockAnalysis(imageType, bodyPart, imageUrl)

    return analysis
  } catch (error) {
    console.error("Error analyzing medical image:", error)
    throw error
  }
}

/**
 * Generate mock CNN analysis results
 * In production, this would call actual deep learning models
 */
function generateMockAnalysis(imageType: string, bodyPart: string, imageUrl: string): ImageAnalysisResult {
  // Simulated abnormalities based on image type and body part
  const abnormalityMap: { [key: string]: { [key: string]: string[] } } = {
    xray: {
      chest: ["possible consolidation upper left lobe", "mild hyperinflation", "normal cardiac silhouette"],
      knee: ["joint space narrowing", "possible osteophytes", "mild soft tissue swelling"],
      ankle: ["no acute fracture", "mild soft tissue edema"],
    },
    ct_scan: {
      abdomen: ["small liver lesion 8mm", "mild free fluid", "normal pancreas"],
      chest: ["ground glass opacity right upper lobe", "mediastinal lymphadenopathy"],
      head: ["no acute intracranial findings", "normal ventricles"],
    },
  }

  const abnormalities = abnormalityMap[imageType]?.[bodyPart] || ["Image quality acceptable for interpretation"]

  return {
    image_id: imageUrl,
    abnormalities_detected: abnormalities,
    confidence_score: 0.82 + Math.random() * 0.15,
    analysis_text: `Radiographic analysis of ${bodyPart} ${imageType}. ${abnormalities.join(". ")}. Clinical correlation recommended.`,
    requires_followup: Math.random() > 0.5,
    recommendations: [
      "Follow-up imaging recommended in 3-6 months",
      "Clinical correlation with patient symptoms needed",
      "Consider specialist referral for detailed evaluation",
    ],
    comparison_images: ["prev-xray-2024-01-15", "reference-normal-chest-xray"],
  }
}

/**
 * Get medical images for a user
 */
export async function getMedicalImages(userId: string, limit = 50) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("medical_images")
    .select("*")
    .eq("user_id", userId)
    .order("image_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching medical images:", error)
    throw error
  }

  return data
}

/**
 * Get medical image by ID
 */
export async function getMedicalImageById(imageId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("medical_images").select("*").eq("id", imageId).single()

  if (error) {
    console.error("Error fetching medical image:", error)
    throw error
  }

  return data
}

/**
 * Update medical image with analysis results
 */
export async function updateImageAnalysis(imageId: string, analysis: ImageAnalysisResult) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("medical_images")
    .update({
      ai_analysis: JSON.stringify(analysis),
      abnormalities_detected: analysis.abnormalities_detected,
      confidence_score: analysis.confidence_score,
      requires_followup: analysis.requires_followup,
    })
    .eq("id", imageId)

  if (error) {
    console.error("Error updating image analysis:", error)
    throw error
  }
}

/**
 * Delete medical image
 */
export async function deleteMedicalImage(imageId: string, imagePath: string) {
  const supabase = await createServerClient()

  // Delete from storage
  const { error: storageError } = await supabase.storage.from("medical-images").remove([imagePath])

  if (storageError) {
    console.error("Error deleting image from storage:", storageError)
  }

  // Delete from database
  const { error: dbError } = await supabase.from("medical_images").delete().eq("id", imageId)

  if (dbError) {
    console.error("Error deleting image from database:", dbError)
    throw dbError
  }
}
