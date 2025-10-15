const supabase = require("../config/supabase");

// 📍 Lấy tất cả hình thức làm việc
const listAccountWordType = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("work_type")
      .select("*")
      .order("work_type_id");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ work_type: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Lấy theo ID
const listAccountWordTypeId = async (req, res) => {
  try {
    const id = req.params.id;
    const { data, error } = await supabase
      .from("work_type")
      .select("*")
      .eq("work_type_id", id)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ work_type: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Thêm hình thức làm việc
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

// 📍 Cập nhật hình thức làm việc
const updateAccountWordType = async (req, res) => {
  try {
    const id = req.params.id;
    const { job_posting_id, work_type_name } = req.body;

    if (!id || !work_type_name) {
      return res
        .status(400)
        .json({ error: "Thiếu ID hoặc tên hình thức làm việc" });
    }

    const { data, error } = await supabase
      .from("work_type")
      .update({ job_posting_id, work_type_name })
      .eq("work_type_id", id)
      .select();

    if (error) throw error;
    return res.status(200).json({
      message: "✅ Cập nhật hình thức làm việc thành công",
      work_type: data[0],
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res
      .status(500)
      .json({ error: "Lỗi server khi cập nhật hình thức làm việc" });
  }
};

// 📍 Xóa hình thức làm việc
const deleteAccountWordType = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({ error: "Thiếu ID hình thức làm việc" });

    const { error } = await supabase
      .from("work_type")
      .delete()
      .eq("work_type_id", id);
    if (error) throw error;
    return res
      .status(200)
      .json({ message: "🗑️ Xóa hình thức làm việc thành công" });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res
      .status(500)
      .json({ error: "Lỗi server khi xóa hình thức làm việc" });
  }
};

module.exports = {
  listAccountWordType,
  listAccountWordTypeId,
  postAccountWordType,
  updateAccountWordType,
  deleteAccountWordType,
};
