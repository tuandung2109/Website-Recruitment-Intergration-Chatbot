import { _get, _post } from "../utils/request";

const listWorkType = async () => {
  try {
    const res = await _get(`/work_type/listAccountWordType`);
    const result = await res.json();

    // ✅ Dữ liệu trả về là result.work_type → dùng đúng key này
    if (res.ok && result.work_type) {
      return {
        success: true,
        workTypes: result.work_type, // ✅ đặt lại tên đúng với FE đang dùng
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

const postWorkType = async (data) => {
  try {
    const res = await _post(`/work_type/postAccountWordType`, data);
    const result = await res.json();

    if (res.ok && result.work_type) {
      return {
        success: true,
        workType: result.work_type,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể thêm hình thức làm việc",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối máy chủ",
    };
  }
};

export { listWorkType, postWorkType };
