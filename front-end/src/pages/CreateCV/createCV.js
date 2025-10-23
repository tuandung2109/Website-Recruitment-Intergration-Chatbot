import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function CreateCVTeacherFixed() {
  const [avatar, setAvatar] = useState("https://via.placeholder.com/150");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cvRef = useRef(null);

  // Đổi ảnh
  const handleAvatarClick = () => fileInputRef.current.click();
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  // Ngăn Enter xuống dòng
  const handleKeyDown = (e) => e.key === "Enter" && e.preventDefault();

  // ✅ Tải xuống PDF an toàn
  const handleDownloadPDF1 = async () => {
    try {
      setLoading(true);
      const cv = cvRef.current;
      // Dùng html2canvas, khắc phục lỗi ảnh ngoài domain
      const canvas = await html2canvas(cv, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save("CV_GiaoVienTiengAnh.pdf");
    } catch (err) {
      alert("❌ Không thể tải PDF. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadPDF = async () => {
    const cvElement = cvRef.current;
    const canvas = await html2canvas(cvElement, { scale: 2, useCORS: true });
    const dataURL = canvas.toDataURL("image/png", 1);

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("my_cv.pdf");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-center mb-4">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          } text-white px-5 py-2 rounded-lg shadow-md transition`}
        >
          {loading ? "⏳ Đang tạo PDF..." : "⬇️ Tải xuống PDF"}
        </button>
      </div>

      <div
        ref={cvRef}
        className="max-w-[850px] mx-auto bg-white border rounded-lg shadow-lg overflow-hidden flex"
      >
        {/* Cột trái */}
        <div className="w-1/3 bg-emerald-100 p-6 text-gray-800 flex flex-col items-center">
          {/* Avatar */}
          <div
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer hover:opacity-80 transition"
            onClick={handleAvatarClick}
            title="Bấm để thay ảnh"
          >
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />

          {/* Tên & chức danh */}
          <div className="text-center mt-4">
            <h2
              contentEditable
              suppressContentEditableWarning
              onKeyDown={handleKeyDown}
              className="text-xl font-bold text-emerald-800"
            >
              Nguyễn Lê Tú Anh
            </h2>
            <p
              contentEditable
              suppressContentEditableWarning
              onKeyDown={handleKeyDown}
              className="text-sm text-gray-700"
            >
              Giáo viên tiếng Anh
            </p>
          </div>

          {/* Thông tin */}
          <div className="mt-6 text-sm space-y-2 w-full">
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

          <hr className="my-4 border-gray-300 w-full" />

          {/* Kỹ năng */}
          <div className="w-full">
            <h3 className="font-semibold text-emerald-700 mb-2">Kỹ năng</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li contentEditable suppressContentEditableWarning>
                Thiết kế giáo án
              </li>
              <li contentEditable suppressContentEditableWarning>
                Giảng dạy TOEIC/IELTS
              </li>
              <li contentEditable suppressContentEditableWarning>
                Tổ chức lớp học
              </li>
              <li contentEditable suppressContentEditableWarning>
                Giao tiếp & phản hồi
              </li>
              <li contentEditable suppressContentEditableWarning>
                Học hỏi nhanh
              </li>
            </ul>
          </div>

          <hr className="my-4 border-gray-300 w-full" />

          {/* Chứng chỉ */}
          <div className="w-full">
            <h3 className="font-semibold text-emerald-700 mb-2">Chứng chỉ</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li contentEditable suppressContentEditableWarning>
                Nghiệp vụ sư phạm
              </li>
              <li contentEditable suppressContentEditableWarning>
                TOEIC 900+
              </li>
              <li contentEditable suppressContentEditableWarning>
                Khóa PTI kỹ năng
              </li>
            </ul>
          </div>
        </div>

        {/* Cột phải */}
        <div
          className="w-2/3 p-6"
          style={{
            backgroundColor: "#f3f4f6",
            color: "#1f2937",
            borderRight: "1px solid #d1d5db",
          }}
        >
          {/* Mục tiêu */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-emerald-700 mb-1">
              🎯 Mục tiêu nghề nghiệp
            </h3>
            <p
              className="text-sm leading-relaxed"
              contentEditable
              suppressContentEditableWarning
            >
              Là giáo viên tiếng Anh với hơn 5 năm kinh nghiệm giảng dạy, tôi
              mong muốn phát triển trong môi trường năng động và đóng góp vào
              các dự án đào tạo chuyên nghiệp.
            </p>
          </div>

          {/* Học vấn */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-emerald-700 mb-1">
              🎓 Học vấn
            </h3>
            <p
              className="text-sm"
              contentEditable
              suppressContentEditableWarning
            >
              2015 - 2019 | Đại học TopCV | Ngôn ngữ Anh
            </p>
            <p
              className="text-sm text-gray-600"
              contentEditable
              suppressContentEditableWarning
            >
              Tốt nghiệp loại Giỏi
            </p>
          </div>

          {/* Kinh nghiệm */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-emerald-700 mb-1">
              💼 Kinh nghiệm làm việc
            </h3>
            <h4
              className="font-semibold"
              contentEditable
              suppressContentEditableWarning
            >
              08/2021 - Nay | CÔNG TY GIÁO DỤC HUS | Giáo viên tiếng Anh
            </h4>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
              <li contentEditable suppressContentEditableWarning>
                Giảng dạy TOEIC, IELTS
              </li>
              <li contentEditable suppressContentEditableWarning>
                Soạn giáo án & đánh giá học viên
              </li>
              <li contentEditable suppressContentEditableWarning>
                Đạt tỷ lệ 97% học viên đạt mục tiêu
              </li>
            </ul>

            <h4
              className="font-semibold mt-3"
              contentEditable
              suppressContentEditableWarning
            >
              08/2019 - 07/2021 | TRUNG TÂM ANH NGỮ MVI | Giáo viên dạy kèm
            </h4>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
              <li contentEditable suppressContentEditableWarning>
                Dạy kỹ năng IELTS online
              </li>
              <li contentEditable suppressContentEditableWarning>
                Theo dõi tiến bộ học viên
              </li>
            </ul>
          </div>

          {/* Hoạt động */}
          <div>
            <h3 className="text-lg font-bold text-emerald-700 mb-1">
              🤝 Hoạt động
            </h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li contentEditable suppressContentEditableWarning>
                03/2022 | CLB luyện thi IELTS online | Hỗ trợ 50 học viên
              </li>
              <li contentEditable suppressContentEditableWarning>
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
