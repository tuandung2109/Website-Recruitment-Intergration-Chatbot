import { _get, _patch, _post } from "../utils/request";
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
const listCompanyAdmin = async () => {
  try {
    const res = await _get(`/company/listCompanyAdmin`);
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
    // const res = await _get(`/company/listCompany/${id}`);
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
const postCompany = async (companyData) => {
  try {
    // companyData là object chứa thông tin công ty: name, website, industry_id,...
    const res = await _post(`/company/postCompany`, companyData);
    const result = await res.json();
    if (res.ok && result.success) {
      return {
        success: true,
        company_id: result.company_id,
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message || "Tạo công ty không thành công",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi không xác định khi tạo công ty",
    };
  }
};
const updateCompany = async (id, data) => {
  try {
    const res = await _patch(`/updateCompany/${id}`, data);
    return res; // trả về kết quả API
  } catch (err) {
    console.error("❌ Lỗi updateCompany:", err);
    return { success: false, message: err.message };
  }
};
const lockCompany = async (id) => {
  try {
    const res = await _patch(`/company/lockCompany/${id}`);
    const result = await res.json();
    if (res.ok) {
      return { success: true, message: result.message };
    } else {
      return {
        success: false,
        message: result.error || "Khóa công ty thất bại",
      };
    }
  } catch (error) {
    return { success: false, message: error.message || "Lỗi kết nối máy chủ" };
  }
};
const unlockCompany = async (id) => {
  try {
    const res = await _patch(`/company/unlockCompany/${id}`);
    const result = await res.json();
    if (res.ok) {
      return { success: true, message: result.message };
    } else {
      return {
        success: false,
        message: result.error || "Mở khóa công ty thất bại",
      };
    }
  } catch (error) {
    return { success: false, message: error.message || "Lỗi kết nối máy chủ" };
  }
};
export {
  listCompany,
  getCompanyById,
  postCompany,
  updateCompany,
  unlockCompany,
  lockCompany,
  listCompanyAdmin,
};
