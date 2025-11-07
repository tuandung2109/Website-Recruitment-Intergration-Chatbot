import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function CVContentMarketing() {
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
        el.className = '';

        el.style.backgroundColor = normalizeColor(styles.backgroundColor, 'backgroundColor');
        el.style.color = normalizeColor(styles.color, 'color');
        el.style.borderColor = normalizeColor(styles.borderColor, 'borderColor');
        el.style.fontSize = styles.fontSize;
        el.style.fontWeight = styles.fontWeight;
        el.style.fontFamily = styles.fontFamily;
        el.style.textAlign = styles.textAlign;
        el.style.padding = styles.padding;
        el.style.margin = styles.margin;
        el.style.display = styles.display;
        el.style.width = styles.width;
        el.style.height = styles.height;
        el.style.position = styles.position === 'static' ? 'relative' : styles.position;
        el.style.top = styles.top;
        el.style.left = styles.left;
        el.style.right = styles.right;
        el.style.bottom = styles.bottom;
        el.style.alignItems = styles.alignItems;
        el.style.justifyContent = styles.justifyContent;
        el.style.gap = styles.gap;
        el.style.flexDirection = styles.flexDirection;
        el.style.flexWrap = styles.flexWrap;
        el.style.letterSpacing = styles.letterSpacing;
        el.style.textTransform = styles.textTransform;
        el.style.lineHeight = styles.lineHeight;
        el.style.borderRadius = styles.borderRadius;
        el.style.borderWidth = styles.borderWidth;
        el.style.borderStyle = styles.borderStyle;
        el.style.boxSizing = styles.boxSizing;
        el.style.overflow = styles.overflow;
        el.style.whiteSpace = styles.whiteSpace;
      });

      const draggableDivs = cloneCV.querySelectorAll('div');
      draggableDivs.forEach((el) => {
        if (el.style.transform) {
          el.style.transform = 'none';
        }
        if (el.style.position === 'absolute' && !el.hasAttribute('contenteditable')) {
          el.style.position = 'relative';
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
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(cloneCV);

      htmlEl.style.backgroundColor = prevHtmlBg.color;
      htmlEl.style.backgroundImage = prevHtmlBg.image;
      htmlEl.style.background = prevHtmlBg.background;
      bodyEl.style.backgroundColor = prevBodyBg.color;
      bodyEl.style.backgroundImage = prevBodyBg.image;
      bodyEl.style.background = prevBodyBg.background;

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      pdf.save("CV_ContentMarketing.pdf");
    } catch (err) {
      alert("❌ Không thể tải PDF. Vui lòng thử lại!\nLỗi: " + err.message);
      console.error("Lỗi PDF:", err);
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

          {/* Cột trái - Màu xám */}
          <div
            className="w-[280px] p-6 text-white flex flex-col"
            style={{ backgroundColor: "#3a3a3a" }}
          >
            {/* Avatar tròn */}
            <div
              className="w-40 h-40 rounded-full overflow-hidden border-4 border-teal-400 shadow-lg cursor-pointer hover:opacity-80 transition mx-auto"
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
            <div className="text-center mt-6">
              <Draggable>
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  className="text-3xl font-bold text-teal-400 cursor-move"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Hoàng Tường Vy
                </h1>
              </Draggable>
              <Draggable>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onKeyDown={handleKeyDown}
                  className="text-lg mt-1 cursor-move"
                >
                  Content Marketing
                </p>
              </Draggable>
            </div>

            {/* Thông tin cá nhân */}
            <div className="mt-8">
              <div
                className="font-bold text-lg mb-3 pb-2"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                THÔNG TIN CÁ NHÂN
              </div>
              <div className="space-y-2 text-sm">
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start"
                  >
                    <span className="mr-2">📱</span>
                    <span>(024) 6680 5588</span>
                  </p>
                </Draggable>
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start"
                  >
                    <span className="mr-2">📅</span>
                    <span>06/12/1993</span>
                  </p>
                </Draggable>
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start"
                  >
                    <span className="mr-2">✉️</span>
                    <span>hoitrr@topcv.vn</span>
                  </p>
                </Draggable>
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start"
                  >
                    <span className="mr-2">🌐</span>
                    <span>be.net/tccuan</span>
                  </p>
                </Draggable>
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="flex items-start"
                  >
                    <span className="mr-2">📍</span>
                    <span>Ba Đình, Hà Nội</span>
                  </p>
                </Draggable>
              </div>
            </div>

            {/* Học vấn */}
            <div className="mt-8">
              <div
                className="font-bold text-lg mb-3 pb-2"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                HỌC VẤN
              </div>
              <div className="space-y-1 text-sm">
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="font-semibold"
                  >
                    🎓 Đại học TopCV
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    2015 - 2019
                  </p>
                </Draggable>
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="italic"
                  >
                    Truyền thông đại chúng
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    Xếp loại: Xuất sắc
                  </p>
                </Draggable>
              </div>
            </div>

            {/* Kỹ năng */}
            <div className="mt-8">
              <div
                className="font-bold text-lg mb-3 pb-2"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                KỸ NĂNG
              </div>
              <div className="space-y-2 text-sm">
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    KỸ NĂNG GIAO TIẾP
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    KỸ NĂNG LẮNG NGHE
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    KỸ NĂNG ĐÀM PHÁN
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    KỸ NĂNG GIẢI QUYẾT VẤN ĐỀ
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    KỸ NĂNG LÀM VIỆC DƯỚI ÁP LỰC CAO
                  </p>
                </Draggable>
              </div>
            </div>

            {/* Người giới thiệu */}
            <div className="mt-8">
              <div
                className="font-bold text-lg mb-3 pb-2"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                NGƯỜI GIỚI THIỆU
              </div>
              <div className="space-y-1 text-sm">
                <Draggable>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    className="font-semibold"
                  >
                    Đỗ Quỳnh Mai - HR Director
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    SVT Investment & Development Co., Ltd
                  </p>
                </Draggable>
                <Draggable>
                  <p contentEditable suppressContentEditableWarning>
                    Tel.: (024) 6680 5588
                  </p>
                </Draggable>
              </div>
            </div>

            {/* Sở thích */}
            <div className="mt-8">
              <div
                className="font-bold text-lg mb-3 pb-2"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "8px",
                  textAlign: "center",
                }}
              >
                SỞ THÍCH
              </div>
              <Draggable>
                <p contentEditable suppressContentEditableWarning className="text-sm">
                  Nấu ăn - Đọc sách - Nghe nhạc - Chơi thể thao
                </p>
              </Draggable>
            </div>
          </div>

          {/* Cột phải - Nội dung chính */}
          <div className="flex-1 p-8" style={{ backgroundColor: "#f5f5f5" }}>
            {/* Mục tiêu nghề nghiệp */}
            <div className="mb-6">
              <div
                className="font-bold text-xl mb-3 pb-1 text-white"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "6px 12px",
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
                  className="text-sm leading-relaxed"
                  style={{ color: "#333" }}
                >
                  Với hơn 5 năm kinh nghiệm trong lĩnh vực Content Marketing, tôi
                  đã trao dồi cho mình kiến thức chuyên môn ở đa dạng lĩnh vực,
                  đặc biệt là Giáo dục - Đào tạo. Mục tiêu của tôi trong 2 năm tới
                  là trở thành Leader Content Marketing. Học hỏi và triển khai
                  nhiều dự án content mới với vai trò dùng đột phá, đồng góp vào
                  sự phát triển bền vững của doanh nghiệp.
                </p>
              </Draggable>
            </div>

            {/* Kinh nghiệm làm việc */}
            <div className="mb-6">
              <div
                className="font-bold text-xl mb-3 pb-1 text-white"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "6px 12px",
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
                  <span className="text-2xl mr-2">●</span>
                  <div className="flex-1">
                    <Draggable>
                      <h4
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-sm"
                      >
                        SVT Investment & Development Co., Ltd
                      </h4>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-sm text-gray-600"
                      >
                        08/2019 - Now
                      </p>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold text-sm"
                      >
                        CHUYÊN VIÊN CONTENT MARKETING
                      </p>
                    </Draggable>
                  </div>
                </div>
                <ul
                  className="list-disc ml-8 text-sm space-y-1"
                  style={{ color: "#333" }}
                >
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Lên kế hoạch, trực tiếp triển khai và xây dựng nội dung cho
                      các kênh Marketing như: Website, Zalo, TikTok.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Sản xuất nội dung chạy quảng cáo quảng bá sản phẩm ứng dụng
                      học tập của trung tâm LittleMe trên Facebook.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Thúc đẩy tăng trưởng traffic từ nguồn referral lên 28% từ
                      24.800/tháng lên 31.000/tháng thông qua việc xây dựng nội
                      dung bài trend hàng ngày.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Các bài viết tương tác mang lại trung bình 520 leads/tháng,
                      tỷ lệ chuyển đổi lả 15.5%.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Nghiên cứu, phác thảo sản xuất content tĩnh gần như giải
                      nhượng văn đồm bảo chất lượng nội dung, gợp phản tinh kiện
                      35% chi phí sản xuất thông thường.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Sáng tạo, thường xuyên đề cập môxâ hợi tưởng tươi cáo mạng
                      xã hội Facebook, Tiktok tăng 285% so với thời điểm tháng
                      06/2022.
                    </li>
                  </Draggable>
                </ul>
              </div>
            </div>

            {/* Hoạt động */}
            <div className="mb-6">
              <div
                className="font-bold text-xl mb-3 pb-1 text-white"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "6px 12px",
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
                  <span className="text-2xl mr-2">●</span>
                  <div className="flex-1">
                    <Draggable>
                      <h4
                        contentEditable
                        suppressContentEditableWarning
                        className="font-bold text-sm"
                      >
                        CLB Truyền thông về Sự kiện (TopCV)
                      </h4>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-sm text-gray-600"
                      >
                        2016 - 2018
                      </p>
                    </Draggable>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="text-sm"
                      >
                        Thành viên Ban Chuyên môn
                      </p>
                    </Draggable>
                  </div>
                </div>
                <ul
                  className="list-disc ml-8 text-sm space-y-1"
                  style={{ color: "#333" }}
                >
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Quản lý trang Fanpage và xây dựng nội dung cho các bài đăng
                      giúp Fanpage tăng 2.000 lượt theo dõi sau 1 năm.
                    </li>
                  </Draggable>
                  <Draggable>
                    <li contentEditable suppressContentEditableWarning>
                      Hỗ trợ thiết kế hình ảnh, video để phục vụ các hoạt động
                      truyền thông của CLB.
                    </li>
                  </Draggable>
                </ul>
              </div>
            </div>

            {/* Chứng chỉ */}
            <div className="mb-6">
              <div
                className="font-bold text-xl mb-3 pb-1 text-white"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "6px 12px",
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
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-2xl mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold"
                      >
                        2023
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning>
                        HubSpot Content Marketing Certification
                      </p>
                    </Draggable>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold"
                      >
                        2021
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning>
                        Google Digital Garage - Fundamentals of Digital Marketing
                      </p>
                    </Draggable>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh hiệu và giải thưởng */}
            <div>
              <div
                className="font-bold text-xl mb-3 pb-1 text-white"
                style={{
                  backgroundColor: "#2d2d2d",
                  padding: "6px 12px",
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
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-2xl mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold"
                      >
                        2024
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning>
                        Employee of the Year Award
                      </p>
                    </Draggable>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-2xl mr-2">●</span>
                  <div>
                    <Draggable>
                      <p
                        contentEditable
                        suppressContentEditableWarning
                        className="font-semibold"
                      >
                        2022
                      </p>
                    </Draggable>
                    <Draggable>
                      <p contentEditable suppressContentEditableWarning>
                        Top Performer of the Year
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

export default CVContentMarketing;
