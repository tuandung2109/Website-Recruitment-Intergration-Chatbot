const supabase = require("../config/supabase");
// Lấy danh sách account
const listIndustry = async (req, res) => {
  try {
    const { data: industry, error } = await supabase
      .from("industry")
      .select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ industry });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listIndustryId = async (req, res) => {
  try {
    const industry_id = req.params.id;

    if (!industry_id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }

    const { data: industry, error } = await supabase
      .from("industry")
      .select("*")
      .eq("industry_id", industry_id) // sửa tên cột
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ industry });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { listIndustry, listIndustryId };
