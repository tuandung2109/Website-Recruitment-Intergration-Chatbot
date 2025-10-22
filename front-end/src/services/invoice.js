import { _get, _patch, _post } from "../utils/request";

const listInvoice1 = async () => {
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
        message: result.message || "Không thể lấy danh sách hóa đơn",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};
const postInvoice = async ({ password, email }) => {
  try {
    const res = await _post(`/account/listInvoice`, {
      password,
      email,
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
        message: result.message || "Tạo không thành công",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "lỗi",
    };
  }
};

const createPayment = (account_id, amount) =>
  _post("/invoice/create-qr", { account_id, amount });

// Kiểm tra kết quả thanh toán
const checkPayment = (query) => _get(`/invoice/check-payment-vnpay?${query}`);

const listInvoice = async () => {
  try {
    const res = await _get(`/invoice/listInvoice`);
    const result = await res.json();

    if (res.ok && result.invoice) {
      return { success: true, invoices: result.invoice };
    }
    return {
      success: false,
      message: result.message || "Không thể lấy danh sách hóa đơn",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updateInvoiceStatus = async (invoice_id) => {
  try {
    const res = await _patch(`/invoice/updateInvoiceStatus/${invoice_id}`);
    const result = await res.json();
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export {
  listInvoice,
  postInvoice,
  createPayment,
  checkPayment,
  updateInvoiceStatus,
};
