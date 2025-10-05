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

module.exports = { listApplication };
