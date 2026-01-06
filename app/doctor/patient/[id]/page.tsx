import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import PatientDetailView from "@/components/doctor/patient-detail-view"

interface PatientPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PatientPage({ params }: PatientPageProps) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { id } = await params

  return <PatientDetailView doctorId={user.id} patientId={id} />
}
