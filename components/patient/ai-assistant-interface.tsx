"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, Send, TrendingUp, Zap, Brain } from "lucide-react"
import SymptomTracker from "./symptom-tracker"
import PredictionViewer from "./prediction-viewer"
import EnvironmentalInsights from "./environmental-insights"
import HealthTimeline from "./health-timeline"

interface AIAssistantInterfaceProps {
  userId: string
}

export default function AIAssistantInterface({ userId }: AIAssistantInterfaceProps) {
  const [selectedTab, setSelectedTab] = useState("symptoms")
  const [predictionData, setPredictionData] = useState<any>(null)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Important Notice */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Health Intelligence Assistant</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered preliminary health analysis and consultation preparation
            </p>
          </div>

          {/* Important Notice Banner */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
            <CardContent className="pt-6 flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                <p className="font-semibold">This is an Assistant, Not a Doctor</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Predictions are preliminary analysis only - not medical diagnosis</li>
                  <li>Always consult a licensed healthcare provider for medical decisions</li>
                  <li>In emergencies, seek immediate medical attention</li>
                  <li>Use this tool to prepare for your doctor visit, not replace it</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition" onClick={() => setSelectedTab("symptoms")}>
            <CardHeader className="pb-3">
              <Brain className="w-6 h-6 text-primary mb-2" />
              <CardTitle className="text-lg">Log Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Track your symptoms and let AI analyze patterns</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-accent transition"
            onClick={() => setSelectedTab("environmental")}
          >
            <CardHeader className="pb-3">
              <TrendingUp className="w-6 h-6 text-accent mb-2" />
              <CardTitle className="text-lg">Environmental Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">See how weather and air quality affect your health</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-secondary transition">
            <CardHeader className="pb-3">
              <Zap className="w-6 h-6 text-secondary mb-2" />
              <CardTitle className="text-lg">Get Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View AI predictions and health recommendations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="environmental">Environment</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms" className="space-y-4">
            <SymptomTracker userId={userId} onPredictionGenerated={setPredictionData} />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <PredictionViewer userId={userId} predictionData={predictionData} />
          </TabsContent>

          <TabsContent value="environmental" className="space-y-4">
            <EnvironmentalInsights userId={userId} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <HealthTimeline userId={userId} />
          </TabsContent>
        </Tabs>

        {/* Doctor Consultation Helper */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Share with Your Doctor
            </CardTitle>
            <CardDescription>Export your analysis to help with medical consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You can export your symptom logs, environmental data, and AI analysis to share with your healthcare
                provider. This helps them understand your complete health context.
              </p>
              <div className="flex gap-2">
                <Button>Export as PDF</Button>
                <Button variant="outline">Email to Doctor</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
