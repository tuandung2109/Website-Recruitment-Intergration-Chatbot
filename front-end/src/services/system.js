import { _get, _patch } from "../utils/request";

export const getSystem = async () => {
  const response = await _get("/system");
  const result = await response.json();
  return result;
};

export const editSystem = async (data) => {
  const response = await _patch("/system", data);
  const result = await response.json();
  return result;
};

export const getInfo = async () => {
  const response = await _get("/system/info");
  const result = await response.json();
  return result;
};
