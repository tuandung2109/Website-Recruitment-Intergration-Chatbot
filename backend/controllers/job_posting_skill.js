const supabase = require("../config/supabase");
// Lấy danh sách account
const listJobPostingSkill = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("job_posting_skill")
      .select("*"); // JOIN 2 bảng

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ job_posting_skill: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listJobPostingSkillId = async (req, res) => {};

module.exports = {
  listJobPostingSkill,
  listJobPostingSkillId,
};
