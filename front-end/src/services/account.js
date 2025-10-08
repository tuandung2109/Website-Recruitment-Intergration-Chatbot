import { _get, _patch, _post } from "../utils/request";

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

const listAccountId = async (account_id) => {
  try {
    const res = await _get(`/account/listAccountId/${account_id}`);
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
// bỏ khóa
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

export {
  postRegister,
  loginAccount,
  listAccount,
  hardDeleteAccount,
  softDeleteAccount,
  unlockDeleteAccount,
  listAccountId,
};
