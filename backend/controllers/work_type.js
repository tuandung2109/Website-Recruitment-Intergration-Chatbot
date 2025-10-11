const supabase = require("../config/supabase");
// Lấy danh sách account
const listAccountWordType = async (req, res) => {
  try {
    const { data, error } = await supabase.from("work_type").select("* ");

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ work_type: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listAccountWordTypeId = async (req, res) => {};
const postAccountWordType = async (req, res) => {
  try {
    const { job_posting_id, work_type_name } = req.body;

    if (!job_posting_id || !work_type_name) {
      return res
        .status(400)
        .json({ error: "Thiếu job_posting_id hoặc work_type_name" });
    }
    const { data, error } = await supabase
      .from("work_type")
      .insert([{ job_posting_id, work_type_name }])
      .select();
    if (error) throw error;
    return res.status(201).json({
      message: "✅ Thêm hình thức làm việc thành công",
      work_type: data[0],
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res
      .status(500)
      .json({ error: "Lỗi server khi thêm hình thức làm việc" });
  }
};

module.exports = {
  listAccountWordType,
  listAccountWordTypeId,
  postAccountWordType,
};
