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
        result_by_key = mongo_client.read_documents(
                "job_match_cv", 
                filter_query={"id": "63ba246606b8152936eab39ec5abb3b6cf3b35552dc3fe413e1c1159bfd86747"}
            )
        print(result_by_key)
 
        
    except Exception as e:
        print(f"Error initializing MongoDBClient: {e}")

        
   