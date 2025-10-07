const supabase = require("../config/supabase");

const listJobPostings = async (req, res) => {
  try {
    const { data: job_postings, error } = await supabase
      .from("job_posting")
      .select(
        `*,
        account:account_id (
          account_id,
          email,
          gender,
          phone_number
        ),
        company:company_id (
          company_id,
          name,
          website,
          logo_url,
          size,
          description,
          address:address (
            address_id,
            address_detail
          )
        ),
        work_type (
          work_type_id,
          work_type_name
        ),
        job_posting_skill (
          skill:skill_id (
            skill_id,
            skill_name
          )
        ),
        job_posting_industry(
          industry:industry_id (
            industry_id,
            name
          )
        )
      `
      )
      .eq("deleted", false)
      .eq("status", "active");

    if (error) {
      console.error("❌ Lỗi Supabase:", error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ job_postings });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listJobPostingId = async (req, res) => {
  try {
    const job_posting_id = req.params.id;
    if (!job_posting_id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }

    const { data: job_posting, error } = await supabase
      .from("job_posting")
      .select(
        `
        *,
        account:account_id (
          account_id,
          email,
          gender,
          phone_number
        ),
        company:company_id (
          company_id,
          name,
          website,
          logo_url,
          size,
          description,
          address:address (
            address_id,
            address_detail
          )
        ),
        work_type (
          work_type_id,
          work_type_name
        ),
        job_posting_skill (
          skill:skill_id (
            skill_id,
            skill_name
          )
        ),
        job_posting_industry(
          industry:industry_id (
            industry_id,
            name
          )
        )
      `
      )
      .eq("job_posting_id", job_posting_id)
      .eq("deleted", false)
      .eq("status", "active")
      .single(); // chỉ lấy 1 kết quả

    if (error) {
      console.error("❌ Lỗi Supabase:", error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ job_posting });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listJobPostings1 = async (req, res) => {
  try {
    const { data: job_postings, error } = await supabase
      .from("job_posting")
      .select(
        `*,account:account_id (
          account_id,
          email,
          gender,
          phone_number
        ),
        company:company_id (
          company_id,
          name,
          website,
          logo_url,
          size,
          description
        )
      `
      )
      .eq("deleted", false)
      .eq("status", "active");

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ job_postings });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
const listJobPostingsDeleted = async (req, res) => {
  try {
    const { data: job_postings, error } = await supabase
      .from("job_posting")
      .select("*")
      .eq("status", "inactive"); // Lọc các bài đăng có trạng thái active
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ job_postings });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const postJobPosting = async (req, res) => {
  try {
    const {
      account_id,
      company_id,
      position_name,
      job_description,
      requirements,
      salary,
      deadline,
      experience_years,
      education_level,
      benefits,
      working_time,
      status,
      deleted,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!account_id || !company_id || !position_name || !job_description) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu dữ liệu bắt buộc (account_id, company_id, position_name, job_description)",
      });
    }

    // Chèn vào DB
    const { data, error } = await supabase
      .from("job_posting")
      .insert([
        {
          account_id,
          company_id,
          position_name,
          job_description,
          requirements: requirements || "",
          salary: salary || null,
          deadline: deadline || null,
          experience_years: experience_years || 0,
          education_level: education_level || "",
          benefits: benefits || "",
          working_time: working_time || "",
          status: status || "active",
          deleted: deleted || false,
        },
      ])
      .select(); // select để trả về data vừa insert

    if (error) {
      console.error("❌ Lỗi khi thêm job_posting:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(201).json({
      success: true,
      message: "Đăng tin tuyển dụng thành công",
      job_posting: data[0], // trả về bản ghi vừa tạo
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
const deleteJobPosting = async (req, res) => {
  try {
    const job_posting_id = req.params.id;
    if (!job_posting_id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }
    const data = await supabase
      .from("job_posting")
      .update({ status: "inactive" })
      .eq("job_posting_id", job_posting_id);
    if (data.modifiedCount === 0) {
      return res.status(404).json({ error: "Không tìm thấy bài đăng" });
    }
    return res.status(200).json({ message: "Xóa bài đăng thành công" });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
const updateJobPosting = async (req, res) => {
  try {
    const job_posting_id = req.params.id;
    const update = { ...req.body };
    const updatedJobPosting = {
      update_ar: new Date(),
    };
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
module.exports = {
  listJobPostings,
  postJobPosting,
  listJobPostingId,
  deleteJobPosting,
  updateJobPosting,
  listJobPostingsDeleted,
};
