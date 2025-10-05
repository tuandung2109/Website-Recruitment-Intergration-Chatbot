const generateOTP = require("../helper/generate");
const supabase = require("../config/supabase");
// Lấy danh sách account
const listCompany = async (req, res) => {
  try {
    const { data: accounts, error } = await supabase
      .from("account")
      .select("*")
      .eq("status", "active");

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ accounts });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { listCompany };
