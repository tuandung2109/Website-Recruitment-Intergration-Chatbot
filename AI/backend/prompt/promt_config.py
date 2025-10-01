class PromptConfig:
    def __init__(self):
        self.prompts = {
            "job_description_analysis": (
                "Analyze the following job description and extract key skills, qualifications, "
                "and responsibilities required for the role:\n\n{job_description}\n\n"
                "Provide a summary in bullet points."
            ),
            "extract_features_question_about_job": (
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
          
          "extract_features_cv": (
            """Bạn là chuyên gia phân tích CV.

Nhiệm vụ:
Đọc CV dưới đây và trả về **JSON hợp lệ** với format:

{{
  "skills": ["skill1", "skill2", ...],
  "experience_years": <tổng số năm kinh nghiệm> (int),
  "experience_detail": [
      {{"domain": "<lĩnh vực/loại công việc>", "years": <số năm kinh nghiệm> (int)}},
      ...
  ],
  "education_level": "Bachelor/Master/PhD/College/Other",
  "location": "<Thành phố hoặc tỉnh>",
  "ielts": <điểm IELTS hoặc null>,
  "certs": ["cert1", "cert2"]
}}

HƯỚNG DẪN:
- skills: Liệt kê tất cả kỹ năng lập trình, công nghệ, framework.
- experience_years: Tổng số năm kinh nghiệm làm việc (tính từ thời gian các vị trí ghi rõ trong CV).
- experience_detail: Mỗi phần tử ghi rõ lĩnh vực (ví dụ: "AI/ML", "Game Development", "Blockchain", "Web/Mobile", "Khác") và số năm kinh nghiệm trong lĩnh vực đó.
- education_level: Bachelor/Master/PhD/College/Other.
- location: Thành phố/tỉnh từ địa chỉ.
- ielts: Điểm IELTS nếu CV ghi rõ, nếu không có thì null (không được suy đoán).
- certs: Danh sách chứng chỉ nếu có.

QUAN TRỌNG:
- Chỉ tính số năm kinh nghiệm khi CV có mốc thời gian rõ ràng.
- Nếu thiếu thông tin → years = 0.
- Không tự sáng tạo hoặc suy đoán thông tin không có.

CV CONTENT:
{user_input}

CHỈ TRẢ VỀ JSON, KHÔNG VIẾT THÊM BẤT KỲ TEXT NÀO KHÁC"""
          ),
          
          "classification_chat_intent": (
  """
Bạn là hệ thống phân loại intent cho chatbot tuyển dụng.
Nhiệm vụ: ĐỌC tin nhắn của người dùng và trả về CHÍNH XÁC 1 (MỘT) intent (chỉ trả về key, không giải thích):

Intent list:
- intent_jd: Người dùng TÌM KIẾM CÔNG VIỆC với ÍT NHẤT MỘT thông tin CỤ THỂ (vd: vị trí cụ thể, kỹ năng cụ thể, địa điểm cụ thể, loại công việc rõ ràng).
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
- "Hướng dẫn tạo tài khoản" → intent_guide.
- "Mình muốn phản hồi về tính năng đăng bài" → intent_feedback.
- "Chào bạn" / "Trời hôm nay đẹp" → intent_chitchat.

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

        }

    def get_prompt(self, prompt_name: str, **kwargs) -> str:
        """
        Return the prompt text. If kwargs are provided, format placeholders.
        Example: get_prompt("extract_features_question_about_job", user_input="Tìm việc ở Hà Nội")
        """
        template = self.prompts.get(prompt_name, "Prompt not found.")
        return template.format(**kwargs)  # <-- inject user_input etc.
