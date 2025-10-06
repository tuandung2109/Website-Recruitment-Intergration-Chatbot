const supabase = require("../config/supabase");

// 📍 Lấy danh sách tất cả kỹ năng
const listMessage = async (req, res) => {
  try {
    const { data: message, error } = await supabase
      .from("message")
      .select("*")
      .order("message_id", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Lấy kỹ năng theo ID
const listMessageId = async (req, res) => {
  try {
    const message_id = req.params.id;

    if (!message_id) {
      return res.status(400).json({ error: "Thiếu ID kỹ năng" });
    }

    const { data: message, error } = await supabase
      .from("message")
      .select("*")
      .eq("message_id", message_id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  listMessage,
  listMessageId,
};
