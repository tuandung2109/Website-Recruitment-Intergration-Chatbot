const supabase = require("../config/supabase");

// 📍 Lấy tất cả địa chỉ
const listAddress = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("address")
      .select(`
        address_id,
        address_detail,
        company:company_id ( company_id, name )
      `);
    if (error) throw error;
    res.status(200).json({ addresses: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📍 Lấy địa chỉ theo company_id
const listAddressByCompany = async (req, res) => {
  const { companyId } = req.params;
  try {
    const { data, error } = await supabase
      .from("address")
      .select("*")
      .eq("company_id", companyId);
    if (error) throw error;
    res.status(200).json({ addresses: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📍 Thêm địa chỉ mới
const postAddress = async (req, res) => {
  const { company_id, address_detail } = req.body;
  if (!company_id || !address_detail)
    return res.status(400).json({ error: "Thiếu dữ liệu bắt buộc" });
  try {
    const { data, error } = await supabase
      .from("address")
      .insert([{ company_id, address_detail }])
      .select();
    if (error) throw error;
    res.status(201).json({ message: "Thêm địa chỉ thành công", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listAddress, listAddressByCompany, postAddress };
