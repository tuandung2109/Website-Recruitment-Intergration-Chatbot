import { useRef, useState } from "react";
// import jsPDF from "jspdf";
import { jsPDF } from "jspdf";

import html2canvas from "html2canvas";

function CreateCVTeacherFixed() {
  const [avatar, setAvatar] = useState("https://via.placeholder.com/150");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cvRef = useRef(null);

  const handleAvatarClick = () => fileInputRef.current.click();
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e) => e.key === "Enter" && e.preventDefault();
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const cv = cvRef.current;
      // Chụp vùng CV ra ảnh bằng html2canvas
      const canvas = await html2canvas(cv, {
        scale: 2, // xuất sắc nét hơn
        useCORS: true, // cho phép ảnh link ngoài (avatar)
        backgroundColor: "#ffffff", // tránh oklch lỗi
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save("CV_GiaoVien.jpg");
    } catch (err) {
      console.error(err);
      alert("❌ Không thể tạo PDF. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div className="flex justify-center mb-4">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#9ca3af" : "#059669",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#fff",
            padding: "8px 20px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          {loading ? "⏳ Đang tạo PDF..." : "⬇️ Tải xuống PDF"}
        </button>
      </div>

      <div
        ref={cvRef}
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          display: "flex",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Cột trái */}
        <div
          style={{
            width: "33.3%",
            backgroundColor: "#d1fae5",
            padding: "24px",
            color: "#1f2937",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "128px",
              height: "128px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              cursor: "pointer",
            }}
            onClick={handleAvatarClick}
            title="Bấm để thay ảnh"
          >
            <img
              src={avatar}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <h2
              contentEditable
              suppressContentEditableWarning
              onKeyDown={handleKeyDown}
              style={{ fontSize: "20px", fontWeight: "700", color: "#065f46" }}
            >
              Nguyễn Lê Tú Anh
            </h2>
            <p
              contentEditable
              suppressContentEditableWarning
              onKeyDown={handleKeyDown}
              style={{ fontSize: "14px", color: "#374151" }}
            >
              Giáo viên tiếng Anh
            </p>
          </div>

          <div
            style={{
              marginTop: "24px",
              width: "100%",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            <p contentEditable suppressContentEditableWarning>
              🎂 18/12/1997
            </p>
            <p contentEditable suppressContentEditableWarning>
              👩‍🏫 Nữ
            </p>
            <p contentEditable suppressContentEditableWarning>
              📞 0123456789
            </p>
            <p contentEditable suppressContentEditableWarning>
              📧 emailcuaban@mail.vn
            </p>
            <p contentEditable suppressContentEditableWarning>
              🔗 be.net/tcuan
            </p>
            <p contentEditable suppressContentEditableWarning>
              📍 Ba Đình, Hà Nội
            </p>
          </div>

          <hr
            style={{ margin: "16px 0", borderColor: "#d1d5db", width: "100%" }}
          />

          <div style={{ width: "100%" }}>
            <h3
              style={{
                fontWeight: "600",
                color: "#047857",
                marginBottom: "8px",
              }}
            >
              Kỹ năng
            </h3>
            <ul style={{ fontSize: "14px", paddingLeft: "20px" }}>
              <li>Thiết kế giáo án</li>
              <li>Giảng dạy TOEIC/IELTS</li>
              <li>Tổ chức lớp học</li>
              <li>Giao tiếp & phản hồi</li>
              <li>Học hỏi nhanh</li>
            </ul>
          </div>

          <hr
            style={{ margin: "16px 0", borderColor: "#d1d5db", width: "100%" }}
          />

          <div style={{ width: "100%" }}>
            <h3
              style={{
                fontWeight: "600",
                color: "#047857",
                marginBottom: "8px",
              }}
            >
              Chứng chỉ
            </h3>
            <ul style={{ fontSize: "14px", paddingLeft: "20px" }}>
              <li>Nghiệp vụ sư phạm</li>
              <li>TOEIC 900+</li>
              <li>Khóa PTI kỹ năng</li>
            </ul>
          </div>
        </div>

        {/* Cột phải */}
        <div
          style={{
            width: "66.7%",
            padding: "24px",
            backgroundColor: "#f3f4f6",
            color: "#1f2937",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#047857",
                marginBottom: "4px",
              }}
            >
              🎯 Mục tiêu nghề nghiệp
            </h3>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              Là giáo viên tiếng Anh với hơn 5 năm kinh nghiệm giảng dạy, tôi
              mong muốn phát triển trong môi trường năng động và đóng góp vào
              các dự án đào tạo chuyên nghiệp.
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#047857",
                marginBottom: "4px",
              }}
            >
              🎓 Học vấn
            </h3>
            <p style={{ fontSize: "14px" }}>
              2015 - 2019 | Đại học TopCV | Ngôn ngữ Anh
            </p>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              Tốt nghiệp loại Giỏi
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#047857",
                marginBottom: "4px",
              }}
            >
              💼 Kinh nghiệm làm việc
            </h3>
            <h4 style={{ fontWeight: "600" }}>
              08/2021 - Nay | CÔNG TY GIÁO DỤC HUS | Giáo viên tiếng Anh
            </h4>
            <ul style={{ fontSize: "14px", paddingLeft: "20px" }}>
              <li>Giảng dạy TOEIC, IELTS</li>
              <li>Soạn giáo án & đánh giá học viên</li>
              <li>Đạt tỷ lệ 97% học viên đạt mục tiêu</li>
            </ul>

            <h4 style={{ fontWeight: "600", marginTop: "12px" }}>
              08/2019 - 07/2021 | TRUNG TÂM ANH NGỮ MVI | Giáo viên dạy kèm
            </h4>
            <ul style={{ fontSize: "14px", paddingLeft: "20px" }}>
              <li>Dạy kỹ năng IELTS online</li>
              <li>Theo dõi tiến bộ học viên</li>
            </ul>
          </div>

          <div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#047857",
                marginBottom: "4px",
              }}
            >
              🤝 Hoạt động
            </h3>
            <ul style={{ fontSize: "14px", paddingLeft: "20px" }}>
              <li>03/2022 | CLB luyện thi IELTS online | Hỗ trợ 50 học viên</li>
              <li>
                11/2020 | “English for Hope” | Dạy tiếng Anh miễn phí cho trẻ em
                vùng cao
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCVTeacherFixed;
