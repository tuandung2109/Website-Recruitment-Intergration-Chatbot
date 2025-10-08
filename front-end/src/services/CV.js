import { _get, _post } from "../utils/request";

// 📥 Lấy tất cả CV của user (gồm skill)
const getCvDetail = async (account_id) => {
  const res = await _get(`/cv/detail/${account_id}`);
  return res.json();
};

// 📤 Upload CV mới
const uploadCv = async (data) => {
  const res = await _post("/cv/upload", data);
  return res.json();
};

// 🔁 Cập nhật kỹ năng cho 1 CV
const updateCvSkills = async (data) => {
  const res = await _post("/cv/updateSkills", data);
  return res.json();
};

// ❌ Xoá CV
const deleteCv = async (cv_id) => {
  const res = await fetch(`http://localhost:9000/api/cv/delete/${cv_id}`, {
    method: "DELETE",
  });
  return res.json();
};

// Thêm kỹ năng mới 
const createSkill = async (skill_name) => {
  const res = await _post("/skill/postSkill", { skill_name });
  return res.json();
};

export { getCvDetail, uploadCv, updateCvSkills, deleteCv, createSkill };