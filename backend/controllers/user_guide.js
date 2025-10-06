const supabase = require("../config/supabase");

// 📍 Lấy danh sách tất cả hướng dẫn
const listUserGuide = async (req, res) => {
  try {
    const { data: user_guide, error } = await supabase
      .from("user_guide")
      .select("*")
      .order("guide_id", { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user_guide });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Lấy hướng dẫn theo ID
const listUserGuideId = async (req, res) => {
  try {
    const guide_id = req.params.id;
    if (!guide_id) {
      return res.status(400).json({ error: "Thiếu ID hướng dẫn" });
    }
    const { data: user_guide, error } = await supabase
      .from("user_guide")
      .select("*")
      .eq("guide_id", guide_id)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user_guide });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Thêm hướng dẫn mới
const postUserGuideId = async (req, res) => {
  try {
    const { guide_title, guide_content } = req.body;
    if (!guide_title || !guide_content) {
      return res
        .status(400)
        .json({ error: "Thiếu tiêu đề hoặc nội dung hướng dẫn" });
    }
    const { data, error } = await supabase
      .from("user_guide")
      .insert([
        {
          guide_title,
          guide_content,
          updated_at: new Date().toISOString().split("T")[0],
        },
      ])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ message: "Thêm hướng dẫn thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Cập nhật hướng dẫn
const updateUserGuideId = async (req, res) => {
  try {
    const guide_id = req.params.id;
    const { guide_title, guide_content } = req.body;
    if (!guide_id || !guide_title || !guide_content) {
      return res.status(400).json({ error: "Thiếu ID hoặc dữ liệu cập nhật" });
    }
    const { data, error } = await supabase
      .from("user_guide")
      .update({
        guide_title,
        guide_content,
        updated_at: new Date().toISOString().split("T")[0],
      })
      .eq("guide_id", guide_id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res
      .status(200)
      .json({ message: "Cập nhật hướng dẫn thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Xóa hướng dẫn
const deleteUserGuideId = async (req, res) => {
  try {
    const guide_id = req.params.id;
    if (!guide_id) {
      return res.status(400).json({ error: "Thiếu ID hướng dẫn" });
    }
    const { error } = await supabase
      .from("user_guide")
      .delete()
      .eq("guide_id", guide_id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Xóa hướng dẫn thành công" });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 (Tuỳ chọn) Mở khóa hướng dẫn nếu có cột status
const unlockUserGuideId = async (req, res) => {
  try {
    const guide_id = req.params.id;

    if (!guide_id) {
      return res.status(400).json({ error: "Thiếu ID hướng dẫn" });
    }

    const { data, error } = await supabase
      .from("user_guide")
      .update({ status: "active" })
      .eq("guide_id", guide_id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Đã mở khóa hướng dẫn", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
module.exports = {
  listUserGuide,
  listUserGuideId,
  postUserGuideId,
  updateUserGuideId,
  deleteUserGuideId,
  unlockUserGuideId,
};
