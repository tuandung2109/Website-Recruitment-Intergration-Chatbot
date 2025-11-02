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
const listCompanyAdmin = async (req, res) => {
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
      .eq("deleted", false);
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
      .select(
        `
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
        `
      )
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

const updateCompany = async (req, res) => {
  try {
    const company_id = req.params.id;
    const updateData = req.body.company; // nhận toàn bộ dữ liệu "company" từ frontend

    if (!company_id) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ID công ty" });
    }
    // 1️⃣ Cập nhật bảng company
    const companyFields = {
      name: updateData.name,
      website: updateData.website,
      logo_url: updateData.logo_url,
      size: updateData.size,
      description: updateData.description,
      status: updateData.status,
      deleted: updateData.deleted,
    };

    const { data: companyUpdated, error: companyError } = await supabase
      .from("company")
      .update(companyFields)
      .eq("company_id", company_id)
      .select();

    if (companyError)
      return res
        .status(400)
        .json({ success: false, message: companyError.message });

    // 2️⃣ Cập nhật ngành nghề (company_industry)
    if (updateData.company_industry && updateData.company_industry.length > 0) {
      // Xóa cũ → Thêm mới (cách đơn giản nhất)
      await supabase
        .from("company_industry")
        .delete()
        .eq("company_id", company_id);

      const industryData = updateData.company_industry.map((ci) => ({
        company_id,
        industry_id: ci.industry.industry_id,
      }));
      await supabase.from("company_industry").insert(industryData);
    }

    // 3️⃣ Cập nhật địa chỉ (address)
    if (updateData.address && updateData.address.length > 0) {
      await supabase.from("address").delete().eq("company_id", company_id);

      const addressData = updateData.address.map((a) => ({
        company_id,
        address_detail: a.address_detail,
      }));
      await supabase.from("address").insert(addressData);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật công ty thành công",
      company: companyUpdated[0],
    });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
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
const postCompany = async (req, res) => {
  try {
    const {
      account_id,
      name,
      website,
      logo_url,
      size,
      description,
      industry_ids,
      address_detail,
    } = req.body;

    if (!account_id || !name || !industry_ids?.length)
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc!",
      });

    // 1️⃣ Kiểm tra account có công ty chưa
    const { data: account } = await supabase
      .from("account")
      .select("*")
      .eq("account_id", account_id)
      .maybeSingle();

    if (account?.company_id)
      return res.status(400).json({
        success: false,
        message: "Tài khoản này đã có công ty!",
      });

    // 2️⃣ Tạo company
    const { data: newCompany, error: companyError } = await supabase
      .from("company")
      .insert([
        { name, website, logo_url, size, description, status: "active" },
      ])
      .select()
      .single();

    if (companyError)
      return res.status(500).json({
        success: false,
        message: "Lỗi khi tạo công ty!",
      });

    // 3️⃣ Thêm địa chỉ (nếu có)
    if (address_detail) {
      await supabase
        .from("address")
        .insert([{ address_detail, company_id: newCompany.company_id }]);
    }

    // 4️⃣ Gắn nhiều industry
    const industryRecords = industry_ids.map((id) => ({
      company_id: newCompany.company_id,
      industry_id: id,
    }));

    await supabase.from("company_industry").insert(industryRecords);

    // 5️⃣ Cập nhật account có company_id
    await supabase
      .from("account")
      .update({ company_id: newCompany.company_id })
      .eq("account_id", account_id);

    return res.status(200).json({
      success: true,
      message: "Tạo công ty thành công!",
      company_id: newCompany.company_id,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo công ty:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  listCompany,
  listCompanyId,
  deleteCompany,
  lockCompany,
  updateCompany,
  unlockCompany,
  postCompany,
  listCompanyAdmin,
};
