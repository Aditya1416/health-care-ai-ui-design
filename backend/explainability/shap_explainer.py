import shap
import numpy as np
from typing import Dict, List
import json

class SHAPExplainer:
    """Explain predictions using SHAP (SHapley Additive exPlanations)"""
    
    def __init__(self, model, X_background: np.ndarray, feature_names: List[str] = None):
        self.model = model
        self.X_background = X_background[:100]  # Use subset for efficiency
        self.feature_names = feature_names or [f"feature_{i}" for i in range(X_background.shape[1])]
        
        # Create KernelExplainer
        self.explainer = shap.KernelExplainer(
            model.predict,
            shap.sample(self.X_background, 50)
        )
    
    def explain_prediction(self, X: np.ndarray) -> Dict:
        """Generate SHAP explanation for prediction"""
        # Get SHAP values
        shap_values = self.explainer.shap_values(X)
        
        # Prepare explanation
        explanation = {
            "features": [],
            "values": [],
            "base_value": float(self.explainer.expected_value),
            "prediction_value": float(np.mean(shap_values))
        }
        
        # Add top contributing features
        feature_importance = np.abs(shap_values[0]).argsort()[::-1][:10]
        
        for idx in feature_importance:
            explanation["features"].append(self.feature_names[idx])
            explanation["values"].append(float(shap_values[0][idx]))
        
        return explanation

class GradCAMExplainer:
    """Generate Grad-CAM visualizations for CNN predictions"""
    
    def __init__(self, model, target_layer_name: str):
        self.model = model
        self.target_layer_name = target_layer_name
        self.gradients = None
        self.activations = None
        
        # Register hooks
        self._register_hooks()
    
    def _register_hooks(self):
        """Register hooks to capture gradients and activations"""
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]
        
        def forward_hook(module, input, output):
            self.activations = output
        
        # Get target layer
        target_layer = self._get_layer(self.model, self.target_layer_name)
        target_layer.register_forward_hook(forward_hook)
        target_layer.register_backward_hook(backward_hook)
    
    def _get_layer(self, model, layer_name: str):
        """Retrieve layer by name"""
        for name, module in model.named_modules():
            if layer_name in name:
                return module
        raise ValueError(f"Layer {layer_name} not found")
    
    def generate_heatmap(self, image: np.ndarray, class_idx: int = None) -> np.ndarray:
        """Generate Grad-CAM heatmap"""
        import torch
        
        # Forward pass
        image_tensor = torch.tensor(image, dtype=torch.float32).unsqueeze(0)
        output = self.model(image_tensor)
        
        if class_idx is None:
            class_idx = torch.argmax(output).item()
        
        # Backward pass
        self.model.zero_grad()
        class_output = output[0, class_idx]
        class_output.backward()
        
        # Compute heatmap
        gradients = self.gradients[0]
        activations = self.activations[0]
        
        weights = torch.mean(gradients, dim=[1, 2])
        heatmap = torch.sum(weights.unsqueeze(-1).unsqueeze(-1) * activations, dim=0)
        heatmap = torch.relu(heatmap)
        heatmap = heatmap / (torch.max(heatmap) + 1e-10)
        
        return heatmap.cpu().numpy()
