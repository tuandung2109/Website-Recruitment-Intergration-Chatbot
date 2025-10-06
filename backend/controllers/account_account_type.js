const supabase = require("../config/supabase");
// Lấy danh sách account
const listAccountAccountType = async (req, res) => {
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

const listAccountAccountTypeId = async (req, res) => {
  try {
    const typeId = req.params.id;

    const { data, error } = await supabase
      .from("account")
      .select("*, account_type(*)")
      .eq("account_type_id", typeId);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ accounts: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
module.exports = {
  listAccountAccountType,
  listAccountAccountTypeId,
};
