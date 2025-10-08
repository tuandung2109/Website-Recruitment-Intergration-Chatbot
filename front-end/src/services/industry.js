import { _get } from "../utils/request";

const listIndustry = async () => {
  try {
    const res = await _get(`/industry/listIndustry`);
    const result = await res.json();

    if (res.ok && result.industry) {
      return {
        success: true,
        industrys: result.industry,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể lấy danh sách ngành nghề",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};

export { listIndustry };
