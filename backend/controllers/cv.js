const supabase = require("../config/supabase");
// Lấy danh sách account
const listCv = async (req, res) => {
  try {
    const { data: cv, error } = await supabase.from("cv").select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ cv });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listCvId = async (req, res) => {
  try {
    const cv_id = req.params.id;

    if (!cv_id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }
    const { data: cv, error } = await supabase
      .from("cv")
      .select("*")
      .eq("cv_id", cv_id) // sửa tên cột
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ cv });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { listCv, listCvId };
