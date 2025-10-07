const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const generateOTP = require("../helper/generate");
const sendMailHelper = require("../helper/sendMail");
const otpStore = new Map();

// Lấy danh sách account
const listAccount = async (req, res) => {
  try {
    const { data: accounts, error } = await supabase
      .from("account")
      .select(
        `*,
        account_account_type(
          account_type:account_type_id(
            account_type_id,
            role_name
          )
        )
        `
      )
      .eq("status", "active");

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ accounts });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// Đăng ký account mới
const postRegister = async (req, res) => {
  try {
    const { email, phone_number, password, gender, date_of_birth, company_id } =
      req.body;

    // Validate bắt buộc
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email không được để trống!" });
    }
    if (!phone_number) {
      return res
        .status(400)
        .json({ success: false, message: "Phone không được để trống!" });
    }
    if (phone_number.length < 10 || phone_number.length > 11) {
      return res
        .status(400)
        .json({ success: false, message: "Số lượng ký tự Phone không hợp lệ" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password không được để trống!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password phải >= 6 ký tự" });
    }
    if (password.length > 20) {
      return res
        .status(400)
        .json({ success: false, message: "Password phải <= 20 ký tự" });
    }

    // Kiểm tra email đã tồn tại
    const { data: exitEmail } = await supabase
      .from("account")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (exitEmail)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại!" });

    // Kiểm tra phone_number đã tồn tại
    const { data: exitPhone } = await supabase
      .from("account")
      .select("*")
      .eq("phone_number", phone_number)
      .maybeSingle();

    if (exitPhone)
      return res
        .status(400)
        .json({ success: false, message: "Phone đã tồn tại!" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm account mới
    const { data, error } = await supabase.from("account").insert([
      {
        email,
        phone_number,
        password: hashedPassword,
        status: "active", // default active
        gender: gender || null,
        date_of_birth: date_of_birth || null,
        company_id: company_id || null,
      },
    ]);

    if (error)
      return res.status(400).json({ success: false, message: error.message });

    return res
      .status(201)
      .json({ success: true, message: "Đăng ký thành công!", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Đăng nhập
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email và password là bắt buộc!" });

    console.log("DEBUG: email =", email);
    console.log("DEBUG: password =", password);

    // Lấy account theo email
    const { data: account, error } = await supabase
      .from("account")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    console.log("DEBUG: account từ Supabase =", account); // ✅ in ra account
    if (error) console.log("DEBUG: lỗi khi lấy account =", error);

    if (!account)
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc password sai!" });

    console.log("DEBUG: account.password =", account.password);
    console.log("DEBUG: password nhập vào =", password);

    // So sánh password
    const isMatch = await bcrypt.compare(password, account.password);
    console.log("DEBUG: isMatch =", isMatch);

    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc password sai!" });

    // Nếu đăng nhập thành công
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      account: {
        id: account.account_id,
        email: account.email,
        phone_number: account.phone_number,
        status: account.status,
        gender: account.gender,
        date_of_birth: account.date_of_birth,
        company_id: account.company_id,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Xóa cứng account
const hardDeleteAccount = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      req.flash("error", "ID không được để trống!");
      return res.redirect("/accounts");
    }
    const { data, error } = await supabase
      .from("account")
      .delete()
      .eq("account_id", id);

    if (error) {
      console.error("❌ Lỗi khi xóa cứng account:", error);
      req.flash("error", "Xóa account thất bại!");
      return res.redirect("/accounts");
    }

    req.flash("success", "Xóa cứng account thành công!");
    console.log("success", "Xóa cứng account thành công!");
    return res.redirect("/accounts");
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
// Xóa mềm account (cập nhật status từ active -> inactive)
const softDeleteAccount = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      req.flash("error", "ID không được để trống!");
      return res.redirect("/accounts");
    }

    // Kiểm tra account tồn tại
    const { data: existingAccount, error: fetchError } = await supabase
      .from("account")
      .select("*")
      .eq("account_id", id)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Lỗi khi kiểm tra account:", fetchError);
      req.flash("error", "Lỗi server khi kiểm tra account!");
      return res.redirect("/accounts");
    }

    if (!existingAccount) {
      req.flash("error", "Account không tồn tại!");
      return res.redirect("/accounts");
    }

    // Cập nhật status
    const { data, error } = await supabase
      .from("account")
      .update({ status: "inactive" })
      .eq("account_id", id);

    if (error) {
      console.error("❌ Lỗi khi xóa mềm account:", error);
      req.flash("error", "Xóa mềm account thất bại!");
      return res.redirect("/accounts");
    }

    req.flash("success", "Xóa mềm account thành công!");
    return res.redirect("/accounts");
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const userForgot = async (req, res) => {
  try {
    const email = req.body.email || req.body.email?.email;
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email không hợp lệ!" });
    }
    // Kiểm tra email tồn tại
    const { data: accountData, error: accountError } = await supabase
      .from("account")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (accountError)
      return res.status(500).json({ success: false, message: "Lỗi server" });
    if (!accountData)
      return res
        .status(400)
        .json({ success: false, message: "Email không tồn tại!" });
    // Tạo OTP
    const otp = generateOTP.generateRandomNumber(6);
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 phút
    // Lưu OTP vào Map tạm
    otpStore.set(email, { otp, expiresAt });
    // Gửi email
    const subject = "Mã OTP đặt lại mật khẩu";
    const html = `Mã OTP là <b style="color:blue">${otp}</b>. Có hiệu lực 3 phút. Hãy nhập cẩn thận bạn nhó ('_')`;
    await sendMailHelper.sendMail(email, subject, html);
    return res.status(200).json({
      success: true,
      message: "OTP đã được gửi! Có hiệu lực 3 phút.",
      email,
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
// API kiểm tra OTP
const userOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu email hoặc OTP" });
    }
    const record = otpStore.get(email);
    if (!record) {
      return res
        .status(400)
        .json({ success: false, message: "OTP không tồn tại hoặc đã hết hạn" });
    }
    // Kiểm tra thời gian
    if (new Date() > record.expiresAt) {
      otpStore.delete(email);
      return res
        .status(400)
        .json({ success: false, message: "OTP đã hết hạn" });
    }
    // Kiểm tra OTP
    if (otp !== record.otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP không chính xác" });
    }
    // OTP đúng => xóa khỏi Map
    otpStore.delete(email);

    return res.status(200).json({ success: true, message: "OTP hợp lệ" });
  } catch (err) {
    console.error("OTP check error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xác minh OTP" });
  }
};
const userResetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu đầu vào (email hoặc password)!",
      });
    }
    // Kiểm tra xem OTP đã được xác minh chưa
    if (!verifiedOtpStore.get(email)) {
      return res.status(400).json({
        success: false,
        message: "Chưa xác minh OTP hoặc OTP đã hết hạn",
      });
    }
    // Hash password mới
    const hashedPassword = await bcrypt.hash(password, 10);
    // Cập nhật password vào bảng account
    const { data, error } = await supabase
      .from("account")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (error) {
      console.error("❌ Lỗi khi cập nhật password:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
    // Sau khi đổi mật khẩu, xóa email khỏi verifiedOtpStore
    verifiedOtpStore.delete(email);
    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    console.error("Error in userResetPassword : ", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau!",
    });
  }
};

module.exports = {
  listAccount,
  postRegister,
  postLogin,
  userForgot,
  userOtp,
  userResetPassword,
  hardDeleteAccount,
  softDeleteAccount,
};
