"use client"

import React from "react"

/**
 * GradCAM Heatmap Visualization Component
 * Implements Gradient-weighted Class Activation Mapping visualization
 * for chest X-ray analysis interpretability
 */

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Info,
  Maximize2,
  Download
} from "lucide-react"
import type { GradCAMResult, AttentionRegion } from "@/lib/services/densenet-chest-xray"

interface GradCAMHeatmapProps {
  imageUrl: string
  gradcamData: GradCAMResult
  pathologyName?: string
  confidence?: number
  onRegionClick?: (region: AttentionRegion) => void
}

export function GradCAMHeatmap({
  imageUrl,
  gradcamData,
  pathologyName,
  confidence,
  onRegionClick
}: GradCAMHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6)
  const [zoom, setZoom] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<AttentionRegion | null>(null)
  const [showRegionLabels, setShowRegionLabels] = useState(true)
  
  // Draw the heatmap overlay on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageLoaded) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw the original image
      ctx.drawImage(img, 0, 0)
      
      if (showHeatmap && gradcamData.heatmap_data) {
        // Draw heatmap overlay
        drawHeatmapOverlay(ctx, gradcamData.heatmap_data, canvas.width, canvas.height, heatmapOpacity)
        
        // Draw attention region markers if enabled
        if (showRegionLabels) {
          drawRegionMarkers(ctx, gradcamData.attention_regions, canvas.width, canvas.height)
        }
      }
    }
    img.onerror = () => {
      // Use placeholder on error
      img.src = "/xray-chest-tb.jpg"
    }
    img.src = imageUrl || "/xray-chest-tb.jpg"
  }, [imageUrl, gradcamData, showHeatmap, heatmapOpacity, imageLoaded, showRegionLabels])
  
  // Initialize image loading state
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => setImageLoaded(true)
    img.onerror = () => setImageLoaded(true) // Still mark as loaded to use fallback
    img.src = imageUrl || "/xray-chest-tb.jpg"
  }, [imageUrl])
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    // Find clicked region
    const clickedRegion = gradcamData.attention_regions.find(region => {
      return x >= region.x && x <= region.x + region.width &&
             y >= region.y && y <= region.y + region.height
    })
    
    if (clickedRegion) {
      setSelectedRegion(clickedRegion)
      onRegionClick?.(clickedRegion)
    }
  }
  
  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `gradcam-analysis-${pathologyName || 'xray'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            GradCAM Visualization
          </CardTitle>
          {pathologyName && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {pathologyName}: {confidence ? `${(confidence * 100).toFixed(1)}%` : 'N/A'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Panel */}
        <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch
              id="heatmap-toggle"
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
            />
            <Label htmlFor="heatmap-toggle" className="text-sm">
              {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Label>
          </div>
          
          <div className="flex items-center gap-2 flex-1 min-w-[150px] max-w-[200px]">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Opacity</Label>
            <Slider
              value={[heatmapOpacity]}
              onValueChange={([val]) => setHeatmapOpacity(val)}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
              disabled={!showHeatmap}
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {(zoom * 100).toFixed(0)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setZoom(1)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="region-labels"
              checked={showRegionLabels}
              onCheckedChange={setShowRegionLabels}
            />
            <Label htmlFor="region-labels" className="text-xs">Labels</Label>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            className="ml-auto bg-transparent"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
        
        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="relative overflow-auto bg-black rounded-lg"
          style={{ maxHeight: '500px' }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-crosshair mx-auto"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
            }}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse text-muted-foreground">Loading X-ray image...</div>
            </div>
          )}
        </div>
        
        {/* Attention Regions Legend */}
        {gradcamData.attention_regions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Info className="w-4 h-4 text-primary" />
              Attention Regions (Click to inspect)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gradcamData.attention_regions.slice(0, 4).map((region, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(region)
                    onRegionClick?.(region)
                  }}
                  className={`p-2 rounded border text-left transition-colors ${
                    selectedRegion === region 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: getIntensityColor(region.intensity),
                        opacity: 0.8
                      }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {region.description}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {region.associated_pathology} - {(region.intensity * 100).toFixed(0)}% activation
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected Region Details */}
        {selectedRegion && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="font-medium text-foreground">{selectedRegion.description}</div>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">Associated Finding:</span> {selectedRegion.associated_pathology}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Activation Intensity:</span> {(selectedRegion.intensity * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              This region shows significant model attention, indicating features relevant to the diagnosis.
            </div>
          </div>
        )}
        
        {/* Color Scale Legend */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="flex-1 h-3 rounded-full" style={{
            background: 'linear-gradient(to right, rgba(0,0,255,0.7), rgba(0,255,0,0.7), rgba(255,255,0,0.7), rgba(255,0,0,0.7))'
          }} />
          <span>High</span>
          <span className="ml-2">Model Attention</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Draw the heatmap overlay on the canvas
 */
function drawHeatmapOverlay(
  ctx: CanvasRenderingContext2D,
  heatmapData: number[][],
  width: number,
  height: number,
  opacity: number
) {
  const gridRows = heatmapData.length
  const gridCols = heatmapData[0]?.length || 0
  
  if (gridRows === 0 || gridCols === 0) return
  
  const cellWidth = width / gridCols
  const cellHeight = height / gridRows
  
  // Create temporary canvas for smooth heatmap
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return
  
  // Draw heatmap cells with interpolation
  for (let i = 0; i < gridRows; i++) {
    for (let j = 0; j < gridCols; j++) {
      const value = heatmapData[i][j]
      if (value > 0.2) { // Only draw significant activations
        const color = valueToHeatmapColor(value)
        
        // Create radial gradient for smoother appearance
        const centerX = j * cellWidth + cellWidth / 2
        const centerY = i * cellHeight + cellHeight / 2
        const radius = Math.max(cellWidth, cellHeight) * (0.8 + value * 0.4)
        
        const gradient = tempCtx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        )
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, 'transparent')
        
        tempCtx.fillStyle = gradient
        tempCtx.fillRect(
          centerX - radius,
          centerY - radius,
          radius * 2,
          radius * 2
        )
      }
    }
  }
  
  // Apply the heatmap with specified opacity
  ctx.globalAlpha = opacity
  ctx.globalCompositeOperation = 'screen'
  ctx.drawImage(tempCanvas, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}

/**
 * Draw markers for attention regions
 */
function drawRegionMarkers(
  ctx: CanvasRenderingContext2D,
  regions: AttentionRegion[],
  width: number,
  height: number
) {
  regions.forEach((region, idx) => {
    const x = region.x * width
    const y = region.y * height
    const w = region.width * width
    const h = region.height * height
    
    // Draw region outline
    ctx.strokeStyle = getIntensityColor(region.intensity)
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(x, y, w, h)
    ctx.setLineDash([])
    
    // Draw label background
    const label = `${idx + 1}`
    const labelSize = 20
    ctx.fillStyle = getIntensityColor(region.intensity)
    ctx.fillRect(x, y - labelSize - 2, labelSize, labelSize)
    
    // Draw label text
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, x + labelSize / 2, y - labelSize / 2 - 2)
  })
}

/**
 * Convert activation value to heatmap color (jet colormap)
 */
function valueToHeatmapColor(value: number): string {
  // Clamp value between 0 and 1
  const v = Math.max(0, Math.min(1, value))
  
  let r: number, g: number, b: number
  
  if (v < 0.25) {
    // Blue to Cyan
    r = 0
    g = Math.floor(255 * (v / 0.25))
    b = 255
  } else if (v < 0.5) {
    // Cyan to Green
    r = 0
    g = 255
    b = Math.floor(255 * (1 - (v - 0.25) / 0.25))
  } else if (v < 0.75) {
    // Green to Yellow
    r = Math.floor(255 * ((v - 0.5) / 0.25))
    g = 255
    b = 0
  } else {
    // Yellow to Red
    r = 255
    g = Math.floor(255 * (1 - (v - 0.75) / 0.25))
    b = 0
  }
  
  return `rgba(${r}, ${g}, ${b}, 0.8)`
}

/**
 * Get color for intensity indicator
 */
function getIntensityColor(intensity: number): string {
  if (intensity > 0.8) return '#ef4444' // Red
  if (intensity > 0.6) return '#f97316' // Orange
  if (intensity > 0.4) return '#eab308' // Yellow
  return '#22c55e' // Green
}

export default GradCAMHeatmap
