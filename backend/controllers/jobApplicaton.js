const multer = require("multer");
const supabase = require("../config/supabase");
const upload = multer({ storage: multer.memoryStorage() }).single("file");

// Lấy danh sách account
const listApplication = async (req, res) => {
  try {
    // 🔍 Lấy filter params từ query
    const {
      searchText,
      status,
      job_posting_id,
      submittedFrom,
      submittedTo,
    } = req.query;

    let query = supabase.from("job_application")
      .select(`
        job_application_id,
        account_id,
        job_posting_id,
        cv_id,
        cover_letter,
        status,
        submitted_at,
        file_upload,
        file_url,
        account:account_id (
          account_id,
          email,
          phone_number
        ),
        job_posting:job_posting_id (
          job_posting_id,
          position_name,
          job_description,
          requirements,
          experience_years,
          education_level,
          benefits,
          working_time,
          salary, 
          company:company_id (
            company_id,
            name,
            website,
            logo_url,
            size,
            description
          )
        ),
        cv:cv_id (
          cv_id,
          cv_link,
          years_experience,
          education_level,
          created_at
        )
      `);

    // 📌 Filter theo trạng thái
    if (status) {
      query = query.eq("status", status);
    }

    // 📌 Filter theo job posting
    if (job_posting_id) {
      query = query.eq("job_posting_id", job_posting_id);
    }

    // 📌 Filter theo ngày nộp
    if (submittedFrom) {
      query = query.gte("submitted_at", submittedFrom);
    }
    if (submittedTo) {
      query = query.lte("submitted_at", submittedTo);
    }

    const { data: applications, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // 🔍 Filter theo email/phone (backend không support text search tốt, nên filter sau)
    let filteredApps = applications;
    if (searchText) {
      const search = searchText.toLowerCase();
      filteredApps = applications.filter(
        (app) =>
          app.account?.email?.toLowerCase().includes(search) ||
          app.account?.phone_number?.includes(search)
      );
    }

    return res.status(200).json({ applications: filteredApps });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Lấy đơn ứng tuyển theo ID
const listApplicationId = async (req, res) => {
  try {
    const job_application_id = req.params.id;

    if (!job_application_id)
      return res.status(400).json({ error: "Thiếu ID đơn ứng tuyển" });

    const { data: application, error } = await supabase
      .from("job_application")
      .select(
        `
        job_application_id,
        account_id,
        job_posting_id,
        cv_id,
        cover_letter,
        status,
        submitted_at,
        file_upload,
        file_url,
        account:account_id (
          account_id,
          email,
          phone_number
        ),
        job_posting:job_posting_id (
          job_posting_id,
          position_name,
          job_description,
          requirements,
          experience_years,
          education_level,
          benefits,
          working_time,
          salary, 
          company:company_id (
            company_id,
            name,
            website,
            logo_url,
            size,
            description
          )
        ),
        cv:cv_id (
          cv_id,
          cv_link,
          years_experience,
          education_level,
          created_at
        )
      `
      )
      .eq("job_application_id", job_application_id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ application });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📝 Thêm đơn ứng tuyển
const addApplication = async (req, res) => {
  try {
    const {
      account_id,
      job_posting_id,
      cv_id,
      cover_letter,
      file_upload,
      file_url,
    } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !account_id ||
      !job_posting_id ||
      !cv_id ||
      !cover_letter ||
      !file_upload ||
      !file_url
    ) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Thêm đơn ứng tuyển vào Supabase
    const { data, error } = await supabase
      .from("job_application")
      .insert([
        {
          account_id,
          job_posting_id,
          cv_id,
          cover_letter,
          status: "pending",
          file_upload,
          file_url,
        },
      ])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res
      .status(201)
      .json({ message: "Nộp đơn ứng tuyển thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Cập nhật trạng thái đơn ứng tuyển
const acceptApplication = async (req, res) => {
  try {
    const job_application_id = req.params.id;
    const { status } = req.body; // ví dụ: pending / accept / reject

    if (!job_application_id || !status) {
      return res.status(400).json({ error: "Thiếu ID hoặc trạng thái" });
    }

    const { data, error } = await supabase
      .from("job_application")
      .update({ status })
      .eq("job_application_id", job_application_id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Khóa hoặc mở khóa đơn ứng tuyển (status = inactive / active)
const rejectApplication = async (req, res) => {
  try {
    const job_application_id = req.params.id;
    const { action } = req.body; // "lock" hoặc "unlock"

    if (!job_application_id || !action) {
      return res.status(400).json({ error: "Thiếu ID hoặc hành động" });
    }

    const newStatus = action === "lock" ? "inactive" : "active";

    const { data, error } = await supabase
      .from("job_application")
      .update({ status: newStatus })
      .eq("job_application_id", job_application_id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({
      message: `Đơn ứng tuyển đã ${action === "lock" ? "khóa" : "mở"}`,
      data,
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const job_application_id = req.params.id;
    let { status } = req.body; // ví dụ: "pending", "accepted", "rejected"

    console.log("📦 Status nhận từ client:", status);

    if (!job_application_id || !status) {
      return res
        .status(400)
        .json({ error: "Thiếu ID hoặc trạng thái cần cập nhật" });
    }

    // ✅ Chuẩn hóa status từ frontend
    const mapStatus = {
      accepted: "accept",
      rejected: "reject",
      pending: "pending",
    };
    status = mapStatus[status] || status; // tự động chuyển đổi nếu cần

    const validStatuses = ["pending", "accept", "reject"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ error: `Trạng thái không hợp lệ: ${status}` });
    }

    const { data, error } = await supabase
      .from("job_application")
      .update({ status })
      .eq("job_application_id", job_application_id)
      .select();

    if (error) {
      console.error("❌ Lỗi Supabase:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái đơn ứng tuyển #${job_application_id} thành '${status}' thành công`,
      data: data[0],
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// 📍 Xóa đơn ứng tuyển
const deleteApplication = async (req, res) => {
  try {
    const job_application_id = req.params.id;

    if (!job_application_id)
      return res.status(400).json({ error: "Thiếu ID đơn ứng tuyển" });

    const { error } = await supabase
      .from("job_application")
      .delete()
      .eq("job_application_id", job_application_id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Xóa đơn ứng tuyển thành công" });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// thêm hàm mới : Backend: thêm endpoint upload-file-cho-đơn (không đụng bảng cv)
const addApplicationFile = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ error: "Upload lỗi" });
      const file = req.file;
      const { account_id, job_posting_id, cover_letter } = req.body;

      if (!account_id || !job_posting_id || !cover_letter || !file) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
      }
      // 1) Đẩy file lên Supabase Storage (bucket nên khác bucket CV, ví dụ: application-files)
      const ts = Date.now();
      const safeName = (file.originalname || "application.pdf").replace(
        /\s+/g,
        "_"
      );
      const objectKey = `applications/${account_id}/${ts}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("application-files")
        .upload(objectKey, file.buffer, {
          contentType: file.mimetype || "application/pdf",
          upsert: true,
        });
      if (uploadErr) {
        console.error("[UPLOAD ERROR]", {
          message: uploadErr.message,
          name: uploadErr.name,
          status: uploadErr.statusCode || uploadErr.status,
          key: objectKey,
          bucket: "application-files",
        });
        return res.status(500).json({ error: "Không upload được file" });
      }
      const { data: pub } = supabase.storage
        .from("application-files")
        .getPublicUrl(objectKey);
      const publicUrl = pub?.publicUrl;

      // 2) Insert vào job_application (cv_id = null)
      const { data, error } = await supabase
        .from("job_application")
        .insert([
          {
            account_id: Number(account_id),
            job_posting_id: Number(job_posting_id),
            cv_id: null, // <– quan trọng
            cover_letter,
            status: "pending",
            file_upload: safeName,
            file_url: publicUrl,
          },
        ])
        .select();

      if (error) return res.status(400).json({ error: error.message });
      return res
        .status(201)
        .json({ message: "Nộp đơn (file rời) thành công", data });
    } catch (e) {
      console.error("❌ addApplicationFile error:", e);
      return res.status(500).json({ error: "Lỗi server" });
    }
  });
};

// 📍 Kiểm tra user đã ứng tuyển job này chưa
const checkApplied = async (req, res) => {
  try {
    const { job_posting_id, account_id } = req.params;

    if (!job_posting_id || !account_id) {
      return res.status(400).json({ 
        success: false,
        error: "Thiếu job_posting_id hoặc account_id" 
      });
    }

    // Kiểm tra trong bảng job_application
    const { data, error } = await supabase
      .from("job_application")
      .select("job_application_id, status, submitted_at")
      .eq("job_posting_id", job_posting_id)
      .eq("account_id", account_id)
      .single();

    if (error) {
      // Nếu không tìm thấy (PGRST116) => chưa ứng tuyển
      if (error.code === "PGRST116") {
        return res.status(200).json({
          success: true,
          applied: false,
          application: null,
        });
      }
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    // Đã ứng tuyển
    return res.status(200).json({
      success: true,
      applied: true,
      application: data,
    });
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra ứng tuyển:", err);
    return res.status(500).json({ 
      success: false,
      error: "Lỗi server" 
    });
  }
};

// Thống kê hồ sơ ứng tuyển theo công ty
const getApplicationStatistics = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID là bắt buộc",
      });
    }

    // Lấy tất cả job posting của công ty
    const { data: jobs, error: jobError } = await supabase
      .from("job_posting")
      .select("job_posting_id, position_name")
      .eq("company_id", companyId);

    if (jobError) {
      console.error("❌ Lỗi khi lấy job posting:", jobError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách job posting",
      });
    }

    const jobIds = jobs.map((j) => j.job_posting_id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        statistics: {
          total: 0,
          pending: 0,
          accepted: 0,
          rejected: 0,
          monthlyData: [],
          topPositions: [],
        },
      });
    }

    // Lấy tất cả application của các job này
    const { data: applications, error: appError } = await supabase
      .from("job_application")
      .select("job_application_id, job_posting_id, status, submitted_at")
      .in("job_posting_id", jobIds);

    if (appError) {
      console.error("❌ Lỗi khi lấy application:", appError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê hồ sơ",
      });
    }

    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const accepted = applications.filter((a) => a.status === "accept").length;
    const rejected = applications.filter((a) => a.status === "reject").length;

    // Thống kê theo tháng (6 tháng gần nhất)
    const now = new Date();
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const count = applications.filter((a) => {
        if (!a.submitted_at) return false;
        const appDate = new Date(a.submitted_at);
        return (
          appDate.getFullYear() === date.getFullYear() &&
          appDate.getMonth() === date.getMonth()
        );
      }).length;
      monthlyData.push({ month: monthKey, count });
    }

    // Top 5 vị trí nhận nhiều hồ sơ nhất
    const jobMap = {};
    jobs.forEach((j) => {
      jobMap[j.job_posting_id] = j.position_name;
    });

    const positionCount = {};
    applications.forEach((a) => {
      const posName = jobMap[a.job_posting_id] || "Unknown";
      positionCount[posName] = (positionCount[posName] || 0) + 1;
    });

    const topPositions = Object.entries(positionCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      statistics: {
        total,
        pending,
        accepted,
        rejected,
        monthlyData,
        topPositions,
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

// Thống kê kết quả ứng tuyển theo công ty
const getApplicationResults = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID là bắt buộc",
      });
    }

    // Lấy tất cả job posting của công ty
    const { data: jobs, error: jobError } = await supabase
      .from("job_posting")
      .select("job_posting_id, position_name, create_at")
      .eq("company_id", companyId);

    if (jobError) {
      console.error("❌ Lỗi khi lấy job posting:", jobError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách job posting",
      });
    }

    const jobIds = jobs.map((j) => j.job_posting_id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        results: {
          conversionRate: 0,
          avgProcessingTime: 0,
          trendData: [],
          positionResults: [],
        },
      });
    }

    // Lấy tất cả application của các job này
    const { data: applications, error: appError } = await supabase
      .from("job_application")
      .select("job_application_id, job_posting_id, status, submitted_at")
      .in("job_posting_id", jobIds);

    if (appError) {
      console.error("❌ Lỗi khi lấy application:", appError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê",
      });
    }

    // Tính tỷ lệ chuyển đổi
    const totalApps = applications.length;
    const acceptedApps = applications.filter((a) => a.status === "accept").length;
    const conversionRate = totalApps > 0 ? ((acceptedApps / totalApps) * 100).toFixed(2) : 0;

    // Giả định thời gian xử lý trung bình (có thể tính từ submitted_at đến updated_at nếu có)
    const avgProcessingTime = 3.5; // days - có thể tính chính xác hơn nếu có trường updated_at

    // Xu hướng theo tháng (6 tháng gần nhất)
    const now = new Date();
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      
      const monthApps = applications.filter((a) => {
        if (!a.submitted_at) return false;
        const appDate = new Date(a.submitted_at);
        return (
          appDate.getFullYear() === date.getFullYear() &&
          appDate.getMonth() === date.getMonth()
        );
      });

      const received = monthApps.length;
      const accepted = monthApps.filter((a) => a.status === "accept").length;
      const rejected = monthApps.filter((a) => a.status === "reject").length;

      trendData.push({ 
        month: monthKey, 
        received, 
        accepted, 
        rejected 
      });
    }

    // Kết quả theo từng vị trí
    const jobMap = {};
    jobs.forEach((j) => {
      jobMap[j.job_posting_id] = j.position_name;
    });

    const positionStats = {};
    applications.forEach((a) => {
      const posName = jobMap[a.job_posting_id] || "Unknown";
      if (!positionStats[posName]) {
        positionStats[posName] = {
          total: 0,
          accepted: 0,
          rejected: 0,
          pending: 0,
        };
      }
      positionStats[posName].total++;
      if (a.status === "accept") positionStats[posName].accepted++;
      if (a.status === "reject") positionStats[posName].rejected++;
      if (a.status === "pending") positionStats[posName].pending++;
    });

    const positionResults = Object.entries(positionStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        accepted: stats.accepted,
        rejected: stats.rejected,
        pending: stats.pending,
        rate: stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      results: {
        conversionRate: parseFloat(conversionRate),
        avgProcessingTime,
        trendData,
        positionResults,
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

// 📍 Lấy danh sách ứng viên theo job_posting_id (kèm điểm AI nếu có)
const getCandidatesByJobPosting = async (req, res) => {
  try {
    const { job_posting_id } = req.params;

    if (!job_posting_id) {
      return res.status(400).json({
        success: false,
        error: "Thiếu job_posting_id",
      });
    }

    // Lấy tất cả application của job posting này
    const { data: applications, error } = await supabase
      .from("job_application")
      .select(`
        job_application_id,
        account_id,
        job_posting_id,
        cv_id,
        cover_letter,
        status,
        submitted_at,
        file_upload,
        file_url,
        account:account_id (
          account_id,
          email,
          phone_number,
          gender,
          date_of_birth
        ),
        cv:cv_id (
          cv_id,
          cv_link,
          years_experience,
          education_level,
          created_at
        )
      `)
      .eq("job_posting_id", job_posting_id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("❌ Lỗi khi lấy danh sách ứng viên:", error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // ✅ Lấy đánh giá AI từ bảng ai_evaluate_cv cho từng application
    const candidatesWithAI = await Promise.all(
      applications.map(async (app) => {
        // Query AI evaluation
        const { data: aiEval, error: aiError } = await supabase
          .from("ai_evaluate_cv")
          .select("*")
          .eq("job_application_id", app.job_application_id)
          .single();

        // Tính điểm tổng từ các thành phần (nếu có AI evaluation)
        let ai_score = null;
        let ai_evaluation = null;

        if (aiEval && !aiError) {
          // Tính điểm trung bình (scale 0-10 -> 0-100)
          const totalScore =
            (aiEval.skill || 0) +
            (aiEval.education || 0) +
            (aiEval.position || 0) +
            (aiEval.experiences || 0) +
            (aiEval.general || 0);
          ai_score = Math.round((totalScore / 50) * 100); // 50 = max (5 categories * 10)

          ai_evaluation = {
            ai_evaluate_cv_id: aiEval.ai_evaluate_cv_id,
            skill: aiEval.skill,
            education: aiEval.education,
            position: aiEval.position,
            experiences: aiEval.experiences,
            general: aiEval.general,
            weak: aiEval.weak,
            strong: aiEval.strong,
            interview_question: aiEval.interview_question,
            detail_analysis: aiEval.detail_analysis,
            created_at: aiEval.created_at,
          };
        }

        return {
          ...app,
          ai_score,
          ai_evaluation,
        };
      })
    );

    // Sắp xếp theo điểm AI từ cao xuống thấp (những ứng viên chưa có điểm xuống cuối)
    candidatesWithAI.sort((a, b) => {
      if (a.ai_score === null) return 1;
      if (b.ai_score === null) return -1;
      return b.ai_score - a.ai_score;
    });

    return res.status(200).json({
      success: true,
      candidates: candidatesWithAI,
      total: candidatesWithAI.length,
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({
      success: false,
      error: "Lỗi server",
    });
  }
};

module.exports = {
  listApplication,
  addApplication,
  listApplicationId,
  updateApplicationStatus,
  acceptApplication,
  deleteApplication,
  rejectApplication,
  addApplicationFile,
  checkApplied,
  getApplicationStatistics,
  getApplicationResults,
  getCandidatesByJobPosting,
};
