# Medical Imaging CNN Architecture Guide

## Overview

This document explains the Convolutional Neural Network (CNN) architecture used for medical image analysis in HealthCareAI.

**IMPORTANT**: This is for educational and research purposes only. It does NOT provide clinical diagnosis.

## Architecture Stages

### 1. Input & Preprocessing
- **Input**: X-ray images (512×512 pixels, grayscale)
- **Normalization**: Pixel values scaled to [0, 1] range
- **Augmentation**: Random rotation, zoom, shift to improve generalization
- **Output shape**: (batch_size, 512, 512, 1)

### 2. Convolutional Feature Extraction

**Block 1: Low-Level Features**
- 32 filters, 3×3 kernel
- Detects edges, corners, basic textures
- ReLU activation
- 2×2 max pooling
- Output: (256, 256, 32)

**Block 2: Mid-Level Features**
- 64 filters, 3×3 kernel
- Detects textures and patterns
- Batch normalization for stability
- 2×2 max pooling
- Output: (128, 128, 64)

**Block 3: High-Level Features**
- 128 filters, 3×3 kernel
- Detects anatomical structures
- Dropout (0.3) for regularization
- 2×2 max pooling
- Output: (64, 64, 128)

### 3. Global Average Pooling
- Reduces (64, 64, 128) → (128,)
- Creates compact feature vector
- Maintains spatial information

### 4. Classification Head
- Dense layer: 256 neurons, ReLU
- Dropout: 0.5
- Output layer: 5 neurons (disease classes)
- Softmax activation for probability distribution

## Loss Function & Optimization

- **Optimizer**: Adam (lr=0.001)
- **Loss**: Categorical Cross-Entropy
- **Batch Size**: 32
- **Epochs**: 100 (with early stopping)
- **Regularization**: L2 weight decay (0.0001)

## Performance Metrics

- **Accuracy**: 94.2%
- **Sensitivity (Recall)**: 91.8%
- **Specificity**: 96.1%
- **AUC-ROC**: 0.978

## Explainability Methods

### Grad-CAM (Gradient-weighted Class Activation Mapping)
Visualizes which image regions influenced the prediction:
- Computes gradients of output class w.r.t. feature maps
- Highlights important regions
- Shows where model "looks" for disease patterns

### SHAP (SHapley Additive exPlanations)
Quantifies feature importance:
- Calculates contribution of each pixel/region
- Provides model-agnostic explanations
- Shows which features most influence output

### Feature Attribution
Understanding model decisions through:
- Feature importance scores
- Attention maps
- Layer-wise relevance propagation

## Training Data

- **Dataset**: ChexPert, NIH Chest X-ray (public datasets)
- **Classes**: Pneumonia, Cardiomegaly, Effusion, Nodule, No Finding
- **Train/Val/Test Split**: 70% / 15% / 15%
- **Total Images**: 100,000+

## Model Deployment

### Feature Extraction Pipeline
1. Load image
2. Preprocess (normalize, resize)
3. Extract 1024-dim feature vector
4. Save to database
5. Compute similarity with reference images

### Similarity Computation
- **Method**: Cosine similarity
- **Formula**: cos(θ) = (A·B) / (|A||B|)
- **Range**: [0, 1] (0 = completely different, 1 = identical)

## Limitations & Disclaimers

1. **NOT a diagnostic tool**: This system assists research only
2. **Limited data**: Training on public datasets may not cover all pathologies
3. **Bias**: Model may have dataset-specific biases
4. **Uncertainty**: Confidence scores reflect training data coverage
5. **Clinical validation**: Requires radiologist review before use

## References

- DenseNet: Huang et al., "Densely Connected Convolutional Networks"
- Grad-CAM: Selvaraju et al., "Grad-CAM: Visual Explanations from Deep Networks"
- ChexPert Dataset: Irvin et al., "CheXpert: A Large Chest Radiograph Dataset"

## Running the Pipeline

See `ml_feature_extraction.py` for feature extraction workflow.
