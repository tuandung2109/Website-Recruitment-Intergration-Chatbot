import { _get, _post } from "../utils/request";

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

const addJobApplication = async (payload) => {
  // payload gồm: account_id, job_posting_id, cv_id, cover_letter, file_upload, file_url
  const res = await _post(`/jobsApplication/addApplication`, payload);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Nộp đơn thất bại");
  return data; // { message, data }
};

export { listJobApplication , addJobApplication };
