import cv2
import numpy as np
from PIL import Image
import torch
from torchvision import transforms
from typing import Tuple

class MedicalImagePreprocessor:
    """Preprocess medical images for CNN analysis"""
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        self.target_size = target_size
        self.transform = transforms.Compose([
            transforms.Resize(target_size),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """Load and preprocess medical image"""
        img = Image.open(image_path).convert('RGB')
        tensor = self.transform(img)
        return tensor.unsqueeze(0)  # Add batch dimension
    
    def preprocess_from_bytes(self, image_bytes: bytes) -> torch.Tensor:
        """Preprocess image from bytes"""
        import io
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        tensor = self.transform(img)
        return tensor.unsqueeze(0)
    
    def enhance_contrast(self, image_array: np.ndarray) -> np.ndarray:
        """Enhance image contrast for better analysis"""
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(image_array)
    
    def normalize_intensity(self, image_array: np.ndarray) -> np.ndarray:
        """Normalize image intensity"""
        min_val = np.min(image_array)
        max_val = np.max(image_array)
        normalized = (image_array - min_val) / (max_val - min_val + 1e-5)
        return (normalized * 255).astype(np.uint8)
