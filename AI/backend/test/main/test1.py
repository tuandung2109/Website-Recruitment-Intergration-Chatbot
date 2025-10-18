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
    job_description = pg_client.get_job_posting_info_by_id(1)
    
    print("Job Description:")
    print(job_description)