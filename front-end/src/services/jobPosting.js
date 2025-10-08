import { _get, _patch } from "../utils/request";

const listJobsPosting = async (params = {}) => {
  try {
    // Tạo query string từ object params
    const query = new URLSearchParams(params).toString();
    // Nếu có query thì thêm vào URL
    const url = query
      ? `/jobPosting/listJobPosting?${query}`
      : `/jobPosting/listJobPosting`;
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
const listJobPostingById = async (id) => {
  try {
    const res = await _get(`/jobPosting/listJobPostingId/${id}`);
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

export {
  softJobPosting,
  unlockJobPosting,
  listJobsPosting,
  listJobPostingById,
  listJobsByCompany,
  listJobPostingAdmin,
};
