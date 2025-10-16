import os
import sys
from pathlib import Path
from supabase import create_client, Client
from typing import List, Dict, Any
import logging
import uuid

# Add AI/backend directory to sys.path for embeddings and setting import
ai_backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(ai_backend_dir))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PostgreSQLClient:
    """
    PostgreSQL client using Supabase for company and job data management with Qdrant embedding capabilities
    """
    def __init__(self, Settings=None):
        """
        Khởi tạo Supabase client và Qdrant client
        Args:
            url: Supabase URL
            key: Supabase anon key
            qdrant_url: Qdrant URL
            qdrant_api_key: Qdrant API key
        """
        # Khởi tạo Supabase
        self.url = Settings.SUPABASE_URL
        self.key = Settings.SUPABASE_ANON_KEY

        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL và SUPABASE_ANON_KEY phải được cung cấp")
            
        self.client: Client = create_client(self.url, self.key)
        logger.info("✅ Supabase client initialized successfully")
        


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
    
    
    def get_job_posting_info_by_id(self, job_posting_id: int) -> Dict[str, Any]:
        """
        Lấy thông tin chi tiết về job posting theo ID sử dụng stored function
        
        Args:
            job_posting_id: ID của job posting cần lấy thông tin
            
        Returns:
            Dict chứa thông tin job posting hoặc None nếu không tìm thấy
            
        Example:
            >>> pg_client = PostgreSQLClient(Settings=settings)
            >>> job_info = pg_client.get_job_posting_info_by_id(1)
            >>> print(job_info['position_name'])
        """
        try:
            logger.info(f"🔍 Fetching job posting info for ID: {job_posting_id}")
            
            # Gọi stored function với tham số
            response = self.client.rpc(
                "get_job_posting_infor_by_id",
                {"p_job_posting_id": job_posting_id}
            ).execute()
            
            # Kiểm tra kết quả
            if response.data and len(response.data) > 0:
                job_data = response.data[0]  # Function trả về array, lấy phần tử đầu tiên
                logger.info(f"✅ Successfully retrieved job posting: {job_data.get('position_name')}")
                
                return self._build_job_posting_text(job_data)
            else:
                logger.warning(f"⚠️ No job posting found with ID: {job_posting_id}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error getting job posting info: {str(e)}")
            return None
    
    
    def get_multiple_job_postings_info(self, job_posting_ids: List[int]) -> List[Dict[str, Any]]:
        """
        Lấy thông tin của nhiều job postings
        
        Args:
            job_posting_ids: List các ID của job posting
            
        Returns:
            List[Dict] chứa thông tin các job postings
        """
        results = []
        for job_id in job_posting_ids:
            job_info = self.get_job_posting_info_by_id(job_id)
            if job_info:
                results.append(job_info)
        
        logger.info(f"✅ Retrieved {len(results)}/{len(job_posting_ids)} job postings")
        return self._build_job_posting_text(results)
    
    def _build_job_posting_text(self, record: Dict[str, Any]) -> str:
        """Build a single descriptive string used for embedding a job posting record."""
        parts: List[str] = []

        position_name = record.get("position_name")
        if position_name:
            parts.append(f"Vị trí tuyển dụng: {position_name}")
        
        job_description = record.get("job_description")
        if job_description:
            parts.append(f"Mô tả công việc: {job_description}")
        
        requirements = record.get("requirements")
        if requirements:
            parts.append(f"Yêu cầu: {requirements}")
        
        salary = record.get("salary")
        if salary:
            parts.append(f"Mức lương: {salary}")

        deadline = record.get("deadline")
        if deadline:
            parts.append(f"Hạn nộp: {deadline}")

        experience_year = record.get("experience_year")
        if experience_year:
            parts.append(f"Kinh nghiệm: {experience_year}")
    
        education_level = record.get("education_level")
        if education_level:
            parts.append(f"Trình độ học vấn: {education_level}")
    
        benefits = record.get("benefits")
        if benefits:
            parts.append(f"Phúc lợi: {benefits}")
    
        working_time = record.get("working_time")
        if working_time:
            parts.append(f"Thời gian làm việc: {working_time}")
    
        name_of_company = record.get("name_of_company")
        if name_of_company:
            parts.append(f"Công ty: {name_of_company}")
        
        industries = record.get("industries")
        if industries:
            parts.append(f"Ngành nghề: {industries}")
    
        skills = record.get("skills")
        if skills:
            parts.append(f"Kỹ năng: {skills}")
        
        addresses = record.get("addresses")
        if addresses:
            parts.append(f"Địa chỉ: {addresses}")
    
        return ". ".join(parts).strip()
        
    

if __name__ == '__main__':
    # Add current directory to path for imports
    current_dir = Path(__file__).resolve().parent.parent.parent
    if str(current_dir) not in sys.path:
        sys.path.insert(0, str(current_dir))
    from setting import Settings
    from app.chatbot.AgentKatCoder import AgentKatCoder
    from prompt.promt_config import PromptConfig
    
    

    settings = Settings.load_settings()
    pg_client = PostgreSQLClient(Settings=settings)
    client = AgentKatCoder()

    job_info = pg_client.get_job_posting_info_by_id(11)
    prompt = PromptConfig().get_prompt("evaluate_jd", user_input=job_info)

    result = client.generate_content([{"role": "user", "content": prompt}])

    print(result)






