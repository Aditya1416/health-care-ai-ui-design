"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CasesPage() {
  const supabase = createBrowserClient()
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from("clinical_cases")
        .select("*, patients(id), doctors(id)")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCases(data || [])
    } catch (error) {
      console.error("Error fetching cases:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">Loading cases...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clinical Cases</h1>
        <Link href="/admin/cases/new">
          <Button>Create New Case</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {cases.length === 0 ? (
          <p className="text-muted-foreground">No cases found</p>
        ) : (
          cases.map((caseItem) => (
            <Link key={caseItem.id} href={`/admin/cases/${caseItem.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{caseItem.case_title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{caseItem.case_number}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        caseItem.status === "open"
                          ? "bg-blue-100 text-blue-800"
                          : caseItem.status === "in-review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{caseItem.case_description}</p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
