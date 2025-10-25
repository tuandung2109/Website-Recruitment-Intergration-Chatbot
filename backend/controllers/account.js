const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const generateOTP = require("../helper/generate");
const sendMailHelper = require("../helper/sendMail");
const otpStore = new Map();

// Lấy danh sách account
const listAccount = async (req, res) => {
  try {
    const { data: accounts, error } = await supabase.from("account").select(
      `*,
        account_account_type(
          account_type:account_type_id(
            account_type_id,
            role_name
          )
        )
        `
    );

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ accounts });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// Lấy danh sách account
const listAccountId = async (req, res) => {
  try {
    const account_id = req.params.id;
    if (!account_id) {
      return res.status(400).json({ error: "Thiếu ID tai khoan" });
    }
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
      .eq("account_id", account_id);
    if (error) {
      console.error("❌ Lỗi Supabase:", error);
      return res.status(400).json({ error: error.message });
    }
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
    // ===== 1. Validate dữ liệu =====
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email không được để trống!" });
    if (!password)
      return res
        .status(400)
        .json({ success: false, message: "Password không được để trống!" });
    if (!phone_number)
      return res
        .status(400)
        .json({ success: false, message: "Phone không được để trống!" });
    if (phone_number.length < 10 || phone_number.length > 11)
      return res
        .status(400)
        .json({ success: false, message: "Số lượng ký tự Phone không hợp lệ" });
    if (password.length < 6 || password.length > 20)
      return res
        .status(400)
        .json({ success: false, message: "Password phải từ 6–20 ký tự" });
    // ===== 2. Kiểm tra trùng email/phone =====
    const { data: exitEmail } = await supabase
      .from("account")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (exitEmail)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại!" });
    const { data: exitPhone } = await supabase
      .from("account")
      .select("*")
      .eq("phone_number", phone_number)
      .maybeSingle();
    if (exitPhone)
      return res
        .status(400)
        .json({ success: false, message: "Phone đã tồn tại!" });
    // ===== 3. Thêm tài khoản mới =====
    const { data: newAccount, error: insertError } = await supabase
      .from("account")
      .insert([
        {
          email,
          phone_number,
          password, // có thể hash sau
          status: "active",
          gender: gender || null,
          date_of_birth: date_of_birth || null,
          company_id: company_id || null,
        },
      ])
      .select("account_id")
      .maybeSingle();

    if (insertError)
      return res.status(400).json({
        success: false,
        message: "Lỗi khi thêm account: " + insertError.message,
      });

    // ===== 4. Gán loại tài khoản “Seeker” =====
    const SEEKER_ID = 3; // ⚠️ nhớ đổi đúng ID Seeker trong bảng account_type
    const { error: typeError } = await supabase
      .from("account_account_type")
      .insert([
        { account_id: newAccount.account_id, account_type_id: SEEKER_ID },
      ]);

    if (typeError) console.error("❌ Lỗi khi gán loại tài khoản:", typeError);

    // ===== 5. Trả kết quả =====
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      account_id: newAccount.account_id,
    });
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
// KHÓA account
const softDeleteAccount = async (req, res) => {
  const { id } = req.params; // ✅ đổi lại cho khớp
  console.log("req.params:", req.params);

  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu account_id" });

  const { data: existingAccount, error: fetchError } = await supabase
    .from("account")
    .select("*")
    .eq("account_id", id)
    .maybeSingle();

  if (fetchError)
    return res
      .status(500)
      .json({ success: false, message: fetchError.message });
  if (!existingAccount)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy account" });

  const { error } = await supabase
    .from("account")
    .update({ status: "inactive" })
    .eq("account_id", id);

  if (error)
    return res.status(500).json({ success: false, message: error.message });

  return res
    .status(200)
    .json({ success: true, message: "Khóa tài khoản thành công" });
};
// MỞ KHÓA account
const unlockDeleteAccount = async (req, res) => {
  const { id } = req.params; // ✅ đổi lại cho khớp
  console.log("req.params:", req.params);

  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu account_id" });

  const { data: existingAccount, error: fetchError } = await supabase
    .from("account")
    .select("*")
    .eq("account_id", id)
    .maybeSingle();

  if (fetchError)
    return res
      .status(500)
      .json({ success: false, message: fetchError.message });
  if (!existingAccount)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy account" });

  const { error } = await supabase
    .from("account")
    .update({ status: "active" })
    .eq("account_id", id);

  if (error)
    return res.status(500).json({ success: false, message: error.message });

  return res
    .status(200)
    .json({ success: true, message: "Mở khóa tài khoản thành công" });
};
//
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
//
const userResetPassword1 = async (req, res) => {
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
    // const hashedPassword = await bcrypt.hash(password, 10);
    // Cập nhật password vào bảng account
    const { data, error } = await supabase
      .from("account")
      .update({ password: password })
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

    // 🔹 Lấy mật khẩu cũ từ DB để so sánh
    const { data: oldData, error: getError } = await supabase
      .from("account")
      .select("password")
      .eq("email", email)
      .single();

    if (getError || !oldData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này!",
      });
    }

    // 🔹 Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
    if (password === oldData.password) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được trùng với mật khẩu cũ!",
      });
    }

    // 🔹 Cập nhật mật khẩu mới
    const { data, error } = await supabase
      .from("account")
      .update({ password: password })
      .eq("email", email);

    if (error) {
      console.error("❌ Lỗi khi cập nhật password:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }

    // 🔹 Xóa OTP đã xác minh
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

// ⚙️ Lấy thông tin user (ví dụ đơn giản, không có JWT)
const getApiUser = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu hoặc sai user_id",
      });
    }

    const { data, error } = await supabase
      .from("account")
      .select(
        `
        account_id,
        email,
        gender,
        phone_number,
        status,
        company_id,
        deleted,
        amount,
        account_account_type(
          account_type(
            role_name,
            account_type_id
          )
        )
        `
      )
      .eq("account_id", user_id)
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    return res.json({
      success: true,
      user: data,
    });
  } catch (err) {
    console.error("❌ Lỗi getApiUser:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
// 🧩 controllers/account.js
const unlinkCompany = async (req, res) => {
  try {
    const account_id = req.params.id;
    if (!account_id) {
      return res.status(400).json({ error: "Thiếu account_id" });
    }

    const { data, error } = await supabase
      .from("account")
      .update({ company_id: null })
      .eq("account_id", account_id)
      .select();

    if (error) throw error;

    return res
      .status(200)
      .json({ success: true, message: "Đã hủy liên kết công ty", data });
  } catch (err) {
    console.error("❌ Lỗi unlinkCompany:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// 🧩 controllers/account.js
const getAccount = async (req, res) => {
  try {
    const accountId = req.query.account_id; // hoặc req.user.account_id nếu có JWT
    const { data, error } = await supabase
      .from("account")
      .select("account_id, email, phone_number")
      .eq("account_id", accountId)
      .single();

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ account: data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const sendOtpRegister = async (req, res) => {
  try {
    const email = req.body?.email;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email không được để trống!" });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email))
      return res
        .status(400)
        .json({ success: false, message: "Email không hợp lệ!" });
    // Kiểm tra email đã tồn tại
    const { data: existing } = await supabase
      .from("account")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại trong hệ thống!" });
    // Tạo mã OTP (6 số ngẫu nhiên)
    const otp = generateOTP.generateRandomNumber(6);
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 phút
    otpStore.set(email, { otp, expiresAt });
    // Gửi mail
    const subject = "Mã OTP đăng ký tài khoản JobVip";
    const html = `Xin chào,<br>Mã OTP xác thực của bạn là <b style="color:blue">${otp}</b>.<br>Mã có hiệu lực trong 3 phút.Hãy nhập cẩn thận bạn nhó ('_')`;
    await sendMailHelper.sendMail(email, subject, html);
    return res
      .status(200)
      .json({ success: true, message: "OTP đã được gửi đến email!" });
  } catch (error) {
    console.error("❌ Lỗi sendOtpRegister:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi gửi OTP" });
  }
};

const verifyOtpRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record)
      return res
        .status(400)
        .json({ success: false, message: "Không tìm thấy OTP cho email này!" });

    if (Date.now() > record.expiresAt)
      return res
        .status(400)
        .json({ success: false, message: "Mã OTP đã hết hạn!" });

    if (record.otp !== otp)
      return res
        .status(400)
        .json({ success: false, message: "Mã OTP không chính xác!" });

    // Đánh dấu email đã xác thực
    otpStore.set(email, { ...record, verified: true });

    return res
      .status(200)
      .json({ success: true, message: "Xác thực OTP thành công!" });
  } catch (error) {
    console.error("❌ Lỗi verifyOtpRegister:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xác minh OTP" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { account_id, gender, phone_number, date_of_birth, status, amount } =
      req.body;
    if (!account_id) {
      return res.status(400).json({ error: "Thiếu account_id" });
    }
    // ⚙️ Cập nhật thông tin trong bảng account
    const { data, error } = await supabase
      .from("account")
      .update({
        gender,
        phone_number,
        date_of_birth,
        status,
        amount,
        updated_at: new Date(),
      })
      .eq("account_id", account_id)
      .select("*");
    if (error) {
      console.error("❌ Lỗi Supabase:", error);
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({
      message: "Cập nhật thông tin thành công",
      account: data[0],
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// PATCH /changePassword
const changePassword = async (req, res) => {
  try {
    const { account_id, old_password, new_password } = req.body;

    if (!account_id || !old_password || !new_password)
      return res.status(400).json({ error: "Thiếu thông tin cần thiết" });

    // 🔎 Lấy tài khoản hiện tại
    const { data, error: getError } = await supabase
      .from("account")
      .select("password")
      .eq("account_id", account_id)
      .single();

    if (getError) return res.status(400).json({ error: getError.message });
    if (!data || data.password !== old_password)
      return res.status(400).json({ error: "Mật khẩu cũ không đúng" });

    // ✅ Cập nhật mật khẩu mới
    const { error: updateError } = await supabase
      .from("account")
      .update({ password: new_password, updated_at: new Date() })
      .eq("account_id", account_id);

    if (updateError)
      return res.status(400).json({ error: updateError.message });

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("❌ Lỗi changePassword:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  listAccount,
  getApiUser,
  listAccountId,
  postRegister,
  postLogin,
  userForgot,
  userOtp,
  userResetPassword,
  hardDeleteAccount,
  softDeleteAccount,
  unlockDeleteAccount,
  unlinkCompany,
  getAccount,
  sendOtpRegister,
  verifyOtpRegister,
  updateAccount,
  changePassword,
};
