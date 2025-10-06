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
const listApplicationId = async (req, res) => {
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

module.exports = { listApplication, listApplicationId };
