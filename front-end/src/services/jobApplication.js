import { _get } from "../utils/request";

const listJobApplication = async () => {
  try {
    const res = await _get(`/jobsApplication/listApplication`);
    const result = await res.json();
    if (res.ok && result.company) {
      return {
        success: true,
        jobApplications: result.company,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể lấy danh sách ứng tuyển",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};

export { listJobApplication };
