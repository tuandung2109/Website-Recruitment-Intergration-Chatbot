import fitz
import sys
import os

# Add the backend directory to Python path for clean imports
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from setting import Settings
from tool.database.postgest import PostgreSQLClient
from app.chatbot.AgentKatCoder import AgentKatCoder  

if __name__ == "__main__":
    settings = Settings.load_settings()
    agent = AgentKatCoder(Settings=settings)
    print(agent.handle_ai_evaluation_based_on_features(2, 12, None, 82))
    