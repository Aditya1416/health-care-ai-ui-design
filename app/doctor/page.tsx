import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import DoctorDashboard from "@/components/doctor/doctor-dashboard"

export default async function DoctorPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <DoctorDashboard userId={user.id} />
}
