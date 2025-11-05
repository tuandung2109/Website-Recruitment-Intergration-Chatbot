import { _get } from "../utils/request";

// Lấy thống kê tổng quan
export const getStatisticsOverview = async () => {
  try {
    const res = await _get(`/statistics/overview`);
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể tải thống kê",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối",
    };
  }
};

// Lấy thống kê tài khoản
export const getStatisticsAccounts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.accountType && filters.accountType !== "all") {
      queryParams.append("accountType", filters.accountType);
    }
    if (filters.status && filters.status !== "all") {
      queryParams.append("status", filters.status);
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      queryParams.append("startDate", filters.dateRange[0]);
      queryParams.append("endDate", filters.dateRange[1]);
    }

    const queryString = queryParams.toString();
    const res = await _get(
      `/statistics/accounts${queryString ? `?${queryString}` : ""}`
    );
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể tải thống kê tài khoản",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối",
    };
  }
};

// Lấy thống kê tuyển dụng
export const getStatisticsRecruitment = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== "all") {
      queryParams.append("status", filters.status);
    }
    if (filters.companyId && filters.companyId !== "all") {
      queryParams.append("companyId", filters.companyId);
    }
    if (filters.dateRange && filters.dateRange.length === 2) {
      queryParams.append("startDate", filters.dateRange[0]);
      queryParams.append("endDate", filters.dateRange[1]);
    }

    const queryString = queryParams.toString();
    const res = await _get(
      `/statistics/recruitment${queryString ? `?${queryString}` : ""}`
    );
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể tải thống kê tuyển dụng",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối",
    };
  }
};

// Lấy thống kê doanh thu
export const getStatisticsRevenue = async () => {
  try {
    const res = await _get(`/statistics/revenue`);
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể tải thống kê doanh thu",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối",
    };
  }
};

// Lấy báo cáo tuyển dụng
export const getStatisticsReport = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await _get(
      `/statistics/report${queryParams ? `?${queryParams}` : ""}`
    );
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể tải báo cáo",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối",
    };
  }
};
