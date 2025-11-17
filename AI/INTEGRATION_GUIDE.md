# CV-JD Match Integration Guide

## Overview
This integration connects the Python backend (`extract_features_cv_and_jd` method) with the React frontend (`CVJobMatcherResult` component) through a REST API endpoint.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│  React Frontend │  HTTP   │  Flask API       │  Call   │  AgentKatCoder      │
│  CVJobMatcher   │ ──────> │  /api/evaluate/  │ ──────> │  extract_features_  │
│                 │         │  cv-jd-match     │         │  cv_and_jd()        │
└─────────────────┘         └──────────────────┘         └─────────────────────┘
```

## API Endpoint

### POST `/api/evaluate/cv-jd-match`

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `cv_file` (file): PDF file of the CV
  - `job_description` (text): Job description text
  - `job_title` (text, optional): Job title

**Response:**
```json
{
  "status": "success",
  "job_title": "Unity Mobile Game Developer",
  "skill": 7.1,
  "education": 2.5,
  "position": 6.3,
  "experiences": 4.5,
  "general": 4.0,
  "weak": "Limited professional experience...",
  "strong": "Strong technical aptitude...",
  "interview_question": "Can you describe...",
  "detail_analysis": "Candidate shows...",
  "created_at": "2025-08-27T10:15:30Z",
  "skill_matches": [
    {
      "name": "Unity Development",
      "status": "partial",
      "jobRequirement": "Around 3 years...",
      "evidence": "Unity Intern Developer...",
      "recommendation": "Gain more experience..."
    }
  ],
  "raw_similarity_scores": {
    "skills": 0.7089,
    "education": 0.2540,
    "experience": 0.4476,
    "positions": 0.6331,
    "general": 0.4038
  },
  "extracted_features": {
    "cv": {
      "skills": ["Python", "C#", "JavaScript"],
      "education": ["Bachelor of Software Engineering"],
      "positions": ["AI Intern", "Unity Intern Developer"],
      "experience": ["Developed sentiment classification model..."]
    },
    "jd": {
      "skills": ["Unity", "C#", "OOP"],
      "education": [],
      "positions": ["Unity Game Developer"],
      "experience": ["Around 3 years of experience..."]
    }
  },
  "timestamp": 1700000000.0
}
```

## Backend Implementation

### File: `AI/backend/app/main2.py`

The new endpoint `/api/evaluate/cv-jd-match`:
1. Accepts CV file upload and job description
2. Saves CV temporarily
3. Calls `AgentKatCoder.extract_features_cv_and_jd(filepath, jd)`
4. Transforms similarity scores from 0-1 to 0-10 scale
5. Returns formatted response
6. Cleans up temporary file

### File: `AI/backend/app/chatbot/AgentKatCoder.py`

Method `extract_features_cv_and_jd(filepath, jd)`:
1. Extracts text from CV PDF
2. Generates two prompts:
   - `intent_job_matcher`: Returns evaluation analysis
   - `intent_extract_features_for_evaluation`: Returns structured features
3. Calculates cosine similarity between CV and JD embeddings for:
   - Skills
   - Education
   - Experience
   - Positions
   - General (full text)
4. Returns combined result with scores and analysis

## Frontend Implementation

### File: `front-end/src/pages/EvaluateCV/CVJobMatcher.js`

Updated `handleStartScanning()` to:
1. Create FormData with CV file and job description
2. POST to `/api/evaluate/cv-jd-match`
3. Handle success/error responses
4. Pass result to `CVJobMatcherResult` component

### File: `front-end/src/pages/EvaluateCV/CVJobMatcherResult.js`

Component expects data format:
- Scores: `skill`, `education`, `position`, `experiences`, `general` (0-10 scale)
- Text: `weak`, `strong`, `interview_question`, `detail_analysis`
- Array: `skill_matches` with status indicators

## Testing

### Backend Test

```bash
# Test the method directly
python AI/backend/test/main/test3.py

# Test the API endpoint
python AI/backend/test/main/test_api_cv_jd_match.py
```

### Start Backend Server

```bash
cd AI/backend/app
python main2.py
```

Server runs on: `http://localhost:5000`

### Start Frontend

```bash
cd front-end
npm start
```

Frontend runs on: `http://localhost:3000`

Navigate to: `http://localhost:3000/cv-job-matcher`

## Data Flow

1. **User uploads CV** → `CVJobMatcher` component stores file
2. **User enters JD** → `CVJobMatcher` component stores text
3. **User clicks "Start Scanning"** → `handleStartScanning()` called
4. **API Request** → FormData sent to Flask endpoint
5. **Backend Processing**:
   - Save CV temporarily
   - Extract text from PDF
   - Generate LLM prompts
   - Get evaluation analysis
   - Extract structured features
   - Calculate embedding similarities
   - Transform scores (0-1 → 0-10)
6. **API Response** → JSON with scores + analysis
7. **Frontend Display** → `CVJobMatcherResult` renders results
8. **Cleanup** → Temporary CV file deleted

## Key Features

- ✅ Real-time CV analysis against job descriptions
- ✅ Similarity scoring for skills, education, experience, positions
- ✅ AI-generated strengths and weaknesses
- ✅ Interview question suggestions
- ✅ Detailed skill matching with status indicators
- ✅ Automatic file cleanup
- ✅ Error handling at all levels

## Configuration

### Backend Settings (AI/backend/setting.py)

- `MODE_KAT_CODER`: LLM model to use
- `EMBEDDING_MODE`: Embedding model for similarity calculation
- `BASE_URL_OPENAI`: OpenAI API endpoint

### Frontend API URL (front-end/src/pages/EvaluateCV/CVJobMatcher.js)

Update the API URL if backend runs on different port:
```javascript
const response = await fetch('http://localhost:5000/api/evaluate/cv-jd-match', {
    method: 'POST',
    body: formData,
});
```

## Troubleshooting

### CORS Issues
- Backend has CORS enabled for `localhost:3000`
- Check `CORS(app, origins=[...])` in `main2.py`

### File Upload Issues
- Only PDF files supported
- Max file size: 5MB
- Check upload folder permissions

### LLM Issues
- Verify OpenAI API key in environment
- Check `Settings.load_settings()` loads correctly
- Review prompt templates in `prompt/promt_config.py`

### Embedding Issues
- Ensure embedding model is loaded: `llm_manager.get_embedding_model()`
- Check model cache: `AI/backend/.cache/`

## Future Enhancements

- [ ] Support for DOC/DOCX files
- [ ] Job title extraction from JD text
- [ ] PDF report generation
- [ ] Result caching
- [ ] Batch CV processing
- [ ] Real-time progress updates via WebSocket
