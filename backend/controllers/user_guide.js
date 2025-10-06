const supabase = require("../config/supabase");
// Lấy danh sách account
const listUserGuide = async (req, res) => {
  try {
    const { data: user_guide, error } = await supabase
      .from("user_guide")
      .select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user_guide });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
const listUserGuideId = async (req, res) => {
  try {
    const guide_id = req.params.id;

    if (!guide_id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }

    const { data: user_guide, error } = await supabase
      .from("user_guide")
      .select("*")
      .eq("guide_id", guide_id) // sửa tên cột
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ user_guide });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { listUserGuide, listUserGuideId };
