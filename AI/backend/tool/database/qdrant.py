from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


class QDrant():
    def __init__(self, url: str, api_key: str):
        self.url = url
        self.api_key = api_key
        # Disable compatibility check and set timeout for better error handling
        try:
            self.client = QdrantClient(
                url=self.url, 
                api_key=self.api_key,
                timeout=60,
                prefer_grpc=False,
                https=True,
                verify=True
            )
        except Exception as e:
            print(f"Failed to initialize Qdrant client: {e}")
            raise
        
    def get_client(self) -> QdrantClient:
        return self.client
    
    def test_connection(self) -> bool:
        """Test the connection to Qdrant server"""
        try:
            collections = self.client.get_collections()
            print("✅ Successfully connected to Qdrant server")
            return True
        except Exception as e:
            print(f"❌ Failed to connect to Qdrant server: {e}")
            return False
    
    def create_collection(self, collection_name: str, vector_size: int):
        self.client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
        )
        print(f"✅ Created/Recreated collection '{collection_name}' with vector size {vector_size}")

    def insert_vectors(self, collection_name: str, points: list):
        self.client.upsert(
            collection_name=collection_name,
            points=points
        )
        print(f"✅ Inserted {len(points)} vectors into collection '{collection_name}'")
    
    def check_point_exists(self, collection_name: str, point_id: int) -> bool:
        """Kiểm tra xem point với ID đã tồn tại trong collection chưa"""
        try:
            result = self.client.retrieve(
                collection_name=collection_name,
                ids=[point_id]
            )
            return len(result) > 0
        except Exception as e:
            print(f"❌ Error checking point existence: {e}")
            return False
    
    def get_existing_ids(self, collection_name: str) -> set:
        """Lấy tất cả IDs đã tồn tại trong collection"""
        try:
            points, _ = self.client.scroll(
                collection_name=collection_name,
                limit=10000,  # Adjust based on your collection size
                with_payload=False,  # Chỉ cần ID, không cần payload
                with_vectors=False   # Không cần vectors
            )
            return {point.id for point in points}
        except Exception as e:
            print(f"❌ Error getting existing IDs: {e}")
            return set()
    
    def insert_vectors_safe(self, collection_name: str, points: list):
        """Insert vectors nhưng chỉ thêm những ID chưa tồn tại"""
        existing_ids = self.get_existing_ids(collection_name)
        
        # Filter out points with existing IDs
        new_points = [point for point in points if point.id not in existing_ids]
        existing_points = [point for point in points if point.id in existing_ids]
        
        if existing_points:
            print(f"⚠️  Skipped {len(existing_points)} points with existing IDs: {[p.id for p in existing_points]}")
        
        if new_points:
            self.client.upsert(
                collection_name=collection_name,
                points=new_points
            )
            print(f"✅ Inserted {len(new_points)} new vectors into collection '{collection_name}'")
            print(f"📋 New IDs added: {[p.id for p in new_points]}")
        else:
            print(f"ℹ️  No new vectors to insert - all IDs already exist in collection")
        
    def search_vectors(self, collection_name: str, query_vector: list, top_k: int):
        results = self.client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=top_k
        )
        return results
    
    def delete_collection(self, collection_name: str):
        self.client.delete_collection(collection_name=collection_name)
        print(f"✅ Deleted collection '{collection_name}'")
        
    def list_collections(self):
        return self.client.get_collections()
    
    def get_data_from_collection(self, collection_name: str):
        return self.client.scroll(collection_name=collection_name)
        
        


    
    
    
    
            