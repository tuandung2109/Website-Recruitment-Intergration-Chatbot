import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  Shield,
  Clock,
  KeyRound,
} from "lucide-react";
import {
  listAccount,
  verifyOtpRegister,
  sendOtpForgotPassword,
  sendOtpRegister,
  updateAccount,
} from "../../services/account";
import UseTitle from "../../hooks/useTitle";

const ForgotPassword = () => {
  UseTitle("JobVip - Quên mật khẩu");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("email"); // "email" | "otp" | "reset" | "done"

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // 📩 B1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Vui lòng nhập email");
    if (!validateEmail(email)) return setError("Email không hợp lệ");

    setIsLoading(true);
    const accountRes = await listAccount();
    const found = accountRes?.accounts?.find((acc) => acc.email === email);

    if (!found) {
      setIsLoading(false);
      return setError("Email này chưa được đăng ký");
    }

    const res = await sendOtpForgotPassword(email);
    setIsLoading(false);

    if (res.success) {
      setStep("otp");
    } else {
      setError(res.message || "Không thể gửi mã OTP, vui lòng thử lại");
    }
  };

  // 🔢 B2: Xác minh OTP
  const handleVerifyOtp = async () => {
    setError("");
    if (!otp) return setError("Vui lòng nhập mã OTP");
    setIsLoading(true);

    const res = await verifyOtpRegister(email, otp);
    setIsLoading(false);

    if (res.success) {
      setStep("reset");
    } else {
      setError(res.message || "Mã OTP không chính xác hoặc đã hết hạn");
    }
  };

  // 🔒 B3: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6)
      return setError("Mật khẩu phải có ít nhất 6 ký tự");
    if (password !== confirmPassword)
      return setError("Mật khẩu nhập lại không khớp");

    setIsLoading(true);
    const accountRes = await listAccount();
    const found = accountRes?.accounts?.find((acc) => acc.email === email);

    if (!found) {
      setIsLoading(false);
      return setError("Không tìm thấy tài khoản để đặt lại mật khẩu");
    }

    const res = await updateAccount({
      account_id: found.account_id,
      password,
    });

    setIsLoading(false);
    if (res.success) {
      setStep("done");
    } else {
      setError(res.message || "Không thể đặt lại mật khẩu, thử lại sau");
    }
  };

  // ✅ B4: Thành công
  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-6 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Đặt lại mật khẩu thành công!
          </h2>
          <p className="text-gray-600">
            Bạn có thể đăng nhập lại bằng mật khẩu mới.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/50"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // ============================ GIAO DIỆN TỪNG BƯỚC ============================
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900 rounded-full opacity-20 -ml-40 -mb-40"></div>

        <div className="relative z-10">
          <Link
            to="/"
            className="flex items-center space-x-3 mb-12 hover:opacity-80 transition-opacity"
          >
            <div className="bg-white p-3 rounded-xl">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-white font-bold text-3xl">JobVip</span>
          </Link>

          <div className="mt-20">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Đừng lo lắng! <br />
              Chúng tôi sẽ giúp bạn
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Chỉ cần vài bước đơn giản để đặt lại mật khẩu và lấy lại quyền
              truy cập.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-blue-100 text-sm">
              Bảo mật cao với mã hóa đầu cuối
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-blue-100 text-sm">
              Xử lý nhanh chóng trong vài phút
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                {step === "reset" ? (
                  <KeyRound className="h-10 w-10 text-blue-600" />
                ) : (
                  <Mail className="h-10 w-10 text-blue-600" />
                )}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === "email"
                ? "Quên mật khẩu?"
                : step === "otp"
                ? "Nhập mã OTP"
                : "Đặt lại mật khẩu"}
            </h2>
            <p className="text-gray-600">
              {step === "email" &&
                "Nhập email để chúng tôi gửi mã xác minh đến bạn."}
              {step === "otp" && "Nhập mã OTP vừa được gửi đến email của bạn."}
              {step === "reset" &&
                "Nhập mật khẩu mới để hoàn tất quá trình đặt lại."}
            </p>
          </div>

          {/* Form */}
          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="example@email.com"
                  className={`w-full border-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP 6 chữ số"
                  className={`w-full border-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Đang xác minh..." : "Xác nhận OTP"}
              </button>
            </div>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className={`w-full border-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập lại mật khẩu
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  className={`w-full border-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Đang lưu..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          <div className="text-center pt-4">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
