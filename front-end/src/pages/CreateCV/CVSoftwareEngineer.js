import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function CVSoftwareEngineer() {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("https://via.placeholder.com/150");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cvRef = useRef(null);

  const colorProbeRef = useRef(null);
  const ensureColorProbe = () => {
    if (!colorProbeRef.current) {
      const probe = document.createElement("div");
      probe.style.position = "absolute";
      probe.style.left = "-9999px";
      probe.style.top = "0";
      probe.style.width = "0";
      probe.style.height = "0";
      document.body.appendChild(probe);
      colorProbeRef.current = probe;
    }
    return colorProbeRef.current;
  };

  const normalizeColor = (value, property = "color") => {
    if (!value) return value;
    try {
      const probe = ensureColorProbe();
      probe.style[property] = "";
      probe.style[property] = value;
      const computed = window.getComputedStyle(probe)[property];
      if (computed && computed !== "initial") {
        return computed;
      }
      return value;
    } catch (_) {
      return value;
    }
  };

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

  // Tải xuống PDF
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const cv = cvRef.current;

      const originalElements = cv.querySelectorAll('*');
      const clonesData = [];

      clonesData.push({ element: cv, styles: window.getComputedStyle(cv) });
      originalElements.forEach((el) => {
        clonesData.push({ element: el, styles: window.getComputedStyle(el) });
      });

      const cloneCV = cv.cloneNode(true);
      const cloneElements = [cloneCV, ...cloneCV.querySelectorAll('*')];

      cloneElements.forEach((el, index) => {
        const data = clonesData[index];
        if (!data) return;
        const styles = data.styles;

        const inlineStyles = [
          'color', 'backgroundColor', 'backgroundImage', 'background',
          'fontSize', 'fontWeight', 'fontFamily', 'lineHeight',
          'textAlign', 'padding', 'margin', 'border', 'borderRadius',
          'width', 'height', 'display', 'flexDirection', 'alignItems',
          'justifyContent', 'gap', 'position', 'top', 'left', 'right', 'bottom',
          'transform', 'opacity', 'boxShadow', 'zIndex', 'overflow',
          'textDecoration', 'textTransform', 'letterSpacing', 'whiteSpace'
        ];

        inlineStyles.forEach((prop) => {
          const val = styles[prop];
          if (val && val !== 'initial' && val !== 'none' && val !== 'normal') {
            if (prop === 'color' || prop === 'backgroundColor') {
              el.style[prop] = normalizeColor(val, prop);
            } else {
              el.style[prop] = val;
            }
          }
        });

        el.style.boxSizing = 'border-box';
        if (el.classList && el.classList.length > 0) {
          el.className = '';
        }
      });

      const draggableDivs = cloneCV.querySelectorAll('div');
      draggableDivs.forEach((el) => {
        const transform = el.style.transform;
        if (transform && transform.includes('translate')) {
          el.style.transform = transform;
          el.style.position = 'absolute';
        }
      });

      cloneCV.style.position = 'absolute';
      cloneCV.style.left = '-9999px';
      cloneCV.style.top = '0';
      document.body.appendChild(cloneCV);

      await new Promise((resolve) => setTimeout(resolve, 300));

      const htmlEl = document.documentElement;
      const bodyEl = document.body;
      const prevHtmlBg = { color: htmlEl.style.backgroundColor, image: htmlEl.style.backgroundImage, background: htmlEl.style.background };
      const prevBodyBg = { color: bodyEl.style.backgroundColor, image: bodyEl.style.backgroundImage, background: bodyEl.style.background };
      htmlEl.style.backgroundColor = '#ffffff';
      htmlEl.style.backgroundImage = 'none';
      htmlEl.style.background = '#ffffff';
      bodyEl.style.backgroundColor = '#ffffff';
      bodyEl.style.backgroundImage = 'none';
      bodyEl.style.background = '#ffffff';

      const canvas = await html2canvas(cloneCV, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      htmlEl.style.backgroundColor = prevHtmlBg.color;
      htmlEl.style.backgroundImage = prevHtmlBg.image;
      htmlEl.style.background = prevHtmlBg.background;
      bodyEl.style.backgroundColor = prevBodyBg.color;
      bodyEl.style.backgroundImage = prevBodyBg.image;
      bodyEl.style.background = prevBodyBg.background;

      document.body.removeChild(cloneCV);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("CV_SoftwareEngineer.pdf");
    } catch (err) {
      console.error("Lỗi khi tạo PDF:", err);
      alert("Không thể tạo PDF. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => navigate("/createCV")}
        style={{
          margin: "20px",
          padding: "10px 20px",
          backgroundColor: "#047857",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        ← Quay lại
      </button>

      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center mb-4 gap-2">
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
          >
            ➕ Thêm Text mới
          </button>
        </div>

        <div
          ref={cvRef}
          className="max-w-[850px] mx-auto"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #ccc",
            display: "flex",
            minHeight: "1123px",
            position: "relative",
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
                  zIndex: 10,
                }}
              >
                {block.text}
              </div>
            </Draggable>
          ))}

          {/* Cột trái - Màu đen */}
          <div
            className="w-[220px] p-6 text-white flex flex-col"
            style={{ backgroundColor: "rgb(211 196 196)" }}
          >
            {/* Avatar tròn */}
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:opacity-80 transition mx-auto mb-4"
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

            {/* Tên */}
            <div className="text-center mb-6">
              <Draggable>
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  className="text-2xl font-bold cursor-move mb-1"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Nguyễn Văn An
                </h1>
              </Draggable>
              <Draggable>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  className="text-sm cursor-move"
                >
                  Software Engineer
                </p>
              </Draggable>
            </div>

            {/* Thông tin cá nhân */}
            <div className="mb-6">
              <div
                className="font-bold text-sm mb-3 pb-2 border-b border-gray-600"
                style={{ color: "#ffffff" }}
              >
                THÔNG TIN CÁ NHÂN
              </div>
              <div className="space-y-2 text-xs">
                <Draggable>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start cursor-move"
                  >
                    <span className="mr-2">📱</span>
                    <span>0912 345 678</span>
                  </div>
                </Draggable>
                <Draggable>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start cursor-move"
                  >
                    <span className="mr-2">📅</span>
                    <span>15/08/1995</span>
                  </div>
                </Draggable>
                <Draggable>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start cursor-move"
                  >
                    <span className="mr-2">✉️</span>
                    <span>nguyenvanan.dev@gmail.com</span>
                  </div>
                </Draggable>
                <Draggable>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start cursor-move"
                  >
                    <span className="mr-2">🌐</span>
                    <span>github.com/nguyenvanan</span>
                  </div>
                </Draggable>
                <Draggable>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start cursor-move"
                  >
                    <span className="mr-2">📍</span>
                    <span>Quận 1, TP. Hồ Chí Minh</span>
                  </div>
                </Draggable>
              </div>
            </div>

            {/* Học vấn */}
            <div className="mb-6">
              <div className="font-bold text-sm mb-3 pb-2 border-b border-gray-600">
                HỌC VẤN
              </div>
              <div className="space-y-1 text-xs">
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="font-semibold cursor-move"
                  >
                    Đại học Bách Khoa TP.HCM
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    2013 - 2017
                  </p>
                </Draggable>
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="italic cursor-move"
                  >
                    Công nghệ Phần mềm
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    GPA: 3.6/4.0
                  </p>
                </Draggable>
              </div>
            </div>

            {/* Kỹ năng */}
            <div className="mb-6">
              <div className="font-bold text-sm mb-3 pb-2 border-b border-gray-600">
                KỸ NĂNG
              </div>
              <div className="space-y-2 text-xs">
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    JAVASCRIPT / TYPESCRIPT
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    REACT / NODE.JS
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    MONGODB / POSTGRESQL
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    GIT / DOCKER
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    AWS / AZURE
                  </p>
                </Draggable>
              </div>
            </div>

            {/* Người giới thiệu */}
            <div className="mb-6">
              <div className="font-bold text-sm mb-3 pb-2 border-b border-gray-600">
                NGƯỜI GIỚI THIỆU
              </div>
              <div className="space-y-1 text-xs">
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="font-semibold cursor-move"
                  >
                    Trần Minh Tuấn - Tech Lead
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    FPT Software Solutions
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning className="cursor-move">
                    Tel.: 0909 123 456
                  </p>
                </Draggable>
              </div>
            </div>

            {/* Sở thích */}
            <div>
              <div className="font-bold text-sm mb-3 pb-2 border-b border-gray-600">
                SỞ THÍCH
              </div>
              <Draggable>
                <p contentEditable suppressContentEditableWarning className="text-xs cursor-move">
                  Code Review - Học công nghệ mới - Đọc sách - Chơi cờ vây
                </p>
              </Draggable>
            </div>
          </div>

          {/* Cột phải - Nội dung chính */}
          <div className="flex-1 p-8" style={{ backgroundColor: "#ffffff" }}>
            {/* Mục tiêu nghề nghiệp */}
            <div className="mb-6">
              <div
                className="font-bold text-base mb-2 pb-1"
                style={{
                  color: "#1a1a1a",
                  borderBottom: "2px solid #1a1a1a",
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                >
                  MỤC TIÊU NGHỀ NGHIỆP
                </span>
              </div>
              <Draggable>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="text-xs leading-relaxed cursor-move"
                  style={{ color: "#333" }}
                >
                  Với hơn 5 năm kinh nghiệm trong lĩnh vực phát triển phần mềm,
                  tôi đã tích lũy được kiến thức vững chắc về Full-stack Development,
                  đặc biệt là React và Node.js. Mục tiêu của tôi trong 2 năm tới
                  là trở thành Senior Software Engineer, đồng thời học hỏi thêm
                  về kiến trúc hệ thống phân tán và công nghệ Cloud. Mong muốn
                  đóng góp vào các dự án có tác động lớn và phát triển cùng đội ngũ
                  kỹ thuật chuyên nghiệp.
                </p>
              </Draggable>
            </div>

            {/* Kinh nghiệm làm việc */}
            <div className="mb-6">
              <div
                className="font-bold text-base mb-2 pb-1"
                style={{
                  color: "#1a1a1a",
                  borderBottom: "2px solid #1a1a1a",
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                >
                  KINH NGHIỆM LÀM VIỆC
                </span>
              </div>

              {/* Công việc 1 */}
              <div className="mb-4">
                <div className="flex items-start mb-1">
                  <span className="text-lg mr-2">●</span>
                  <div className="flex-1">
                    <Draggable>
                      <h4
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-xs cursor-move"
                      >
                        FPT Software Solutions
                      </h4>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-xs text-gray-600 cursor-move"
                      >
                        03/2020 - Nay
                      </p>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold text-xs cursor-move"
                      >
                        FULL-STACK DEVELOPER
                      </p>
                    </Draggable>
                  </div>
                </div>
                <ul
                  className="list-disc ml-6 text-xs space-y-1"
                  style={{ color: "#333" }}
                >
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Phát triển và maintain hệ thống quản lý nhân sự với React, 
                      Node.js, MongoDB phục vụ 5000+ users.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Xây dựng RESTful API và microservices architecture, giảm 
                      30% thời gian response time của hệ thống.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Implement CI/CD pipeline với Docker và Jenkins, tăng 40% 
                      tốc độ deployment.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Code review và mentor cho 3 junior developers, đảm bảo 
                      code quality và best practices.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Tối ưu database queries và caching strategies, giảm 50% 
                      database load trong giờ cao điểm.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Thiết kế và phát triển real-time chat feature sử dụng 
                      WebSocket, phục vụ 1000+ concurrent connections.
                    </li>
                  </Draggable>
                </ul>
              </div>
            </div>

            {/* Hoạt động */}
            <div className="mb-6">
              <div
                className="font-bold text-base mb-2 pb-1"
                style={{
                  color: "#1a1a1a",
                  borderBottom: "2px solid #1a1a1a",
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                >
                  HOẠT ĐỘNG
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-start mb-1">
                  <span className="text-lg mr-2">●</span>
                  <div className="flex-1">
                    <Draggable>
                      <h4
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-xs cursor-move"
                      >
                        Hackathon Vietnam 2023
                      </h4>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-xs text-gray-600 cursor-move"
                      >
                        Tháng 10/2023
                      </p>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-xs cursor-move"
                      >
                        Giải Nhì - Phát triển ứng dụng AI
                      </p>
                    </Draggable>
                  </div>
                </div>
                <ul
                  className="list-disc ml-6 text-xs space-y-1"
                  style={{ color: "#333" }}
                >
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Phát triển chatbot AI sử dụng GPT-4 API để hỗ trợ học 
                      tiếng Anh trong 48 giờ.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning className="cursor-move">
                      Xây dựng frontend với React và backend với FastAPI, 
                      deploy lên AWS EC2.
                    </li>
                  </Draggable>
                </ul>
              </div>
            </div>

            {/* Chứng chỉ */}
            <div className="mb-6">
              <div
                className="font-bold text-base mb-2 pb-1"
                style={{
                  color: "#1a1a1a",
                  borderBottom: "2px solid #1a1a1a",
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                >
                  CHỨNG CHỈ
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start">
                  <span className="text-lg mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold cursor-move"
                      >
                        2024
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning className="cursor-move">
                        AWS Certified Solutions Architect - Associate
                      </p>
                    </Draggable>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-lg mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold cursor-move"
                      >
                        2022
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning className="cursor-move">
                        MongoDB Certified Developer Associate
                      </p>
                    </Draggable>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh hiệu và giải thưởng */}
            <div>
              <div
                className="font-bold text-base mb-2 pb-1"
                style={{
                  color: "#1a1a1a",
                  borderBottom: "2px solid #1a1a1a",
                }}
              >
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                >
                  DANH HIỆU VÀ GIẢI THƯỞNG
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start">
                  <span className="text-lg mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold cursor-move"
                      >
                        2024
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning className="cursor-move">
                        Best Developer of the Year - FPT Software
                      </p>
                    </Draggable>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-lg mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold cursor-move"
                      >
                        2023
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning className="cursor-move">
                        Excellence Performance Award - Q3 2023
                      </p>
                    </Draggable>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CVSoftwareEngineer;
