import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import jsPDF from "jspdf";

function CreateCV() {
  const [pages, setPages] = useState([{ id: 1 }]);
  const [currentPage, setCurrentPage] = useState(0);
  const fabricRefs = useRef([]);
  const [selected, setSelected] = useState(null);
  const [fontSize, setFontSize] = useState(20);
  const [color, setColor] = useState("#000000");
  const [borderRadius, setBorderRadius] = useState(0);
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showIcons, setShowIcons] = useState(false);

  // Danh sách icon hay dùng
  const icons = {
    phone: "📞",
    mail: "✉️",
    star: "⭐",
    location: "📍",
    github: "🐙",
    linkedin: "💼",
    education: "🎓",
    skills: "🛠️",
    experience: "💼",
    user: "👤",
  };

  useEffect(() => {
    // Khởi tạo tất cả canvas theo pages
    pages.forEach((_, index) => {
      if (!fabricRefs.current[index]) {
        const canvas = new fabric.Canvas(`cv-canvas-${index}`, {
          width: 800,
          height: 1100,
          backgroundColor: "#fff",
        });
        fabricRefs.current[index] = canvas;

        const text = new fabric.IText(`Trang ${index + 1}`, {
          left: 50,
          top: 50,
          fontSize: 28,
          fontWeight: "bold",
          fill: "#222",
        });
        canvas.add(text);

        canvas.on("selection:created", (e) => setSelected(e.target));
        canvas.on("selection:updated", (e) => setSelected(e.target));
        canvas.on("selection:cleared", () => setSelected(null));
      }
    });
  }, [pages]);

  const getCanvas = () => fabricRefs.current[currentPage];

  // ➕ Thêm text
  const addText = () => {
    const canvas = getCanvas();
    const newText = new fabric.IText("Nhập nội dung...", {
      left: 100,
      top: 200,
      fontSize: 20,
      fill: "#000",
    });
    canvas.add(newText);
    canvas.setActiveObject(newText);
    setSelected(newText);
  };

  // 🖼️ Thêm ảnh
  const addImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, (img) => {
        const clip = new fabric.Rect({
          rx: 0,
          ry: 0,
          width: img.width,
          height: img.height,
          originX: "center",
          originY: "center",
        });

        img.set({
          left: 150,
          top: 150,
          scaleX: 0.3,
          scaleY: 0.3,
          clipPath: clip,
        });

        const canvas = getCanvas();
        canvas.add(img);
        canvas.setActiveObject(img);
        setSelected(img);
      });
    };
    reader.readAsDataURL(file);
  };

  // ➖ Thêm đường kẻ
  const addLine = () => {
    const canvas = getCanvas();
    const line = new fabric.Line([50, 300, 750, 300], {
      stroke: "#333",
      strokeWidth: 2,
    });
    canvas.add(line);
  };

  // ⭐ Thêm icon
  const addIcon = (icon) => {
    const canvas = getCanvas();
    const text = new fabric.Text(icon, {
      left: 100,
      top: 100,
      fontSize: 30,
    });
    canvas.add(text);
  };

  // 🗑️ Xóa đối tượng
  const deleteSelected = () => {
    const canvas = getCanvas();
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.remove(obj);
      setSelected(null);
      canvas.renderAll();
    }
  };

  // 🎨 Đổi màu nền
  const changeBackground = (color) => {
    setBgColor(color);
    const canvas = getCanvas();
    canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
  };

  // 📄 Xuất PDF (gộp nhiều trang)
  const exportPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    pages.forEach((_, i) => {
      const canvas = fabricRefs.current[i];
      const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(dataURL, "PNG", 0, 0, imgWidth, imgHeight);
    });
    pdf.save("my_cv.pdf");
  };

  // 🔤 Font size
  const handleFontSizeChange = (value) => {
    setFontSize(value);
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "i-text") {
      obj.set("fontSize", parseInt(value));
      getCanvas().renderAll();
    }
  };

  // 🎨 Đổi màu chữ
  const handleColorChange = (value) => {
    setColor(value);
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "i-text") {
      obj.set("fill", value);
      getCanvas().renderAll();
    }
  };

  // 💪 In đậm
  const toggleBold = () => {
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "i-text") {
      obj.set("fontWeight", obj.fontWeight === "bold" ? "normal" : "bold");
      getCanvas().renderAll();
    }
  };

  // ✍️ In nghiêng
  const toggleItalic = () => {
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "i-text") {
      obj.set("fontStyle", obj.fontStyle === "italic" ? "normal" : "italic");
      getCanvas().renderAll();
    }
  };

  // 🔠 Viết hoa
  const toggleUppercase = () => {
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "i-text") {
      const newText =
        obj.text === obj.text.toUpperCase()
          ? obj.text.toLowerCase()
          : obj.text.toUpperCase();
      obj.set("text", newText);
      getCanvas().renderAll();
    }
  };

  // 🔄 Xoay ảnh
  const rotateSelected = (angle) => {
    const obj = getCanvas().getActiveObject();
    if (obj) {
      obj.rotate(obj.angle + angle);
      getCanvas().renderAll();
    }
  };

  // 🔁 Lật ngang ảnh
  const flipHorizontal = () => {
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "image") {
      obj.set("flipX", !obj.flipX);
      getCanvas().renderAll();
    }
  };

  // 🟣 Bo góc ảnh
  const handleBorderRadius = (percent) => {
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "image") {
      const rx = (obj.width / 2) * (percent / 50);
      const ry = (obj.height / 2) * (percent / 50);
      const clipPath = new fabric.Rect({
        rx,
        ry,
        width: obj.width,
        height: obj.height,
        originX: "center",
        originY: "center",
      });
      obj.set({ clipPath });
      getCanvas().renderAll();
      setBorderRadius(percent);
    }
  };

  // 🧱 Viền ảnh
  const handleBorderChange = (width, color) => {
    setBorderWidth(width);
    setBorderColor(color);
    const obj = getCanvas().getActiveObject();
    if (obj?.type === "image") {
      obj.set({
        stroke: color,
        strokeWidth: parseInt(width),
      });
      getCanvas().renderAll();
    }
  };

  // ➕ Trang mới
  const addPage = () => {
    const newPage = { id: pages.length + 1 };
    setPages([...pages, newPage]);
    setCurrentPage(pages.length);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* 🎛 Toolbar */}
      <div className="flex flex-wrap justify-center gap-2 bg-gray-100 p-3 rounded-lg shadow w-[90%]">
        <button
          onClick={addText}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          ➕ Thêm Text
        </button>
        <label className="bg-green-600 text-white px-3 py-2 rounded cursor-pointer">
          🖼️ Thêm Ảnh
          <input
            type="file"
            onChange={addImage}
            accept="image/*"
            className="hidden"
          />
        </label>
        <button
          onClick={addLine}
          className="bg-gray-600 text-white px-3 py-2 rounded"
        >
          ➖ Đường kẻ
        </button>
        <button
          onClick={() => setShowIcons(!showIcons)}
          className="bg-yellow-500 text-white px-3 py-2 rounded"
        >
          ⭐ Icon
        </button>
        {showIcons && (
          <div className="flex flex-wrap gap-1 bg-white border rounded p-2 shadow max-w-[300px]">
            {Object.entries(icons).map(([key, val]) => (
              <button
                key={key}
                onClick={() => addIcon(val)}
                className="text-xl hover:bg-gray-200 px-2 rounded"
              >
                {val}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={deleteSelected}
          className="bg-red-700 text-white px-3 py-2 rounded"
        >
          🗑️ Xóa
        </button>
        <button
          onClick={addPage}
          className="bg-purple-600 text-white px-3 py-2 rounded"
        >
          ➕ Trang mới
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-3 py-2 rounded"
        >
          📄 Xuất PDF
        </button>

        {/* Font + Style */}
        <label className="ml-2">
          Cỡ chữ:
          <input
            type="number"
            min="10"
            max="80"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="ml-1 border px-1 w-16"
          />
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="ml-2 w-8 h-8 border"
        />
        <button
          onClick={toggleBold}
          className="bg-gray-700 text-white px-2 py-1 rounded font-bold"
        >
          B
        </button>
        <button
          onClick={toggleItalic}
          className="bg-gray-700 text-white px-2 py-1 rounded italic"
        >
          I
        </button>
        <button
          onClick={toggleUppercase}
          className="bg-gray-700 text-white px-2 py-1 rounded uppercase"
        >
          Aa
        </button>

        {/* Ảnh */}
        <label className="ml-2 flex items-center gap-2">
          Bo góc:
          <input
            type="range"
            min="0"
            max="50"
            value={borderRadius}
            onChange={(e) => handleBorderRadius(e.target.value)}
          />
          <span>{borderRadius}%</span>
        </label>
        <label className="ml-2">
          Viền:
          <input
            type="number"
            min="0"
            max="10"
            value={borderWidth}
            onChange={(e) => handleBorderChange(e.target.value, borderColor)}
            className="ml-1 w-12 border"
          />
        </label>
        <input
          type="color"
          value={borderColor}
          onChange={(e) => handleBorderChange(borderWidth, e.target.value)}
          className="w-8 h-8 border"
        />
        <button
          onClick={() => rotateSelected(15)}
          className="bg-gray-600 text-white px-3 py-2 rounded"
        >
          ↩️ Xoay 15°
        </button>
        <button
          onClick={flipHorizontal}
          className="bg-gray-600 text-white px-3 py-2 rounded"
        >
          🔁 Lật ngang
        </button>

        {/* 🎨 Màu nền */}
        <label className="ml-2 flex items-center gap-2">
          Nền:
          <input
            type="color"
            value={bgColor}
            onChange={(e) => changeBackground(e.target.value)}
          />
        </label>
      </div>

      {/* Danh sách trang */}
      <div className="flex gap-2 mt-3">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`px-3 py-1 rounded border ${
              i === currentPage ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            Trang {i + 1}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div id="cv-wrapper" className="border shadow bg-white mt-3">
        {pages.map((_, i) => (
          <canvas
            key={i}
            id={`cv-canvas-${i}`}
            style={{ display: i === currentPage ? "block" : "none" }}
          />
        ))}
      </div>
    </div>
  );
}

export default CreateCV;
