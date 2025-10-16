import re
from transformers import pipeline
from typing import List, Set


def normalize_token(token: str) -> str:
    t = token.strip()
    # Fix common typos and canonicalize
    replacements = {
        "asp.net": "ASP.NET",
        "asp .net": "ASP.NET",
        "asp.net core mvc": "ASP.NET Core MVC",
        "githup": "GitHub",
        "ui toolkit": "UI Toolkit",
        "unity ui": "Unity UI",
        "google admob sdk": "Google AdMob SDK",
        "c ++": "C++",
        "c#": "C#",
    }
    low = t.lower()
    if low in replacements:
        return replacements[low]
    # Title-case multi-word tokens that look like phrases (except known all-caps like OOP, SOLID, SDK, UI, MVC)
    if re.search(r"\b(oop|solid|sdk|ui|mvc|html|css|sql|hlsl|c\+\+|c#|3d|2d)\b", low):
        return t.replace("  ", " ").strip()
    # Keep original case for tech names with punctuation/numbers
    return t.replace("  ", " ").strip()


def heuristic_extract_skills(text: str) -> List[str]:
    # Curated skill tokens for this CV; extend as needed
    known = [
        "ASP.NET Core MVC",
        "ASP.NET",
        "Unity 3D/2D",
        "Unity UI",
        "UI Toolkit",
        "Unity",
        "Unreal",
        "DOTween",
        "Firebase",
        "Google AdMob SDK",
        "JavaScript",
        "Java",
        "Kotlin",
        "C#",
        "C++",
        "SQL",
        "HTML",
        "CSS",
        "HLSL",
        "OOP",
        "Design Pattern",
        "SOLID",
        "State Machine",
        "MVC",
        "SDK",
        "UI",
        "GitHub",
        "Git",
    ]
    # Build regex that prefers longer tokens first
    esc = [re.escape(k) for k in sorted(known, key=len, reverse=True)]
    pattern = re.compile(r"(" + "|".join(esc) + r")", re.IGNORECASE)

    # Normalize common typos before matching
    pre = text.replace("ASP.Net", "ASP.NET").replace("Githup", "GitHub")

    matches = []
    for m in pattern.finditer(pre):
        token = normalize_token(m.group(0))
        matches.append((m.start(), token))

    # Stable order by occurrence and deduplicate
    seen: Set[str] = set()
    ordered: List[str] = []
    for _, tok in sorted(matches, key=lambda x: x[0]):
        key = tok.lower()
        # Prefer GitHub over Git if both hit at same position later
        if key == "git" and "github" in seen:
            continue
        if key not in seen:
            ordered.append(tok)
            seen.add(key)

    return ordered


def ner_extract_skills(text: str, threshold: float = 0.50) -> List[str]:
    try:
        ner = pipeline(
            "token-classification",
            model="yashpwr/resume-ner-bert-v2",
            aggregation_strategy="simple",
        )
    except Exception as e:
        # If model fails to load, fallback to heuristic only
        print(f"[WARN] NER model load failed, using heuristic only: {e}")
        return []

    results = ner(text)
    skills = []
    for ent in results:
        label = ent.get("entity_group") or ent.get("entity")
        word = ent.get("word", "").strip()
        score = float(ent.get("score", 0))
        if not word or score < threshold:
            continue
        if str(label).lower() in {"skill", "skills", "technology", "tech"}:
            skills.append(normalize_token(word))
    # De-dup while preserving order
    seen = set()
    uniq = []
    for s in skills:
        if s.lower() not in seen:
            uniq.append(s)
            seen.add(s.lower())
    return uniq


if __name__ == "__main__":
    # Sample resume text (Vietnamese + English tech stack)
    text = """"
Projects
Skills
Unity Developer Intern
Education
Awards
Là một sinh viên đam mê lập trình,
nhiệt huyết và trách nhiệm, luôn nỗ lực
phát triển bản thân để đạt mục tiêu.
Trong 2 năm tới, tôi mong muốn trở
thành Game Developer và sẽ không
ngừng học hỏi thêm kiến thức và kinh
nghiệm. Mục tiêu dài hạn là trở thành
một Game Developer chuyên nghiệp.
About Me
tthanh.fesh@gmail.com
0859215819
Shooter Zombie Top down 3d
Hoang Liet, Hoang Mai, Ha Noi
Là thể loại game góc nhìn từ trên xuống, trong đó người chơi vào
vai một nhân vật dùng các kỹ năng và súng để phòng thủ qua các
đợt tấn công của zombie.
Game sử dụng UI Toolkit  và Unity UI để tạo giao diện người dùng
Game có sử dụng một số các mẫu thiết kế như MVC, Pooling
object, State Machine, ...
Linh demo: Link
Link Githup: Link
Unity 3D/2D, Unreal
C#, Java, Kotlin, C++, SQL, HTML, CSS,
JavaScript, HLSL
OOP, Design Pattern, SOLID, ASP.Net
Core MVC
UI Toolkit, Unity UI, Dotween, Firebase,
Google Admob SDK
Git, Githup
NGUYỄN THẾ THÀNH
11/2024 - NOW
TREASURE RUNNER 2D
Là thể loại game chạy vô tận. Người chơi nhập vai vào một cướp
biển phiêu lưu qua các vùng đất, vượt qua các vật cản để đạt được
kho báu.
Game sử dụng UI Toolkit  và Unity UI để tạo giao diện người dùng
Linh demo: Link
Link Githup: Link
10/2024-11/2024
PAIN HIT 3D
Mục tiêu là ném bóng vào các vòng tròn đang quay vào thời điểm
hoàn hảo để tô màu hoàn toàn cho chúng. Người chơi phải tránh
các chấm đen và các khu vực đã đánh trước đó.
Linh demo: Link
Link Githup: Link
09/2024
OTHER PROJECT
Dự đoán cảm xúc của người dùng dựa trên đánnh giá
Sử dụng ML.net c# để xử lý ngôn ngữ NLP và xây dựng mô hình
máy học.
Sử dụng các công cụ để tiền xử lý ngôn ngữ người sang máy học
giúp môn hình dự đoán chính xác 75%
Tích hợp vào blazor web để dự đoán cảm xúc người dùng
Link Githup: Link
09/2024
Đại học mở Hà Nội (2022 - 2025)
Chuyên ngành công nghệ phần mềm
GPA 3.0
Học bổng Giỏi và Khá của trường
Giải khuyến khích tỉnh môn vật lý 2021
nGuyễn Thế
Trang 1/1
"""

    heuristic = heuristic_extract_skills(text)
    print(f"Heuristic skills ({len(heuristic)}): {heuristic}")

    ner_skills = ner_extract_skills(text, threshold=0.50)
    print(f"NER skills ({len(ner_skills)}): {ner_skills}")

    # Unified set with heuristics taking precedence
    unified = []
    seen = set()
    for s in heuristic + ner_skills:
        key = s.lower()
        if key not in seen:
            unified.append(s)
            seen.add(key)
    print(f"Unified skills ({len(unified)}): {unified}")