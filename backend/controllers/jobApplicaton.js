const supabase = require("../config/supabase");
// Lấy danh sách account
const listApplication = async (req, res) => {
  try {
    const { data: company, error } = await supabase
      .from("job_application")
      .select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ company });
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
// 📍 Lấy đơn ứng tuyển theo ID
const listApplicationId = async (req, res) => {
  try {
    const job_application_id = req.params.id;

    if (!job_application_id)
      return res.status(400).json({ error: "Thiếu ID đơn ứng tuyển" });

    const { data: application, error } = await supabase
      .from("job_application")
      .select("*")
      .eq("job_application_id", job_application_id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ application });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Cập nhật trạng thái đơn ứng tuyển
const updateApplication = async (req, res) => {
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
const unlockApplication = async (req, res) => {
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

module.exports = {
  listApplication,
  addApplication,
  listApplicationId,
  unlockApplication,
  updateApplication,
  deleteApplication,
};

// const supabase = require("../config/supabase");
// // Lấy danh sách account
// const listApplication = async (req, res) => {
//   try {
//     const { data: company, error } = await supabase
//       .from("job_application")
//       .select("*");
//     if (error) return res.status(400).json({ error: error.message });
//     return res.status(200).json({ company });
//   } catch (err) {
//     console.error("❌ Lỗi server:", err);
//     return res.status(500).json({ error: "Lỗi server" });
//   }
// };

// // 📝 Thêm đơn ứng tuyển
// const listApplicationId = async (req, res) => {
//   try {
//     const {
//       account_id,
//       job_posting_id,
//       cv_id,
//       cover_letter,
//       file_upload,
//       file_url,
//     } = req.body;

//     // Kiểm tra dữ liệu đầu vào
//     if (
//       !account_id ||
//       !job_posting_id ||
//       !cv_id ||
//       !cover_letter ||
//       !file_upload ||
//       !file_url
//     ) {
//       return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
//     }

//     // Thêm đơn ứng tuyển vào Supabase
//     const { data, error } = await supabase
//       .from("job_application")
//       .insert([
//         {
//           account_id,
//           job_posting_id,
//           cv_id,
//           cover_letter,
//           status: "pending",
//           file_upload,
//           file_url,
//         },
//       ])
//       .select();

//     if (error) return res.status(400).json({ error: error.message });
//     return res
//       .status(201)
//       .json({ message: "Nộp đơn ứng tuyển thành công", data });
//   } catch (err) {
//     console.error("❌ Lỗi server:", err);
//     return res.status(500).json({ error: "Lỗi server" });
//   }
// };

// module.exports = { listApplication, listApplicationId };
