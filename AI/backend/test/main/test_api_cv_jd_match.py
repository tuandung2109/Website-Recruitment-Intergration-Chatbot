"""
Test script for the CV-JD Match API endpoint
"""
import requests
import sys
import os

# Test configuration
API_URL = "http://localhost:5000/api/evaluate/cv-jd-match"
CV_FILE_PATH = r"C:\Users\thanh\Downloads\NGUYEN THE THANH (1).pdf"

JD_TEXT = """Mô tả công việc
Develop and maintain 2D/3D mobile games using Unity;
Collaborate closely with Game Designers, Artists, and PMs, combining diverse strengths to achieve shared milestones;
Ensure game builds meet Google Play and App Store requirements, including submission and compliance;
Support post-launch updates: bug fixing, improvements, and live-ops events;
Research and apply new technologies/trends to enhance product quality and scalability for the global market;
Take ownership of assigned features and feel proud of delivering high-quality gameplay experiences to global players;
Prioritize impactful tasks, maintain work discipline, and ensure efficient delivery of game features that matter most to the project and players.

Yêu cầu ứng viên
Around 3 years of experience in developing mobile games with Unity;
Portfolio/demo projects (published titles, personal games, etc.);
Solid knowledge of Unity & C#, OOP, and common design patterns (MVC, MVP, Singleton, Observer);
Experience integrating third-party SDKs (AdMob, Firebase, IAP, Analytics);
Comfortable working with 2D/3D assets and implementing animations, lighting, and effects;
Good understanding of the mobile game market and current trends;
Experience with Git/GitHub (or similar version control systems);
Experience submitting apps to Google Play/App Store is a plus;
Knowledge of multiplayer/networking (Photon, PlayFab, Netcode) is a plus;
Ability to read and write in English;
Soft skills: detail-oriented, good time management, teamwork, and problem-solving mindset.

Quyền lợi
Opportunities to work with international and experienced talents;
Attractive compensation and benefits package;
15 annual leave days;
Meal allowance;
Free parking;
Complimentary coffee and tea at the office;
Regular company lunches/dinners;
Birthday gifts;
Board games and team-building activities."""

def test_api():
    """Test the CV-JD Match API endpoint"""
    
    # Check if CV file exists
    if not os.path.exists(CV_FILE_PATH):
        print(f"❌ CV file not found: {CV_FILE_PATH}")
        print("Please update CV_FILE_PATH in the script to point to a valid PDF file")
        return
    
    print(f"📄 Testing API with CV: {CV_FILE_PATH}")
    print(f"🔗 API Endpoint: {API_URL}")
    print("⏳ Sending request...")
    
    try:
        # Prepare the request
        with open(CV_FILE_PATH, 'rb') as cv_file:
            files = {
                'cv_file': (os.path.basename(CV_FILE_PATH), cv_file, 'application/pdf')
            }
            data = {
                'job_description': JD_TEXT,
                'job_title': 'Unity Mobile Game Developer'
            }
            
            # Send the request
            response = requests.post(API_URL, files=files, data=data)
        
        # Check response
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!\n")
            
            # Print key results
            print("=" * 80)
            print("📈 SIMILARITY SCORES (0-10 scale)")
            print("=" * 80)
            print(f"Skills:      {result.get('skill', 0):.1f}/10")
            print(f"Education:   {result.get('education', 0):.1f}/10")
            print(f"Position:    {result.get('position', 0):.1f}/10")
            print(f"Experience:  {result.get('experiences', 0):.1f}/10")
            print(f"General:     {result.get('general', 0):.1f}/10")
            
            print("\n" + "=" * 80)
            print("💪 STRENGTHS")
            print("=" * 80)
            print(result.get('strong', 'N/A')[:300] + "...")
            
            print("\n" + "=" * 80)
            print("⚠️  WEAKNESSES")
            print("=" * 80)
            print(result.get('weak', 'N/A')[:300] + "...")
            
            print("\n" + "=" * 80)
            print("🎯 SKILL MATCHES")
            print("=" * 80)
            skill_matches = result.get('skill_matches', [])
            for i, match in enumerate(skill_matches[:3], 1):  # Show first 3
                print(f"\n{i}. {match.get('name', 'N/A')}")
                print(f"   Status: {match.get('status', 'N/A')}")
                print(f"   Evidence: {match.get('evidence', 'N/A')[:100]}...")
            
            if len(skill_matches) > 3:
                print(f"\n   ... and {len(skill_matches) - 3} more skill matches")
            
            print("\n" + "=" * 80)
            print(f"✅ Full response saved to 'api_response.json'")
            
            # Save full response to file
            import json
            with open('api_response.json', 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
                
        else:
            error_data = response.json()
            print(f"❌ API Error: {error_data.get('error', 'Unknown error')}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Failed to connect to the API server")
        print("   Make sure the Flask server is running on http://localhost:5000")
        print("   Run: python AI/backend/app/main2.py")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_api()
