import { _get } from "../utils/request";

const listSkills = async () => {
  try {
    const res = await _get(`/skill/listSkill`);
    const result = await res.json();
    if (res.ok && result.skill) {
      return {
        success: true,
        skills: result.skill,
      };
    } else {
      return {
        success: false,
        message: result.message || "Không thể lấy danh sách kỹ năng",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Lỗi kết nối đến máy chủ",
    };
  }
};

export { listSkills };
