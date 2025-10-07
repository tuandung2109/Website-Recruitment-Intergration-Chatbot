import { _get } from "../utils/request";

const listJobsPosting = async () => {
  try {
    const res = await _get(`/jobPosting/listJobPosting`);
    const result = await res.json();
    if (res.ok) {
      return { success: true, jobs: result.job_posting || result.jobs || [] };
    } else {
      return { success: false, message: "Không thể lấy danh sách công việc" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const listJobPostingById = async (id) => {
  try {
    const res = await fetch(
      `http://localhost:9000/api/jobPosting/listJobPostingId/${id}`
    );
    const result = await res.json();
    if (res.ok && result.job_posting) {
      return { success: true, job_posting: result.job_posting };
    } else {
      return { success: false, message: "Không tìm thấy công việc" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Thêm của Dũng ( lấy danh sách job theo companyId )
const listJobsByCompany = async (companyId) => {
  try {
    const res = await _get(`/jobPosting/byCompany/${companyId}`);
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, jobs: result.jobs || [] };
    }
    return { success: false, message: result.message || "Không lấy được danh sách job" };
  } catch (e) {
    return { success: false, message: e.message };
  }
};

export { listJobsPosting, listJobPostingById , listJobsByCompany};
