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
          status,
          deleted,
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
      .eq("status", "active")
      .eq("company.status", "active") // lọc theo trạng thái công ty
      .eq("company.deleted", false); // lọc công ty chưa xóa

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
const listJobPostingsEmployer = async (req, res) => {
  try {
    // 📌 Lấy filter params từ query
    const {
      searchText,
      status,
      salaryMin,
      salaryMax,
      deadlineFrom,
      deadlineTo,
      industryIds,
      skillIds,
    } = req.query;

    let query = supabase
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
          status,
          deleted,
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
      .eq("company.status", "active")
      .eq("company.deleted", false);
    // 🔍 Tìm kiếm theo tên vị trí
    if (searchText) {
      query = query.ilike("position_name", `%${searchText}%`);
    }
    // 📊 Lọc theo trạng thái
    if (status) {
      query = query.eq("status", status);
    }
    // 💰 Lọc theo khoảng lương
    if (salaryMin) {
      query = query.gte("salary", Number(salaryMin));
    }
    if (salaryMax) {
      query = query.lte("salary", Number(salaryMax));
    }
    // 📅 Lọc theo hạn nộp
    if (deadlineFrom) {
      query = query.gte("deadline", deadlineFrom);
    }
    if (deadlineTo) {
      query = query.lte("deadline", deadlineTo);
    }
    const { data: job_postings, error } = await query;
    if (error) {
      console.error("❌ Lỗi query:", error);
      return res.status(400).json({ error: error.message });
    }
    let filteredJobs = job_postings || [];
    // 🏢 Lọc theo ngành nghề (sau khi query vì cần check nested data)
    if (industryIds) {
      const industryArray = industryIds.split(",").map((id) => Number(id));
      filteredJobs = filteredJobs.filter((job) =>
        job.job_posting_industry?.some((jpi) =>
          industryArray.includes(jpi.industry?.industry_id)
        )
      );
    }
    // 💼 Lọc theo kỹ năng
    if (skillIds) {
      const skillArray = skillIds.split(",").map((id) => Number(id));
      filteredJobs = filteredJobs.filter((job) =>
        job.job_posting_skill?.some((jps) =>
          skillArray.includes(jps.skill?.skill_id)
        )
      );
    }
    return res.status(200).json({
      success: true,
      job_postings: filteredJobs,
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
             description,
          status,
          deleted,
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
                 description,
          status,
          deleted,
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
const listUpdateJobPosting = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }
    const { data: job_posting, error } = await supabase
      .from("job_posting_updates")
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
                 description,
          status,
          deleted,
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
      .eq("job_posting_updates_id", id)
      .single();

    if (error) {
      console.error("❌ Lỗi Supabase:", error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ job_posting_updates });
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
      industry_ids = [],
      skill_ids = [],
      work_type_name,
    } = req.body;

    // --- Kiểm tra dữ liệu bắt buộc ---
    if (!account_id || !company_id || !position_name || !job_description) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu dữ liệu bắt buộc (account_id, company_id, position_name, job_description)",
      });
    }

    // --- Kiểm tra hạn nộp ---
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        return res.status(400).json({
          success: false,
          message: "Ngày hết hạn phải lớn hơn ngày hiện tại!",
        });
      }
    }

    // --- Kiểm tra trạng thái công ty ---
    const { data: company, error: companyError } = await supabase
      .from("company")
      .select("company_id, status, deleted")
      .eq("company_id", company_id)
      .single();

    if (companyError || !company) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công ty!",
      });
    }

    if (company.status !== "active" || company.deleted === true) {
      return res.status(403).json({
        success: false,
        message:
          "Công ty chưa được duyệt hoặc đã bị vô hiệu hóa, không thể đăng tin tuyển dụng!",
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
      await supabase.from("job_posting_skill").insert(skillRows);
    }

    // === 3️⃣ Thêm ngành nghề (job_posting_industry) ===
    if (industry_ids.length > 0) {
      const industryRows = industry_ids.map((industry_id) => ({
        job_posting_id,
        industry_id,
      }));
      await supabase.from("job_posting_industry").insert(industryRows);
    }

    // === 4️⃣ Thêm hình thức làm việc (work_type) ===
    if (work_type_name) {
      await supabase
        .from("work_type")
        .insert([{ job_posting_id, work_type_name }]);
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
const postJobPosting2 = async (req, res) => {
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
    // --- Kiểm tra deadline ---

    if (!account_id || !company_id || !position_name || !job_description) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu dữ liệu bắt buộc (account_id, company_id, position_name, job_description)",
      });
    }
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();

      // Nếu deadline <= hiện tại → báo lỗi
      if (deadlineDate <= now) {
        return res.status(400).json({
          success: false,
          message: "Ngày hết hạn phải lớn hơn ngày hiện tại!",
        });
      }
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

// 🟢 Tắt tin (chuyển sang off)
const offJobPosting = async (req, res) => {
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
      .update({ status: "off" })
      .eq("job_posting_id", id);

    if (error)
      return res.status(500).json({ success: false, message: error.message });

    return res.status(200).json({
      success: true,
      message: "Tắt tin bài đăng thành công",
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

const updateJobPosting1 = async (req, res) => {
  try {
    const id = req.params.id;
    // ✅ Kiểm tra ID có hợp lệ không
    if (!id || id === "undefined" || isNaN(parseInt(id))) {
      return res
        .status(400)
        .json({ success: false, message: "ID bài đăng không hợp lệ" });
    }

    // ✅ Nhận dữ liệu từ req.body.job_posting HOẶC req.body trực tiếp
    const jobData = req.body.job_posting || req.body;

    if (!jobData || Object.keys(jobData).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu dữ liệu job_posting" });
    }

    console.log("🔍 Đang cập nhật job với ID:", id);
    console.log("📦 Dữ liệu nhận được:", jobData);

    // ✅ Kiểm tra bài đăng có tồn tại không
    const { data: existingJob, error: fetchError } = await supabase
      .from("job_posting")
      .select("job_posting_id")
      .eq("job_posting_id", parseInt(id))
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Lỗi khi kiểm tra job:", fetchError);
      return res
        .status(400)
        .json({ success: false, message: fetchError.message });
    }
    if (!existingJob) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bài đăng" });
    }
    // ✅ Cập nhật bằng Supabase
    const { data: updatedJob, error: updateError } = await supabase
      .from("job_posting")
      .update({
        position_name: jobData.position_name,
        job_description: jobData.job_description,
        requirements: jobData.requirements,
        salary: jobData.salary,
        deadline: jobData.deadline,
        experience_years: jobData.experience_years,
        education_level: jobData.education_level,
        benefits: jobData.benefits,
        working_time: jobData.working_time,
        status: jobData.status,
      })
      .eq("job_posting_id", parseInt(id))
      .select()
      .single();

    if (updateError) {
      console.error("❌ Lỗi khi cập nhật:", updateError);
      return res
        .status(400)
        .json({ success: false, message: updateError.message });
    }

    // ✅ Trả về kết quả mới
    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      job_posting: updatedJob,
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
const updateJobPosting = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const jobData = req.body;

    if (!id || !jobData) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    // Tạo version chờ duyệt
    const { data, error } = await supabase
      .from("job_posting_updates")
      .insert([
        {
          job_posting_id: id,
          updated_data: jobData, // Lưu cả object → dễ duyệt
          status: "pending",
          updated_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Lỗi lưu bản cập nhật:", error);
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(201).json({
      success: true,
      message: "Đã gửi bản cập nhật, chờ admin duyệt.",
      draft_update: data,
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Thống kê số tin đã đăng theo công ty
const getJobPostingStatistics = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID là bắt buộc",
      });
    }

    // Lấy tất cả job posting của công ty
    const { data: jobs, error } = await supabase
      .from("job_posting")
      .select("job_posting_id, position_name, status, create_at, deadline")
      .eq("company_id", companyId);

    if (error) {
      console.error("❌ Lỗi khi lấy thống kê:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê",
      });
    }

    const total = jobs.length;
    const active = jobs.filter((j) => j.status === "active").length;
    const inactive = jobs.filter((j) => j.status === "inactive").length;

    // Thống kê theo tháng (6 tháng gần nhất)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const count = jobs.filter((j) => {
        if (!j.create_at) return false;
        const jobDate = new Date(j.create_at);
        return (
          jobDate.getFullYear() === date.getFullYear() &&
          jobDate.getMonth() === date.getMonth()
        );
      }).length;
      monthlyData.push({ month: monthKey, count });
    }

    return res.status(200).json({
      success: true,
      statistics: {
        total,
        active,
        inactive,
        monthlyData,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const handleUpdate = async () => {
  try {
    const values = await form.validateFields();
    const res = await submitJobUpdate(selectedJob.id, values); // 👈 API mới
    if (res.success) {
      message.success("Cập nhật đã gửi, chờ admin duyệt!");
      setIsEditModal(false);
      fetchAll();
    } else {
      message.error(res.message);
    }
  } catch {
    message.error("Lỗi khi gửi cập nhật!");
  }
};
const submitJobUpdate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const jobData = req.body;
    // 1) Lưu bản cập nhật vào job_posting_updates
    await supabase.from("job_posting_updates").insert({
      job_posting_id: id,
      ...jobData,
    });
    // 2) Đặt bài gốc về trạng thái pending
    await supabase
      .from("job_posting")
      .update({ status: "pending" })
      .eq("job_posting_id", id);
    return res.json({ success: true, message: "Đã gửi chỉnh sửa, chờ duyệt" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
const approveJobUpdate = async (req, res) => {
  try {
    const updateId = parseInt(req.params.updateId);

    // Lấy bản cập nhật
    const { data: draft } = await supabase
      .from("job_posting_updates")
      .select("*")
      .eq("update_id", updateId)
      .single();

    if (!draft) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy bản cập nhật" });
    }

    // Update job_posting bằng dữ liệu mới
    const { error: updateError } = await supabase
      .from("job_posting")
      .update(draft.updated_data)
      .eq("job_posting_id", draft.job_posting_id);

    if (updateError)
      return res
        .status(400)
        .json({ success: false, message: updateError.message });

    // Xóa bản chờ duyệt
    await supabase
      .from("job_posting_updates")
      .delete()
      .eq("update_id", updateId);

    return res.json({ success: true, message: "Duyệt cập nhật thành công" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const rejectJobUpdate = async (req, res) => {
  const updateId = req.params.updateId;
  await supabase.from("job_posting_updates").delete().eq("update_id", updateId);
  return res.json({ success: true, message: "Đã từ chối bản cập nhật" });
};

// controllers/jobPosting.js

const listPendingUpdates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("job_posting_updates")
      .select(
        `
        *,
        job:job_posting_id (
          job_posting_id,
          position_name,
          company_id
        )
      `
      )
      .eq("status", "pending");

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, pendingUpdates: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  listJobPostings,
  listPendingUpdates,
  submitJobUpdate,
  postJobPosting,
  handleUpdate,
  listJobPostingId,
  approveJobUpdate,
  softJobPosting,
  unlockJobPosting,
  listJobPostingsDeleted,
  listJobsByCompany,
  listJobPostingsAdmin,
  updateJobPosting,
  getJobPostingStatistics,
  offJobPosting,
  listJobPostingsEmployer,
  rejectJobUpdate,
  listUpdateJobPosting,
};
