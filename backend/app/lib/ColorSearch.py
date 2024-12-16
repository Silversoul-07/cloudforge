import os
import numpy as np
from PIL import Image
import cv2
from pymilvus import Collection, CollectionSchema, FieldSchema, DataType, connections

class ColorImageSearch:
    def __init__(self, image_dir, milvus_host='localhost', milvus_port=19530):
        self.image_dir = image_dir
        self.collection_name = 'color_image_search'
        
        # Connect to Milvus
        connections.connect(host=milvus_host, port=milvus_port)
        
        # Create collection if not exists
        self._create_collection()
        
    def _create_collection(self):
        # Define collection schema
        fields = [
            FieldSchema(name='id', dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name='image_path', dtype=DataType.VARCHAR, max_length=500),
            FieldSchema(name='color_vector', dtype=DataType.FLOAT_VECTOR, dim=3)
        ]
        schema = CollectionSchema(fields)
        
        # Create collection
        try:
            self.collection = Collection(self.collection_name, schema)
            self.collection.create_index(field_name='color_vector', index_type='HNSW')
        except Exception:
            self.collection = Collection(self.collection_name)
    
    def _extract_average_color(self, image_path):
        # Extract average color as RGB vector
        img = Image.open(image_path)
        img = img.resize((100, 100))
        avg_color = np.array(img).mean(axis=(0, 1))
        return avg_color / 255.0
    
    def index_images(self):
        # Index all images in directory
        for filename in os.listdir(self.image_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif')):
                full_path = os.path.join(self.image_dir, filename)
                color_vector = self._extract_average_color(full_path)
                
                # Insert into Milvus
                self.collection.insert([[full_path], [color_vector]])
        
        # Flush and load
        self.collection.flush()
        self.collection.load()
    
    def search_by_color(self, hex_color, threshold=0.1):
        # Convert hex to normalized RGB
        hex_color = hex_color.lstrip('#')
        color_vector = np.array([
            int(hex_color[:2], 16) / 255.0,
            int(hex_color[2:4], 16) / 255.0,
            int(hex_color[4:], 16) / 255.0
        ])
        
        # Search in Milvus
        search_params = {
            "metric_type": "L2",
            "params": {"nprobe": 10}
        }
        
        results = self.collection.search(
            data=[color_vector],
            anns_field='color_vector',
            param=search_params,
            limit=10,
            expr=f'L2_Distance(color_vector, {color_vector}) < {threshold}'
        )
        
        # Extract image paths from results
        return [hit.entity.get('image_path') for hit in results[0]]

def main():
    search_engine = ColorImageSearch('/app/images')
    search_engine.index_images()
    
if __name__ == '__main__':
    main()