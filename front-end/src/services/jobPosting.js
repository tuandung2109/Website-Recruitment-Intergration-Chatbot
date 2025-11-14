// import { message } from "antd";
import { _get, _patch, _post, _delete } from "../utils/request";

const listJobsPosting = async (params = {}) => {
  try {
    // 🧩 Tạo query string linh hoạt
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/jobPosting/listJobPosting?${query}`
      : `/jobPosting/listJobPosting`;

    const res = await _get(url);
    const result = await res.json();

    console.log("📦 Dữ liệu gốc từ backend:", result);

    if (!res.ok) {
      throw new Error(result.error || "Không thể lấy danh sách công việc");
    }

    // 🧠 Linh hoạt với nhiều kiểu response khác nhau
    let rawJobs = [];
    if (Array.isArray(result.job_postings)) rawJobs = result.job_postings;
    else if (Array.isArray(result.data)) rawJobs = result.data;
    else if (result.job_posting) rawJobs = [result.job_posting];

    if (rawJobs.length === 0) {
      console.warn("⚠️ Không tìm thấy dữ liệu job trong response:", result);
      return { success: false, message: "Không có dữ liệu job hợp lệ" };
    }

    // 🎯 Chuẩn hóa dữ liệu
    const jobs = rawJobs.map((j) => {
      // Log để kiểm tra các key quan trọng
      // console.log("🧩 Kiểm tra job:", {
      //   id: j.job_posting_id,
      //   work_type: j.work_type,
      //   job_posting_skill: j.job_posting_skill,
      // });

      return {
        id: j.job_posting_id,
        title: j.position_name || "Chưa có tiêu đề",
        description: j.job_description || "",
        requirements: j.requirements || "",
        salary: Number(j.salary) || 0,
        deadline: j.deadline || "",
        experienceYears: j.experience_years || 0,
        educationLevel: j.education_level || "",
        benefits: j.benefits || "",
        workingTime: j.working_time || "",
        status: j.status || "inactive",
        account: j.account || {},
        create_at: j.create_at || "",

        // 🏢 Công ty
        company: {
          id: j.company?.company_id || null,
          company_id: j.company?.company_id || null,
          name: j.company?.name || "",
          logo: j.company?.logo_url || "",
          website: j.company?.website || "",
          size: j.company?.size || "",
          description: j.company?.description || "",
          address:
            Array.isArray(j.company?.address) &&
            j.company.address.length > 0 &&
            j.company.address[0].address_detail
              ? j.company.address[0].address_detail
              : "",
        },

        // 🧱 Kiểu làm việc
        workTypes:
          Array.isArray(j.work_type) && j.work_type.length > 0
            ? j.work_type.map((w) => w.work_type_name)
            : Array.isArray(j.workTypes) && j.workTypes.length > 0
            ? j.workTypes
            : [],

        // 🧠 Kỹ năng
        skills:
          Array.isArray(j.job_posting_skill) && j.job_posting_skill.length > 0
            ? j.job_posting_skill
                .map((s) => s.skill?.skill_name)
                .filter(Boolean)
            : [],

        // 🏭 Ngành nghề
        industries:
          Array.isArray(j.job_posting_industry) &&
          j.job_posting_industry.length > 0
            ? j.job_posting_industry
                .map((i) => i.industry?.name)
                .filter(Boolean)
            : [],
      };
    });

    console.log("✅ Dữ liệu sau khi map:", jobs);
    return { success: true, jobs };
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách job:", error);
    return { success: false, message: error.message || "Lỗi không xác định" };
  }
};

const listJobPostingsEmployer = async (params = {}) => {
  try {
    // 🧩 Tạo query string linh hoạt
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/jobPosting/listJobPostingsEmployer?${query}`
      : `/jobPosting/listJobPostingsEmployer`;

    const res = await _get(url);
    const result = await res.json();

    console.log("📦 Dữ liệu gốc từ backend:", result);

    if (!res.ok) {
      throw new Error(result.error || "Không thể lấy danh sách công việc");
    }

    // 🧠 Linh hoạt với nhiều kiểu response khác nhau
    let rawJobs = [];
    if (Array.isArray(result.job_postings)) rawJobs = result.job_postings;
    else if (Array.isArray(result.data)) rawJobs = result.data;
    else if (result.job_posting) rawJobs = [result.job_posting];

    if (rawJobs.length === 0) {
      console.warn("⚠️ Không tìm thấy dữ liệu job trong response:", result);
      return { success: false, message: "Không có dữ liệu job hợp lệ" };
    }

    // 🎯 Chuẩn hóa dữ liệu
    const jobs = rawJobs.map((j) => {
      // Log để kiểm tra các key quan trọng
      // console.log("🧩 Kiểm tra job:", {
      //   id: j.job_posting_id,
      //   work_type: j.work_type,
      //   job_posting_skill: j.job_posting_skill,
      // });

      return {
        id: j.job_posting_id,
        title: j.position_name || "Chưa có tiêu đề",
        description: j.job_description || "",
        requirements: j.requirements || "",
        salary: Number(j.salary) || 0,
        deadline: j.deadline || "",
        experienceYears: j.experience_years || 0,
        educationLevel: j.education_level || "",
        benefits: j.benefits || "",
        workingTime: j.working_time || "",
        status: j.status || "inactive",
        account: j.account || {},
        create_at: j.create_at || "",

        // 🏢 Công ty
        company: {
          id: j.company?.company_id || null,
          company_id: j.company?.company_id || null,
          name: j.company?.name || "",
          logo: j.company?.logo_url || "",
          website: j.company?.website || "",
          size: j.company?.size || "",
          description: j.company?.description || "",
          address:
            Array.isArray(j.company?.address) &&
            j.company.address.length > 0 &&
            j.company.address[0].address_detail
              ? j.company.address[0].address_detail
              : "",
        },

        // 🧱 Kiểu làm việc
        workTypes:
          Array.isArray(j.work_type) && j.work_type.length > 0
            ? j.work_type.map((w) => w.work_type_name)
            : Array.isArray(j.workTypes) && j.workTypes.length > 0
            ? j.workTypes
            : [],

        // 🧠 Kỹ năng
        skills:
          Array.isArray(j.job_posting_skill) && j.job_posting_skill.length > 0
            ? j.job_posting_skill
                .map((s) => s.skill?.skill_name)
                .filter(Boolean)
            : [],

        // 🏭 Ngành nghề
        industries:
          Array.isArray(j.job_posting_industry) &&
          j.job_posting_industry.length > 0
            ? j.job_posting_industry
                .map((i) => i.industry?.name)
                .filter(Boolean)
            : [],
      };
    });

    console.log("✅ Dữ liệu sau khi map:", jobs);
    return { success: true, jobs };
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách job:", error);
    return { success: false, message: error.message || "Lỗi không xác định" };
  }
};

const listJobPostingById = async (id) => {
  try {
    const res = await _get(`/jobPosting/listJobPostingId/${id}`);
    const result = await res.json();

    console.log("📦 Dữ liệu chi tiết job từ backend:", result);

    if (!res.ok || !result.job_posting) {
      throw new Error(result.error || "Không tìm thấy công việc");
    }

    const j = result.job_posting;

    // 🔍 Log kiểm tra dữ liệu gốc
    console.log("🧩 Kiểm tra job:", {
      id: j.job_posting_id,
      work_type: j.work_type,
      job_posting_skill: j.job_posting_skill,
    });

    // 🎯 Chuẩn hóa dữ liệu chi tiết job giống listJobsPosting
    const job = {
      id: j.job_posting_id,
      title: j.position_name || "Chưa có tiêu đề",
      description: j.job_description || "",
      requirements: j.requirements || "",
      salary: Number(j.salary) || 0,
      deadline: j.deadline || "",
      experienceYears: j.experience_years || 0,
      educationLevel: j.education_level || "",
      benefits: j.benefits || "",
      workingTime: j.working_time || "",
      status: j.status || "inactive",
      account: j.account || {},
      create_at: j.create_at || "",

      // 🏢 Thông tin công ty
      company: {
        id: j.company?.company_id || null,
        company_id: j.company?.company_id || null,
        name: j.company?.name || "",
        logo: j.company?.logo_url || "",
        website: j.company?.website || "",
        size: j.company?.size || "",
        description: j.company?.description || "",
        address:
          Array.isArray(j.company?.address) &&
          j.company.address.length > 0 &&
          j.company.address[0].address_detail
            ? j.company.address[0].address_detail
            : "",
      },

      // 🧱 Kiểu làm việc
      workTypes:
        Array.isArray(j.work_type) && j.work_type.length > 0
          ? j.work_type.map((w) => w.work_type_name)
          : Array.isArray(j.workTypes) && j.workTypes.length > 0
          ? j.workTypes
          : [],

      // 🧠 Kỹ năng
      skills:
        Array.isArray(j.job_posting_skill) && j.job_posting_skill.length > 0
          ? j.job_posting_skill.map((s) => s.skill?.skill_name).filter(Boolean)
          : [],

      // 🏭 Ngành nghề
      industries:
        Array.isArray(j.job_posting_industry) &&
        j.job_posting_industry.length > 0
          ? j.job_posting_industry.map((i) => i.industry?.name).filter(Boolean)
          : [],
    };

    console.log("✅ Dữ liệu job sau khi chuẩn hóa:", job);

    return { success: true, job_posting: job };
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết job:", error);
    return { success: false, message: error.message || "Lỗi không xác định" };
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
    return {
      success: false,
      message: result.message || "Không lấy được danh sách job",
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
};
const listJobPostingAdmin = async (params = {}) => {
  try {
    // Tạo query string từ object params
    const query = new URLSearchParams(params).toString();
    // Nếu có query thì thêm vào URL
    const url = query
      ? `/jobPosting/listJobPostingAdmin?${query}`
      : `/jobPosting/listJobPostingAdmin`;
    const res = await _get(url);
    const result = await res.json();
    console.log("📦 Dữ liệu gốc từ backend:", result);
    if (!res.ok) {
      throw new Error(result.error || "Không thể lấy danh sách công việc");
    }
    const rawJobs = result.job_postings || [];
    const jobs = rawJobs.map((j) => ({
      id: j.job_posting_id,
      title: j.position_name || "Untitled",
      description: j.job_description || "",
      requirements: j.requirements || "",
      salary: Number(j.salary) || 0,
      deadline: j.deadline || "",
      experienceYears: j.experience_years || 0,
      educationLevel: j.education_level || "",
      benefits: j.benefits || "",
      workingTime: j.working_time || "",
      status: j.status,
      company: {
        id: j.company?.company_id || null,
        company_id: j.company?.company_id || null,
        name: j.company?.name || "",
        logo: j.company?.logo_url || "",
        website: j.company?.website || "",
        size: j.company?.size || "",
        description: j.company?.description || "",
        address:
          Array.isArray(j.company?.address) && j.company.address.length > 0
            ? j.company.address[0].address_detail
            : "",
      },
      account: j.account || {},
      workTypes: Array.isArray(j.work_type)
        ? j.work_type.map((w) => w.work_type_name)
        : [],
      skills: Array.isArray(j.job_posting_skill)
        ? j.job_posting_skill.map((s) => s.skill?.skill_name)
        : [],
      industries: Array.isArray(j.job_posting_industry)
        ? j.job_posting_industry.map((i) => i.industry?.name)
        : [],
    }));
    console.log("✅ Dữ liệu sau khi map:", jobs);
    return { success: true, jobs };
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách job:", error);
    return { success: false, message: error.message };
  }
};
const softJobPosting = async (job_posting_id) => {
  try {
    const res = await _patch(`/jobPosting/softJobPosting/${job_posting_id}`);
    return await res.json();
  } catch (error) {
    return { success: false, message: error.message || "Lỗi" };
  }
};
const unlockJobPosting = async (job_posting_id) => {
  try {
    const res = await _patch(`/jobPosting/unlockJobPosting/${job_posting_id}`);
    return await res.json();
  } catch (error) {
    return { success: false, message: error.message || "Lỗi" };
  }
};
const offJobPosting = async (job_posting_id) => {
  try {
    const res = await _patch(`/jobPosting/offJobPosting/${job_posting_id}`);
    return await res.json();
  } catch (error) {
    return { success: false, message: error.message || "Lỗi" };
  }
};
const postJobPosting = async (jobs) => {
  try {
    const res = await _post(`/jobPosting/postJobPosting`, jobs);
    const result = await res.json();

    if (res.ok) {
      // ✅ sửa oke → ok
      return {
        success: true,
        job_posting: result.job_posting,
        message: result.message || "Tạo thành công",
      };
    } else {
      return {
        success: false,
        message: result.message || "Tạo thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối máy chủ",
    };
  }
};
const updateJobPosting = async (job_posting_id, jobData) => {
  try {
    const res = await _patch(
      `/jobPosting/updateJobPosting/${job_posting_id}`,
      jobData
    );
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        job_posting: result.job_posting,
        message: result.message || "Cập nhật thành công",
      };
    } else {
      return {
        success: false,
        message: result.message || "Cập nhật thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối máy chủ",
    };
  }
};
// Thống kê số tin đã đăng theo công ty
const getJobPostingStatistics = async (companyId) => {
  try {
    const res = await _get(`/jobPosting/statistics/${companyId}`);
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, statistics: result.statistics };
    }
    return {
      success: false,
      message: result.message || "Không lấy được thống kê",
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
};

// NTD gửi bản chỉnh sửa
const submitJobUpdate = async (job_posting_id, jobData) => {
  try {
    const res = await _post(
      `/jobPosting/submitUpdate/${job_posting_id}`,
      jobData
    );
    const result = await res.json();
    return result;
  } catch (error) {
    return { success: false, message: error.message || "Lỗi kết nối máy chủ" };
  }
};
// ADMIN duyệt chỉnh sửa
const approveJobUpdate = async (job_posting_id) => {
  try {
    const res = await _patch(`/jobPosting/approveUpdate/${job_posting_id}`);
    const result = await res.json();
    return result;
  } catch (error) {
    return { success: false, message: error.message || "Lỗi kết nối máy chủ" };
  }
};
// ADMIN từ chối chỉnh sửa
const rejectJobUpdate = async (job_posting_id) => {
  try {
    const res = await _patch(`/jobPosting/rejectUpdate/${job_posting_id}`);
    const result = await res.json();
    return result;
  } catch (error) {
    return { success: false, message: error.message || "Lỗi kết nối máy chủ" };
  }
};
// Lấy danh sách job đang chờ duyệt chỉnh sửa
const listPendingUpdates = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/jobPosting/listPendingUpdates?${query}`
      : `/jobPosting/listPendingUpdates`;

    const res = await _get(url);
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || "Lỗi không xác định");

    return { success: true, data: result.data || [] };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
// Xóa cứng job posting (hard delete)
const deleteJobPosting = async (job_posting_id) => {
  try {
    const res = await _delete(`/jobPosting/deleteJobPosting/${job_posting_id}`);
    const result = await res.json();
    if (res.ok) {
      return {
        success: true,
        message: result.message || "Xóa job posting thành công",
      };
    } else {
      return {
        success: false,
        message: result.message || "Xóa job posting thất bại",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối máy chủ",
    };
  }
};

export {
  listPendingUpdates,
  softJobPosting,
  unlockJobPosting,
  listJobsPosting,
  listJobPostingById,
  listJobsByCompany,
  listJobPostingAdmin,
  postJobPosting,
  updateJobPosting,
  getJobPostingStatistics,
  offJobPosting,
  listJobPostingsEmployer,
  rejectJobUpdate,
  approveJobUpdate,
  submitJobUpdate,
  deleteJobPosting,
};
