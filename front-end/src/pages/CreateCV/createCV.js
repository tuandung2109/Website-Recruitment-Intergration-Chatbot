import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";

function CreateCVTeacherFixed() {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const navigate = useNavigate();
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
  const addNewBlock = () => {
    const newBlock = {
      id: Date.now(),
      text: "Nhập nội dung mới...",
      color: "#000000",
      fontSize: 16,
      x: 100,
      y: 100,
    };
    setBlocks((prev) => [...prev, newBlock]);
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
    try {
      setLoading(true);
      const cvElement = cvRef.current;
      
      // ✅ KHÔNG DÙNG window.getComputedStyle - chỉ dùng map cứng
      const tailwindToStyle = {
        // Background colors
        'bg-white': 'background-color: #ffffff',
        'bg-gray-50': 'background-color: #f9fafb',
        'bg-gray-100': 'background-color: #f3f4f6',
        'bg-gray-200': 'background-color: #e5e7eb',
        'bg-gray-300': 'background-color: #d1d5db',
        'bg-gray-400': 'background-color: #9ca3af',
        'bg-gray-600': 'background-color: #4b5563',
        'bg-gray-700': 'background-color: #374151',
        'bg-gray-800': 'background-color: #1f2937',
        'bg-emerald-50': 'background-color: #ecfdf5',
        'bg-emerald-100': 'background-color: #d1fae5',
        'bg-emerald-600': 'background-color: #059669',
        'bg-emerald-700': 'background-color: #047857',
        'bg-emerald-800': 'background-color: #065f46',
        'bg-blue-600': 'background-color: #2563eb',
        'bg-blue-700': 'background-color: #1d4ed8',
        
        // Text colors & sizes
        'text-black': 'color: #000000',
        'text-white': 'color: #ffffff',
        'text-sm': 'font-size: 14px; line-height: 20px',
        'text-lg': 'font-size: 18px; line-height: 28px',
        'text-xl': 'font-size: 20px; line-height: 28px',
        'text-gray-600': 'color: #4b5563',
        'text-gray-700': 'color: #374151',
        'text-gray-800': 'color: #1f2937',
        'text-emerald-600': 'color: #059669',
        'text-emerald-700': 'color: #047857',
        'text-emerald-800': 'color: #065f46',
        'text-center': 'text-align: center',
        
        // Border
        'border-white': 'border-color: #ffffff; border-style: solid',
        'border-gray-300': 'border-color: #d1d5db; border-style: solid',
        'border-4': 'border-width: 4px; border-style: solid',
        'border': 'border-width: 1px; border-style: solid',
        'rounded-full': 'border-radius: 9999px',
        'rounded-lg': 'border-radius: 8px',
        'rounded-md': 'border-radius: 6px',
        
        // Layout
        'flex': 'display: flex',
        'flex-col': 'flex-direction: column',
        'items-center': 'align-items: center',
        'justify-center': 'justify-content: center',
        'overflow-hidden': 'overflow: hidden',
        
        // Spacing
        'w-32': 'width: 128px',
        'h-32': 'height: 128px',
        'w-full': 'width: 100%',
        'w-1/3': 'width: 33.333333%',
        'w-2/3': 'width: 66.666667%',
        'p-6': 'padding: 24px',
        'px-4': 'padding-left: 16px; padding-right: 16px',
        'px-5': 'padding-left: 20px; padding-right: 20px',
        'py-2': 'padding-top: 8px; padding-bottom: 8px',
        'mt-1': 'margin-top: 4px',
        'mt-3': 'margin-top: 12px',
        'mt-4': 'margin-top: 16px',
        'mt-6': 'margin-top: 24px',
        'mb-1': 'margin-bottom: 4px',
        'mb-2': 'margin-bottom: 8px',
        'mb-4': 'margin-bottom: 16px',
        'mb-6': 'margin-bottom: 24px',
        'my-4': 'margin-top: 16px; margin-bottom: 16px',
        'gap-1': 'gap: 4px',
        'gap-3': 'gap: 12px',
        'max-w-[850px]': 'max-width: 850px',
        'mx-auto': 'margin-left: auto; margin-right: auto',
        'min-h-screen': 'min-height: 100vh',
        
        // Typography
        'font-bold': 'font-weight: 700',
        'font-semibold': 'font-weight: 600',
        'leading-relaxed': 'line-height: 1.625',
        
        // List
        'list-disc': 'list-style-type: disc',
        'list-inside': 'list-style-position: inside',
        
        // Effects
        'shadow-md': 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)',
        'shadow-lg': 'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)',
        'cursor-pointer': 'cursor: pointer',
        'cursor-move': 'cursor: move',
        'transition': 'transition: all 0.3s',
        
        // Display
        'hidden': 'display: none',
        'object-cover': 'object-fit: cover',
      };
      
      // ✅ Disable TẤT CẢ stylesheets trước khi clone
      const allStylesheets = Array.from(document.styleSheets);
      const disabledStates = allStylesheets.map(sheet => {
        try {
          const disabled = sheet.disabled;
          sheet.disabled = true;
          return { sheet, disabled };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      // Clone và inject inline styles
      const clone = cvElement.cloneNode(true);
      clone.style.cssText = 'position: absolute; left: -9999px; top: 0; background-color: #ffffff; border: 1px solid #ccc; display: flex; max-width: 850px;';
      document.body.appendChild(clone);
      
      // Replace TẤT CẢ Tailwind classes bằng inline styles
      const allElements = clone.querySelectorAll('*');
      allElements.forEach(el => {
        const classes = Array.from(el.classList);
        let inlineStyles = el.getAttribute('style') || '';
        
        classes.forEach(className => {
          if (tailwindToStyle[className]) {
            inlineStyles += '; ' + tailwindToStyle[className];
          }
        });
        
        // Handle space-y-* classes (apply margin-top to children)
        if (classes.some(c => c.startsWith('space-y-'))) {
          const spaceClass = classes.find(c => c.startsWith('space-y-'));
          const spacing = spaceClass === 'space-y-1' ? '4px' : spaceClass === 'space-y-2' ? '8px' : '0';
          Array.from(el.children).forEach((child, index) => {
            if (index > 0) {
              const childStyle = child.getAttribute('style') || '';
              child.setAttribute('style', childStyle + `; margin-top: ${spacing}`);
            }
          });
        }
        
        if (inlineStyles) {
          el.setAttribute('style', inlineStyles);
        }
        
        // XÓA class attribute hoàn toàn
        el.removeAttribute('class');
      });
      
      // Đợi render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Render canvas
      const canvas = await html2canvas(clone, { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Xóa TẤT CẢ <style> và <link> tags trong clone
          clonedDoc.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => el.remove());
        }
      });
      
      // Restore stylesheets
      disabledStates.forEach(({ sheet, disabled }) => {
        try {
          sheet.disabled = disabled;
        } catch (e) {}
      });
      
      // Cleanup
      document.body.removeChild(clone);
      
      const dataURL = canvas.toDataURL("image/png", 1);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("CV_GiaoVien.pdf");
      
      alert("✅ Tải PDF thành công!");
    } catch (err) {
      alert("❌ Không thể tải PDF: " + err.message);
      console.error('PDF Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => navigate("/createCV")}>Quay lại</button>

      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center mb-4">
          {selectedBlock && (
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white shadow-lg border rounded-lg px-4 py-2 flex items-center gap-3 z-50">
              <label className="flex items-center gap-1 text-sm">
                🎨 Màu:
                <input
                  type="color"
                  value={selectedBlock.color}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, color: newColor }
                          : b
                      )
                    );
                    setSelectedBlock((prev) => ({ ...prev, color: newColor }));
                  }}
                />
              </label>

              <label className="flex items-center gap-1 text-sm">
                🔤 Cỡ chữ:
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={selectedBlock.fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, fontSize: newSize }
                          : b
                      )
                    );
                    setSelectedBlock((prev) => ({
                      ...prev,
                      fontSize: newSize,
                    }));
                  }}
                  className="w-16 border rounded px-1"
                />
              </label>
            </div>
          )}
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

          <button
            onClick={addNewBlock}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md"
            style={{
              marginLeft: "2px",
            }}
          >
            ➕ Thêm Text mới
          </button>
        </div>

        <div
          ref={cvRef}
          className="max-w-[850px] mx-auto"
          style={{
            backgroundColor: "#ffffff", // thay vì bg-white
            border: "1px solid #ccc",
            display: "flex",
          }}
        >
          {blocks.map((block) => (
            <Draggable
              key={block.id}
              bounds="parent"
              defaultPosition={{ x: block.x, y: block.y }}
            >
              <div
                contentEditable
                suppressContentEditableWarning
                onClick={() => setSelectedBlock(block)}
                onBlur={(e) => {
                  const updated = e.target.innerText;
                  setBlocks((prev) =>
                    prev.map((b) =>
                      b.id === block.id ? { ...b, text: updated } : b
                    )
                  );
                }}
                style={{
                  position: "absolute",
                  color: block.color,
                  fontSize: `${block.fontSize}px`,
                  fontWeight: 400,
                  cursor: "move",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              >
                {block.text}
              </div>
            </Draggable>
          ))}

          {/* Cột trái */}
          <div
            className="w-1/3 p-6 text-gray-800 flex flex-col items-center"
            style={{ backgroundColor: "#d1fae5" }}
          >
            {" "}
            {/* Màu emerald-100 */}
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
              <Draggable>
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  className="text-xl font-bold text-emerald-800 cursor-move"
                >
                  Nguyễn Lê Tú Anh
                </h2>
              </Draggable>

              <Draggable>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  className="text-sm text-gray-700 cursor-move"
                >
                  Giáo viên tiếng Anh
                </p>
              </Draggable>
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
              <h3
                className="font-semibold text-emerald-700 mb-2"
                suppressContentEditableWarning
                contentEditable
              >
                Kỹ năng
              </h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Thiết kế giáo án
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Giảng dạy TOEIC/IELTS
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Tổ chức lớp học
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Giao tiếp & phản hồi
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Học hỏi nhanh
                  </li>
                </Draggable>
              </ul>
            </div>
            <hr className="my-4 border-gray-300 w-full" />
            {/* Chứng chỉ */}
            <div className="w-full">
              <Draggable>
                <h3
                  suppressContentEditableWarning
                  contentEditable
                  className="font-semibold text-emerald-700 mb-2"
                >
                  Chứng chỉ
                </h3>
              </Draggable>
              <ul className="list-disc list-inside text-sm space-y-1">
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Nghiệp vụ sư phạm
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    TOEIC 900+
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Khóa PTI kỹ năng
                  </li>
                </Draggable>
              </ul>
            </div>
          </div>

          {/* Cột phải */}
          <div
            className="w-2/3 p-6"
            style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
          >
            {/* Mục tiêu */}
            <div className="mb-6">
              <Draggable>
                <h3
                  suppressContentEditableWarning
                  contentEditable
                  className="text-lg font-bold text-emerald-700 mb-1"
                >
                  🎯 Mục tiêu nghề nghiệp
                </h3>
              </Draggable>
              <Draggable>
                <p
                  className="text-sm leading-relaxed"
                  contentEditable
                  suppressContentEditableWarning
                >
                  Là giáo viên tiếng Anh với hơn 5 năm kinh nghiệm giảng dạy,
                  tôi mong muốn phát triển trong môi trường năng động và đóng
                  góp vào các dự án đào tạo chuyên nghiệp.
                </p>
              </Draggable>
            </div>

            {/* Học vấn */}
            <div className="mb-6">
              <Draggable>
                <h3
                  className="text-lg font-bold text-emerald-700 mb-1"
                  suppressContentEditableWarning
                  contentEditable
                >
                  🎓 Học vấn
                </h3>
              </Draggable>

              <Draggable>
                <p
                  className="text-sm"
                  contentEditable
                  suppressContentEditableWarning
                >
                  2015 - 2019 | Đại học TopCV | Ngôn ngữ Anh
                </p>
              </Draggable>
              <Draggable>
                <p
                  className="text-sm text-gray-600"
                  contentEditable
                  suppressContentEditableWarning
                >
                  Tốt nghiệp loại Giỏi
                </p>
              </Draggable>
            </div>

            {/* Kinh nghiệm */}
            <div className="mb-6">
              <Draggable>
                <h3
                  className="text-lg font-bold text-emerald-700 mb-1"
                  suppressContentEditableWarning
                  contentEditable
                >
                  💼 Kinh nghiệm làm việc
                </h3>
              </Draggable>
              <Draggable>
                <h4
                  className="font-semibold"
                  contentEditable
                  suppressContentEditableWarning
                >
                  08/2021 - Nay | CÔNG TY GIÁO DỤC HUS | Giáo viên tiếng Anh
                </h4>
              </Draggable>
              <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Giảng dạy TOEIC, IELTS
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Soạn giáo án & đánh giá học viên
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Đạt tỷ lệ 97% học viên đạt mục tiêu
                  </li>
                </Draggable>
              </ul>
              <Draggable>
                <h4
                  className="font-semibold mt-3"
                  contentEditable
                  suppressContentEditableWarning
                >
                  08/2019 - 07/2021 | TRUNG TÂM ANH NGỮ MVI | Giáo viên dạy kèm
                </h4>
              </Draggable>
              <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Dạy kỹ năng IELTS online
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    Theo dõi tiến bộ học viên
                  </li>
                </Draggable>
              </ul>
            </div>

            {/* Hoạt động */}
            <div>
              <Draggable>
                <h3
                  suppressContentEditableWarning
                  contentEditable
                  className="text-lg font-bold text-emerald-700 mb-1"
                >
                  🤝 Hoạt động
                </h3>
              </Draggable>
              <ul className="list-disc list-inside text-sm space-y-1">
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    03/2022 | CLB luyện thi IELTS online | Hỗ trợ 50 học viên
                  </li>
                </Draggable>
                <Draggable>
                  <li contentEditable suppressContentEditableWarning>
                    11/2020 | “English for Hope” | Dạy tiếng Anh miễn phí cho
                    trẻ em vùng cao
                  </li>
                </Draggable>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateCVTeacherFixed;
