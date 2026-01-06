"""
Medical Imaging CNN Feature Extraction Script
Educational demonstration of using pretrained CNN models for feature extraction

This script demonstrates how to:
1. Load pretrained DenseNet/ResNet models
2. Use them as frozen feature extractors
3. Generate embeddings for medical images
4. Compute similarity scores
5. Save results to CSV

IMPORTANT: This is for research and educational purposes only.
NOT FOR CLINICAL DIAGNOSIS.
"""

import numpy as np
import pandas as pd
from pathlib import Path
import json
from typing import List, Dict, Tuple
import warnings

warnings.filterwarnings("ignore")

# Note: Actual PyTorch/TensorFlow imports would go here
# from torchvision import models, transforms
# import torch
# from PIL import Image

class MedicalCNNFeatureExtractor:
    """
    Educational CNN feature extractor for medical images.
    Uses pretrained models as frozen feature extractors.
    """

    def __init__(self, model_name: str = "densenet121", device: str = "cpu"):
        """
        Initialize the feature extractor.

        Args:
            model_name: Pretrained model (densenet121, resnet50, efficientnet_b0)
            device: 'cpu' or 'cuda'
        """
        self.model_name = model_name
        self.device = device
        self.model = None
        self.feature_extractor = None
        self.transform = None

        # In a real implementation:
        # self._load_model()

    def _load_model(self):
        """Load pretrained model and remove classification head."""
        # Example with DenseNet121:
        # from torchvision.models import densenet121
        # self.model = densenet121(pretrained=True)
        # self.feature_extractor = torch.nn.Sequential(
        #     *list(self.model.children())[:-1]
        # )
        # self.feature_extractor.eval()
        # self.feature_extractor = self.feature_extractor.to(self.device)
        pass

    def extract_features(self, image_path: str) -> np.ndarray:
        """
        Extract feature vector from an image.

        Args:
            image_path: Path to medical image

        Returns:
            Feature embedding vector (1, 1024)
        """
        # Simulated feature extraction
        # In real implementation:
        # 1. Load image using PIL
        # 2. Apply preprocessing: normalization, resizing to (224, 224)
        # 3. Convert to tensor
        # 4. Run through frozen feature extractor
        # 5. Return embedding

        # For demonstration, return simulated feature vector
        np.random.seed(hash(image_path) % 2**32)
        features = np.random.randn(1, 1024).astype(np.float32)
        return features

    def compute_similarity(self, features1: np.ndarray, features2: np.ndarray) -> float:
        """
        Compute cosine similarity between two feature vectors.

        Args:
            features1: Feature vector 1
            features2: Feature vector 2

        Returns:
            Cosine similarity score (0-1)
        """
        from numpy.linalg import norm

        cos_similarity = np.dot(features1.flatten(), features2.flatten()) / (
            norm(features1.flatten()) * norm(features2.flatten())
        )
        return float((cos_similarity + 1) / 2)  # Normalize to 0-1

    def process_dataset(self, image_dir: Path, output_csv: Path) -> pd.DataFrame:
        """
        Process all images in directory and save embeddings.

        Args:
            image_dir: Directory containing images
            output_csv: Output CSV file path

        Returns:
            DataFrame with image_path and embedding vector
        """
        results = []

        image_files = list(image_dir.glob("*.jpg")) + list(image_dir.glob("*.png"))

        for image_path in image_files:
            try:
                features = self.extract_features(str(image_path))

                results.append({
                    "image_path": str(image_path),
                    "image_name": image_path.name,
                    "embedding": features.tolist(),
                    "embedding_dim": 1024,
                    "model": self.model_name,
                })
            except Exception as e:
                print(f"Error processing {image_path}: {e}")

        df = pd.DataFrame(results)
        df.to_csv(output_csv, index=False)
        print(f"Processed {len(df)} images. Saved to {output_csv}")

        return df

    def generate_similarity_matrix(
        self, embeddings_csv: Path, output_matrix: Path
    ) -> np.ndarray:
        """
        Generate similarity matrix from embeddings.

        Args:
            embeddings_csv: CSV file with embeddings
            output_matrix: Output NPZ file for matrix

        Returns:
            Similarity matrix (N, N)
        """
        df = pd.read_csv(embeddings_csv)
        n_images = len(df)
        similarity_matrix = np.zeros((n_images, n_images))

        for i in range(n_images):
            emb1 = np.array(json.loads(df.iloc[i]["embedding"]))
            for j in range(i, n_images):
                emb2 = np.array(json.loads(df.iloc[j]["embedding"]))
                sim = self.compute_similarity(emb1, emb2)
                similarity_matrix[i, j] = sim
                similarity_matrix[j, i] = sim

        np.savez_compressed(output_matrix, similarity_matrix=similarity_matrix)
        print(f"Similarity matrix saved to {output_matrix}")

        return similarity_matrix


def main():
    """Main execution demonstrating feature extraction pipeline."""

    # Configuration
    IMAGE_DIR = Path("./reference_xrays")  # Directory with X-ray images
    OUTPUT_CSV = Path("./xray_embeddings.csv")
    OUTPUT_MATRIX = Path("./similarity_matrix.npz")

    # Initialize extractor
    extractor = MedicalCNNFeatureExtractor(model_name="densenet121")

    print("=== Medical Imaging CNN Feature Extraction ===")
    print(f"Model: {extractor.model_name}")
    print(f"Device: {extractor.device}")

    # Process images (example - would need real images)
    if IMAGE_DIR.exists():
        print(f"\nProcessing images from {IMAGE_DIR}...")
        embeddings_df = extractor.process_dataset(IMAGE_DIR, OUTPUT_CSV)

        # Generate similarity matrix
        print("\nGenerating similarity matrix...")
        sim_matrix = extractor.generate_similarity_matrix(OUTPUT_CSV, OUTPUT_MATRIX)
        print(f"Similarity matrix shape: {sim_matrix.shape}")

        # Example: Find most similar images
        print("\n=== Most Similar Image Pairs ===")
        for i in range(min(5, len(embeddings_df))):
            for j in range(i + 1, len(embeddings_df)):
                if sim_matrix[i, j] > 0.8:
                    print(f"{embeddings_df.iloc[i]['image_name']} <-> "
                          f"{embeddings_df.iloc[j]['image_name']}: {sim_matrix[i, j]:.3f}")
    else:
        print(f"Image directory {IMAGE_DIR} not found. Create it with sample X-ray images.")
        print("\nThis script demonstrates the feature extraction pipeline.")
        print("In production, it would:")
        print("1. Load all X-ray images from reference_xrays/")
        print("2. Extract 1024-dimensional feature vectors using DenseNet121")
        print("3. Compute pairwise cosine similarity")
        print("4. Save results to xray_embeddings.csv and similarity_matrix.npz")


if __name__ == "__main__":
    main()
