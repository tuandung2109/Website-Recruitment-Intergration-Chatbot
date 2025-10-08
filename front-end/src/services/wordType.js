import { _get } from "../utils/request";

const listWorkType = async () => {
  try {
    const res = await _get(`/work_type/listAccountWordType`);
    const result = await res.json();

    // ✅ Dữ liệu trả về là result.accounts → dùng đúng key này
    if (res.ok && result.accounts) {
      return {
        success: true,
        workTypes: result.accounts, // ✅ đặt lại tên đúng với FE đang dùng
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể lấy danh sách hình thức làm việc",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};

export { listWorkType };
