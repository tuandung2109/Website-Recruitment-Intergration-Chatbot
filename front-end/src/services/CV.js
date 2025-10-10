import { _get, _post , _delete } from "../utils/request";

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
  const res = await _delete(`/cv/delete/${cv_id}`);
  return res.json();
};

// Thêm kỹ năng mới 
const createSkill = async (skill_name) => {
  const res = await _post("/skill/postSkill", { skill_name });
  return res.json();
};

const listMyCVs = async (accountId) => {
  const res = await _get(`/cv/listCv`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Không thể lấy danh sách CV");
  return (data.cv || []).filter(cv => cv.account_id === Number(accountId));
};

// ✅ Upload CV thật để nhận cv_id và cv_link từ backend
const uploadCvFile = async ({ account_id, file, years_experience = 0, education_level = "No Requirements" }) => {
  const form = new FormData();
  form.append("account_id", account_id);
  form.append("years_experience", years_experience);
  form.append("education_level", education_level);
  form.append("file", file); // tên field phải đúng với routes/cv.js: upload.single("file")

  const res = await _post(`/cv/upload`, form);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Upload CV thất bại");
  // data.cv = { cv_id, cv_link, ... }
  return data.cv;
};

export { getCvDetail, uploadCv, updateCvSkills, deleteCv, createSkill , listMyCVs , uploadCvFile };