"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Trash2, FileText } from "lucide-react"

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newRecord, setNewRecord] = useState({
    record_type: "",
    description: "",
  })
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchRecords()
  }, [supabase])

  const fetchRecords = async () => {
    try {
      const { data } = await supabase.from("medical_records").select("*").order("date_recorded", { ascending: false })
      setRecords(data || [])
    } catch (error) {
      console.error("Error fetching records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecord = async () => {
    if (!newRecord.record_type || !newRecord.description) return

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { error } = await supabase.from("medical_records").insert([
        {
          user_id: userData.user.id,
          record_type: newRecord.record_type,
          description: newRecord.description,
          date_recorded: new Date().toISOString(),
        },
      ])

      if (error) throw error

      setNewRecord({ record_type: "", description: "" })
      setIsOpen(false)
      fetchRecords()
    } catch (error) {
      console.error("Error adding record:", error)
    }
  }

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase.from("medical_records").delete().eq("id", id)
      if (error) throw error
      fetchRecords()
    } catch (error) {
      console.error("Error deleting record:", error)
    }
  }

  const recordTypes = [
    { value: "diagnosis", label: "Diagnosis" },
    { value: "prescription", label: "Prescription" },
    { value: "lab_result", label: "Lab Result" },
    { value: "imaging", label: "Imaging Report" },
    { value: "vaccination", label: "Vaccination" },
    { value: "surgery", label: "Surgery Report" },
    { value: "consultation", label: "Consultation Notes" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
                <p className="text-muted-foreground mt-2">View and manage your medical history</p>
              </div>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={18} />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Add Medical Record</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Record Type</Label>
                      <select
                        id="type"
                        value={newRecord.record_type}
                        onChange={(e) => setNewRecord({ ...newRecord, record_type: e.target.value })}
                        className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      >
                        <option value="">Select record type...</option>
                        {recordTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="desc">Description</Label>
                      <textarea
                        id="desc"
                        value={newRecord.description}
                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                        placeholder="Enter record details..."
                        className="w-full mt-2 px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                        rows={5}
                      />
                    </div>
                    <Button onClick={handleAddRecord} className="w-full">
                      Add Record
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Records Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : records.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((record) => (
                  <Card key={record.id} className="border-border hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground capitalize">
                                {record.record_type.replace(/_/g, " ")}
                              </h3>
                              <Badge variant="secondary">{new Date(record.date_recorded).toLocaleDateString()}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{record.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No medical records yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Start by adding your first medical record</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
