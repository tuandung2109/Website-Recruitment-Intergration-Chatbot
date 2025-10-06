const supabase = require("../config/supabase");
// Lấy danh sách account
const listInvoice = async (req, res) => {
  try {
    const { data: invoice, error } = await supabase
      .from("invoice")
      .select("*")
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

// const postInvoice = async (req, res) => {};
// const unlockInvoice = async (req, res) => {};
// const updateInvoice = async (req, res) => {};
// const deleteInvoice = async (req, res) => {};

module.exports = {
  listInvoice,
  listInvoiceId,
};
