import { _get, _post, _patch, _delete } from "../utils/request";

const listWorkType = async () => {
  try {
    const res = await _get(`/work_type/listAccountWordType`);
    const result = await res.json();
    if (res.ok && result.work_type) {
      return { success: true, workTypes: result.work_type };
    } else {
      return {
        success: false,
        message: result.error || "Không thể lấy danh sách hình thức làm việc",
      };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const postWorkType = async (data) => {
  try {
    const res = await _post(`/work_type/postAccountWordType`, data);
    const result = await res.json();
    if (res.ok) return { success: true, data: result };
    return { success: false, message: result.error };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const updateWorkType = async (id, data) => {
  try {
    const res = await _patch(`/work_type/updateAccountWordType/${id}`, data);
    const result = await res.json();
    if (res.ok) return { success: true, data: result };
    return { success: false, message: result.error };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const deleteWorkType = async (id) => {
  try {
    const res = await _delete(`/work_type/deleteAccountWordType/${id}`);
    const result = await res.json();
    if (res.ok) return { success: true, message: result.message };
    return { success: false, message: result.error };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export { listWorkType, postWorkType, updateWorkType, deleteWorkType };
