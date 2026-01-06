"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ImagingPage() {
  const supabase = createBrowserClient()
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<any>(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data } = await supabase
          .from("medical_imaging")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)

        setImages(data || [])
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) return <div className="p-6">Loading imaging data...</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medical Imaging</h1>
        <p className="text-muted-foreground mt-1">View uploaded medical scans and AI analysis results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scans ({images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      selectedImage?.id === img.id ? "bg-primary/20 border-primary" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-semibold text-sm">{img.image_type || "Scan"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(img.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedImage && (
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Viewer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Preview Placeholder */}
                <div className="w-full h-96 bg-secondary rounded flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">Medical Image Preview</p>
                    <p className="text-xs text-muted-foreground">{selectedImage.image_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-muted-foreground">Type</p>
                    <p>{selectedImage.image_type}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Uploaded</p>
                    <p>{new Date(selectedImage.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Confidence</p>
                    <p>{(selectedImage.confidence_score * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Status</p>
                    <p>Analyzed</p>
                  </div>
                </div>

                {selectedImage.analysis_result && (
                  <div className="pt-4 border-t">
                    <p className="font-semibold mb-3">AI Analysis Results</p>
                    <div className="space-y-2 text-sm">
                      {selectedImage.analysis_result.disease_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disease:</span>
                          <span className="font-semibold">{selectedImage.analysis_result.disease_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-semibold">{(selectedImage.confidence_score * 100).toFixed(1)}%</span>
                      </div>
                      {selectedImage.analysis_result.severity && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Severity:</span>
                          <span className="font-semibold">{selectedImage.analysis_result.severity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button className="w-full mt-4">Download Image</Button>
              </CardContent>
            </Card>

            {selectedImage.analysis_result?.abnormalities_detected && (
              <Card>
                <CardHeader>
                  <CardTitle>Detected Abnormalities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {selectedImage.analysis_result.abnormalities_detected.map((abn: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive"></span>
                        {abn}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
