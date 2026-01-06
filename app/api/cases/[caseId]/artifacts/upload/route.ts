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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const artifactType = formData.get("artifactType") as string
    const uploadNotes = formData.get("uploadNotes") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const caseId = params.caseId
    const fileName = `${caseId}/${Date.now()}-${file.name}`
    const fileBuffer = await file.arrayBuffer()

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("case-artifacts")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      })

    if (uploadError) throw uploadError

    const fileUrl = supabase.storage.from("case-artifacts").getPublicUrl(fileName).data.publicUrl

    // Create artifact record
    const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single()

    const { data: artifact, error } = await supabase
      .from("case_artifacts")
      .insert({
        case_id: caseId,
        artifact_type: artifactType,
        artifact_name: file.name,
        file_url: fileUrl,
        file_size_bytes: file.size,
        mime_type: file.type,
        uploaded_by: doctor?.id,
        upload_notes: uploadNotes,
      })
      .select()
      .single()

    if (error) throw error

    // Log audit
    await supabase.from("case_audit_log").insert({
      case_id: caseId,
      action: "artifact_added",
      actor_id: doctor?.id,
      actor_role: "doctor",
      details: { artifact_type: artifactType, file_name: file.name },
    })

    return NextResponse.json(artifact)
  } catch (error) {
    console.error("[v0] Error uploading artifact:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload artifact" },
      { status: 500 },
    )
  }
}
