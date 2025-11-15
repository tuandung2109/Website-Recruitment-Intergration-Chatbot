import { useNavigate } from "react-router-dom";
import { updateAccountMoney } from "../../services/account";
import { useState, useEffect } from "react";

function CreateCVIndex() {
  const navigate = useNavigate();
  const [currentAccount, setCurrentAccount] = useState(null);

  // Load account từ localStorage khi component mount
  useEffect(() => {
    const accountData = JSON.parse(localStorage.getItem("account"));
    if (accountData) setCurrentAccount(accountData);
  }, []);

  const cvOptions = [
    {
      title: "🧩 CV tự thiết kế",
      desc: "Free",
      path: "/cvselfMade",
      price: 0,
      color: "#e0f2fe",
      textColor: "#0369a1",
    },
    {
      title: "📄 CV giáo viên mẫu",
      desc: "Trả phí 1k",
      path: "/createCVTeacherFixed",
      price: 1000,
      color: "#dcfce7",
      textColor: "#047857",
    },
    {
      title: "🎨 CV Content Marketing",
      desc: "Trả phí 1k",
      path: "/cvContentMarketing",
      price: 1000,
      color: "#fef3c7",
      textColor: "#d97706",
    },
    {
      title: "💻 CV Software Engineer",
      desc: "Trả phí 1k",
      path: "/cvSoftwareEngineer",
      price: 1000,
      color: "#e2e8f0",
      textColor: "#7493ddff",
    },
  ];

  const handleClick = async (cv) => {
    if (!window.confirm("⚠️ CV chưa được lưu. Bạn có muốn tiếp tục?")) return;

    if (!currentAccount) {
      alert("❌ Không tìm thấy thông tin tài khoản!");
      return;
    }

    if (cv.price > 0) {
      if (currentAccount.amount < cv.price) {
        alert("❌ Số dư không đủ để tạo CV trả phí!");
        return;
      }

      try {
        const data = await updateAccountMoney({
          account_id: currentAccount.account_id,
          deductAmount: cv.price, // Backend cần hỗ trợ deductAmount
        });

        if (!data || !data.account) {
          alert("❌ Lỗi khi trừ tiền!");
          return;
        }

        // Cập nhật state và localStorage
        setCurrentAccount(data.account);
        localStorage.setItem("account", JSON.stringify(data.account));

        alert(
          `✅ Đã trừ ${cv.price} từ tài khoản. Số dư hiện tại: ${data.account.amount}`
        );
      } catch (err) {
        console.error(err);
        alert("❌ Lỗi khi trừ tiền, vui lòng thử lại!");
        return;
      }
    }

    navigate(cv.path);
  };

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
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {cvOptions.map((cv, index) => (
          <div
            key={index}
            onClick={() => handleClick(cv)}
            style={{
              width: "280px",
              height: "200px",
              backgroundColor: cv.color,
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
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: cv.textColor,
              }}
            >
              {cv.title}
            </h2>
            <p style={{ fontSize: "14px", color: "#334155", marginTop: "6px" }}>
              {cv.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CreateCVIndex;
