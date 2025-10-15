import { _get, _post, _patch, _delete } from "../utils/request";

const listIndustry = async () => {
  try {
    const res = await _get(`/industry/listIndustry`);
    const result = await res.json();
    if (res.ok && result.industry) {
      return { success: true, industrys: result.industry };
    }
    return { success: false, message: result.error || "Không thể tải dữ liệu" };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

const postIndustry = async (body) => {
  try {
    const res = await _post(`/industry/postIndustry`, body);
    const result = await res.json();
    return { success: res.ok, ...result };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

const updateIndustry = async (id, body) => {
  try {
    const res = await _patch(`/industry/updateIndustry/${id}`, body);
    const result = await res.json();
    return { success: res.ok, ...result };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

const deleteIndustry = async (id) => {
  try {
    const res = await _delete(`/industry/deleteIndustry/${id}`);
    const result = await res.json();
    return { success: res.ok, ...result };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export { listIndustry, postIndustry, updateIndustry, deleteIndustry };
