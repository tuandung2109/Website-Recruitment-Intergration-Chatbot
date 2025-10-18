from pymongo.mongo_client import MongoClient
import sys
import os
from pathlib import Path


from pymongo.mongo_client import MongoClient
from pymongo.collection import Collection
from typing import Dict, Any, List, Optional


class MongoDBClient:
    def __init__(self, Settings=None):
        if Settings is None:
            raise ValueError("Settings must be provided to initialize MongoDBClient")

        self.client = MongoClient(Settings.MONGO_DB_URI)
        self.database = self.client[Settings.DATABASE_MONGO_NAME]

    def get_collection(self, collection_name: str) -> Collection:
        """Lấy 1 collection cụ thể"""
        return self.database[collection_name]

    # ===============================
    # CRUD FUNCTIONS
    # ===============================

    def create_document(self, collection_name: str, data: Dict[str, Any]) -> str:
        """Thêm 1 document mới"""
        collection = self.get_collection(collection_name)
        result = collection.insert_one(data)
        return str(result.inserted_id)

    def read_documents(
        self,
        collection_name: str,
        filter_query: Optional[Dict[str, Any]] = None,
        projection: Optional[Dict[str, int]] = None,
        limit: int = 0,
        sort: Optional[List[tuple]] = None,
    ) -> List[Dict[str, Any]]:
        """Đọc dữ liệu từ collection"""
        collection = self.get_collection(collection_name)
        cursor = collection.find(filter_query or {}, projection)
        if sort:
            cursor = cursor.sort(sort)
        if limit > 0:
            cursor = cursor.limit(limit)
        return list(cursor)

    def update_document(
        self,
        collection_name: str,
        filter_query: Dict[str, Any],
        update_values: Dict[str, Any],
        many: bool = False,
    ) -> int:
        """Cập nhật document (một hoặc nhiều)"""
        collection = self.get_collection(collection_name)
        update_op = {"$set": update_values}
        if many:
            result = collection.update_many(filter_query, update_op)
        else:
            result = collection.update_one(filter_query, update_op)
        return result.modified_count

    def delete_document(
        self, collection_name: str, filter_query: Dict[str, Any], many: bool = False
    ) -> int:
        """Xóa document (một hoặc nhiều)"""
        collection = self.get_collection(collection_name)
        if many:
            result = collection.delete_many(filter_query)
        else:
            result = collection.delete_one(filter_query)
        return result.deleted_count

    def close_connection(self):
        self.client.close()
        print("MongoDB connection closed.")


def _ensure_settings_importable():
    """Ensure that the parent AI/backend directory is on sys.path so local imports work

    This helps when running this file directly (python mongodb.py) from the workspace
    where the package modules (like `setting`) live one or two levels up.
    """
    # Current file: AI/backend/tool/database/mongodb.py
    current = Path(__file__).resolve()
    # Add AI/backend to sys.path (two levels up from this file -> AI/backend)
    ai_backend_dir = current.parents[2]
    if str(ai_backend_dir) not in sys.path:
        sys.path.insert(0, str(ai_backend_dir))


if __name__ == "__main__":
    try:
        _ensure_settings_importable()
        # Import Settings after ensuring path
        from setting import Settings

        # # If Settings is a class with load_settings method, try to get instance
        try:
            settings = Settings.load_settings() if hasattr(Settings, "load_settings") else Settings
        except Exception:
            settings = Settings

        mongo_client = MongoDBClient(Settings=settings)
        collection = mongo_client.get_collection("recruitment website intergrate ai")
 
        
        from tool.database.postgest import PostgreSQLClient
        
        from tool import generate_evaluation_key
        pg_client = PostgreSQLClient(Settings=Settings.load_settings())
        job_description = pg_client.get_job_posting_info_by_id(1)
        key = generate_evaluation_key(job_description)
        # print(f"Generated Evaluation Key: {key}")
        
    
        # print("Job Description:")
        print(job_description)
        
        # Insert evaluation data into MongoDB
        evaluation_data = {
            "key": key,
            "id": 1,
            "overallScore": 74,
            "scores": {
                "clarity": 80,
                "completeness": 70,
                "attractiveness": 65,
                "seo": 75,
                "inclusivity": 80
            },
            "strengths": [
                {
                    "category": "Mô tả công việc",
                    "point": "Mô tả công việc rõ ràng, nêu rõ nhiệm vụ chính là dạy lập trình Python",
                    "icon": "✓"
                },
                {
                    "category": "Thông tin lương",
                    "point": "Đã công khai mức lương cụ thể (15000), tăng tính minh bạch và đáng tin cậy",
                    "icon": "✓"
                },
                {
                    "category": "Kỹ năng yêu cầu",
                    "point": "Liệt kê các kỹ năng kỹ thuật như Java, Python, SQL giúp ứng viên tự đánh giá năng lực",
                    "icon": "✓"
                }
            ],
            "improvements": [
                {
                    "category": "Tiêu đề",
                    "issue": "Tiêu đề đơn giản và chưa đủ hấp dẫn",
                    "suggestion": "Thêm mô tả thu hút như 'Giáo viên Online Python - Cơ hội làm việc linh hoạt'",
                    "priority": "medium",
                    "example": "\"Giáo viên Online\" → \"Giáo viên Online Python - Remote Flexible\""
                },
                {
                    "category": "Mô tả công ty",
                    "issue": "Thiếu thông tin về văn hóa và sứ mệnh của công ty EduSoft",
                    "suggestion": "Bổ sung đoạn giới thiệu ngắn về văn hóa giảng dạy, sứ mệnh giáo dục và giá trị của công ty",
                    "priority": "high",
                    "example": "Thêm: 'EduSoft hướng đến xây dựng thế hệ lập trình viên sáng tạo và tự tin chinh phục công nghệ mới.'"
                },
                {
                    "category": "Quyền lợi",
                    "issue": "Phúc lợi mô tả quá chung chung ('Lương thưởng hấp dẫn')",
                    "suggestion": "Cụ thể hóa bằng số liệu hoặc ví dụ thực tế",
                    "priority": "high",
                    "example": "Thay vì 'Lương thưởng hấp dẫn' → 'Thưởng theo hiệu suất giảng dạy, lên đến 2 tháng lương/năm'"
                },
                {
                    "category": "Từ khóa SEO",
                    "issue": "Chưa có các từ khóa liên quan đến 'remote', 'career growth', 'flexible schedule'",
                    "suggestion": "Bổ sung các từ khóa phổ biến trong ngành giáo dục và công nghệ",
                    "priority": "medium",
                    "example": "Thêm: 'Làm việc linh hoạt, môi trường giảng dạy hiện đại, cơ hội phát triển sự nghiệp'"
                },
                {
                    "category": "Call-to-Action",
                    "issue": "Không có lời kêu gọi hành động rõ ràng ở cuối JD",
                    "suggestion": "Thêm câu khuyến khích ứng viên nộp hồ sơ",
                    "priority": "low",
                    "example": "Thêm: 'Nếu bạn yêu thích giảng dạy và công nghệ, hãy gia nhập đội ngũ EduSoft ngay hôm nay!'"
                }
            ],
            "keywordAnalysis": {
                "missing": ["remote", "flexible", "career growth", "online teaching tools"],
                "overused": ["yêu cầu", "lập trình"],
                "recommended": ["innovation", "education technology", "learning experience"]
            },
            "competitorComparison": {
                "betterThan": 60,
                "avgSalary": "Tương đương mặt bằng chung của thị trường giáo dục công nghệ",
                "responseRate": "Dự đoán: 5-8 ứng viên phù hợp trong 7 ngày đầu"
            }
        }
        
        # Insert the evaluation data into MongoDB
        try:
            document_id = mongo_client.create_document("recruitment website intergrate ai", evaluation_data)
            print(f"Successfully inserted evaluation data with ID: {document_id}")
        except Exception as insert_error:
            print(f"Error inserting evaluation data: {insert_error}")
        
        # Query data examples
        print("\n=== QUERY EXAMPLES ===")
        
        # 1. Select by key
        print(f"\n1. Select by key = '{key}':")
        try:
            result_by_key = mongo_client.read_documents(
                "recruitment website intergrate ai", 
                filter_query={"key": key}
            )
            if result_by_key:
                print(result_by_key)
            else:
                print(f"No documents found with key '{key}'")
        except Exception as e:
            print(f"Error querying by key: {e}")
            
        
        
        

        
    #     # 3. Select by both key and id
    #     print(f"\n3. Select by both key = '{key}' AND id = 1:")
    #     try:
    #         result_by_both = mongo_client.read_documents(
    #             "recruitment website intergrate ai", 
    #             filter_query={"key": key, "id": 1}
    #         )
    #         if result_by_both:
    #             print(f"Found {len(result_by_both)} document(s) with both conditions")
    #             for doc in result_by_both:
    #                 print(f"   - Document _id: {doc.get('_id')}")
    #                 print(f"   - Key: {doc.get('key')}")
    #                 print(f"   - ID: {doc.get('id')}")
    #                 print(f"   - Overall Score: {doc.get('overallScore')}")
    #         else:
    #             print("No documents found with both conditions")
    #     except Exception as e:
    #         print(f"Error querying by both key and id: {e}")
        
    #     # 4. Select all documents (limited to 5)
    #     print(f"\n4. Select all documents (limited to 5):")
    #     try:
    #         all_docs = mongo_client.read_documents(
    #             "recruitment website intergrate ai", 
    #             limit=5
    #         )
    #         print(f"Found {len(all_docs)} documents:")
    #         for i, doc in enumerate(all_docs, 1):
    #             print(f"   {i}. _id: {doc.get('_id')}, key: {doc.get('key')}, id: {doc.get('id')}")
    #     except Exception as e:
    #         print(f"Error querying all documents: {e}")
        
    #     # 5. Select with projection (only specific fields)
    #     print(f"\n5. Select only key, id, and overallScore fields:")
    #     try:
    #         projected_docs = mongo_client.read_documents(
    #             "recruitment website intergrate ai",
    #             projection={"key": 1, "id": 1, "overallScore": 1, "_id": 0},
    #             limit=3
    #         )
    #         print(f"Found {len(projected_docs)} documents (projected):")
    #         for i, doc in enumerate(projected_docs, 1):
    #             print(f"   {i}. {doc}")
    #     except Exception as e:
    #         print(f"Error with projection query: {e}")
        
    except Exception as e:
        print(f"Error during MongoDBClient test: {e}")