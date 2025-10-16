

import re
import json
from transformers import pipeline
from typing import List, Set, Literal



def get_similarity_job_by_skills(filePath: str, use_kat_coder: bool = False):
    """
    Extract skills from CV and find similar jobs
    
    Args:
        filePath (str): Path to the CV PDF file
        use_kat_coder (bool): If True, use AgentKatCoder. If False, use AgentOllama (default)
    
    Returns:
        dict: Result with intent and extracted features (skills and jobs)
    """
    import sys
    import os
    import json
    
    # Add the backend directory to the Python path if not already there
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    
    import tool.pdf_to_text as pdf_to_text
    from tool.database.qdrant import QDrant
    from setting import Settings
    from qdrant_client.models import Filter, FieldCondition, MatchValue
    
    # Import appropriate agent based on parameter
    if use_kat_coder:
        from app.chatbot.AgentKatCoder import AgentKatCoder
        print("🔧 Using AgentKatCoder for skill extraction")
        client = AgentKatCoder()
    else:
        from app.chatbot.AgentOllama import AgentOllama
        print("🔧 Using AgentOllama for skill extraction")
        client = AgentOllama()

    # Extract text from CV
    cv = pdf_to_text.extract_text_from_pdf(filePath)
    
    # Get prompt for skill extraction
    classification_prompt = client.prompt_config.get_prompt("extract_features_cv", user_input=cv)
    
    # Extract skills using the selected agent
    # Use generate_content method which works for both agents
    skills = client._strip_think(client.generate_content([{"role": "user", "content": classification_prompt}]))
    if not skills:
        print("[WARN] No skills found")
        return {
            "intent": "job-suggestions",
            "extracted_features": {
                "success": False,
                "skills": [],
                "jobs": [],
                "total_jobs": 0,
                "total_skills": 0,
                "error": "No skills extracted from CV"
            }
        }

    # Use QDrant to find similar jobs
    settings = Settings().load_settings()
    qdrant = QDrant(Settings=settings)
    similar_jobs = qdrant.search_vectors_with_filter(
        settings,
        " ".join(skills),
        "entities",
        top_k=5,
        filter=Filter(
            must=[
                FieldCondition(
                    key="entity_type",
                    match=MatchValue(value="skill")
                ),
            ]
        )
    )
    
    # Parse skills from JSON string to list
    try:
        skills_data = json.loads(skills)
        skills_list = skills_data.get("skills", [])
    except json.JSONDecodeError:
        skills_list = []
    
    # Format job postings for frontend
    job_postings = []
    for res in similar_jobs:
        payload = res.payload
        if payload:
            job_postings.append({
                "id": payload.get("job_posting_id"),
                "position_name": payload.get("position_name"),
                "company_name": payload.get("name_of_company"),
                "job_description": payload.get("job_description"),
                "requirements": payload.get("requirements"),
                "salary": payload.get("salary"),
                "deadline": payload.get("deadline"),
                "education_level": payload.get("education_level"),
                "benefits": payload.get("benefits"),
                "working_time": payload.get("working_time"),
                "industries": payload.get("industries"),
                "skills": payload.get("skills"),
                "addresses": payload.get("addresses"),
                "match_score": round(res.score * 100, 2)  # Convert to percentage
            })
    
    # Return format compatible with agentController
    return {
        "intent": "job-suggestions",
        "extracted_features": {
            "success": True,
            "skills": skills_list,
            "jobs": job_postings,
            "total_jobs": len(job_postings),
            "total_skills": len(skills_list)
        }
    }


def get_similarity_job_by_skills_with_agent(filePath: str, agent_type: Literal["ollama", "katcoder"] = "ollama"):
    """
    Convenience wrapper for get_similarity_job_by_skills with named agent types
    
    Args:
        filePath (str): Path to the CV PDF file
        agent_type (Literal["ollama", "katcoder"]): Agent type to use ("ollama" or "katcoder")
    
    Returns:
        dict: Result with intent and extracted features (skills and jobs)
    
    Example:
        # Using Ollama
        result = get_similarity_job_by_skills_with_agent("cv.pdf", "ollama")
        
        # Using KatCoder
        result = get_similarity_job_by_skills_with_agent("cv.pdf", "katcoder")
    """
    use_kat_coder = (agent_type.lower() == "katcoder")
    return get_similarity_job_by_skills(filePath, use_kat_coder=use_kat_coder)


if __name__ == "__main__":
    print("Testing NER Skill Extraction")
    
    # OPTION 1: Use boolean parameter
    # You can change this to test different agents
    USE_KAT_CODER = False  # Set to True to use AgentKatCoder, False for AgentOllama
    
    print(f"\n{'='*80}")
    print(f"🤖 Testing with: {'AgentKatCoder' if USE_KAT_CODER else 'AgentOllama'}")
    print(f"{'='*80}\n")

    result = get_similarity_job_by_skills(
        "E:\\Githup Projects\\Website-Recruitment-Intergration-Chatbot\\AI\\backend\\uploads\\99090b0a-7eda-4d37-8634-8c99d2bd4080_cv.pdf",
        use_kat_coder=USE_KAT_CODER
    )
    
    # OPTION 2: Use named agent type (alternative)
    # result = get_similarity_job_by_skills_with_agent(
    #     "C:\\Users\\myth\\Downloads\\CV_LuuKienTruong_ThucTapSinhAndroidDeveloper.pdf",
    #     agent_type="ollama"  # or "katcoder"
    # )

    # Extract data from result
    intent = result.get('intent')
    features = result.get('extracted_features', {})
    
    # Pretty print the result
    print("\n" + "="*80)
    print("📊 RESULT SUMMARY")
    print("="*80)
    print(f"\n🎯 Intent: {intent}")
    print(f"✅ Success: {features.get('success')}")
    print(f"📝 Total Skills Extracted: {features.get('total_skills')}")
    print(f"💼 Total Jobs Found: {features.get('total_jobs')}")
    
    print("\n" + "-"*80)
    print("🎯 EXTRACTED SKILLS")
    print("-"*80)
    for i, skill in enumerate(features.get('skills', []), 1):
        print(f"{i:2d}. {skill}")
    
    print("\n" + "-"*80)
    print("💼 MATCHING JOBS")
    print("-"*80)
    for i, job in enumerate(features.get('jobs', []), 1):
        print(f"\n{i}. {job['position_name']} - {job['company_name']}")
        print(f"   Match Score: {job['match_score']}%")
        print(f"   Salary: {job['salary']:,} VND")
        print(f"   Skills Required: {job['skills']}")
        print(f"   Location: {job['addresses']}")
    
    print("\n" + "="*80)
    print("\n📦 Full JSON Output (Format for Frontend):")
    print(json.dumps(result, indent=2, ensure_ascii=False))
