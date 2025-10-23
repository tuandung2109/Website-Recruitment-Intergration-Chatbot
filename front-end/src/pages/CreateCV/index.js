import { useNavigate } from "react-router-dom";

function CreateCVIndex() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#047857",
          marginBottom: "12px",
        }}
      >
        Chọn loại CV bạn muốn tạo
      </h1>

      <div
        style={{
          display: "flex",
          gap: "40px",
        }}
      >
        {/* CV tự thiết kế */}
        <div
          onClick={() => navigate("/cvselfMade")}
          style={{
            width: "280px",
            height: "200px",
            backgroundColor: "#e0f2fe",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            flexDirection: "column",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#0369a1" }}>
            🧩 CV tự thiết kế
          </h2>
          <p style={{ fontSize: "14px", color: "#334155", marginTop: "6px" }}>
            Kéo thả, tùy chỉnh, sáng tạo tự do
          </p>
        </div>

        {/* CV mẫu có sẵn */}
        <div
          onClick={() => navigate("/createCVTeacherFixed")}
          style={{
            width: "280px",
            height: "200px",
            backgroundColor: "#dcfce7",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            flexDirection: "column",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#047857" }}>
            📄 CV giáo viên mẫu
          </h2>
          <p style={{ fontSize: "14px", color: "#334155", marginTop: "6px" }}>
            Mẫu CV được thiết kế sẵn, chỉ cần chỉnh sửa
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateCVIndex;
