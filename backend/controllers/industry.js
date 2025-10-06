const supabase = require("../config/supabase");

// 📍 Lấy danh sách tất cả ngành nghề
const listIndustry = async (req, res) => {
  try {
    const { data: industry, error } = await supabase
      .from("industry")
      .select("*")
      .order("industry_id", { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ industry });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Lấy thông tin ngành nghề theo ID
const listIndustryId = async (req, res) => {
  try {
    const industry_id = req.params.id;
    if (!industry_id) {
      return res.status(400).json({ error: "Thiếu ID ngành nghề" });
    }
    const { data: industry, error } = await supabase
      .from("industry")
      .select("*")
      .eq("industry_id", industry_id)
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ industry });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Thêm ngành nghề mới
const postIndustry = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Thiếu tên ngành nghề" });
    }
    const { data, error } = await supabase
      .from("industry")
      .insert([{ name }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res
      .status(201)
      .json({ message: "Thêm ngành nghề thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 📍 Cập nhật ngành nghề
const updateIndustry = async (req, res) => {
  try {
    const industry_id = req.params.id;
    const { name } = req.body;

    if (!industry_id || !name) {
      return res.status(400).json({ error: "Thiếu ID hoặc tên ngành nghề" });
    }
    const { data, error } = await supabase
      .from("industry")
      .update({ name })
      .eq("industry_id", industry_id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res
      .status(200)
      .json({ message: "Cập nhật ngành nghề thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Xóa ngành nghề
const deleteIndustry = async (req, res) => {
  try {
    const industry_id = req.params.id;

    if (!industry_id) {
      return res.status(400).json({ error: "Thiếu ID ngành nghề" });
    }
    const { error } = await supabase
      .from("industry")
      .delete()
      .eq("industry_id", industry_id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Xóa ngành nghề thành công" });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Mở khóa ngành nghề (nếu có cột status)
const unlockIndustry = async (req, res) => {
  try {
    const industry_id = req.params.id;

    if (!industry_id) {
      return res.status(400).json({ error: "Thiếu ID ngành nghề" });
    }
    // Nếu bảng có cột status thì bạn có thể dùng:
    const { data, error } = await supabase
      .from("industry")
      .update({ status: "active" })
      .eq("industry_id", industry_id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "Đã mở khóa ngành nghề", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  listIndustry,
  listIndustryId,
  postIndustry,
  unlockIndustry,
  updateIndustry,
  deleteIndustry,
};
