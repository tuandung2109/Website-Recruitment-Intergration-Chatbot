const supabase = require("../config/supabase");

// 📍 Lấy danh sách tất cả công ty
const listCompany = async (req, res) => {
  try {
    const { data: company, error } = await supabase
      .from("company")
      .select(
        `*,
      company_industry(
        industry:industry_id(
          industry_id,
          name
        )
      ),
      address(
        address_id,
        address_detail 
      )
      `
      )
      .eq("deleted", false)
      .eq("status", "active");
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ company });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};


// 📍 Lấy thông tin công ty theo ID
const listCompanyId = async (req, res) => {
  try {
    const company_id = req.params.id;

    if (!company_id) {
      return res.status(400).json({ error: "Thiếu ID công ty" });
    }

    const { data: company, error } = await supabase
      .from("company")
      // .select("*")
        .select(`
          *,
          company_industry(
            industry:industry_id(
              industry_id,
              name
            )
          ),
          address(
            address_id,
            address_detail
          )
        `)
      .eq("company_id", company_id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ company });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Khóa / Mở khóa công ty (status = 'active' hoặc 'locked')
const lockCompany = async (req, res) => {
  try {
    const company_id = req.params.id;

    if (!company_id) {
      return res.status(400).json({ error: "Thiếu ID công ty" });
    }

    // Cập nhật status = 'inactive'
    const { data, error } = await supabase
      .from("company")
      .update({ status: "inactive" })
      .eq("company_id", company_id);

    if (error) return res.status(400).json({ error: error.message });

    return res
      .status(200)
      .json({ message: "Đã khóa công ty (inactive)", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

const unlockCompany = async (req, res) => {
  try {
    const company_id = req.params.id;

    if (!company_id) {
      return res.status(400).json({ error: "Thiếu ID công ty" });
    }

    // Cập nhật status = 'active'
    const { data, error } = await supabase
      .from("company")
      .update({ status: "active" })
      .eq("company_id", company_id);

    if (error) return res.status(400).json({ error: error.message });

    return res
      .status(200)
      .json({ message: "Đã mở khóa công ty (active)", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Cập nhật thông tin công ty
const updateCompany = async (req, res) => {
  try {
    const company_id = req.params.id;
    const updateData = req.body; // Dữ liệu cần cập nhật (ví dụ: { name, address, phone })

    if (!company_id) {
      return res.status(400).json({ error: "Thiếu ID công ty" });
    }

    const { data, error } = await supabase
      .from("company")
      .update(updateData)
      .eq("company_id", company_id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res
      .status(200)
      .json({ message: "Cập nhật công ty thành công", data });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

// 📍 Xóa công ty
const deleteCompany = async (req, res) => {
  try {
    const company_id = req.params.id;

    if (!company_id) {
      return res.status(400).json({ error: "Thiếu ID công ty" });
    }

    const { error } = await supabase
      .from("company")
      .delete()
      .eq("company_id", company_id);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ message: "Xóa công ty thành công" });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  listCompany,
  listCompanyId,
  deleteCompany,
  lockCompany,
  updateCompany,
  unlockCompany,
};
