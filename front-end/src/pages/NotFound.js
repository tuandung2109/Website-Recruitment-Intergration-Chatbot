import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000); // 3 giây quay lại trang chủ

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-2xl text-gray-800 mb-6">
        Trang bạn truy cập không tồn tại.
      </p>
      <p className="text-gray-500">
        Tự động quay lại trang chủ sau vài giây...
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all"
      >
        Quay lại ngay
      </button>
    </div>
  );
}

export default NotFound;
