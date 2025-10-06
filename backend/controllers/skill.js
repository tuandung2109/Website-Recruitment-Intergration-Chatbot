const supabase = require("../config/supabase");

// 📍 Lấy danh sách tất cả kỹ năng
const listSkill = async (req, res) => {
  try {
    const { data: skill, error } = await supabase
      .from("skill")
      .select("*")
      .order("skill_id", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ skill });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Lấy kỹ năng theo ID
const listSkillId = async (req, res) => {
  try {
    const skill_id = req.params.id;

    if (!skill_id) {
      return res.status(400).json({ error: "Thiếu ID kỹ năng" });
    }

    const { data: skill, error } = await supabase
      .from("skill")
      .select("*")
      .eq("skill_id", skill_id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ skill });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Thêm kỹ năng mới
const postSkill = async (req, res) => {
  try {
    const { skill_name } = req.body;

    if (!skill_name) {
      return res.status(400).json({ error: "Thiếu tên kỹ năng" });
    }

    const { data, error } = await supabase
      .from("skill")
      .insert([{ skill_name }])
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ message: "Thêm kỹ năng thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Cập nhật kỹ năng
const updateSkill = async (req, res) => {
  try {
    const skill_id = req.params.id;
    const { skill_name } = req.body;

    if (!skill_id || !skill_name) {
      return res.status(400).json({ error: "Thiếu ID hoặc tên kỹ năng" });
    }

    const { data, error } = await supabase
      .from("skill")
      .update({ skill_name })
      .eq("skill_id", skill_id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    return res
      .status(200)
      .json({ message: "Cập nhật kỹ năng thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Xóa kỹ năng
const deleteSkill = async (req, res) => {
  try {
    const skill_id = req.params.id;

    if (!skill_id) {
      return res.status(400).json({ error: "Thiếu ID kỹ năng" });
    }

    const { error } = await supabase
      .from("skill")
      .delete()
      .eq("skill_id", skill_id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Xóa kỹ năng thành công" });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 (Tuỳ chọn) Mở khóa kỹ năng nếu có cột status
const unlockSkill = async (req, res) => {
  try {
    const skill_id = req.params.id;

    if (!skill_id) {
      return res.status(400).json({ error: "Thiếu ID kỹ năng" });
    }

    const { data, error } = await supabase
      .from("skill")
      .update({ status: "active" })
      .eq("skill_id", skill_id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Đã mở khóa kỹ năng", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  listSkill,
  listSkillId,
  postSkill,
  unlockSkill,
  updateSkill,
  deleteSkill,
};
