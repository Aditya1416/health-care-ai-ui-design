"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface ReferenceImage {
  id: string
  disease_name: string
  image_name: string
  image_url: string
  notes?: string
  created_at: string
}

interface DiseaseCategory {
  disease: string
  images: ReferenceImage[]
  count: number
}

export default function ReferenceImagesPage() {
  const [categories, setCategories] = useState<DiseaseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchReferenceImages = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from("medical_reference_images")
          .select("*")
          .order("disease_name", { ascending: true })

        if (fetchError) throw fetchError

        // Group by disease
        const grouped = (data as ReferenceImage[]).reduce((acc, image) => {
          const existing = acc.find((cat) => cat.disease === image.disease_name)
          if (existing) {
            existing.images.push(image)
            existing.count++
          } else {
            acc.push({
              disease: image.disease_name,
              images: [image],
              count: 1,
            })
          }
          return acc
        }, [] as DiseaseCategory[])

        setCategories(grouped)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch reference images"
        setError(errorMessage)
        console.error("Error fetching reference images:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReferenceImages()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading reference images...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Medical Reference Images</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Educational X-ray reference database for research visualization
              </p>
            </div>
            <Link href="/research/ml-architecture" className="text-sm text-primary hover:underline">
              View ML Architecture →
            </Link>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="border-b border-border bg-destructive/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-semibold">Research & Educational Use Only</p>
              <p className="text-muted-foreground mt-1">
                These reference images are for research and educational purposes only. This system does NOT provide
                medical diagnosis. Always consult qualified healthcare professionals for medical decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {categories.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No reference images available</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={categories[0]?.disease} className="w-full">
            <TabsList
              className="grid w-full"
              style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 5)}, minmax(0, 1fr))` }}
            >
              {categories.map((category) => (
                <TabsTrigger key={category.disease} value={category.disease} className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">{category.disease}</span>
                  <span className="sm:hidden">{category.disease.substring(0, 3)}</span>
                  <span className="ml-1 text-xs text-muted-foreground">({category.count})</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.disease} value={category.disease} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{category.disease}</CardTitle>
                    <CardDescription>
                      {category.count} reference image{category.count !== 1 ? "s" : ""} available for research
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.images.map((image) => (
                        <div
                          key={image.id}
                          className="group relative overflow-hidden rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                        >
                          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={image.image_url || "/placeholder.svg"}
                              alt={image.image_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement
                                img.src = "/x-ray-image.png"
                              }}
                            />
                          </div>
                          <div className="p-3 border-t border-border">
                            <p className="text-sm font-medium text-foreground truncate">{image.image_name}</p>
                            {image.notes && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{image.notes}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              Added: {new Date(image.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}
