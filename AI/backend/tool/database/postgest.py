import os
import sys
from pathlib import Path
from supabase import create_client, Client
from typing import List, Dict, Any, Optional, Callable
import logging
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Add backend to path for LLMManager import
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

try:
    from llms.llm_manager import llm_manager
    LLM_MANAGER_AVAILABLE = True
except ImportError:
    LLM_MANAGER_AVAILABLE = False
    llm_manager = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PostgreSQLClient:
    """
    PostgreSQL client using Supabase for company and job data management with Qdrant embedding capabilities
    """
    
    def __init__(self, url: str = None, key: str = None, qdrant_url: str = None, qdrant_api_key: str = None):
        """
        Khởi tạo Supabase client và Qdrant client
        Args:
            url: Supabase URL
            key: Supabase anon key
            qdrant_url: Qdrant URL
            qdrant_api_key: Qdrant API key
        """
        # Khởi tạo Supabase
        self.url = url or os.getenv("SUPABASE_URL")
        self.key = key or os.getenv("SUPABASE_ANON_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL và SUPABASE_ANON_KEY phải được cung cấp")
            
        self.client: Client = create_client(self.url, self.key)
        logger.info("✅ Supabase client initialized successfully")
        
        # Khởi tạo Qdrant và embedding
        self.qdrant_url = qdrant_url or os.getenv("QDRANT_URL")
        self.qdrant_api_key = qdrant_api_key or os.getenv("QDRANT_API_KEY")
        
        self.qdrant_client = None
        self.embedding_model = None
        
        if self.qdrant_url and self.qdrant_api_key:
            self._init_qdrant_and_embedding()
        else:
            logger.info("ℹ️ Qdrant not configured - embedding features disabled")

    def _init_qdrant_and_embedding(self):
        """Khởi tạo Qdrant client và embedding model"""
        try:
            # Khởi tạo Qdrant
            self.qdrant_client = QdrantClient(
                url=self.qdrant_url,
                api_key=self.qdrant_api_key
            )
            logger.info("✅ Qdrant client initialized successfully")
            
            # Khởi tạo embedding model
            self.embedding_model = self._get_embedding_model()
            if self.embedding_model:
                logger.info("✅ Embedding model initialized successfully")
            else:
                logger.warning("⚠️ Could not initialize embedding model")
                
        except Exception as e:
            logger.warning(f"⚠️ Could not initialize Qdrant: {str(e)}")
            self.qdrant_client = None
            self.embedding_model = None

    def _get_embedding_model(self):
        """Lấy embedding model từ LLMManager hoặc tạo trực tiếp"""
        # Thử LLMManager trước
        if LLM_MANAGER_AVAILABLE and llm_manager:
            model = llm_manager.get_embedding_model('dangvantuan/vietnamese-document-embedding')
            if model:
                return model
        
        # Fallback: tạo trực tiếp
        try:
            from sentence_transformers import SentenceTransformer
            return SentenceTransformer('dangvantuan/vietnamese-document-embedding')
        except Exception as e:
            logger.error(f"❌ Failed to initialize embedding model: {str(e)}")
            return None

    def _is_valid_point_id(self, point_id: str) -> bool:
        """
        Kiểm tra xem point ID có hợp lệ với Qdrant không
        Qdrant chấp nhận: unsigned integer hoặc UUID
        """
        try:
            # Thử parse thành UUID
            uuid.UUID(point_id)
            return True
        except ValueError:
            # Thử parse thành unsigned integer
            try:
                int_id = int(point_id)
                return int_id >= 0
            except ValueError:
                return False

    def get_data_from_procedures(self, name_of_procedure: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lấy dữ liệu từ stored procedure
        Args:
            limit: số lượng bản ghi tối đa
        Returns:
            List[Dict]: danh sách công ty với ngành nghề
        """
        try:
            response = self.client.rpc(name_of_procedure).execute()
       
            if response.data:
                logger.info(f"✅ Retrieved {len(response.data)} records")
                return response.data
            else:
                return self._get_companies_fallback(limit)
                
        except Exception as e:
            logger.error(f"❌ Error getting {str(e)}")
            return self._get_companies_fallback(limit)

    def _get_companies_fallback(self, limit: int) -> List[Dict[str, Any]]:
        """
        Phương thức dự phòng để lấy dữ liệu công ty
        """
        try:
            # Lấy dữ liệu từ các bảng riêng biệt và join thủ công
            companies = self.client.table('cong_ty').select('*').limit(limit).execute()
            
            result = []
            for company in companies.data:
                # Lấy địa chỉ
                address = self.client.table('dia_chi').select('*').eq('ma_cong_ty', company['ma_cong_ty']).execute()
                
                # Lấy ngành nghề
                industries = (self.client.table('cong_ty_nganh_nghe')
                            .select('*, nganh_nghe(*)')
                            .eq('ma_cong_ty', company['ma_cong_ty'])
                            .execute())
                
                # Tạo bản ghi kết hợp
                for industry in industries.data:
                    record = {
                        **company,
                        'dia_chi': address.data[0]['dia_chi'] if address.data else '',
                        'ma_dia_chi': address.data[0]['ma_dia_chi'] if address.data else None,
                        'ma_nganh_nghe': industry['ma_nganh_nghe'],
                        'ten_nganh_nghe': industry['nganh_nghe']['ten_nganh_nghe'] if industry.get('nganh_nghe') else ''
                    }
                    result.append(record)
            
            logger.info(f"✅ Retrieved {len(result)} records using fallback method")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in fallback method: {str(e)}")
            return []

    def create_collection_if_not_exists(self, collection_name: str, vector_size: int = 384):
        """
        Tạo collection trong Qdrant nếu chưa tồn tại
        Args:
            collection_name: tên collection
            vector_size: kích thước vector
        """
        if not self.qdrant_client:
            logger.error("❌ Qdrant client not initialized")
            return False
            
        try:
            collections = self.qdrant_client.get_collections().collections
            existing_collections = [col.name for col in collections]
            
            if collection_name not in existing_collections:
                self.qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
                )
                logger.info(f"✅ Created collection '{collection_name}'")
            else:
                logger.info(f"✅ Collection '{collection_name}' already exists")
            return True
                
        except Exception as e:
            logger.error(f"❌ Error creating collection: {str(e)}")
            return False

    def embed_data_to_qdrant(
        self,
        procedure_name: str,
        collection_name: str,
        text_extractor: Callable[[Dict[str, Any]], str],
        id_extractor: Callable[[Dict[str, Any]], str] = None,
        data_processor: Callable[[List[Dict[str, Any]]], List[Dict[str, Any]]] = None,
        limit: int = 100,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """
        Hàm embedding linh hoạt cho bất kỳ loại dữ liệu nào từ stored procedure
        
        Args:
            procedure_name: tên stored procedure
            collection_name: tên collection trong Qdrant
            text_extractor: hàm trích xuất text để embedding từ mỗi bản ghi
            id_extractor: hàm trích xuất ID cho mỗi point (mặc định dùng UUID)
            data_processor: hàm xử lý dữ liệu trước khi embedding (tùy chọn)
            limit: số lượng bản ghi tối đa
            batch_size: kích thước batch cho embedding
            
        Returns:
            Dict: kết quả embedding và upsert
        """
        if not self.qdrant_client or not self.embedding_model:
            return {"status": "error", "message": "Qdrant client or embedding model not initialized"}
        
        try:
            # 1. Lấy dữ liệu từ PostgreSQL
            logger.info(f"🔍 Fetching data from procedure: {procedure_name}")
            raw_data = self.get_data_from_procedures(procedure_name, limit)
            
            if not raw_data:
                return {"status": "error", "message": "No data retrieved"}
            
            # 2. Xử lý dữ liệu nếu có processor
            processed_data = data_processor(raw_data) if data_processor else raw_data
            logger.info(f"📊 Processing {len(processed_data)} records")
            
            # 3. Tạo collection nếu chưa tồn tại
            if not self.create_collection_if_not_exists(collection_name):
                return {"status": "error", "message": f"Failed to create collection {collection_name}"}
            
            # 4. Tạo embedding và points
            points = []
            for i, record in enumerate(processed_data):
                try:
                    # Trích xuất text để embedding
                    text_to_embed = text_extractor(record)
                    
                    # Tạo embedding vector
                    embedding = self.embedding_model.encode(text_to_embed).tolist()
                    
                    # Trích xuất ID hoặc tạo ID mới
                    if id_extractor:
                        point_id = id_extractor(record)
                        # Đảm bảo ID tương thích với Qdrant (UUID hoặc integer)
                        if not self._is_valid_point_id(point_id):
                            point_id = str(uuid.uuid4())
                    else:
                        point_id = str(uuid.uuid4())
                    
                    # Tạo point
                    point = PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload=record
                    )
                    points.append(point)
                    
                    if (i + 1) % 10 == 0:
                        logger.info(f"⚡ Processed {i + 1}/{len(processed_data)} records")
                        
                except Exception as e:
                    logger.warning(f"⚠️ Error processing record {i}: {str(e)}")
                    continue
            
            # 5. Upsert vào Qdrant theo batch
            total_inserted = 0
            for i in range(0, len(points), batch_size):
                batch = points[i:i + batch_size]
                try:
                    self.qdrant_client.upsert(
                        collection_name=collection_name,
                        points=batch
                    )
                    total_inserted += len(batch)
                    logger.info(f"📤 Upserted batch {i//batch_size + 1}: {len(batch)} points")
                except Exception as e:
                    logger.error(f"❌ Error upserting batch {i//batch_size + 1}: {str(e)}")
            
            result = {
                "status": "success",
                "procedure": procedure_name,
                "collection": collection_name,
                "total_records": len(processed_data),
                "total_inserted": total_inserted,
                "batch_size": batch_size
            }
            
            logger.info(f"✅ Successfully embedded {total_inserted} records to '{collection_name}'")
            return result
            
        except Exception as e:
            error_result = {
                "status": "error",
                "procedure": procedure_name,
                "collection": collection_name,
                "message": str(e)
            }
            logger.error(f"❌ Error in embedding process: {str(e)}")
            return error_result
    
    def search_similar_records(
        self,
        collection_name: str,
        query_text: str,
        top_k: int = 5,
        score_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Tìm kiếm các bản ghi tương tự
        Args:
            collection_name: tên collection
            query_text: text truy vấn
            top_k: số lượng kết quả
            score_threshold: ngưỡng điểm số
        Returns:
            List: danh sách kết quả tìm kiếm
        """
        if not self.qdrant_client or not self.embedding_model:
            logger.error("❌ Qdrant client or embedding model not initialized")
            return []
        
        try:
            # Tạo vector cho query
            query_vector = self.embedding_model.encode(query_text).tolist()
            
            # Tìm kiếm trong Qdrant
            search_results = self.qdrant_client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=top_k,
                score_threshold=score_threshold
            )
            
            results = []
            for result in search_results:
                results.append({
                    "id": result.id,
                    "score": result.score,
                    "payload": result.payload
                })
            
            logger.info(f"🔍 Found {len(results)} similar records for query: '{query_text}'")
            return results
            
        except Exception as e:
            logger.error(f"❌ Error in search: {str(e)}")
            return []

    