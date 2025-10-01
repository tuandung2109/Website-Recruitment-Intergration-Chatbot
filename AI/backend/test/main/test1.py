
import sys
from pathlib import Path
import numpy as np
import qdrant_client
from qdrant_client.models import PointStruct

# Add backend to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from tool.embeddings import EmbeddingConfig, SentenceTransformerEmbedding


def test():
    """Test tạo collection và hiển thị danh sách collections"""
    from qdrant_client import QdrantClient
    from setting import Settings
    settings = Settings.load_settings()
    from tool.database import QDrant

    qdrant_client = QDrant(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    
    collection_name = "job_descriptions"
    dimension = 768
    
    try:
        qdrant_client.create_collection(collection_name, dimension)
        print("✅ Collection created successfully!")
        collections = qdrant_client.list_collections()
        print(f"📋 Available collections: {collections}")
        return qdrant_client
    except Exception as e:
        print(f"❌ Error in test: {e}")
        return None


def insert_vectors():
    """Test insert vectors vào collection"""
    from setting import Settings
    from tool.database import QDrant
    
    settings = Settings.load_settings()
    qdrant_client = QDrant(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    
    # Khởi tạo embedding model
    config = EmbeddingConfig(name="dangvantuan/vietnamese-document-embedding")
    embedder = SentenceTransformerEmbedding(config)
    collection_name = "job_descriptions"
    
    # Dữ liệu mẫu job descriptions tiếng Việt
    job_data = [
        {
            "id": 1,
            "title": "Lập trình viên Python Backend",
            "company": "Công ty FPT Software",
            "location": "Hà Nội",
            "description": "Phát triển và bảo trì các hệ thống backend sử dụng Python, Django, FastAPI. Làm việc với database PostgreSQL và Redis.",
            "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Docker"],
            "requirements": "Có ít nhất 2 năm kinh nghiệm với Python. Hiểu biết về microservices và cloud computing."
        },
        {
            "id": 2,
            "title": "AI Engineer - Machine Learning",
            "company": "VinAI Research",
            "location": "Hồ Chí Minh",
            "description": "Nghiên cứu và phát triển các mô hình AI/ML cho các sản phẩm của VinGroup. Làm việc với NLP, Computer Vision.",
            "skills": ["Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "MLOps"],
            "requirements": "Thạc sĩ về AI/ML hoặc tương đương. Có kinh nghiệm publish paper quốc tế là lợi thế."
        },
        {
            "id": 3,
            "title": "Full Stack Developer",
            "company": "Tiki Corporation",
            "location": "Hồ Chí Minh",
            "description": "Phát triển full-stack cho platform e-commerce. Frontend với React/Vue, backend với Node.js hoặc Python.",
            "skills": ["JavaScript", "React", "Vue.js", "Node.js", "Python", "MongoDB", "AWS"],
            "requirements": "Có ít nhất 3 năm kinh nghiệm full-stack development. Hiểu biết về e-commerce business."
        },
        {
            "id": 4,
            "title": "DevOps Engineer",
            "company": "Grab Vietnam",
            "location": "Hà Nội, Hồ Chí Minh",
            "description": "Quản lý infrastructure, CI/CD pipelines, monitoring systems. Làm việc với Kubernetes, Docker, AWS.",
            "skills": ["Kubernetes", "Docker", "AWS", "Terraform", "Jenkins", "Prometheus", "Grafana"],
            "requirements": "Có kinh nghiệm với cloud platforms và container orchestration. Hiểu biết về security best practices."
        },
        {
            "id": 5,
            "title": "Data Scientist",
            "company": "Zalo (VNG Corporation)",
            "location": "Hồ Chí Minh",
            "description": "Phân tích dữ liệu người dùng, xây dựng recommendation systems, A/B testing cho các tính năng mới.",
            "skills": ["Python", "R", "SQL", "Spark", "Hadoop", "Statistics", "Machine Learning"],
            "requirements": "Có kinh nghiệm với big data analytics và statistical modeling. Hiểu biết về product analytics."
        }
    ]
    
    try:
        print("📝 Embedding job descriptions...")
        points = []
        
        for job in job_data:
            # Tạo text để embedding
            job_text = f"{job['title']}. {job['description']} Yêu cầu: {job['requirements']} Kỹ năng: {', '.join(job['skills'])}"
            
            print(f"  - Embedding job: {job['title']}")
            
            # Tạo embedding từ text
            embedding = embedder.encode(job_text)
            
            # Tạo point cho Qdrant
            point = PointStruct(
                id=job['id'],
                vector=embedding.tolist() if hasattr(embedding, 'tolist') else embedding,
                payload={
                    "title": job['title'],
                    "company": job['company'],
                    "location": job['location'],
                    "description": job['description'],
                    "skills": job['skills'],
                    "requirements": job['requirements']
                }
            )
            points.append(point)
        
        # Insert vào Qdrant
        qdrant_client.insert_vectors(collection_name, points)
        print(f"✅ Successfully inserted {len(points)} job descriptions!")
        
    except Exception as e:
        print(f"❌ Error inserting vectors: {e}")


def search_vectors():
    """Test search vectors trong collection"""
    from setting import Settings
    from tool.database import QDrant
    
    settings = Settings.load_settings()
    qdrant_client = QDrant(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    
    # Khởi tạo embedding model
    config = EmbeddingConfig(name="dangvantuan/vietnamese-document-embedding")
    embedder = SentenceTransformerEmbedding(config)
    collection_name = "job_descriptions"
    
    # Các câu query mẫu
    search_queries = [
        "Tôi muốn tìm việc làm lập trình Python với Django",
        "Tìm kiếm công việc AI Machine Learning ở Hồ Chí Minh",
        "Cần tuyển DevOps engineer có kinh nghiệm với Kubernetes",
        "Tìm việc data scientist làm việc với big data"
    ]
    
    for i, query in enumerate(search_queries, 1):
        print(f"\n🔍 Search Query {i}: '{query}'")
        print("-" * 60)
        
        try:
            # Embedding search query
            print("📝 Embedding search query...")
            query_embedding = embedder.encode(query)
            query_vector = query_embedding.tolist() if hasattr(query_embedding, 'tolist') else query_embedding
            
            # Search trong Qdrant
            print("🔍 Searching for similar job descriptions...")
            results = qdrant_client.search_vectors(
                collection_name=collection_name,
                query_vector=query_vector,
                top_k=3
            )
            
            print(f"\n📋 Found {len(results)} similar jobs:")
            for j, result in enumerate(results, 1):
                payload = result.payload
                score = result.score
                print(f"\n  {j}. Job ID: {result.id}")
                print(f"     Title: {payload.get('title', 'N/A')}")
                print(f"     Company: {payload.get('company', 'N/A')}")
                print(f"     Location: {payload.get('location', 'N/A')}")
                print(f"     Skills: {', '.join(payload.get('skills', []))}")
                print(f"     Similarity Score: {score:.4f}")
                
        except Exception as e:
            print(f"❌ Error searching with query '{query}': {e}")
        
        print()  # Add spacing between queries
        
def select_data_from_collection(client ,collection_name: str, limit: int = 5):
    """Test lấy dữ liệu từ collection"""
    try:
        # Qdrant scroll() trả về tuple (points, next_page_offset)
        points, next_page_offset = client.get_data_from_collection(collection_name)
        limited_points = points[:limit]
        print(f"📋 Retrieved {len(limited_points)} points from collection '{collection_name}':")
        for i, point in enumerate(limited_points, 1):
            print(f"\n  {i}. Job ID: {point.id}")
            print(f"     Title: {point.payload.get('title', 'N/A')}")
            print(f"     Company: {point.payload.get('company', 'N/A')}")
            print(f"     Location: {point.payload.get('location', 'N/A')}")
            print(f"     Skills: {', '.join(point.payload.get('skills', []))}")
    except Exception as e:
        print(f"❌ Error retrieving data from collection '{collection_name}': {e}")
    


def test_duplicate_prevention():
    """Test chức năng kiểm tra và tránh duplicate IDs"""
    from setting import Settings
    from tool.database import QDrant
    
    settings = Settings.load_settings()
    qdrant_client = QDrant(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    
    # Khởi tạo embedding model
    config = EmbeddingConfig(name="dangvantuan/vietnamese-document-embedding")
    embedder = SentenceTransformerEmbedding(config)
    collection_name = "job_descriptions"
    
    print("🧪 Testing duplicate prevention...")
    print("=" * 50)
    
    # Thử thêm lại một số jobs với ID đã tồn tại
    duplicate_jobs = [
        {
            "id": 1,  # ID đã tồn tại
            "title": "Lập trình viên Python Backend (Updated)",
            "company": "Công ty FPT Software",
            "location": "Hà Nội",
            "description": "Phát triển và bảo trì các hệ thống backend sử dụng Python, Django, FastAPI. Updated version.",
            "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Docker"],
            "requirements": "Có ít nhất 2 năm kinh nghiệm với Python. Updated requirements."
        },
        {
            "id": 6,  # ID mới
            "title": "Frontend Developer React",
            "company": "Shopee Vietnam",
            "location": "Hồ Chí Minh",
            "description": "Phát triển giao diện người dùng với React, TypeScript, Redux. Tối ưu performance và UX.",
            "skills": ["React", "TypeScript", "Redux", "CSS", "HTML", "Jest"],
            "requirements": "Có ít nhất 2 năm kinh nghiệm với React. Hiểu biết về responsive design."
        },
        {
            "id": 3,  # ID đã tồn tại
            "title": "Full Stack Developer (Updated)",
            "company": "Tiki Corporation",
            "location": "Hồ Chí Minh",
            "description": "Updated description for full-stack development.",
            "skills": ["JavaScript", "React", "Vue.js", "Node.js", "Python", "MongoDB", "AWS"],
            "requirements": "Updated requirements for full-stack."
        },
        {
            "id": 7,  # ID mới
            "title": "Mobile Developer Flutter",
            "company": "VNG Corporation",
            "location": "Hồ Chí Minh",
            "description": "Phát triển ứng dụng mobile đa nền tảng với Flutter. Tích hợp APIs và quản lý state.",
            "skills": ["Flutter", "Dart", "Firebase", "REST API", "Git", "Agile"],
            "requirements": "Có ít nhất 1 năm kinh nghiệm với Flutter. Hiểu biết về mobile development best practices."
        }
    ]
    
    try:
        print("📝 Embedding new job descriptions...")
        points = []
        
        for job in duplicate_jobs:
            # Tạo text để embedding
            job_text = f"{job['title']}. {job['description']} Yêu cầu: {job['requirements']} Kỹ năng: {', '.join(job['skills'])}"
            
            print(f"  - Embedding job: {job['title']} (ID: {job['id']})")
            
            # Tạo embedding từ text
            embedding = embedder.encode(job_text)
            
            # Tạo point cho Qdrant
            point = PointStruct(
                id=job['id'],
                vector=embedding.tolist() if hasattr(embedding, 'tolist') else embedding,
                payload={
                    "title": job['title'],
                    "company": job['company'],
                    "location": job['location'],
                    "description": job['description'],
                    "skills": job['skills'],
                    "requirements": job['requirements']
                }
            )
            points.append(point)
        
        # Insert với duplicate checking
        print(f"\n🔍 Checking for duplicates and inserting only new records...")
        qdrant_client.insert_vectors_safe(collection_name, points)
        
        print(f"\n📊 Final collection status:")
        select_data_from_collection(qdrant_client, collection_name, limit=10)
        
    except Exception as e:
        print(f"❌ Error in duplicate prevention test: {e}")


def full_demo():
    """Demo đầy đủ: tạo collection, insert vectors, và search"""
    print("🚀 Starting Qdrant Vector Database Demo...")
    print("=" * 50)
    
    # Step 1: Tạo collection
    print("\n📁 Step 1: Creating collection...")
    qdrant_client = test()
    
    if qdrant_client is None:
        print("❌ Cannot continue without valid connection")
        return
    
    # Step 2: Insert vectors
    print("\n📤 Step 2: Inserting sample vectors...")
    insert_vectors()
    
    # Step 3: Test duplicate prevention
    print("\n🛡️  Step 3: Testing duplicate prevention...")
    test_duplicate_prevention()
    
    # Step 4: Search vectors
    print("\n🔍 Step 4: Searching vectors...")
    search_vectors()
    
    print("\n✅ Demo completed successfully!")


if __name__ == "__main__":
    # Chọn một trong các test dưới đây:
    
    # 1. Test lấy dữ liệu từ collection
    print("🔍 Test 1: Getting existing data from collection")
    print("=" * 50)
    from tool.database import QDrant
    from setting import Settings
    settings = Settings.load_settings()
    qdrant_client = QDrant(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    select_data_from_collection(qdrant_client, "job_descriptions", limit=10)
    
    # 2. Test duplicate prevention
    print("\n\n🛡️  Test 2: Testing duplicate prevention")
    print("=" * 50)
    test_duplicate_prevention()
    
    # 3. Full demo (uncomment để chạy)
    # full_demo()

