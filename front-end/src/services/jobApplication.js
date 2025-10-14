import { _get, _patch, _post } from "../utils/request";

// const API = (process.env.REACT_APP_API_URL || "http://localhost:9000") + "/api";

const listJobApplication = async () => {
  try {
    const res = await _get(`/jobsApplication/listApplication`);
    const result = await res.json();

    if (res.ok && result.applications) {
      return {
        success: true,
        jobApplications: result.applications,
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

const listJobApplicationId = async (id) => {
  try {
    const res = await _get(`/jobsApplication/listApplication/${id}`);
    const result = await res.json();
    if (res.ok && result.job_application) {
      return {
        success: true,
        jobApplications: result.job_application,
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

const updateApplicationStatus = async (job_application_id, status) => {
  try {
    const res = await _patch(
      `/jobsApplication/updateApplicationStatus/${job_application_id}`,
      { status }
    );

    // parse kết quả trả về
    const data = await res.json();

    // kiểm tra lỗi phía server
    if (!res.ok || !data.success) {
      throw new Error(data?.error || "Cập nhật trạng thái thất bại");
    }

    return {
      success: true,
      message:
        data.message ||
        `Cập nhật trạng thái đơn #${job_application_id} thành công`,
      application: data.data,
    };
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};

const addJobApplicationWithFile = async (formData) => {
  // _post đã tự nhận FormData và prepend API base URL
  const res = await _post(`/jobsApplication/addApplicationFile`, formData);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Nộp đơn thất bại");
  return data;
};

export {
  listJobApplication,
  addJobApplication,
  listJobApplicationId,
  updateApplicationStatus,
  addJobApplicationWithFile,
};
