"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Database, Brain } from "lucide-react"
import Link from "next/link"

export default function ResearchPage() {
  const resources = [
    {
      title: "Reference Images",
      description: "Browse X-ray images organized by disease category from our research database",
      icon: Database,
      href: "/research/reference-images",
      count: "5+ diseases",
    },
    {
      title: "ML Architecture",
      description: "Learn how CNNs process medical images and detect disease patterns",
      icon: Brain,
      href: "/research/ml-architecture",
      count: "Educational",
    },
    {
      title: "Research Documentation",
      description: "Detailed methodology and training data information",
      icon: BookOpen,
      href: "#",
      count: "Coming soon",
      disabled: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-foreground">Medical Research Center</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Educational resources and AI research tools for medical imaging analysis. For research and learning purposes
            only.
          </p>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((resource) => {
            const Icon = resource.icon
            const Component = resource.disabled ? "div" : Link

            return (
              <Component
                key={resource.title}
                href={resource.disabled ? "#" : resource.href}
                className={resource.disabled ? "" : "group"}
              >
                <Card
                  className={
                    resource.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "group-hover:border-primary/50 transition-colors"
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-8 w-8 text-primary" />
                      {resource.disabled && (
                        <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
                      )}
                    </div>
                    <CardTitle className="mt-4">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs font-medium text-muted-foreground">{resource.count}</p>
                  </CardContent>
                </Card>
              </Component>
            )
          })}
        </div>
      </div>
    </div>
  )
}
