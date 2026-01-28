"use client"

/**
 * Comprehensive Chest X-Ray Analysis Panel
 * Integrates DenseNet-121 predictions with GradCAM visualization
 * Displays all 14 pathologies with clinical recommendations
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  AlertTriangle,
  Brain,
  ChevronRight,
  Clock,
  FileText,
  Heart,
  Info,
  Lightbulb,
  Loader2,
  Microscope,
  Stethoscope,
  Target,
  TrendingUp,
  Users,
  Zap
} from "lucide-react"
import { GradCAMHeatmap } from "./gradcam-heatmap"
import { 
  analyzeChestXRay, 
  CHEST_PATHOLOGIES,
  type ChestXRayAnalysisResult,
  type DenseNetPrediction,
  type AttentionRegion
} from "@/lib/services/densenet-chest-xray"

interface ChestXRayAnalysisPanelProps {
  imageUrl: string
  patientAge?: number
  patientGender?: string
  clinicalHistory?: string[]
  onAnalysisComplete?: (result: ChestXRayAnalysisResult) => void
}

export function ChestXRayAnalysisPanel({
  imageUrl,
  patientAge,
  patientGender,
  clinicalHistory,
  onAnalysisComplete
}: ChestXRayAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ChestXRayAnalysisResult | null>(null)
  const [selectedPathology, setSelectedPathology] = useState<DenseNetPrediction | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Run analysis on mount or when image changes
  useEffect(() => {
    if (imageUrl) {
      runAnalysis()
    }
  }, [imageUrl])
  
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeChestXRay(
        imageUrl,
        patientAge,
        patientGender,
        clinicalHistory
      )
      setAnalysisResult(result)
      onAnalysisComplete?.(result)
      
      // Auto-select primary diagnosis
      if (result.primary_diagnosis) {
        setSelectedPathology(result.primary_diagnosis)
      }
    } catch (error) {
      console.error("[v0] Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  const handleRegionClick = (region: AttentionRegion) => {
    // Find the pathology associated with this region
    const pathology = analysisResult?.predictions.find(
      p => p.pathology_name === region.associated_pathology
    )
    if (pathology) {
      setSelectedPathology(pathology)
      setActiveTab("pathology")
    }
  }
  
  if (isAnalyzing) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <div className="text-lg font-medium text-foreground">Analyzing Chest X-Ray</div>
          <div className="text-sm text-muted-foreground mt-2">
            Running DenseNet-121 inference for 14 pathologies...
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <Brain className="w-4 h-4" />
            Generating GradCAM activation maps
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!analysisResult) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Microscope className="w-12 h-12 text-muted-foreground mb-4" />
          <div className="text-lg font-medium text-foreground">No Analysis Available</div>
          <div className="text-sm text-muted-foreground mt-2">
            Upload a chest X-ray image to begin AI-powered analysis
          </div>
          <Button onClick={runAnalysis} className="mt-4">
            <Zap className="w-4 h-4 mr-2" />
            Start Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  const { 
    predictions, 
    primary_diagnosis, 
    secondary_findings, 
    gradcam,
    model_info,
    analysis_metadata,
    clinical_recommendations,
    differential_diagnoses,
    follow_up_recommendations
  } = analysisResult
  
  return (
    <div className="space-y-6">
      {/* Header with Model Info */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                DenseNet-121 Chest X-Ray Analysis
              </CardTitle>
              <CardDescription className="mt-1">
                AI-powered detection of 14 chest pathologies with GradCAM interpretability
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {model_info.version}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {analysis_metadata.processing_time_ms}ms
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - GradCAM Visualization */}
        <div className="space-y-4">
          <GradCAMHeatmap
            imageUrl={imageUrl}
            gradcamData={gradcam}
            pathologyName={primary_diagnosis?.pathology_name}
            confidence={primary_diagnosis?.probability}
            onRegionClick={handleRegionClick}
          />
          
          {/* Image Quality Assessment */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Technical Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Image Quality</span>
                <div className="flex items-center gap-2">
                  <Progress value={analysis_metadata.image_quality_score * 100} className="w-24 h-2" />
                  <span className="text-sm font-medium">
                    {(analysis_metadata.image_quality_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Positioning</span>
                <Badge 
                  variant={analysis_metadata.positioning_quality === 'good' ? 'default' : 'secondary'}
                  className={
                    analysis_metadata.positioning_quality === 'good' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-yellow-500/10 text-yellow-500'
                  }
                >
                  {analysis_metadata.positioning_quality}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis_metadata.technical_factors.map((factor, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Results Tabs */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pathology">Pathology</TabsTrigger>
              <TabsTrigger value="all">All 14</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Primary Diagnosis */}
              {primary_diagnosis && (
                <Card className={`border-2 ${
                  primary_diagnosis.severity === 'critical' ? 'border-red-500 bg-red-500/5' :
                  primary_diagnosis.severity === 'high' ? 'border-orange-500 bg-orange-500/5' :
                  primary_diagnosis.severity === 'moderate' ? 'border-yellow-500 bg-yellow-500/5' :
                  'border-green-500 bg-green-500/5'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${
                          primary_diagnosis.severity === 'critical' ? 'text-red-500' :
                          primary_diagnosis.severity === 'high' ? 'text-orange-500' :
                          primary_diagnosis.severity === 'moderate' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        Primary Finding
                      </CardTitle>
                      <Badge className={
                        primary_diagnosis.severity === 'critical' ? 'bg-red-500' :
                        primary_diagnosis.severity === 'high' ? 'bg-orange-500' :
                        primary_diagnosis.severity === 'moderate' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }>
                        {primary_diagnosis.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-foreground">
                        {primary_diagnosis.pathology_name}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {(primary_diagnosis.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {primary_diagnosis.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        ICD-10: {primary_diagnosis.icd10_code}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        AUC: {primary_diagnosis.model_auc.toFixed(3)}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => {
                        setSelectedPathology(primary_diagnosis)
                        setActiveTab("pathology")
                      }}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Secondary Findings */}
              {secondary_findings.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-primary" />
                      Secondary Findings ({secondary_findings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {secondary_findings.map((finding, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full p-2 rounded border border-border hover:bg-muted/50 transition-colors text-left"
                          onClick={() => {
                            setSelectedPathology(finding)
                            setActiveTab("pathology")
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-foreground">
                              {finding.pathology_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={finding.probability * 100} 
                                className="w-16 h-2" 
                              />
                              <span className="text-sm text-muted-foreground w-12 text-right">
                                {(finding.probability * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {gradcam.peak_activation.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Peak Activation</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {(gradcam.activation_coverage * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Coverage</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Pathology Detail Tab */}
            <TabsContent value="pathology" className="space-y-4">
              {selectedPathology ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {selectedPathology.pathology_name}
                      </CardTitle>
                      <Badge 
                        className={
                          selectedPathology.severity === 'critical' ? 'bg-red-500' :
                          selectedPathology.severity === 'high' ? 'bg-orange-500' :
                          selectedPathology.severity === 'moderate' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }
                      >
                        {(selectedPathology.probability * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <CardDescription>{selectedPathology.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Confidence Interval */}
                    <div>
                      <div className="text-sm font-medium text-foreground mb-2">
                        Confidence Interval
                      </div>
                      <div className="relative h-3 bg-muted rounded-full">
                        <div 
                          className="absolute h-full bg-primary/30 rounded-full"
                          style={{
                            left: `${selectedPathology.confidence_interval[0] * 100}%`,
                            width: `${(selectedPathology.confidence_interval[1] - selectedPathology.confidence_interval[0]) * 100}%`
                          }}
                        />
                        <div 
                          className="absolute w-2 h-full bg-primary rounded-full"
                          style={{ left: `${selectedPathology.probability * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{(selectedPathology.confidence_interval[0] * 100).toFixed(0)}%</span>
                        <span>{(selectedPathology.confidence_interval[1] * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Common Causes */}
                    <div>
                      <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Common Causes
                      </div>
                      <ul className="space-y-1">
                        {selectedPathology.common_causes.map((cause, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    {/* Symptoms */}
                    <div>
                      <div className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        Associated Symptoms
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPathology.symptoms.map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Model Performance */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">ICD-10 Code</div>
                        <div className="text-sm font-medium text-foreground">
                          {selectedPathology.icd10_code}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Model AUC</div>
                        <div className="text-sm font-medium text-foreground">
                          {selectedPathology.model_auc.toFixed(3)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Typical Location</div>
                        <div className="text-sm font-medium text-foreground capitalize">
                          {selectedPathology.typical_location.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Severity</div>
                        <div className="text-sm font-medium text-foreground capitalize">
                          {selectedPathology.severity}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Microscope className="w-8 h-8 text-muted-foreground mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Select a pathology to view details
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* All 14 Pathologies Tab */}
            <TabsContent value="all">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    All 14 Pathology Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {predictions.map((pred, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            selectedPathology?.pathology_id === pred.pathology_id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            setSelectedPathology(pred)
                            setActiveTab("pathology")
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-foreground">
                              {pred.pathology_name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                pred.probability > 0.7 ? 'border-red-500 text-red-500' :
                                pred.probability > 0.5 ? 'border-orange-500 text-orange-500' :
                                pred.probability > 0.3 ? 'border-yellow-500 text-yellow-500' :
                                'border-muted text-muted-foreground'
                              }`}
                            >
                              {(pred.probability * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={pred.probability * 100} 
                            className="h-1.5"
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              AUC: {pred.model_auc.toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {pred.icd10_code}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Clinical Tab */}
            <TabsContent value="clinical" className="space-y-4">
              {/* Recommendations */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Clinical Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {clinical_recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Differential Diagnoses */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Differential Diagnoses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {differential_diagnoses.map((dx, idx) => (
                      <Badge 
                        key={idx} 
                        variant={idx === 0 ? "default" : "outline"}
                        className={idx === 0 ? "bg-primary" : ""}
                      >
                        {dx}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Follow-up */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Follow-up Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {follow_up_recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex gap-2">
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Model Info */}
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Model Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Architecture: {model_info.architecture.split(' ')[0]}</div>
                    <div>Input: {model_info.input_size.join('x')}px</div>
                    <div>Pathologies: {model_info.total_pathologies}</div>
                    <div>Dataset: ChestX-ray8</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    This AI analysis is for clinical decision support only. All findings should be 
                    verified by a qualified radiologist before clinical action.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default ChestXRayAnalysisPanel
