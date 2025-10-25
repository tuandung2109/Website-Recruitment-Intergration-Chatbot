const multer = require("multer");
const supabase = require("../config/supabase");
const upload = multer({ storage: multer.memoryStorage() }).single("file");

// Lấy danh sách account
const listApplication = async (req, res) => {
  try {
    const { data: applications, error } = await supabase.from("job_application")
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

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ applications });
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

module.exports = {
  listApplication,
  addApplication,
  listApplicationId,
  updateApplicationStatus,
  acceptApplication,
  deleteApplication,
  rejectApplication,
  addApplicationFile,
};
