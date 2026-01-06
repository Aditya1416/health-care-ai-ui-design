import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const caseId = formData.get("caseId") as string

    if (!file || !caseId) {
      return NextResponse.json({ error: "Missing file or caseId" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    const { data: artifact, error } = await supabase
      .from("case_artifacts")
      .insert([
        {
          case_id: caseId,
          artifact_name: file.name,
          artifact_type: file.type.includes("pdf") ? "pdf" : "image",
          mime_type: file.type,
          file_url: `data:${file.type};base64,${base64}`,
          file_size_bytes: file.size,
          uploaded_by: user.id,
          upload_notes: "Uploaded via dashboard",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, artifact })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
