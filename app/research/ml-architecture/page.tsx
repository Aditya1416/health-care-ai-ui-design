"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Brain, ImageIcon, Network, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function MLArchitecturePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">CNN Architecture for Medical Imaging</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Educational visualization of deep learning pipeline for X-ray analysis
              </p>
            </div>
            <Link href="/research/reference-images" className="text-sm text-primary hover:underline">
              ← Back to References
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
              <p className="font-semibold">Educational & Research Purpose Only</p>
              <p className="text-muted-foreground mt-1">
                This is a demonstration of ML architecture for research. This system does NOT provide medical diagnosis.
                Always consult qualified healthcare professionals for medical decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8">
          {/* CNN Pipeline */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Convolutional Neural Network Pipeline</h2>
            <p className="text-muted-foreground">
              Medical imaging analysis uses deep learning to detect patterns in X-ray images. Here's how the CNN
              processes images:
            </p>
          </div>

          {/* Stage 1: Input */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <CardTitle>Stage 1: Input & Preprocessing</CardTitle>
              </div>
              <CardDescription>Image normalization and augmentation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Input Processing:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Raw X-ray image (512×512 pixels)</li>
                      <li>• Pixel value normalization (0-1 range)</li>
                      <li>• Contrast enhancement</li>
                      <li>• Histogram equalization</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-xs font-mono text-foreground">Input Shape: (1, 512, 512, 1)</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">Normalized to [0, 1] range</p>
                    <p className="text-xs font-mono text-muted-foreground">Mean ≈ 0.5, Std ≈ 0.2</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage 2: Feature Extraction */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-accent/10">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-accent" />
                <CardTitle>Stage 2: Convolutional Feature Extraction</CardTitle>
              </div>
              <CardDescription>Multi-layer convolutional blocks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Block 1 */}
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Conv Block 1: Low-Level Features</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• 32 filters, 3×3 kernel → Edges, corners</p>
                    <p>• ReLU activation: f(x) = max(0, x)</p>
                    <p>• Max pooling (2×2) → Dimensionality reduction</p>
                    <p>• Output shape: (256, 256, 32)</p>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Conv Block 2: Mid-Level Features</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• 64 filters, 3×3 kernel → Textures, patterns</p>
                    <p>• Batch normalization for stability</p>
                    <p>• Max pooling (2×2)</p>
                    <p>• Output shape: (128, 128, 64)</p>
                  </div>
                </div>

                {/* Block 3 */}
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Conv Block 3: High-Level Features</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• 128 filters, 3×3 kernel → Anatomical structures</p>
                    <p>• Dropout (0.3) for regularization</p>
                    <p>• Max pooling (2×2)</p>
                    <p>• Output shape: (64, 64, 128)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage 3: Global Average Pooling */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-chart-1/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-1" />
                <CardTitle>Stage 3: Global Average Pooling</CardTitle>
              </div>
              <CardDescription>Feature map aggregation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Reduces spatial dimensions to a single feature vector:</p>
                <div className="bg-muted p-3 rounded-lg space-y-1">
                  <p className="text-xs font-mono text-foreground">Input: (64, 64, 128)</p>
                  <p className="text-xs font-mono text-muted-foreground">↓ Average pooling across spatial dims</p>
                  <p className="text-xs font-mono text-foreground">Output: (1, 1, 128) → Flatten to (128,)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage 4: Classification Head */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-chart-2/10">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-chart-2" />
                <CardTitle>Stage 4: Dense Classification Layers</CardTitle>
              </div>
              <CardDescription>Disease prediction</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Hidden Layer 1</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• 256 neurons</p>
                    <p>• ReLU activation</p>
                    <p>• Dropout (0.5) prevents overfitting</p>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Output Layer</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• 5 neurons (one per disease class)</p>
                    <p>• Softmax activation: σ(x) = e^x / Σe^x</p>
                    <p>• Output: Probability distribution</p>
                  </div>
                </div>

                <div className="bg-chart-3/10 border border-chart-3 rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Example Output:</p>
                  <div className="text-sm space-y-1 font-mono">
                    <p className="text-muted-foreground">Cardiomegaly: 85.3%</p>
                    <p className="text-muted-foreground">Pneumonia: 8.2%</p>
                    <p className="text-muted-foreground">Effusion: 4.1%</p>
                    <p className="text-muted-foreground">Nodule: 1.8%</p>
                    <p className="text-muted-foreground">No Finding: 0.6%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold">Accuracy</p>
                  <p className="text-2xl font-bold text-primary">94.2%</p>
                  <p className="text-xs text-muted-foreground mt-1">On validation set</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold">Sensitivity (Recall)</p>
                  <p className="text-2xl font-bold text-chart-2">91.8%</p>
                  <p className="text-xs text-muted-foreground mt-1">True positive rate</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold">Specificity</p>
                  <p className="text-2xl font-bold text-chart-3">96.1%</p>
                  <p className="text-xs text-muted-foreground mt-1">True negative rate</p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground font-semibold">AUC-ROC</p>
                  <p className="text-2xl font-bold text-chart-4">0.978</p>
                  <p className="text-xs text-muted-foreground mt-1">Area under curve</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Explainability */}
          <Card>
            <CardHeader>
              <CardTitle>Explainability & Feature Attribution</CardTitle>
              <CardDescription>Understanding why the model makes predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Grad-CAM (Gradient-weighted Class Activation Mapping)</h4>
                <p className="text-sm text-muted-foreground">
                  Visualizes which regions of the X-ray image most influenced the model's prediction by computing
                  gradients of the output class score with respect to feature maps.
                </p>
                <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                  <p className="text-foreground">Key regions highlighted:</p>
                  <p className="text-muted-foreground">• Heart silhouette (for cardiomegaly detection)</p>
                  <p className="text-muted-foreground">• Lung fields (for pneumonia/effusion)</p>
                  <p className="text-muted-foreground">• Mediastinum (for nodule detection)</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Feature Importance Scores</h4>
                <p className="text-sm text-muted-foreground">
                  SHAP values quantify the contribution of each feature to the model's prediction, showing which input
                  characteristics are most influential.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Training Details */}
          <Card>
            <CardHeader>
              <CardTitle>Training & Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-foreground mb-2">Optimizer</p>
                  <p className="text-muted-foreground">Adam (lr=0.001, β₁=0.9, β₂=0.999)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Loss Function</p>
                  <p className="text-muted-foreground">Categorical Cross-Entropy</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Batch Size</p>
                  <p className="text-muted-foreground">32</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Epochs</p>
                  <p className="text-muted-foreground">100 (with early stopping)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Data Augmentation</p>
                  <p className="text-muted-foreground">Rotation, zoom, shift, flip</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">Regularization</p>
                  <p className="text-muted-foreground">L2 (weight decay=0.0001)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Disclaimer */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">Important: This is an Educational Framework Only</p>
                  <p className="text-muted-foreground mt-2">
                    This architecture and metrics are for research and educational purposes. The system demonstrates how
                    CNN models work but does NOT provide clinical diagnosis. Always consult qualified radiologists and
                    healthcare professionals for medical decision-making.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
