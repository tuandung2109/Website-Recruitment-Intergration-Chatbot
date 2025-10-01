import os
import sys
import json
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from tool.database.postgest import PostgreSQLClient  
from setting import Settings  



if __name__ == "__main__":
    settings = Settings.load_settings()

    pg_client = PostgreSQLClient(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    print(pg_client.get_companies_with_industries(limit=10))
   
