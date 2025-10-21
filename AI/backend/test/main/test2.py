
import sys
import os

# Add the parent directories to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from setting import Settings  # PyMuPDF



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
    from tool.database.mongodb import MongoDBClient
    from tool import extract_text_from_pdf
    from tool import generate_evaluation_key
    
    
    
    # settings = Settings().load_settings()

    # key = generate_evaluation_key(extract_text_from_pdf("C:\\Users\\myth\\Downloads\\NGUYEN THE THANH - CV.pdf"))
    
    
    # print(extract_text_from_pdf("C:\\Users\\myth\\Downloads\\NGUYEN THE THANH - CV.pdf"))
    # print(f"Generated evaluation key: {key}")

    # mongo_client = MongoDBClient(Settings=settings)
            
    # # Check if evaluation already exists
    # existing_evaluation = mongo_client.read_documents(
    #     "cv_evaluation",
    #     filter_query={"id": 4, "key": "63ba246606b8152936eab39ec5abb3b6cf3b35552dc3fe413e1c1159bfd86747"}
    # )
            
    # if existing_evaluation:
    #     evaluation_data = existing_evaluation[0]
                
    #             # Convert ObjectId to string for JSON serialization
    # if '_id' in evaluation_data:
    #     evaluation_data['_id'] = str(evaluation_data['_id'])

    print(extract_text_from_pdf("C:\\Users\\myth\\Downloads\\NGUYEN THE THANH - CV.pdf"))  # Return the dict data
    
    
