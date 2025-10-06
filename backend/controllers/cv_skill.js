const supabase = require("../config/supabase");
// Lấy danh sách account
const listAccountCvSkill = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("account")
      .select("*, account_type(*)"); // JOIN 2 bảng

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ accounts: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listAccountCvSkillId = async (req, res) => {};

module.exports = {
  listAccountCvSkill,
  listAccountCvSkillId,
};
