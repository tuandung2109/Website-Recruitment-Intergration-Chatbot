import { _get, _patch, _post } from "../utils/request";
const postRegister = async ({ username, password, email, phone_number }) => {
  try {
    const res = await _post(`/account/postRegister`, {
      username,
      password,
      email,
      phone_number,
    });
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        user: result.user,
      };
    } else {
      return {
        success: false,
        message: result.message || "Đăng ký không thành công",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "lỗi",
    };
  }
};
const loginAccount = async ({ email, password }) => {
  try {
    const res = await _post(`/account/postLogin`, { email, password });
    const result = await res.json();

    if (res.ok && result.success) {
      return { success: true, account: result.account };
    } else {
      return {
        success: false,
        message: result.message || "Email hoặc mật khẩu không đúng",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};
const listAccount = async () => {
  try {
    const res = await _get(`/account/listAccount`);
    const result = await res.json();

    if (res.ok) {
      return { success: true, accounts: result.accounts || [] };
    } else {
      return {
        success: false,
        message: result.error || "Không thể lấy danh sách tài khoản",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};
const listAccountId = async (id) => {
  try {
    const res = await _get(`/account/listAccountId/${id}`);
    const result = await res.json();

    if (res.ok) {
      return { success: true, accounts: result.accounts || [] };
    } else {
      return {
        success: false,
        message: result.error || "Không thể lấy danh sách tài khoản",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};
const hardDeleteAccount = async () => {};
// khóa
const softDeleteAccount = async (account_id) => {
  try {
    const res = await _patch(`/account/hardDeleteLogin/${account_id}`);
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: error.message || "lỗi",
    };
  }
};
// Bỏ khóa
const unlockDeleteAccount = async (account_id) => {
  try {
    const res = await _patch(`/account/unlockDeleteLogin/${account_id}`);
    return await res.json();
  } catch (error) {
    return {
      success: false,
      message: error.message || "lỗi",
    };
  }
};
const unlinkCompany = async (account_id) => {
  try {
    const res = await _patch(`/account/unlinkCompany/${account_id}`);
    const result = await res.json();
    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi khi hủy liên kết công ty",
    };
  }
};
const userForgot = async (email) => {
  try {
    const res = await _post(`/account/resetPassword`, { email });
    const result = await res.json();
    if (result.success) {
      alert("Vui lòng kiểm tra email để nhập mã OTP");
    } else {
      alert(result.message || "Đã xảy ra lỗi.");
    }
    return result;
  } catch (error) {
    alert(error.message || "Lỗi kết nối máy chủ.");
    return {
      success: false,
      message: error.message || "Lỗi kết nối máy chủ.",
    };
  }
};
const userOtp = async ({ email, otp }) => {
  try {
    const res = await _post(`/account/otp`, { email, otp });
    const result = await res.json();
    if (result.success) {
      alert("OTP hợp lệ. Đang chuyển đến trang đặt lại mật khẩu...");
      localStorage.setItem("tokenUser", result.tokenUser);
    } else {
      alert(result.message || "Mã OTP không hợp lệ.");
    }
    console.log(result);
    return result;
  } catch (error) {
    alert(error.message || "Lỗi xác minh OTP");
    return { success: false };
  }
};
const userResetPassword = async ({ email, password }) => {
  const tokenUser = localStorage.getItem("tokenUser");
  try {
    const res = await _post(`/account/resetPassword`, {
      email,
      password,
      tokenUser,
    });
    const rawText = await res.text(); // luôn đọc dưới dạng text để debug lỗi JSON
    console.log("Raw response text:", rawText);
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (err) {
      console.error("Lỗi parse JSON:", err);
      return { success: false, message: "Server không trả về JSON." };
    }
    // console.log("resulttttt:", result);
    if (result.success) {
      alert("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
    } else {
      alert(result.message || "Không thể đặt lại mật khẩu.");
    }
    return result;
  } catch (error) {
    alert(error.message || "Lỗi kết nối khi đặt lại mật khẩu.");
    return { success: false };
  }
};
const sendOtpRegister = async (email) => {
  const res = await _post("/account/checkEmailAndSendOtp", { email });
  const data = await res.json();
  return data;
};
const verifyOtpRegister = async (email, otp) => {
  const res = await _post("/account/verifyOtp", { email, otp });
  const data = await res.json();
  return data;
};
const updateAccount = async (body) => {
  try {
    const res = await _patch(`/account/updateAccount`, body);
    const result = await res.json();
    if (res.ok) {
      return { success: true, account: result.account };
    } else {
      return {
        success: false,
        message: result.error || "Không thể cập nhật tài khoản",
      };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};
const changePassword = async (data) => {
  try {
    const res = await _patch(`/account/changePassword`, data);
    const result = await res.json();
    return res.ok
      ? { success: true, message: result.message }
      : { success: false, message: result.error };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
const sendOtpForgotPassword = async (email) => {
  const res = await _post("/account/sendOtpForgotPassword", { email });
  const data = await res.json();
  return data;
};

const updateAccountMoney = async ({ account_id, deductAmount }) => {
  try {
    const res = await _patch("/account/updateAccountMoney", {
      account_id,
      deductAmount,
    });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export {
  postRegister,
  loginAccount,
  sendOtpForgotPassword,
  listAccount,
  hardDeleteAccount,
  softDeleteAccount,
  unlockDeleteAccount,
  unlinkCompany,
  listAccountId,
  userResetPassword,
  userOtp,
  userForgot,
  sendOtpRegister,
  verifyOtpRegister,
  updateAccount,
  changePassword,
  updateAccountMoney,
};
