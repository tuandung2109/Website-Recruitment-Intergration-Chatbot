import fitz
import sys
import os

# Add the backend directory to Python path for clean imports
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from setting import Settings
from tool.database.postgest import PostgreSQLClient

if __name__ == "__main__":
    pg_client = PostgreSQLClient(Settings=Settings.load_settings())
    information = pg_client.get_cv_job_detail(4,2,2)
    job_description = []
    job_description.append("Vị trí: " + information['position_name'])
    job_description.append("Mô tả công việc: " + information['job_description'])
    job_description.append("Yêu cầu: " + information['requirements'])
    job_description.append("Kinh nghiệm: " + str(information['experience_years'] + " năm"))
    job_description.append("Trình độ học vấn: " + information['education_level'])
    job_description.append("Kỹ năng: " + information['skills'])

    
    print("Job Description:")
    print("\n".join(job_description))