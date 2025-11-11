import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  Shield,
  Clock,
} from "lucide-react";
import UseTitle from "../../hooks/useTitle";
const ForgotPassword = () => {
  UseTitle("JobVip - Quên mật khẩu");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      console.log("Reset password email sent to:", email);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full opacity-20 -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-900 rounded-full opacity-20 -ml-40 -mb-40"></div>

          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white p-6 rounded-full">
                <CheckCircle className="h-20 w-20 text-green-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Email đã được gửi!
            </h1>
            <p className="text-green-100 text-xl max-w-md mx-auto">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn
            </p>
          </div>
        </div>

        {/* Right Side - Success Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Success Icon */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="lg:hidden">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Email đã được gửi!
                </h2>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-600 mb-4">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                </p>
                <p className="text-blue-600 font-semibold text-lg">{email}</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Kiểm tra email của bạn
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Link sẽ hết hạn sau 15 phút
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Không nhận được email?{" "}
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setEmail("");
                      }}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Gửi lại
                    </button>
                  </p>

                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/50"
                  >
                    Quay lại đăng nhập
                  </button>

                  <Link
                    to="/"
                    className="block text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Về trang chủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-20 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900 rounded-full opacity-20 -ml-40 -mb-40"></div>

        <div className="relative z-10">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 mb-12 hover:opacity-80 transition-opacity"
          >
            <div className="bg-white p-3 rounded-xl">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-white font-bold text-3xl">JobVip</span>
          </Link>

          {/* Main content */}
          <div className="mt-20">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Đừng lo lắng!
              <br />
              Chúng tôi sẽ giúp bạn
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Việc quên mật khẩu là chuyện bình thường. Chỉ cần vài bước đơn
              giản để lấy lại quyền truy cập.
            </p>
          </div>
        </div>

        {/* Security Features */}
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
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-blue-600 font-bold text-2xl">JobVip</span>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quên mật khẩu?
            </h2>
            <p className="text-gray-600">
              Nhập email và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={`block w-full pl-10 pr-3 py-3 border-2 ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="example@email.com"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/50 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang gửi...
                </span>
              ) : (
                "Gửi link đặt lại mật khẩu"
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Cần thêm trợ giúp?</p>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Liên hệ bộ phận hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
