import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  Briefcase,
  Users,
  TrendingUp,
} from "lucide-react";
import UseTitle from "../../hooks/useTitle";
import {
  postRegister,
  verifyOtpRegister,
  sendOtpRegister,
} from "../../services/account";

const Register = () => {
  UseTitle("JobVip - Đăng ký");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    accountType: "jobseeker",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }
    if (!formData.phone_number) {
      newErrors.phone_number = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Số điện thoại không hợp lệ";
    }
    // if (!formData.date_of_birth) {
    //   newErrors.date_of_birth = "Vui lòng chọn ngày sinh";
    // }
    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Bạn cần đồng ý với điều khoản";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      setLoading(true);
      const resOtp = await sendOtpRegister(formData.email);
      if (!resOtp.success) {
        setErrors({ email: resOtp.message || "Không gửi được OTP!" });
        return;
      }

      // ✅ Hiện form nhập OTP
      setEmailForOtp(formData.email);
      setShowOtpForm(true);
    } catch (error) {
      console.error("❌ Lỗi gửi OTP:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      setLoading(true);
      const verify = await verifyOtpRegister(emailForOtp, otp);
      if (!verify.success) {
        setOtpError(verify.message || "Mã OTP không đúng hoặc đã hết hạn!");
        return;
      }

      // ✅ Gọi API đăng ký khi OTP đúng
      const resRegister = await postRegister({
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
      });

      if (resRegister.success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        alert(resRegister.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi xác minh OTP:", error);
      setOtpError("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex">
        {showOtpForm && (
          <div className="p-4 border-2 border-blue-400 rounded-xl bg-blue-50 mt-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">
              Nhập mã OTP xác thực
            </h3>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError("");
              }}
              className="w-full px-4 py-2 border-2 rounded-lg border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nhập mã OTP gồm 6 chữ số"
            />
            {otpError && (
              <p className="text-red-600 mt-2 text-sm">{otpError}</p>
            )}

            <div className="flex justify-end mt-3 space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setShowOtpForm(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}

        {/* Left Side */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
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
                Bắt đầu
                <br />
                hành trình
                <br />
                mới
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                Tham gia cộng đồng hàng ngàn ứng viên và nhà tuyển dụng. Tìm
                kiếm cơ hội phù hợp với bạn.
              </p>
            </div>
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Kết nối nhanh chóng
                </h3>
                <p className="text-blue-200 text-sm">
                  Tìm được việc làm phù hợp chỉ trong vài phút
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Phát triển sự nghiệp
                </h3>
                <p className="text-blue-200 text-sm">
                  Công cụ và nguồn lực để thành công
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-2xl py-8">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-600 font-bold text-2xl">JobVip</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Tạo tài khoản
              </h2>
              <p className="text-gray-600">Điền thông tin để bắt đầu</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border-2 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-12 py-3 border-2 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Xác nhận <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-12 py-3 border-2 ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone & DOB Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border-2 ${
                        errors.phone_number
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="0123456789"
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border-2 ${
                        errors.date_of_birth
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    />
                  </div>
                  {errors.date_of_birth && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.date_of_birth}
                    </p>
                  )}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`block w-full px-3 py-3 border-2 ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                {errors.gender && (
                  <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>

              {/* Terms */}
              <div>
                <div className="flex items-start">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="agreeTerms"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Tôi đồng ý với{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Điều khoản dịch vụ
                    </a>{" "}
                    và{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Chính sách bảo mật
                    </a>
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.agreeTerms}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/50 disabled:opacity-60"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
