import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { caseId: string } }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const caseId = params.caseId

    // Get case artifacts
    const { data: artifacts } = await supabase.from("case_artifacts").select("*").eq("case_id", caseId)

    if (!artifacts || artifacts.length === 0) {
      return NextResponse.json({ error: "No artifacts to analyze" }, { status: 400 })
    }

    // Get reference images
    const { data: referenceImages } = await supabase.from("reference_images").select("*").limit(10)

    const results = []

    // Simulate image comparison pipeline
    for (const artifact of artifacts) {
      for (const refImage of referenceImages || []) {
        // PLACEHOLDER: Real implementation would use actual ML model
        const similarityScore = Math.random() * 100
        const featureDistance = Math.random() * 5
        const confidenceScore = Math.random() * 100

        // Generate mock heatmap regions
        const influentialRegions = [
          {
            x: Math.random() * 100,
            y: Math.random() * 100,
            width: 30 + Math.random() * 40,
            height: 30 + Math.random() * 40,
            influence_score: Math.random() * 100,
          },
          {
            x: Math.random() * 100,
            y: Math.random() * 100,
            width: 20 + Math.random() * 30,
            height: 20 + Math.random() * 30,
            influence_score: Math.random() * 100,
          },
        ]

        const { data: comparisonResult, error } = await supabase
          .from("image_comparison_results")
          .insert({
            case_artifact_id: artifact.id,
            reference_image_id: refImage.id,
            reference_disease_id: refImage.diagnosis || "unknown",
            similarity_score: Number.parseFloat(similarityScore.toFixed(2)),
            feature_distance: Number.parseFloat(featureDistance.toFixed(4)),
            confidence_score: Number.parseFloat(confidenceScore.toFixed(2)),
            influential_regions: influentialRegions,
            model_version: "v1.0-placeholder",
            inference_timestamp: new Date(),
          })
          .select()
          .single()

        if (error) {
          console.error("Error storing comparison result:", error)
          continue
        }

        results.push(comparisonResult)
      }
    }

    // Store AI analysis
    const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single()

    const topMatches = results.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 3)
    const avgConfidence = topMatches.reduce((sum, m) => sum + m.confidence_score, 0) / topMatches.length

    await supabase.from("case_ai_analysis").insert({
      case_id: caseId,
      analysis_type: "similarity_analysis",
      predicted_findings: topMatches.map((m) => `Match: ${avgConfidence.toFixed(1)}% confidence`),
      confidence_scores: { overall: Number.parseFloat(avgConfidence.toFixed(2)) },
      feature_importance: { pixel_intensity: 0.35, edge_detection: 0.25, texture: 0.2 },
      explanation_text: `Top ${topMatches.length} reference disease matches found with ${avgConfidence.toFixed(1)}% average confidence. Regions of high similarity highlighted in heatmap.`,
      model_version: "v1.0-placeholder",
    })

    // Log audit
    await supabase.from("case_audit_log").insert({
      case_id: caseId,
      action: "analysis_run",
      actor_id: doctor?.id,
      actor_role: "doctor",
      details: { results_count: results.length, top_match_count: topMatches.length },
    })

    return NextResponse.json({ results: topMatches, totalResults: results.length })
  } catch (error) {
    console.error("[v0] Error analyzing case:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze case" },
      { status: 500 },
    )
  }
}
