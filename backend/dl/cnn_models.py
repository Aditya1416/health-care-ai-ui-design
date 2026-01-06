import torch
import torch.nn as nn
import torchvision.models as models
from typing import Tuple
import numpy as np

class MedicalImageCNN(nn.Module):
    """ResNet-50 based CNN for medical image analysis"""
    
    def __init__(self, num_classes: int = 2, pretrained: bool = True):
        super().__init__()
        self.backbone = models.resnet50(pretrained=pretrained)
        
        # Modify final layer for medical imaging
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Forward pass returning logits and features"""
        x = self.backbone.conv1(x)
        x = self.backbone.bn1(x)
        x = self.backbone.relu(x)
        x = self.backbone.maxpool(x)
        
        x = self.backbone.layer1(x)
        x = self.backbone.layer2(x)
        x = self.backbone.layer3(x)
        x = self.backbone.layer4(x)
        
        features = x  # For Grad-CAM
        
        x = self.backbone.avgpool(x)
        x = torch.flatten(x, 1)
        logits = self.backbone.fc(x)
        
        return logits, features

class AbnormalityDetector:
    """Detect abnormalities in medical scans"""
    
    def __init__(self, model_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MedicalImageCNN(num_classes=2)
        
        if model_path:
            self.model.load_state_dict(torch.load(model_path))
        
        self.model.to(self.device)
        self.model.eval()
    
    def analyze_scan(self, image_tensor: torch.Tensor) -> dict:
        """Analyze medical scan and detect abnormalities"""
        with torch.no_grad():
            image_tensor = image_tensor.to(self.device)
            logits, features = self.model(image_tensor)
            probs = torch.softmax(logits, dim=1)
        
        abnormality_prob = probs[0, 1].item()
        
        # Generate regions of interest
        roi_regions = self._generate_roi(features)
        
        return {
            "abnormality_detected": abnormality_prob > 0.5,
            "confidence": float(abnormality_prob),
            "regions_of_interest": roi_regions,
            "severity": self._classify_severity(abnormality_prob)
        }
    
    def _generate_roi(self, features: torch.Tensor) -> list:
        """Generate regions of interest from features"""
        # Simulate ROI detection
        batch_size, channels, height, width = features.shape
        roi_heatmap = torch.mean(features, dim=1)[0].cpu().numpy()
        
        # Find high-activation regions
        threshold = np.percentile(roi_heatmap, 75)
        roi_mask = roi_heatmap > threshold
        
        # Identify bounding boxes
        regions = []
        if np.any(roi_mask):
            y_coords, x_coords = np.where(roi_mask)
            regions.append({
                "x_min": int(np.min(x_coords)),
                "y_min": int(np.min(y_coords)),
                "x_max": int(np.max(x_coords)),
                "y_max": int(np.max(y_coords)),
                "confidence": float(np.mean(roi_heatmap[roi_mask]))
            })
        
        return regions
    
    def _classify_severity(self, probability: float) -> str:
        """Classify abnormality severity"""
        if probability > 0.8:
            return "Critical"
        elif probability > 0.6:
            return "High"
        elif probability > 0.4:
            return "Moderate"
        else:
            return "Low"
