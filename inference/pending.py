from ..common import *
from pymilvus import MilvusClient, Collection
import os
import pickle
import numpy as np
from deepface import DeepFace
import logging

class FaceRecognizer:
    def __init__(self, milvus_setup: MilvusSetup, collection_name: str = "FaceRecognition", embedding_dim: int = 512):
        self.collection = milvus_setup.client.get_collection(collection_name)
        self.embedding_dim = embedding_dim
        self.model_name = "Facenet512"
        self.detector_backend = "retinaface"

    async def add_face(self, img_paths, identity):
        if not isinstance(img_paths, list):
            img_paths = [img_paths]

        embeddings = []
        identities = []

        for img_path in img_paths:
            embedding = DeepFace.represent(
                img_path=img_path,
                model_name=self.model_name,
                detector_backend=self.detector_backend
            )[0]["embedding"]
            embedding = np.array(embedding).astype("float32")
            embeddings.append(embedding)
            identities.append(identity)
            logging.info(f"Processed embedding for {identity} from {img_path}")

        try:
            data = [
                {"name": "id", "type": DataType.VARCHAR, "values": identities},
                {"name": "face_embed", "type": DataType.FLOAT_VECTOR, "values": embeddings}
            ]
            self.collection.insert(data)
            logging.info(f"Added {len(embeddings)} face(s) for {identity}")
        except Exception as e:
            logging.error(f"Error adding faces for {identity}: {str(e)}")
            raise

    async def predict(self, img_path):
        try:
            embedding = DeepFace.represent(
                img_path=img_path,
                model_name=self.model_name,
                detector_backend=self.detector_backend
            )[0]["embedding"]
            embedding = np.array(embedding).astype("float32").tolist()

            search_params = {
                "metric_type": "IP",
                "params": {"nprobe": 10}
            }

            results = self.collection.search(
                data=[embedding],
                anns_field="face_embed",
                param=search_params,
                limit=1,
                expr=None
            )

            if results:
                top_result = results[0][0]
                match_score = top_result.score
                match_id = top_result.id
                if match_score >= 0.7:
                    identity = self.collection.query(expr=f"id == '{match_id}'", output_fields=["id"])[0]["id"]
                    return identity
            return "No match found"
        except Exception as e:
            logging.error(f"Error predicting face for {img_path}: {str(e)}")
            return "Error during prediction"

# tagging.py
from pathlib import Path
from PIL import Image
from typing import Tuple, Dict, List
import torch
import torchvision.transforms.functional as TVF
from torchvision.models import viso
import numpy as np
from dataclasses import dataclass
import logging

from .base import BaseModel
from ..common import VisionModel
from transformers import AutoModel, visionmodel

'use segment anything model'
@dataclass
class TaggerConfig:
    model_name: str = "Facenet512"
    detector_backend: str = "retinaface"
    device: str = "cuda"
    threshold: float = 0.4
    target_size: int = 224  # Example target size

class Tagger(BaseModel):
    def __init__(self, config: TaggerConfig, model_path: str):
        self.config = config
        self.model_path = model_path
        self.model = self._load_model()
        self.model.eval()
        self.model.to(self.config.device)
        self.top_tags = self._load_top_tags()
        logging.info("Tagger initialized successfully.")

    def _load_model(self) -> VisionModel:
        logging.info(f"Loading model from {self.model_path}")
        model = VisionModel.load_model(self.model_path)
        return model

    def _load_top_tags(self) -> List[str]:
        tags_file = Path(self.model_path) / 'top_tags.txt'
        logging.info(f"Loading top tags from {tags_file}")
        with open(tags_file, 'r') as f:
            top_tags = [line.strip() for line in f.readlines() if line.strip()]
        return top_tags

    def prepare_image(self, image: Image.Image) -> torch.Tensor:
        # Pad image to square
        image_shape = image.size
        max_dim = max(image_shape)
        pad_left = (max_dim - image_shape[0]) // 2
        pad_top = (max_dim - image_shape[1]) // 2

        padded_image = Image.new('RGB', (max_dim, max_dim), (255, 255, 255))
        padded_image.paste(image, (pad_left, pad_top))

        # Resize image
        if max_dim != self.config.target_size:
            padded_image = padded_image.resize((self.config.target_size, self.config.target_size), Image.BICUBIC)
        
        # Convert to tensor
        image_tensor = TVF.pil_to_tensor(padded_image) / 255.0

        # Normalize
        image_tensor = TVF.normalize(
            image_tensor, 
            mean=[0.48145466, 0.4578275, 0.40821073], 
            std=[0.26862954, 0.26130258, 0.27577711]
        )

        return image_tensor

    async def predict(self, image: Image.Image) -> Tuple[str, Dict[str, float]]:
        try:
            image_tensor = self.prepare_image(image).unsqueeze(0).to(self.config.device)

            with torch.no_grad():
                with torch.amp.autocast(mode='cuda', enabled=True):
                    preds = self.model({'image': image_tensor})
                    tag_preds = preds['tags'].sigmoid().cpu()

            scores = {self.top_tags[i]: tag_preds[0][i].item() for i in range(len(self.top_tags))}
            predicted_tags = [tag for tag, score in scores.items() if score > self.config.threshold]
            tag_string = ', '.join(predicted_tags)

            logging.info(f"Prediction completed. Tags: {tag_string}")
            return tag_string, scores

        except Exception as e:
            logging.error(f"Error during prediction: {str(e)}")
            return "Error during prediction", {}

    async def batch_predict(self, images: List[Image.Image]) -> Dict[str, Tuple[str, Dict[str, float]]]:
        results = {}
        for idx, image in enumerate(images):
            try:
                tag_string, scores = await self.predict(image)
                results[f'image_{idx}'] = (tag_string, scores)
                logging.info(f"Batch prediction for image_{idx} completed.")
            except Exception as e:
                logging.error(f"Error during batch prediction for image_{idx}: {str(e)}")
                results[f'image_{idx}'] = ("Error during prediction", {})
        return results