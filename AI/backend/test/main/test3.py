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


def cosine_similarity(vec1, vec2):
    from numpy import dot
    from numpy.linalg import norm
    return dot(vec1, vec2) / (norm(vec1) * norm(vec2))


if __name__ == "__main__":
    from llms.llm_manager import llm_manager
    # settings = Settings.load_settings()
    # embedding_model = llm_manager.get_embedding_model(settings.EMBEDDING_MODE)
    # if embedding_model is None:
    #     print("❌ Embedding model not available for search")
    #     sys.exit(1)
    # embedding_1 = embedding_model.encode("Tôi muốn xây dựng một chatbot hỗ trợ trả lời câu hỏi tự động.")
    # embedding_2 = embedding_model.encode("Tôi đang cần tạo một chatbot để tự động trả lời các thắc mắc của người dùng")
    # similarity = cosine_similarity(embedding_1, embedding_2)
    # print(f"Cosine similarity: {similarity}")
    agent = AgentKatCoder()
    jd = "Mô tả công việc Develop and maintain 2D/3D mobile games using Unity; Collaborate closely with Game Designers, Artists, and PMs, combining diverse strengths to achieve shared milestones;\nEnsure game builds meet Google Play and App Store requirements, including submission and compliance;\nSupport post-launch updates: bug fixing, improvements, and live-ops events;\nResearch and apply new technologies/trends to enhance product quality and scalability for the global market;\nTake ownership of assigned features and feel proud of delivering high-quality gameplay experiences to global players;\nPrioritize impactful tasks, maintain work discipline, and ensure efficient delivery of game features that matter most to the project and players.\nYêu cầu ứng viên\nAround 3 years of experience in developing mobile games with Unity;\nPortfolio/demo projects (published titles, personal games, etc.);\nSolid knowledge of Unity & C#, OOP, and common design patterns (MVC, MVP, Singleton, Observer);\nExperience integrating third-party SDKs (AdMob, Firebase, IAP, Analytics);\nComfortable working with 2D/3D assets and implementing animations, lighting, and effects;\nGood understanding of the mobile game market and current trends;\nExperience with Git/GitHub (or similar version control systems);\nExperience submitting apps to Google Play/App Store is a plus;\nKnowledge of multiplayer/networking (Photon, PlayFab, Netcode) is a plus;\nAbility to read and write in English;\nSoft skills: detail-oriented, good time management, teamwork, and problem-solving mindset.\nQuyền lợi\nOpportunities to work with international and experienced talents;\nAttractive compensation and benefits package;\n15 annual leave days;\nMeal allowance;\nFree parking;\nComplimentary coffee and tea at the office;\nRegular company lunches/dinners;\nBirthday gifts;\nBoard games and team-building activities."
    print(agent.extract_features_cv_and_jd("C:\\Users\\thanh\\Downloads\\NGUYEN THE THANH (1).pdf", jd))


    