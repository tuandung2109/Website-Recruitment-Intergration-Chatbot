# Quick Start Guide - CV-JD Matcher

## 🚀 Quick Test (5 minutes)

### 1. Start Backend (Terminal 1)
```bash
cd "E:\Fork Projects\Website-Recruitment-Intergration-Chatbot"
& "E:/Fork Projects/Website-Recruitment-Intergration-Chatbot/.venv/Scripts/python.exe" AI/backend/app/main2.py
```

Wait for: `✅ Models preloaded successfully!`

### 2. Test API (Terminal 2 - Optional)
```bash
cd "E:\Fork Projects\Website-Recruitment-Intergration-Chatbot"
& "E:/Fork Projects/Website-Recruitment-Intergration-Chatbot/.venv/Scripts/python.exe" AI/backend/test/main/test_api_cv_jd_match.py
```

**Note:** Update `CV_FILE_PATH` in the test script first!

### 3. Start Frontend (Terminal 3)
```bash
cd "E:\Fork Projects\Website-Recruitment-Intergration-Chatbot\front-end"
npm start
```

### 4. Use the Feature
1. Open: http://localhost:3000/cv-job-matcher
2. Upload CV (PDF only)
3. Paste job description
4. Click "Start Scanning"
5. View results!

## 🔍 What Was Fixed

**Original Error:**
```
ERROR:root:Error extracting features from CV and JD: 'cv'
```

**Root Cause:**
The code was parsing the wrong JSON response - it used the evaluation score instead of the extracted features.

**Solution:**
- Fixed parsing logic in `AgentKatCoder.py`
- Created new API endpoint `/api/evaluate/cv-jd-match`
- Connected React frontend to the API
- Transformed data format for frontend compatibility

## 📊 Example Results

**Input:**
- CV: Software Engineering student with Unity internship
- JD: Unity Game Developer with 3 years experience

**Output:**
- Skills: 7.1/10 (70.9% similarity)
- Education: 2.5/10 (25.4% similarity)
- Position: 6.3/10 (63.3% similarity)
- Experience: 4.5/10 (44.8% similarity)
- General: 4.0/10 (40.4% similarity)

Plus detailed analysis, strengths, weaknesses, interview questions, and skill matching!

## 🛠️ Key Files Changed

1. **Backend Logic:** `AI/backend/app/chatbot/AgentKatCoder.py`
   - Fixed JSON parsing bug
   - Added validation and logging

2. **Backend API:** `AI/backend/app/main2.py`
   - New endpoint: `POST /api/evaluate/cv-jd-match`
   - Handles file upload and processing

3. **Frontend:** `front-end/src/pages/EvaluateCV/CVJobMatcher.js`
   - Connected to real API
   - Removed mock data

4. **Test Script:** `AI/backend/test/main/test_api_cv_jd_match.py`
   - API testing tool

## ⚡ API Quick Reference

**Endpoint:** `POST http://localhost:5000/api/evaluate/cv-jd-match`

**Request:**
```bash
curl -X POST http://localhost:5000/api/evaluate/cv-jd-match \
  -F "cv_file=@cv.pdf" \
  -F "job_description=Develop Unity games..." \
  -F "job_title=Game Developer"
```

**Response:**
```json
{
  "status": "success",
  "skill": 7.1,
  "education": 2.5,
  "position": 6.3,
  "experiences": 4.5,
  "general": 4.0,
  "weak": "...",
  "strong": "...",
  "skill_matches": [...]
}
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python environment
& "E:/Fork Projects/Website-Recruitment-Intergration-Chatbot/.venv/Scripts/python.exe" --version

# Install dependencies
pip install -r AI/requirements.txt
```

### Frontend won't start
```bash
cd front-end
npm install
npm start
```

### CORS errors
- Backend CORS is configured for `localhost:3000`
- Check console for error details

### API not responding
- Verify backend is running on port 5000
- Check: http://localhost:5000/health

### File upload fails
- Only PDF files supported
- Max 5MB file size
- Check file permissions

## 📚 Documentation

- **Full Guide:** `AI/INTEGRATION_GUIDE.md`
- **Summary:** `INTEGRATION_SUMMARY.md`
- **Test Results:** Run test script, check `api_response.json`

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Can access http://localhost:5000/health
- [ ] Frontend starts and opens in browser
- [ ] Can upload PDF file
- [ ] Can paste job description
- [ ] "Start Scanning" button works
- [ ] Results display correctly
- [ ] Scores are in 0-10 range
- [ ] Skill matches show up

## 🎯 Demo Data

**Sample Job Description:**
```
Develop and maintain 2D/3D mobile games using Unity
Around 3 years of experience in developing mobile games with Unity
Solid knowledge of Unity & C#, OOP, and common design patterns
Experience integrating third-party SDKs (AdMob, Firebase, IAP)
```

**Expected Behavior:**
- Upload any software engineer CV
- Paste the JD above
- Click "Start Scanning"
- See evaluation results with similarity scores

That's it! The integration is complete and ready to use. 🎉
