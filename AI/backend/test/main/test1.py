
import sys
from pathlib import Path
import numpy as np
import qdrant_client
from qdrant_client.models import PointStruct

# Add backend to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))




if __name__ == "__main__":

    print("🔍 Test 1: Getting existing data from collection")
    print("=" * 50)
    from tool.database import QDrant
    from setting import Settings
    settings = Settings.load_settings()
    qdrant_client = QDrant(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )
    print("QDrant client:", qdrant_client.get_data_from_collection('job_descriptions'))
    print(qdrant_client.list_collections())
    
    
   

