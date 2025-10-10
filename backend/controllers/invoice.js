const supabase = require("../config/supabase");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");
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
const vnpays = async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu user_id hoặc amount",
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
      vnp_OrderInfo: `${user_id}|NapTien`,
      vnp_ReturnUrl: `http://localhost:9000/api/invoice/check-payment-vnpay`,
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
    let orderInfo = query.vnp_OrderInfo || "";
    let user_id = orderInfo.includes("|") ? orderInfo.split("|")[0] : null;

    if (!user_id) {
      console.error("❌ Không tìm thấy user_id trong OrderInfo");
      return res.redirect("http://localhost:3000?status=fail");
    }

    const vnp_Amount = Number(query.vnp_Amount) / 100;

    // ✅ Lưu giao dịch vào bảng invoice (hoặc bảng riêng)
    const { data, error } = await supabase.from("invoice").insert([
      {
        account_id: user_id,
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
    ]);

    if (error) {
      console.error("❌ Lỗi lưu invoice:", error);
      return res.redirect("http://localhost:3000?status=fail");
    }

    // ✅ Cập nhật tiền user
    if (query.vnp_ResponseCode === "00") {
      await updateUserMoney(user_id, vnp_Amount);
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
      .eq("payment_method", "VNPay")
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
const updateUserMoney = async (user_id, amount) => {
  try {
    if (!user_id || !amount) return;

    const { data, error } = await supabase.rpc("increase_user_money", {
      user_id_input: user_id,
      amount_input: amount,
    });

    if (error) console.error("❌ Lỗi cập nhật tiền user:", error);
    else console.log(`✅ User ${user_id} vừa nạp ${amount} thành công`);
  } catch (error) {
    console.error("❌ Lỗi updateUserMoney:", error);
  }
};

module.exports = {
  listInvoice,
  listInvoiceId,
  vnpays,
  checkVnpays,
  getVnpay,
  updateUserMoney,
};
