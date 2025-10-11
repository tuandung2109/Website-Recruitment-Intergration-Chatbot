const supabase = require("../config/supabase");
// Lấy danh sách account
const listJobPostingIndustry = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("job_posting_industry")
      .select("*"); // JOIN 2 bảng

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ job_posting_industry: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listJobPostingIndustryId = async (req, res) => {};

module.exports = {
  listJobPostingIndustry,
  listJobPostingIndustryId,
};
