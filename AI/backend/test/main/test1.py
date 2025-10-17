import fitz

from AI.backend.setting import Settings  # PyMuPDF

if __name__ == "__main__":
    from tool.database.postgest import PostgreSQLClient
    pg_client = PostgreSQLClient(Settings=Settings.load_settings())
    job_description = pg_client.get_job_posting_info_by_id(1)
    
    print("Job Description:")
    print(job_description)