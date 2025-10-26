import { _post } from "../utils/request";

const sendEmail = async (data) => {
  try {
    const res = await _post("/email/send", data);
    const json = await res.json(); // 👈 nhớ có await
    return json;
  } catch (error) {
    console.error("Send email error:", error);
    return { success: false, message: "Không thể gửi email" };
  }
};

export { sendEmail };
