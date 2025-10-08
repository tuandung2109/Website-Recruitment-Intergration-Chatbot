import { _get, _post } from "../utils/request";

const listInvoice = async () => {
  try {
    const res = await _get(`/invoice/listInvoice`);
    const result = await res.json();

    if (res.ok && result.invoice) {
      return {
        success: true,
        invoices: result.invoice,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể lấy danh sách công ty",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};
const postInvoice = async ({ username, password, email, phone }) => {
  try {
    const res = await _post(`/account/listInvoice`, {
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
export { listInvoice, postInvoice };
