class PromptConfig:
    def __init__(self):
        self.prompts = {
            "job_description_analysis": (
                "Analyze the following job description and extract key skills, qualifications, "
                "and responsibilities required for the role:\n\n{job_description}\n\n"
                "Provide a summary in bullet points."
            ),
            "AI_interview_result_evaluation": (
              """
              Bạn là 1 chuyên gia nhận xét và đánh giá kết quả phỏng vấn dựa trên câu trả lời và cv của ứng viên.
              Hãy trả về **JSON hợp lệ** với format:
              {{
                overrallScore: 0-100,
                overallFeedback: "string",
                strengths: [
                  "strength 1",
                  "strength 2",
                  ...
                ],
                weaknesses: [
                  "weakness 1",
                  "weakness 2",
                  ...
                ],
                recommendations: [
                  "recommendation 1",
                  "recommendation 2",
                  ...
                ],
                detailedScores: [
                  {{
                    category: "string",
                    score: 0-100,
                    maxScore: 100,
                    feedback: "string"
                  }},
                  {{
                    category: "string",
                    score: 0-100,
                    maxScore: 100,
                    feedback: "string"
                  }},
                  {{
                    category: "string",
                    score: 0-100,
                    maxScore: 100,
                    feedback: "string"
                  }},
                ], 
                score:[0, 0, 0, 0, 0, 0] // dựa vào câu hỏi và câu trả lời để cho điểm từ câu 
                feedback: [
                  "feedback for question 1",
                  "feedback for question 2",
                  ...
                ] // nhận xét từng câu trả lời của ứng viên
              }}
              CV: "{user_input}"
              Câu hỏi và câu trả lời: "{answers}"
              """
            ),
            "stimulate_interview_based_on_cv": (
              """
              Bạn là 1 chuyên gia phỏng vấn dựa trên cv của người dùng hãy cho tôi 6 câu hỏi phỏng vấn phù hợp với cv của người dùng để kiểm tra kiến thức và kỹ năng của họ.
              Hãy trả về **JSON hợp lệ** với format:
              {{
                "questions": [
                  "Câu hỏi 1",
                  "Câu hỏi 2",
                  "Câu hỏi 3",
                  "Câu hỏi 4",
                  "Câu hỏi 5",
                  "Câu hỏi 6"
                ]
              }}
              CV: "{user_input}"
              """
              ),
            "extract_features_cv": (
            """Bạn là chuyên gia phân tích CV.

Nhiệm vụ:
Đọc CV dưới đây và trả về **JSON hợp lệ** với format:
{{
  "skills": ["skill1", "skill2", ...],
}}
HƯỚNG DẪN:
- skills: Liệt kê tất cả kỹ năng lập trình, công nghệ, framework.
CV CONTENT:
{user_input}

CHỈ TRẢ VỀ JSON, KHÔNG VIẾT THÊM BẤT KỲ TEXT NÀO KHÁC"""
          ),
            "evaluate_jd": (
              """
Bạn là 1 chuyên gia phân tích và đánh giá mô tả công việc (JD) trong lĩnh vực tuyển dụng IT.

**YÊU CẦU QUAN TRỌNG:** Trả về CHÍNH XÁC JSON hợp lệ, KHÔNG có markdown, KHÔNG có text giải thích.

**FORMAT OUTPUT (JSON thuần túy):**
```json
{{
  "overallScore": 78,
  "scores": {{
    "clarity": 85,
    "completeness": 75,
    "attractiveness": 70,
    "seo": 80,
    "inclusivity": 75
  }},
  "strengths": [
    {{
      "category": "Mô tả công việc",
      "point": "Mô tả công việc rõ ràng, chi tiết về trách nhiệm và nhiệm vụ",
      "icon": "✓"
    }},
    {{
      "category": "Thông tin lương",
      "point": "Đã công khai mức lương, tăng tính minh bạch và thu hút ứng viên",
      "icon": "✓"
    }},
    {{
      "category": "Kỹ năng yêu cầu",
      "point": "Liệt kê đầy đủ các kỹ năng cần thiết, giúp ứng viên tự đánh giá",
      "icon": "✓"
    }}
  ],
  "improvements": [
    {{
      "category": "Tiêu đề",
      "issue": "Tiêu đề có thể hấp dẫn hơn",
      "suggestion": "Thêm cụm từ thu hút như 'Senior', 'Remote-friendly', hoặc đặc điểm nổi bật của vị trí",
      "priority": "medium",
      "example": "Ví dụ cải thiện tiêu đề"
    }},
    {{
      "category": "Mô tả công ty",
      "issue": "Thiếu thông tin về văn hóa công ty và môi trường làm việc",
      "suggestion": "Bổ sung 2-3 câu về văn hóa công ty, giá trị cốt lõi, hoặc những điểm đặc biệt",
      "priority": "high",
      "example": "Thêm: 'Chúng tôi tạo môi trường sáng tạo, khuyến khích đổi mới và học hỏi liên tục'"
    }},
    {{
      "category": "Quyền lợi",
      "issue": "Quyền lợi được mô tả chung chung",
      "suggestion": "Cụ thể hóa các quyền lợi với con số và chi tiết",
      "priority": "high",
      "example": "Thay vì 'Thưởng hấp dẫn' → 'Thưởng lên đến 2-3 tháng lương/năm theo KPI'"
    }},
    {{
      "category": "Từ khóa SEO",
      "issue": "Thiếu từ khóa phổ biến trong ngành",
      "suggestion": "Thêm các từ khóa như 'work-life balance', 'career growth', 'modern tech stack'",
      "priority": "medium",
      "example": "Bổ sung vào phần benefits hoặc description"
    }},
    {{
      "category": "Call-to-Action",
      "issue": "Không có lời kêu gọi hành động mạnh mẽ",
      "suggestion": "Thêm câu kết thúc động viên ứng viên nộp hồ sơ",
      "priority": "low",
      "example": "Thêm: 'Đừng bỏ lỡ cơ hội gia nhập đội ngũ tài năng của chúng tôi. Ứng tuyển ngay hôm nay!'"
    }}
  ],
  "keywordAnalysis": {{
    "missing": ["remote", "flexible", "growth opportunity", "modern"],
    "overused": ["công việc", "yêu cầu"],
    "recommended": ["career development", "team culture", "innovation"]
  }},
  "competitorComparison": {{
    "betterThan": 65,
    "avgSalary": "Cao hơn 15% so với thị trường",
    "responseRate": "Dự đoán: 8-12 ứng viên phù hợp trong 7 ngày đầu"
  }}
}}
```

**INPUT JOB DESCRIPTION:**
{user_input}

**CHỈ TRẢ VỀ JSON OBJECT, KHÔNG VIẾT THÊM BẤT KỲ TEXT NÀO KHÁC.**
              """
            ),
            
            
            "extract_feature_question_about_jd": (
                """You are an information extraction engine. Your task is to map Vietnamese and English user job queries into MongoDB fields.

SCHEMA (only these fields allowed):
- title: job position/role (e.g., "Data Analyst", "Unity Developer")
- company: company name (e.g., "FPT Software", "Viettel")
- location: work location (e.g., "Hà Nội", "Hồ Chí Minh", "Đà Nẵng")
- skills: required skills/technologies (e.g., "Python", "React.js")
- experience: experience level (e.g., "1-2 năm", "Internship", "3 năm")

OUTPUT RULES:
1) Output valid JSON only (no extra text, no comments, no code fences).
2) Include ALL relevant fields that are explicitly present in the input. Omit keys that are absent.
3) Use exact field names from SCHEMA.
4) If no field matches at all, return {{}} exactly.
5) Never hallucinate values. Only extract if explicitly mentioned or as a direct synonym/alias mapping (see LOCATION CANONICALIZATION).
6) Do not output null/empty-string values. Include a key only if you have a concrete value.
7) For fields that can have multiple values (e.g., skills), join by ", " in a single string (e.g., "Python, SQL").

LANGUAGE + NORMALIZATION:
- Handle both Vietnamese and English inputs.
- Be case-insensitive and diacritic-insensitive during matching, but output should preserve canonical forms below.

LOCATION CANONICALIZATION (map common variants/synonyms to these exact outputs):
- "Hà Nội": ["Hà Nội", "Ha Noi", "Hanoi", "HN"]
- "Hồ Chí Minh": ["Hồ Chí Minh", "Ho Chi Minh", "Ho Chi Minh City", "TP.HCM", "TP HCM", "HCM", "Sài Gòn", "Saigon", "SG"]
- "Đà Nẵng": ["Đà Nẵng", "Da Nang", "Danang", "ĐN", "DN"]
(If a location is not in this list but clearly mentioned in the input, output it as written in the input.)

DECISION RULES:
- title vs skills:
  - A job position/role → "title" (e.g., "Java Developer", "thực tập sinh AI").
  - A technology/tool/framework → "skills" (e.g., "React.js", "Python").
  - If the phrase is "<TECH> developer" (VN/EN variants like "lập trình viên <TECH>"), set both:
      title = "<TECH> developer" (or the VN phrase as in input)
      skills includes "<TECH>".
- company:
  - Extract company names when explicitly mentioned (patterns like "tại <company>", "ở <company>", "at <company>", "with <company>").
- location:
  - Extract when patterns like "ở/tại/in/at <place>" appear.
  - Apply LOCATION CANONICALIZATION for Hà Nội / Hồ Chí Minh / Đà Nẵng.
  - If the query only mentions a location (e.g., "Công việc tại Đà Nẵng"), return just location field — do NOT return empty object.
- experience:
  - Vietnamese: patterns like "<n> năm", "1-2 năm", "thực tập", "thực tập sinh".
  - English: "Intern"/"Internship", "<n> years".
- description:
  - General non-technical keywords that describe the job but are not clearly title/skills/company/location/experience (e.g., "remote", "toàn thời gian", "full-time", "onsite").

SPECIAL NOTES:
- Keep values as they appear, except location canonicalization. Do not rewrite or translate titles/skills/company.
- If multiple skills/technologies are mentioned (e.g., "Python, SQL"), include them in "skills" as "Python, SQL".

EXAMPLES (strictly follow these):
Input: "có bao nhiêu công ty đang tuyển việc tại Hà Nội"
Output: {{"location": "Hà Nội"}}

Input: "Hà Nội có tuyển Data Analyst không?"
Output: {{"location": "Hà Nội", "title": "Data Analyst"}}

Input: "tôi muốn tìm việc làm Java Developer"
Output: {{"title": "Java Developer"}}

Input: "công ty nào yêu cầu Python"
Output: {{"skills": "Python"}}

Input: "thực tập sinh AI tại FPT"
Output: {{"title": "thực tập sinh AI", "company": "FPT"}}

Input: "senior developer 3 năm kinh nghiệm"
Output: {{"title": "senior developer", "experience": "3 năm"}}

Input: "Tìm các công ty đang tuyển IOS Developer"
Output: {{"title": "IOS Developer"}}

Input: "Công việc ở Hà Nội, là IT"
Output: {{"location": "Hà Nội", "title": "IT"}}

Input: "Công việc tại Đà Nẵng"
Output: {{"location": "Đà Nẵng"}}

Input: "Job in Ho Chi Minh City for React.js developer"
Output: {{"location": "Hồ Chí Minh", "title": "React.js developer", "skills": "React.js"}}

---
INPUT: "{user_input}"
OUTPUT:
"""
            ),
            
            "extract_feature_question_about_company": (
    """You are an information extraction engine. Your task is to map Vietnamese and English user queries about companies into MongoDB fields.

SCHEMA (only these fields allowed):
- name: company name (e.g., "FPT Software", "Viettel", "TechCorp")
- industry: industry or business domain (e.g., "Công nghệ thông tin", "Giáo dục", "Tài chính", "E-commerce")
- location: location or operating city (e.g., "Hà Nội", "Hồ Chí Minh", "Đà Nẵng")

OUTPUT RULES:
1) Output valid JSON only (no extra text, no comments, no code fences).
2) Include ALL relevant fields explicitly present in the input. Omit keys that are absent.
3) Use exact field names from SCHEMA.
4) If no field matches at all, return {{}} exactly.
5) Never hallucinate values — only extract if explicitly mentioned or as a direct synonym/alias mapping (see LOCATION CANONICALIZATION).
6) Do not output null/empty-string values. Include a key only if you have a concrete value.
7) For multi-valued industries (e.g., “công nghệ và giáo dục”), join them by ", " in a single string.

LANGUAGE + NORMALIZATION:
- Handle both Vietnamese and English inputs.
- Be case-insensitive and diacritic-insensitive during matching, but output should preserve canonical forms below.

LOCATION CANONICALIZATION (map common variants/synonyms to these exact outputs):
- "Hà Nội": ["Hà Nội", "Ha Noi", "Hanoi", "HN"]
- "Hồ Chí Minh": ["Hồ Chí Minh", "Ho Chi Minh", "Ho Chi Minh City", "TP.HCM", "TP HCM", "HCM", "Sài Gòn", "Saigon", "SG"]
- "Đà Nẵng": ["Đà Nẵng", "Da Nang", "Danang", "ĐN", "DN"]
(If a location is not in this list but clearly mentioned in the input, output it as written in the input.)

DECISION RULES:
- name:
  - Extract company names explicitly mentioned in patterns like "công ty <name>", "<name> company", "ở <name>", "tại <name>", "from <name>".
- industry:
  - Extract when input refers to business sectors like "lĩnh vực", "ngành", "hoạt động trong", "industry", "field", etc.
  - Examples: "ngành công nghệ thông tin", "hoạt động trong lĩnh vực tài chính", "an education company".
- location:
  - Extract when patterns like "ở/tại/in/at <place>" appear.
  - Apply LOCATION CANONICALIZATION for Hà Nội / Hồ Chí Minh / Đà Nẵng.
  - If only a location is mentioned (e.g., "các công ty ở Hà Nội"), return just location.

SPECIAL NOTES:
- Keep values as they appear, except for canonicalized locations.
- Do not translate or paraphrase company names or industries.

EXAMPLES:
Input: "Công ty FPT Software hoạt động trong lĩnh vực công nghệ thông tin tại Hà Nội"
Output: {{"name": "FPT Software", "industry": "công nghệ thông tin", "location": "Hà Nội"}}

Input: "Tell me about Viettel company"
Output: {{"name": "Viettel"}}

Input: "Các công ty trong lĩnh vực tài chính ở TP.HCM"
Output: {{"industry": "tài chính", "location": "Hồ Chí Minh"}}

Input: "Công ty giáo dục ở Đà Nẵng"
Output: {{"industry": "giáo dục", "location": "Đà Nẵng"}}

Input: "TechCorp hoạt động trong ngành e-commerce"
Output: {{"name": "TechCorp", "industry": "e-commerce"}}

Input: "Công ty tại Hà Nội"
Output: {{"location": "Hà Nội"}}

Input: "Ngành giáo dục"
Output: {{"industry": "giáo dục"}}

---
INPUT: "{user_input}"
OUTPUT:
"""
),

            
          "chitchat_to_recruitment": (
                """
            Người dùng đang nói chuyện phiếm về: "{user_input}"
            Hãy trả lời một cách thân thiện và tự nhiên, sau đó khéo léo chuyển hướng cuộc trò chuyện về chủ đề tuyển dụng và tìm việc làm. 

            Ví dụ:
            - Nếu hỏi về thời tiết: "Thời tiết đẹp thật! Ngày đẹp trời như này thích hợp để cập nhật CV và tìm kiếm cơ hội việc làm mới đấy. Bạn có muốn tôi giúp tìm việc làm phù hợp không?"
            - Nếu hỏi về bản thân bot: "Cảm ơn bạn quan tâm! Tôi là trợ lý tuyển dụng, chuyên giúp mọi người tìm kiếm cơ hội nghề nghiệp. Bạn đang tìm kiếm công việc nào?"

            Hãy trả lời ngắn gọn, thân thiện và chuyển hướng một cách tự nhiên."""
            ),
          
          "classification_recruitment_intent": (
            """
            Bạn là bộ phân loại dữ liệu cho chatbot tuyển dụng.  
Nhiệm vụ: Xác định *loại thông tin* trong tin nhắn người dùng để lưu vào đúng trường trong context.

Các loại duy nhất có thể trả về:
- location : Địa điểm, thành phố, tỉnh, quốc gia, nơi làm việc.
- skills   : Kỹ năng, chuyên môn, công nghệ, ngành nghề.
- salary   : Mức lương, số tiền mong muốn, khoảng lương.
- position : Chức danh, vị trí công việc, tên công việc cụ thể.

Hãy đọc câu người dùng và **CHỈ TRẢ VỀ 1 từ duy nhất** trong bốn lựa chọn trên
mà bạn cho là phù hợp nhất.  
Nếu không chắc chắn, hãy chọn loại gần nhất.

Ví dụ:
User: "Mình muốn làm việc ở Hà Nội" → location
User: "Mình biết lập trình Python và React" → skills
User: "Mức lương khoảng 20 triệu" → salary
User: "Mình muốn làm vị trí Data Analyst" → position

User: "{user_input}"
Trả lời:"""
          ),
          
          "extract_features_cvssss": (
            """
            You are an expert career advisor and AI recruiter specializing in evaluating professional resumes for job readiness and suitability.  
Your goal is to analyze the candidate's CV and produce a structured, insightful evaluation.
---
### Input:
The following text is the candidate's CV:
{user_input}
---
### Instructions:
1. **Identify key information** from the CV:
   - Full name (if available)
   - Contact information
   - Summary or objective
   - Skills (group them into technical, soft, and other relevant categories)
   - Work experience (list company, position, duration, and key responsibilities)
   - Education
   - Projects or research
   - Certifications or awards
   - Languages and tools used

2. **Evaluate the CV** on the following dimensions (give 0–10 score for each):
   - Clarity and formatting
   - Relevance to tech industry (especially AI, data, or blockchain if applicable)
   - Skill depth and variety
   - Project or work impact
   - Professional tone and structure
   - Overall job-readiness

3. **Generate feedback and suggestions:**
   - What’s strong in this CV?
   - What’s missing or weak?
   - What to improve (specific actions)?
   - Suggest potential **job roles** suitable for this candidate.
   
5. **Translate into Vietnamese** if the CV is in Vietnamese; otherwise, respond in English.

4. **Output structure (JSON format):**
   {{
     "summary": "Short summary of the candidate and first impression",
     "scores": {{
       "clarity": 0,
       "relevance": 0,
       "skills": 0,
       "projects": 0,
       "professionalism": 0,
       "overall": 0
     }},
     "strengths": ["..."],
     "weaknesses": ["..."],
     "recommendations": ["..."],
     "suggested_job_roles": ["..."]
   }}
   
  

            """
          ),
          
          "classification_chat_intent": (
  """
Bạn là hệ thống phân loại intent cho chatbot tuyển dụng.
Nhiệm vụ: ĐỌC tin nhắn của người dùng và trả về CHÍNH XÁC 1 (MỘT) intent (chỉ trả về key, không giải thích):

Intent list:
- intent_jd: Người dùng TÌM KIẾM CÔNG VIỆC với ÍT NHẤT MỘT thông tin CỤ THỂ (vd: vị trí cụ thể, kỹ năng cụ thể, địa điểm cụ thể, loại công việc rõ ràng) hoặc hỏi về công ty đó đang tuyển về những công việc nào.
- intent_incomplete_recruitment_question: Câu hỏi LIÊN QUAN tuyển dụng nhưng QUÁ CHUNG CHUNG, THIẾU thông tin để xử lý (không nêu cụ thể vị trí / kỹ năng / địa điểm / nhu cầu rõ ràng).
- intent_candidate: Tìm ỨNG VIÊN với tiêu chí cụ thể (vd: "Ứng viên biết Java", "Tìm tester manual 2 năm kinh nghiệm").
- intent_review_cv: Yêu cầu đánh giá / nhận xét CV.
- intent_suggest_job: Nhờ gợi ý công việc dựa trên CV hoặc hồ sơ cá nhân.
- intent_company_info: Hỏi thông tin về một công ty cụ thể.
- intent_guide: Hỏi cách dùng website / thao tác hệ thống.
- intent_feedback: Góp ý / phàn nàn / phản hồi trải nghiệm.
- intent_chitchat: Chào hỏi / xã giao / nội dung ngoài tuyển dụng.

QUY TẮC RA QUYẾT ĐỊNH (Checklist):
1. Nếu KHÔNG thấy bất kỳ yếu tố cụ thể nào sau đây → intent_incomplete_recruitment_question:
   - Vị trí rõ ("Data Analyst", "Java Developer", "nhân viên kinh doanh", ...)
   - Kỹ năng/stack rõ ("Python", "React", "AI", ...). (Lưu ý: từ cực kỳ chung chung như "IT", "việc làm", "công việc" KHÔNG tính là cụ thể.)
   - Địa điểm cụ thể ("Hà Nội", "Đà Nẵng", "Hồ Chí Minh").
   - Nhu cầu tìm ứng viên nêu rõ tiêu chí ("ứng viên biết Java", "cần designer UI", ...)
2. Nếu chỉ có các cụm mơ hồ như: "ở đây", "có việc không", "việc làm", "tuyển dụng gì không" → intent_incomplete_recruitment_question.
3. Câu có cấu trúc tìm việc nhưng thiếu chi tiết ("tìm việc ở đây", "kiếm việc", "có job nào không") → intent_incomplete_recruitment_question.
4. Có ÍT NHẤT MỘT chi tiết cụ thể → xem tiếp để phân loại đúng (job vs candidate...).
5. Ưu tiên phân loại incomplete trước khi xét intent_jd.

VÍ DỤ RÕ (phải học thuộc):
- "Tìm việc ở đây" → intent_incomplete_recruitment_question ("ở đây" không phải địa điểm cụ thể).
- "Việc làm ở đây?" → intent_incomplete_recruitment_question.
- "Có công việc nào không" → intent_incomplete_recruitment_question.
- "Cần nhân sự" → intent_incomplete_recruitment_question.
- "Tôi muốn tìm việc làm" → intent_incomplete_recruitment_question.
- "Công việc ở Hà Nội" → intent_jd (có địa điểm cụ thể).
- "Tôi muốn tìm lập trình viên biết Java" → intent_candidate.
- "Ứng viên Python 3 năm kinh nghiệm" → intent_candidate.
- "Lập trình viên Python ở Hà Nội" → intent_jd.
- "Bạn review giúp CV này" → intent_review_cv.
- "Dựa vào CV này gợi ý công việc giúp mình" → intent_suggest_job.
- "Thông tin về công ty FPT" → intent_company_info.
- "Công ty Viettel tuyển những vị trí nào" → intent_jd.
- "Hướng dẫn tạo tài khoản" → intent_guide.
- "Mình muốn phản hồi về tính năng đăng bài" → intent_feedback.
- "Chào bạn" / "Trời hôm nay đẹp" → intent_chitchat.
- "Người dùng muốn tìm thông tin về ngân hàng FinBank" → intent_company_info.


⚠ Biên giới đặc biệt:
- "Tìm việc IT" → intent_incomplete_recruitment_question ("IT" quá rộng, không đủ cụ thể).
- "Tìm job Java" → intent_jd ("Java" là kỹ năng cụ thể).
- "Có tuyển dụng gì không ở đây" → intent_incomplete_recruitment_question.

CHỈ TRẢ VỀ duy nhất 1 trong các key intent ở trên.

Người dùng: "{user_input}"
Trả lời:
"""
),
          "intent_chitchat": (
            """
            Bạn là một chatbot tuyển dụng. Người dùng có thể hỏi về ngoài cuộc trò chuyện về tuyển dụng bạn hãy điều hướng thật khéo léo và thông minh
            về lại cuộc trò chuyện về tuyển dụng.
            Người dùng: "{user_input}"
            """
          ),
          
          "recruitment_incomplete": (
            """
            Bạn là một chatbot tuyển dụng. Người dùng có thể hỏi về tuyển dụng nhưng câu hỏi của họ còn thiếu thông tin quan trọng để bạn có thể trả lời chính xác.
            Hãy đặt một câu hỏi ngắn gọn để hỏi thêm thông tin từ người dùng.
            Người dùng: "{user_input}"
            """
          ),
          
          "intent_company_info": (
    """
    Bạn là một chatbot tuyển dụng. Người dùng có thể hỏi về thông tin của một công ty cụ thể.
    Bạn được cung cấp một danh sách các công ty và ngành nghề tương ứng.
    Nhiệm vụ:
    - Xác định công ty phù hợp với câu hỏi của người dùng (dựa trên tên công ty hoặc ngành nghề).
    - Trả về thông tin chi tiết về công ty đó với định dạng gọn gàng, dễ nhìn.
    - Luôn có phần mô tả tóm tắt cuối cùng.
    - KHÔNG ĐƯỢC DÙNG *** 

    Dữ liệu công ty:
    {data}

    Người dùng: "{user_input}"
    Nếu bạn muốn biết thêm thông tin về công ty khác hoặc tìm kiếm theo ngành nghề, hãy cho tôi biết!
    ---
    """
),
          "intent_jd": (
            """
            Bạn là một chatbot tuyển dụng. Người dùng hỏi về thông tin công việc hoặc là công việc của một công ty cụ thể.
            Bạn được cung cấp một danh sách các công việc có liên quan:
            Nhiệm vụ:
            - Xác định công việc phù hợp với câu hỏi của người dùng (dựa trên tên công ty hoặc ngành nghề).
            - Trả về thông tin chi tiết về công việc đó đó với định dạng gọn gàng, dễ nhìn.
            - Luôn có phần mô tả tóm tắt cuối cùng.
            - KHÔNG ĐƯỢC DÙNG *** 
            
             Dữ liệu công việc:
            {data}

            Người dùng: "{user_input}"
            format gọn gàng, dễ nhìn. Xuống dòng hợp lý. 
            Nếu bạn muốn biết thêm thông tin về công ty khác hoặc tìm kiếm theo ngành nghề, hãy cho tôi biết!
            """),
          "classification_agent_intent": (
    """
    Bạn là hệ thống phân loại intent cho chatbot tuyển dụng.
    Nhiệm vụ: ĐỌC tin nhắn của người dùng và trả về CHÍNH XÁC 1 intent (chỉ trả về key intent, không giải thích).

    Danh sách intent và TRANG ĐÍCH:
    - intent_jd → "/jobs" : Người dùng tìm kiếm công việc với ÍT NHẤT MỘT thông tin CỤ THỂ (vị trí, kỹ năng, địa điểm, loại công việc).
    - intent_company_info → "/companies" : Người dùng hỏi thông tin về một công ty cụ thể.
    - intent_chitchat → "/chat" : Người dùng chào hỏi, xã giao hoặc nội dung ngoài tuyển dụng.
    - intent_login → "/login" : Người dùng muốn đăng nhập.
    - intent_register → "/register" : Người dùng muốn đăng ký.
    - intent_forgot-password → "/forgot-password" : Người dùng quên mật khẩu.
    - intent_applications → "/applications" : Người dùng muốn xem hồ sơ ứng tuyển của họ.
    - intent_review_cv → "/review-cv" : Người dùng muốn đánh giá hoặc nhận xét về CV.
    

    QUY TẮC PHÂN LOẠI:
    1. Nếu người dùng có thông tin cụ thể về công việc (vị trí, kỹ năng, địa điểm) → intent_jd.
    2. Nếu người dùng hỏi về công ty cụ thể → intent_company_info.
    3. Nếu người dùng chỉ chào hỏi / xã giao / nói ngoài chủ đề → intent_chitchat.
    4. Nếu người dùng muốn đăng nhập → intent_login.
    5. Nếu người dùng muốn đăng ký → intent_register.
    6. Nếu người dùng quên mật khẩu → intent_forgot-password.
    7. Nếu người dùng muốn xem hồ sơ ứng tuyển của họ → intent_applications.
    8. Nếu người dùng muốn đánh giá hoặc nhận xét về CV → intent_review_cv.

    VÍ DỤ:
    - "Công việc ở Hà Nội" → intent_jd
    - "Tìm job Java" → intent_jd
    - "Thông tin về công ty FPT" → intent_company_info
    - "Chào bạn" / "Trời hôm nay đẹp" → intent_chitchat
    - "Tôi muốn đăng nhập" → intent_login
    - "Tôi muốn tạo tài khoản" → intent_register
    - "Tôi quên mật khẩu" → intent_forgot-password
    - "Xem hồ sơ ứng tuyển của tôi" → intent_applications
    - "Bạn review giúp CV này" → intent_review_cv
    

    Chỉ trả về DUY NHẤT 1 key intent.
    
    Người dùng: "{user_input}"
    Trả lời:
    """
)



        }

    def get_prompt(self, prompt_name: str, **kwargs) -> str:
        """
        Return the prompt text. If kwargs are provided, format placeholders.
        Example: get_prompt("extract_features_question_about_job", user_input="Tìm việc ở Hà Nội")
        """
        template = self.prompts.get(prompt_name, "Prompt not found.")
        return template.format(**kwargs)  # <-- inject user_input etc.
