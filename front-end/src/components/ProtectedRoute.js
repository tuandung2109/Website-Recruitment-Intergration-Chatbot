import { Navigate, Outlet } from "react-router-dom";
import Chatbot from "./Chatbot";

const ProtectedRoute = ({ allowedRoles }) => {
  const account = JSON.parse(localStorage.getItem("account"));

  // Nếu chưa đăng nhập
  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const role = account.account_account_type?.[0]?.account_type?.role_name;

  // Nếu role không nằm trong danh sách cho phép
  if (!allowedRoles.includes(role)) {
    // Có thể chuyển hướng về trang chủ hoặc 403
    return <Navigate to="/" replace />;
  }

  <Chatbot />;
  return <Outlet />;
};

export default ProtectedRoute;
