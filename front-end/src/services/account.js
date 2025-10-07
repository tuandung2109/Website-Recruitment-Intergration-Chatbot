import { _get, _post } from "../utils/request";

const postRegister = async ({ username, password, email, phone }) => {
  try {
    const res = await _post(`/account/postRegister`, {
      username,
      password,
      email,
      phone,
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
      return { success: true, account: result.account }; // ✅ đổi 'user' → 'account'
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

export { postRegister, loginAccount, listAccount };
