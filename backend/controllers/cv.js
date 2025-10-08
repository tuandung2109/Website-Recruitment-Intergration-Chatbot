const supabase = require("../config/supabase");
// Lấy danh sách account
const listCv = async (req, res) => {
  try {
    const { data: cv, error } = await supabase.from("cv").select("*");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ cv });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const listCvId = async (req, res) => {
  try {
    const cv_id = req.params.id;

    if (!cv_id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }
    const { data: cv, error } = await supabase
      .from("cv")
      .select("*")
      .eq("cv_id", cv_id) // sửa tên cột
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ cv });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📤 Upload CV thật (file + thông tin)
const uploadCv = async (req, res) => {
  try {
    const { account_id, years_experience, education_level } = req.body;
    const file = req.file;

    if (!file || !account_id) {
      return res.status(400).json({ error: "Thiếu account_id hoặc file" });
    }

    // 🔹 Tạo đường dẫn lưu file local
    const filePath = `/uploads/${file.filename}`;

    // 🔹 Lưu đường dẫn file vào bảng cv trong Supabase
    const { data, error } = await supabase
      .from("cv")
      .insert([
        {
          account_id,
          cv_link: filePath,
          years_experience,
          education_level,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Tải CV thành công",
      cv: data,
    });
  } catch (err) {
    console.error("❌ Lỗi uploadCv:", err);
    res.status(500).json({ error: "Lỗi server khi upload CV" });
  }
};

// 📍 Lấy tất cả CV + skill của 1 tài khoản
const getCvWithSkills = async (req, res) => {
  try {
    const raw = req.params.account_id;
    const accountId = Number(raw);

    if (!Number.isInteger(accountId) || accountId <= 0) {
      return res.status(400).json({ error: "account_id không hợp lệ" });
    }

    const { data: cvList, error: cvErr } = await supabase
      .from("cv")
      .select("*")
      .eq("account_id", accountId);

    if (cvErr) throw cvErr;
    if (!cvList || cvList.length === 0) {
      return res.status(200).json({ cvList: [], cvSkills: [] }); // không 404 để FE xử lý nhẹ nhàng
    }

    const cvIds = cvList.map((cv) => cv.cv_id);
    const { data: cvSkills, error: skillErr } = await supabase
      .from("cv_skill")
      .select("cv_id, skill(skill_id, skill_name)")
      .in("cv_id", cvIds);
    if (skillErr) throw skillErr;

    return res.status(200).json({ cvList, cvSkills });
  } catch (err) {
    console.error("❌ Lỗi getCvWithSkills:", err);
    return res.status(500).json({ error: "Lỗi server khi lấy CV + skill" });
  }
};


// 📍 Cập nhật kỹ năng cho 1 CV cụ thể
const updateCvSkills = async (req, res) => {
  try {
    const { cv_id, skill_ids } = req.body;
    if (!cv_id || !Array.isArray(skill_ids))
      return res.status(400).json({ error: "Thiếu cv_id hoặc skill_ids" });

    await supabase.from("cv_skill").delete().eq("cv_id", cv_id);

    const newSkills = skill_ids.map((id) => ({ cv_id, skill_id: id }));
    const { error } = await supabase.from("cv_skill").insert(newSkills);
    if (error) throw error;

    res.status(200).json({ message: "Cập nhật kỹ năng thành công" });
  } catch (err) {
    console.error("❌ Lỗi updateCvSkills:", err);
    res.status(500).json({ error: "Lỗi server khi cập nhật kỹ năng" });
  }
};

// 📍 XÓA CV (và kỹ năng đi kèm)
const deleteCv = async (req, res) => {
  try {
    const { cv_id } = req.params;

    if (!cv_id) {
      return res.status(400).json({ error: "Thiếu cv_id" });
    }

    // Xóa kỹ năng liên kết trước (cv_skill)
    const { error: skillErr } = await supabase
      .from("cv_skill")
      .delete()
      .eq("cv_id", cv_id);

    if (skillErr) throw skillErr;

    // Sau đó xóa CV
    const { error: cvErr } = await supabase
      .from("cv")
      .delete()
      .eq("cv_id", cv_id);

    if (cvErr) throw cvErr;

    return res.status(200).json({ message: "Xóa CV thành công" });
  } catch (err) {
    console.error("❌ Lỗi deleteCv:", err);
    return res.status(500).json({ error: "Lỗi server khi xóa CV" });
  }
};

module.exports = { listCv, listCvId , uploadCv, getCvWithSkills, updateCvSkills , deleteCv};
