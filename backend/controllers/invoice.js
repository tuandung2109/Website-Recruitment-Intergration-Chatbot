const supabase = require("../config/supabase");
const { VNPay, ignoreLogger, VnpLocale, dateFormat } = require("vnpay");
// Lấy danh sách account
const listInvoice = async (req, res) => {
  try {
    const { data: invoice, error } = await supabase
      .from("invoice")
      .select(
        `*,
         account:account_id(email))
        `
      )
      .eq("deleted", false)
      .eq("status", "active");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ invoice });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
const listInvoiceId = async (req, res) => {
  try {
    const invoice_id = req.params.id;
    if (!invoice_id) {
      return res.status(400).json({ error: "Thiếu ID bài đăng" });
    }
    const { data: invoice, error } = await supabase
      .from("invoice")
      .select("*")
      .eq("invoice_id", invoice_id) // sửa tên cột
      .single();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ invoice });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// 🧾 Tạo link thanh toán VNPay
const vnpays1 = async (req, res) => {
  try {
    const { account_id, amount } = req.body;
    if (!account_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu account_id hoặc amount",
      });
    }
    const vnpay = new VNPay({
      tmnCode: "X783MKOS",
      secureSecret: "YSOOD595SQM9RAFBDTS4K20FUH8ZTV0Z",
      vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const url = vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100, // VNPay cần nhân 100
      vnp_IpAddr: req.ip,
      vnp_TxnRef: Date.now().toString(),
      vnp_OrderInfo: `${account_id}|NapTien`,
      vnp_ReturnUrl:
        `http://localhost:9000/api/invoice/check-payment-vnpay` ||
        `https://website-recruitment-intergration-ch.vercel.app/api/invoice/check-payment-vnpay`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });
    return res.status(200).json({
      success: true,
      message: "Tạo link thanh toán VNPay thành công!",
      url,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo link VNPAY:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
const vnpays = async (req, res) => {
  try {
    const { account_id, amount } = req.body;

    if (!account_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu account_id hoặc amount",
      });
    }

    const vnpay = new VNPay({
      tmnCode: "X783MKOS",
      secureSecret: "YSOOD595SQM9RAFBDTS4K20FUH8ZTV0Z",
      vnpayHost: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });
    // Tính ngày mai
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Chọn base URL theo môi trường
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "http://localhost:9000"
        : "https://website-recruitment-intergration-ch.vercel.app";

    const url = vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100, // VNPay cần nhân 100
      vnp_IpAddr: req.ip,
      vnp_TxnRef: Date.now().toString(),
      vnp_OrderInfo: `${account_id}|NapTien`,
      vnp_ReturnUrl: `${baseUrl}/api/invoice/check-payment-vnpay`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });
    return res.status(200).json({
      success: true,
      message: "Tạo link thanh toán VNPay thành công!",
      url,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo link VNPAY:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 🧾 Check kết quả thanh toán (callback từ VNPay)
const checkVnpays = async (req, res) => {
  try {
    const query = req.query;
    const orderInfo = query.vnp_OrderInfo || "";
    const account_id = orderInfo.includes("|") ? orderInfo.split("|")[0] : null;
    const vnp_Amount = Number(query.vnp_Amount) / 100;
    if (!account_id) {
      console.error("❌ Không tìm thấy account_id trong OrderInfo");
      return res.redirect("http://localhost:3000?status=fail");
    }
    // ✅ Lưu giao dịch
    const { data, error } = await supabase
      .from("invoice")
      .insert([
        {
          account_id,
          card_number: query.vnp_CardNo || "",
          description: "Nạp tiền qua VNPay",
          amount: vnp_Amount,
          bank_name: query.vnp_BankCode || "VNPay",
          payment_method: "VNPay",
          payment_status:
            query.vnp_ResponseCode === "00" ? "completed" : "failed",
          transaction_code: query.vnp_TxnRef,
          status: "active",
          deleted: false,
          create_at: new Date(),
        },
      ])
      .select()
      .single(); // ✅ để lấy invoice_id luôn
    if (error) {
      console.error("❌ Lỗi lưu invoice:", error);
      return res.redirect("http://localhost:3000?status=fail");
    }
    // ✅ Nếu thanh toán thành công thì cộng tiền và cập nhật trạng thái hóa đơn
    if (query.vnp_ResponseCode === "00") {
      // await updateUserMoney(account_id, vnp_Amount);
      await updateInvoiceStatus(data.invoice_id);
    }
    return res.redirect("http://localhost:3000?status=success");
  } catch (error) {
    console.error("❌ Lỗi checkVnpays:", error);
    return res.redirect("http://localhost:3000?status=fail");
  }
};
// 🧾 Lấy danh sách giao dịch VNPay
const getVnpay = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("invoice")
      .select("*")
      .eq("deleted", false)
      .order("create_at", { ascending: false });
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(200).json({
      success: true,
      payments: data,
    });
  } catch (error) {
    console.error("❌ Lỗi getVnpay:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
// 💰 Cập nhật số dư user sau khi thanh toán
const updateUserMoney = async (account_id, amount) => {
  try {
    if (!account_id || !amount) return;
    // Lấy số dư hiện tại
    const { data: account, error: errGet } = await supabase
      .from("account")
      .select("amount")
      .eq("account_id", account_id)
      .single();
    if (errGet) throw errGet;
    const newAmount = (account?.amount || 0) + Number(amount);
    // Cập nhật lại số dư
    const { error: errUpdate } = await supabase
      .from("account")
      .update({ amount: newAmount })
      .eq("account_id", account_id);
    if (errUpdate) throw errUpdate;
    console.log(`✅ User ${account_id} vừa nạp ${amount} thành công`);
  } catch (error) {
    console.error("❌ Lỗi updateUserMoney:", error);
  }
};
// 📍 Khi thanh toán thành công thì cộng tiền và đổi trạng thái hóa đơn
const updateInvoiceStatus = async (invoice_id) => {
  try {
    const { data: invoice, error: errInvoice } = await supabase
      .from("invoice")
      .select("*")
      .eq("invoice_id", invoice_id)
      .eq("status", "active")
      .single();
    if (errInvoice || !invoice)
      return { success: false, message: "Không tìm thấy hóa đơn" };
    const { data: account, error: errAccount } = await supabase
      .from("account")
      .select("amount")
      .eq("account_id", invoice.account_id)
      .single();
    if (errAccount || !account)
      return { success: false, message: "Không tìm thấy tài khoản" };
    const newAmount = (account.amount || 0) + invoice.amount;
    const { error: errUpdateMoney } = await supabase
      .from("account")
      .update({ amount: newAmount })
      .eq("account_id", invoice.account_id);
    if (errUpdateMoney) return { success: false, message: "Lỗi cộng tiền" };
    const { error: errStatus } = await supabase
      .from("invoice")
      .update({ status: "inactive" })
      .eq("invoice_id", invoice_id);
    if (errStatus)
      return { success: false, message: "Lỗi đổi trạng thái hóa đơn" };
    return { success: true, message: "Cập nhật thành công!" };
  } catch (error) {
    console.error("❌ Lỗi updateInvoiceStatus:", error);
    return { success: false, message: "Lỗi server" };
  }
};
module.exports = {
  listInvoice,
  listInvoiceId,
  vnpays,
  checkVnpays,
  getVnpay,
  updateUserMoney,
  updateInvoiceStatus,
};
