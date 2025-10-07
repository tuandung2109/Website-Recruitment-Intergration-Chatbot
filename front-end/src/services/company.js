import { _get } from "../utils/request";
const listCompany = async () => {
  try {
    const res = await _get(`/company/listCompany`);
    const result = await res.json();

    if (res.ok && result.company) {
      return {
        success: true,
        companys: result.company, // ✅ trả về companys
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

const getCompanyById = async (id) => {
  try {
    const res = await _get(`/company/listCompany/${id}`);
    const result = await res.json();
    if (res.ok && result.company) {
      return { success: true, company: result.company };
    } else {
      return {
        success: false,
        message: result.message || "Không thể lấy chi tiết công ty",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};

export { listCompany, getCompanyById };
