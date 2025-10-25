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
    return res.status(200).json({
      success: true,
      job_postings: job_postings,
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
const listJobPostingsAdmin = async (req, res) => {
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
      );

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
    const id = req.params.id;
    if (!id) {
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
            job_posting_industry (
              industry:industry_id (
                industry_id,
                name
              )
            )
          `
      )
      .eq("job_posting_id", id)
      .single();

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

const postJobPosting1 = async (req, res) => {
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
      skill_id = [], // mảng skill_id
      industry_id = [], // mảng industry_id
      work_type_id = [], // mảng work_type_id
    } = req.body;

    // 🔹 Kiểm tra dữ liệu bắt buộc
    if (!account_id || !company_id || !position_name || !job_description) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu dữ liệu bắt buộc (account_id, company_id, position_name, job_description)",
      });
    }

    // 🔹 1. Thêm job_posting chính
    const { data: jobData, error: jobError } = await supabase
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
          status: status || "inactive",
          deleted: deleted || false,
        },
      ])
      .select()
      .single();

    if (jobError) {
      console.error("❌ Lỗi khi thêm job_posting:", jobError);
      return res
        .status(500)
        .json({ success: false, message: jobError.message });
    }

    const job_posting_id = jobData.job_posting_id;

    // 🔹 2. Thêm vào bảng trung gian job_posting_skill
    if (skill_id.length > 0) {
      const skillRows = skill_id.map((skill_id) => ({
        job_posting_id,
        skill_id,
      }));

      const { error: skillError } = await supabase
        .from("job_posting_skill")
        .insert(skillRows);
      if (skillError)
        console.error("⚠️ Lỗi khi thêm job_posting_skill:", skillError);
    }

    // 🔹 3. Thêm vào bảng trung gian job_posting_industry
    if (industry_id.length > 0) {
      const industryRows = industry_id.map((industry_id) => ({
        job_posting_id,
        industry_id,
      }));

      const { error: industryError } = await supabase
        .from("job_posting_industry")
        .insert(industryRows);
      if (industryError)
        console.error("⚠️ Lỗi khi thêm job_posting_industry:", industryError);
    }

    // 🔹 4. Thêm vào bảng trung gian job_posting_work_type
    if (work_type_id.length > 0) {
      const workTypeRows = work_type_id.map((work_type_id) => ({
        job_posting_id,
        work_type_id,
      }));

      const { error: workTypeError } = await supabase
        .from("job_posting_work_type")
        .insert(workTypeRows);
      if (workTypeError)
        console.error("⚠️ Lỗi khi thêm job_posting_work_type:", workTypeError);
    }

    // 🔹 5. Truy vấn lại để trả về dữ liệu đầy đủ (join)
    const { data: fullJob, error: fullError } = await supabase
      .from("job_posting")
      .select(
        `
        *,
        account (
          account_id,
          email,
          gender,
          phone_number
        ),
        company (
          company_id,
          name,
          size,
          website,
          logo_url,
          description,
          address(address_id, address_detail)
        ),
        job_posting_skill (
          skill:skill_id(skill_id, skill_name)
        ),
        job_posting_industry (
          industry:industry_id(industry_id, name)
        ),
        job_posting_work_type (
          work_type:work_type_id(work_type_id, work_type_name)
        )
      `
      )
      .eq("job_posting_id", job_posting_id)
      .single();

    if (fullError) {
      console.error("⚠️ Lỗi khi lấy job_posting đầy đủ:", fullError);
    }

    return res.status(201).json({
      success: true,
      message: "Đăng tin tuyển dụng thành công",
      job_posting: fullJob || jobData,
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
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
      industry_ids = [], // 👈 mảng id ngành nghề
      skill_ids = [], // 👈 mảng id kỹ năng
      work_type_name, // 👈 hình thức làm việc
      create_at,
    } = req.body;

    if (!account_id || !company_id || !position_name || !job_description) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu dữ liệu bắt buộc (account_id, company_id, position_name, job_description)",
      });
    }

    // === 1️⃣ Thêm job_posting chính ===
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
          status: status || "inactive",
          deleted: deleted || false,
          create_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    const job_posting_id = data.job_posting_id;

    // === 2️⃣ Thêm kỹ năng (job_posting_skill) ===
    if (skill_ids.length > 0) {
      const skillRows = skill_ids.map((skill_id) => ({
        job_posting_id,
        skill_id,
      }));
      const { error: skillError } = await supabase
        .from("job_posting_skill")
        .insert(skillRows);
      if (skillError) console.error("❌ Lỗi khi thêm skill:", skillError);
    }

    // === 3️⃣ Thêm ngành nghề (job_posting_industry) ===
    if (industry_ids.length > 0) {
      const industryRows = industry_ids.map((industry_id) => ({
        job_posting_id,
        industry_id,
      }));
      const { error: industryError } = await supabase
        .from("job_posting_industry")
        .insert(industryRows);
      if (industryError)
        console.error("❌ Lỗi khi thêm industry:", industryError);
    }

    // === 4️⃣ Thêm hình thức làm việc (work_type) ===
    if (work_type_name) {
      const { error: workError } = await supabase
        .from("work_type")
        .insert([{ job_posting_id, work_type_name }]);
      if (workError) console.error("❌ Lỗi khi thêm work_type:", workError);
    }

    // === 5️⃣ Trả kết quả về FE ===
    return res.status(201).json({
      success: true,
      message: "Đăng tin tuyển dụng thành công",
      job_posting: data,
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

const softJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ID bài đăng" });
    }

    const { error } = await supabase
      .from("job_posting")
      .update({ status: "inactive" })
      .eq("job_posting_id", id);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Đã khóa bài đăng thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// 🟢 MỞ KHÓA (chuyển sang active)
const unlockJobPosting = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Thiếu ID" });
    }

    // Kiểm tra bài đăng có tồn tại không
    const { data: job, error: fetchError } = await supabase
      .from("job_posting")
      .select("job_posting_id")
      .eq("job_posting_id", id)
      .maybeSingle();

    if (fetchError)
      return res
        .status(500)
        .json({ success: false, message: fetchError.message });
    if (!job)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài đăng" });

    // Cập nhật trạng thái
    const { error } = await supabase
      .from("job_posting")
      .update({ status: "active" })
      .eq("job_posting_id", id);

    if (error)
      return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({
      success: true,
      message: "Mở khóa bài đăng thành công",
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Thêm của Dũng ( lấy danh sách job theo companyId )
const listJobsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const { data: jobs, error } = await supabase
      .from("job_posting")
      .select("*")
      .eq("company_id", companyId);

    if (error)
      return res.status(400).json({ success: false, message: error.message });

    return res.status(200).json({
      success: true,
      jobs: jobs || [],
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  listJobPostings,
  postJobPosting,
  listJobPostingId,
  softJobPosting,
  unlockJobPosting,
  listJobPostingsDeleted,
  listJobsByCompany,
  listJobPostingsAdmin,
};
