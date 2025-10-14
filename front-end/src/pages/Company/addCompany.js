import { useState, useEffect } from "react";
import { Form, Input, Button, Select, message } from "antd";
import { postCompany } from "../../services/company";
import { listIndustry } from "../../services/industry";

function AddCompany() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    const fetchIndustries = async () => {
      const res = await listIndustry();
      if (res.success) setIndustries(res.industrys);
    };
    fetchIndustries();
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("account"));
      const companyData = {
        ...values,
        account_id: user?.account_id,
        industry_ids: values.industry_ids, // mảng ID
      };

      const result = await postCompany(companyData);
      if (result.success) {
        message.success(result.message || "Tạo công ty thành công!");
        form.resetFields();
      } else {
        message.error(result.message || "Không thể tạo công ty!");
      }
    } catch (err) {
      message.error("Lỗi hệ thống khi tạo công ty!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>Thêm công ty mới</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên công ty"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty!" }]}
        >
          <Input placeholder="VD: TechCorp" />
        </Form.Item>

        <Form.Item label="Website" name="website">
          <Input placeholder="VD: https://techcorp.com" />
        </Form.Item>

        <Form.Item label="Logo URL" name="logo_url">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item label="Quy mô" name="size">
          <Input placeholder="VD: 100-500" />
        </Form.Item>

        {/* ✅ Cho phép chọn nhiều ngành nghề */}
        <Form.Item
          label="Ngành nghề"
          name="industry_ids"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn ít nhất một ngành nghề!",
            },
          ]}
        >
          <Select mode="multiple" placeholder="Chọn ngành nghề" allowClear>
            {industries.map((ind) => (
              <Select.Option key={ind.industry_id} value={ind.industry_id}>
                {ind.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address_detail">
          <Input placeholder="VD: 123 Đường A, Hà Nội" />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={5} placeholder="Mô tả về công ty..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo công ty
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default AddCompany;
