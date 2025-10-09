from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


class QDrant():
    def __init__(self, Settings=None):
        self.url = Settings.QDRANT_URL
        self.api_key = Settings.QDRANT_API_KEY
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

    def search_vectors(self, Settings, query: str, collection_name: str, top_k: int):
        from llms.llm_manager import llm_manager
        embedding_model = llm_manager.get_embedding_model(Settings.EMBEDDING_MODE)
        if embedding_model is None:
            print("❌ Embedding model not available for search")
            return []
        query_vector = embedding_model.encode(query)
        if hasattr(query_vector, "tolist"):
            query_vector = query_vector.tolist()
        results = self.client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=top_k,
        search_params={
            "hnsw_ef": 128,   # tăng độ chính xác (default thường 16-64)
            "exact": False     # nếu True => brute-force, chính xác tuyệt đối nhưng chậm
        }
    )
        return results
    
    def search_vectors_with_filter(self, Settings, query: str, collection_name: str, top_k: int, filter):
        from llms.llm_manager import llm_manager
        embedding_model = llm_manager.get_embedding_model(Settings.EMBEDDING_MODE)
        if embedding_model is None:
            print("❌ Embedding model not available for search")
            return []
        query_vector = embedding_model.encode(query)
        if hasattr(query_vector, "tolist"):
            query_vector = query_vector.tolist()
        results = self.client.search(
            collection_name=collection_name,
            query_vector=query_vector,
            limit=top_k,
            query_filter=filter,
            search_params={
                "hnsw_ef": 128,   # tăng độ chính xác (default thường 16-64)
                "exact": False     # nếu True => brute-force, chính xác tuyệt đối nhưng chậm
            }
        )
        return results
    
    def delete_collection(self, collection_name: str):
        self.client.delete_collection(collection_name=collection_name)
        print(f"✅ Deleted collection '{collection_name}'")
        
    def list_collections(self):
        return self.client.get_collections()
    
    def get_data_from_collection(self, collection_name: str):
        return self.client.scroll(collection_name=collection_name)
    
    def create_payload_index(self, collection_name: str, field_name: str, field_schema: str = "keyword"):
        """
        Create payload index for filtering
        
        Args:
            collection_name: Name of the collection
            field_name: Name of the field to index
            field_schema: Type of index (keyword, integer, float, geo, text)
        """
        try:
            self.client.create_payload_index(
                collection_name=collection_name,
                field_name=field_name,
                field_schema=field_schema
            )
            print(f"✅ Created payload index for field '{field_name}' in collection '{collection_name}'")
        except Exception as e:
            print(f"⚠️  Index creation skipped for '{field_name}': {e}")
    

if __name__ == '__main__':
    import sys
    import os
    from pathlib import Path
    backend_dir = Path(__file__).parent.parent.parent
    sys.path.insert(0, str(backend_dir))
    from setting import Settings
    
    print("=" * 80)
    print("Testing Qdrant Semantic Search")
    print("=" * 80)
    
    settings = Settings.load_settings()
    qdrant = QDrant(Settings=settings)
    
    # Clear cache để đảm bảo load model mới
    from tool.model_manager import model_manager
    model_manager.clear_cache()
    print("✅ Cleared model cache")
    # print(qdrant.get_data_from_collection('entities'))
    
    query = "Tìm công ty TechCorp đang tuyển về gì"
    print(f"\n🔍 Query: {query}")
    print(f"📊 Collection: entities")
    print(f"🎯 Top K: 5")
    print("\nSearching...")
    
    from qdrant_client.models import Filter, FieldCondition, MatchValue
    
    scroll_filter = Filter(
    must=[
        FieldCondition(
            key="entity_type",
            match=MatchValue(value="job_posting")
        ),
        # FieldCondition(
        #     key="name_of_company",
        #     match=MatchValue(value="TechCorp")
        # ),
    ]
)

    results = qdrant.search_vectors_with_filter(settings, query, "entities", top_k=7, filter=scroll_filter)


    print(f"\n✅ Found {len(results)} results:")
    print("=" * 80)
    

    
    for i, result in enumerate(results, 1):
        print(f"\n🔹 Result {i}:")
        print(f"   Score: {result.score:.4f}")
        print(f"   Entity Type: {result.payload.get('entity_type')}")
        if result.payload.get('entity_type') == 'job_posting':
            print(f"   Position: {result.payload.get('position_name')}")
            print(f"   Company: {result.payload.get('name_of_company')}")
            print(f"   Requirements: {result.payload.get('requirements', '')[:100]}...")
    
    # Test filter by company name
    print("\n" + "=" * 80)
    print("Testing Filter by Company Name")
    print("=" * 80)
    
    
    print("=" * 80)




    
    
    
    
            