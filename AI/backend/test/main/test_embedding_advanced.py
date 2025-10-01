import os
import sys
import json
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from tool.database.postgest import PostgreSQLClient  
from setting import Settings  


class CompanyEmbeddingDemo:
    """
    Demo class cho khả năng embedding linh hoạt với nhiều loại dữ liệu
    """
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.pg_client = PostgreSQLClient(
            url=settings.SUPABASE_URL, 
            key=settings.SUPABASE_ANON_KEY,
            qdrant_url=settings.QDRANT_URL,
            qdrant_api_key=settings.QDRANT_API_KEY
        )
    
    def company_text_extractor(self, record: dict) -> str:
        """Extractor cho dữ liệu công ty"""
        text_parts = []
        
        if record.get('ten_cong_ty'):
            text_parts.append(f"Công ty: {record['ten_cong_ty']}")
        
        if record.get('ds_nganh_nghe'):
            text_parts.append(f"Ngành nghề: {record['ds_nganh_nghe']}")
            
        return ". ".join(text_parts)
    
    def company_id_extractor(self, record: dict) -> str:
        """ID extractor cho công ty - sử dụng UUID để tương thích với Qdrant"""
        import uuid
        # Tạo UUID deterministic từ company ID để có thể reproduce
        company_id = record['ma_cong_ty']
        namespace = uuid.UUID('12345678-1234-5678-1234-567812345678')  # Fixed namespace UUID
        deterministic_uuid = uuid.uuid5(namespace, f"company_{company_id}")
        return str(deterministic_uuid)

    
    def run_company_embedding_demo(self):
        """
        Demo embedding công ty với khả năng duplicate prevention
        """
        print("🏢 COMPANY EMBEDDING DEMO")
        print("="*50)
        
        # Demo với procedure get_cong_ty_full (dữ liệu đã gom nhóm)
        result = self.pg_client.embed_data_to_qdrant(
            procedure_name="get_cong_ty_full",
            collection_name="companies_grouped",
            text_extractor=self.company_text_extractor,
            id_extractor=self.company_id_extractor,
            limit=50,
            batch_size=10
        )
        
        print("📊 Company Embedding Result:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        return result
    
    def run_flexible_demo(self):
        """
        Demo khả năng mở rộng với nhiều loại procedure khác nhau
        """
        print("\n🔧 FLEXIBLE EMBEDDING DEMO")
        print("="*50)
        
        # Có thể dễ dàng thêm các procedure khác
        procedures_demo = [
            {
                "name": "get_cong_ty_full",
                "collection": "companies_demo",
                "text_extractor": self.company_text_extractor,
                "id_extractor": self.company_id_extractor,
                "description": "Company data with grouped industries"
            },
        ]
        
        results = []
        for proc in procedures_demo:
            print(f"\n🔄 Processing: {proc['description']}")
            result = self.pg_client.embed_data_to_qdrant(
                procedure_name=proc["name"],
                collection_name=proc["collection"],
                text_extractor=proc["text_extractor"],
                id_extractor=proc["id_extractor"],
                limit=20,
                batch_size=5
            )
            results.append({
                "procedure": proc["name"],
                "result": result
            })
        
        return results
    
    def run_search_demo(self, collection_name: str):
        """
        Demo tìm kiếm với nhiều queries khác nhau
        """
        print(f"\n🔍 SEARCH DEMO - Collection: {collection_name}")
        print("="*50)
        
        search_scenarios = [
            {
                "query": "công ty công nghệ thông tin hà nội",
                "description": "IT companies in Hanoi"
            },
            {
                "query": "trung tâm đào tạo giáo dục",
                "description": "Education and training centers"
            },
            {
                "query": "công ty marketing thương mại điện tử",
                "description": "E-commerce marketing companies"
            },
            {
                "query": "doanh nghiệp phần mềm",
                "description": "Software companies"
            }
        ]
        
        search_results = []
        for scenario in search_scenarios:
            print(f"\n🎯 {scenario['description']}")
            print(f"   Query: '{scenario['query']}'")
            
            results = self.pg_client.search_similar_records(
                collection_name=collection_name,
                query_text=scenario["query"],
                top_k=3,
                score_threshold=0.4
            )
            
            if results:
                for i, result in enumerate(results, 1):
                    payload = result['payload']
                    print(f"   {i}. {payload['ten_cong_ty']} (Score: {result['score']:.4f})")
                    if payload.get('ds_nganh_nghe'):
                        print(f"      Industries: {payload['ds_nganh_nghe']}")
            else:
                print("   No results found")
            
            search_results.append({
                "query": scenario["query"],
                "results": results
            })
        
        return search_results
    
    def run_full_demo(self):
        """
        Chạy toàn bộ demo
        """
        print("🌟 COMPREHENSIVE POSTGRESQL + QDRANT EMBEDDING DEMO")
        print("="*70)
        
        try:
            # 1. Company embedding demo
            company_result = self.run_company_embedding_demo()
            
            # 2. Flexible embedding demo
            flexible_results = self.run_flexible_demo()
            
            # 3. Search demo nếu embedding thành công
            if company_result.get("status") == "success":
                search_results = self.run_search_demo("companies_grouped")
            
            print("\n✅ All demos completed successfully!")
            print("\n📈 Summary:")
            print(f"   - Company records embedded: {company_result.get('total_inserted', 0)}")
            print(f"   - Collections created: {len(flexible_results)}")
            print(f"   - Search scenarios tested: 4")
            
            return {
                "company_embedding": company_result,
                "flexible_demos": flexible_results,
                "search_demos": search_results if company_result.get("status") == "success" else []
            }
            
        except Exception as e:
            print(f"❌ Demo failed: {str(e)}")
            return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    print("🚀 Starting Advanced Company Embedding Demo...")
    
    # Load settings
    settings = Settings.load_settings()
    
    # Run demo
    demo = CompanyEmbeddingDemo(settings)
    final_results = demo.run_full_demo()
    print(final_results)
    
   