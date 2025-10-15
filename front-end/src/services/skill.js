import { _get, _post, _patch, _delete } from "../utils/request";

const listSkills = async () => {
  try {
    const res = await _get(`/skill/listSkill`);
    const result = await res.json();
    if (res.ok && result.skill) {
      return { success: true, skills: result.skill };
    } else {
      return {
        success: false,
        message: result.error || "Không thể lấy danh sách kỹ năng",
      };
    }
  } catch (error) {
    return { success: false, message: error.message || "Lỗi kết nối máy chủ" };
  }
};

const postSkill = async (skill_name) => {
  try {
    const res = await _post(`/skill/postSkill`, { skill_name });
    const result = await res.json();
    if (res.ok) return { success: true, data: result };
    return { success: false, message: result.error };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updateSkill = async (id, skill_name) => {
  try {
    const res = await _patch(`/skill/updateSkill/${id}`, { skill_name });
    const result = await res.json();
    if (res.ok) return { success: true, data: result };
    return { success: false, message: result.error };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deleteSkill = async (id) => {
  try {
    const res = await _delete(`/skill/deleteSkill/${id}`);
    const result = await res.json();
    if (res.ok) return { success: true, message: result.message };
    return { success: false, message: result.error };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export { listSkills, postSkill, updateSkill, deleteSkill };
