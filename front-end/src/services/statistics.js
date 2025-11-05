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

// Lấy thống kê ứng viên
export const getStatisticsCandidates = async () => {
  try {
    const res = await _get(`/statistics/candidates`);
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể tải thống kê ứng viên",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối",
    };
  }
};

// Lấy thống kê bài đăng tuyển dụng
export const getStatisticsJobPosting = async () => {
  try {
    const res = await _get(`/statistics/job-posting`);
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể tải thống kê bài đăng",
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
