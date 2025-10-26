// controllers/emailController.js
const nodemailer = require("nodemailer");
const sendEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // ví dụ: jobvip.company@gmail.com
        pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng (App password)
      },
    });

    await transporter.sendMail({
      from: `"JobVip" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    res.json({ success: true, message: "Email đã được gửi!" });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ success: false, message: "Gửi email thất bại" });
  }
};

module.exports = { sendEmail };
