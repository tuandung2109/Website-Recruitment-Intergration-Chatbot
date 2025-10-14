import { _get, _post } from "../utils/request";
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
    // const res = await _get(`/company/listCompany/${id}`);
    const res = await _get(`/company/listCompanyId/${id}`);
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

export { listCompany, getCompanyById, postCompany };
