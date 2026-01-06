"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DocumentsPage() {
  const supabase = createBrowserClient()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await supabase
          .from("case_artifacts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100)

        setDocuments(data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  if (loading) return <div className="p-6">Loading documents...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents & Reports</h1>
        <p className="text-muted-foreground mt-1">View all uploaded PDFs and medical reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Size</th>
                  <th className="text-left py-3 px-4 font-semibold">Uploaded</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-secondary/50">
                    <td className="py-3 px-4 font-semibold">{doc.artifact_name}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {doc.artifact_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{(doc.file_size_bytes / 1024).toFixed(1)} KB</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
