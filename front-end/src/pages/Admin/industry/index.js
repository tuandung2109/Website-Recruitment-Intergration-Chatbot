import { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from "antd";
import {
  listIndustry,
  postIndustry,
  updateIndustry,
  deleteIndustry,
} from "../../../services/industry";
import UseTitle from "../../../hooks/useTitle";

function AdminIndustry() {
  UseTitle(`JobVip - Quản lý ngành nghề`);

  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [form] = Form.useForm();

  // 📦 Tải dữ liệu
  const fetchData = async () => {
    setLoading(true);
    const res = await listIndustry();
    if (res.success) {
      setIndustries(res.industrys || []);
    } else {
      setError(res.message || "Không thể tải danh sách ngành nghề");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 📍 Mở modal thêm / sửa
  const openModal = (record = null) => {
    setEditingIndustry(record);
    form.setFieldsValue(record || { name: "" });
    setIsModalOpen(true);
  };

  // 📍 Đóng modal
  const closeModal = () => {
    setEditingIndustry(null);
    setIsModalOpen(false);
    form.resetFields();
  };

  // 📍 Gửi form
  const handleSubmit = async (values) => {
    let res;
    if (editingIndustry) {
      // cập nhật
      res = await updateIndustry(editingIndustry.industry_id, values);
    } else {
      // thêm mới
      res = await postIndustry(values);
    }

    if (res.success) {
      message.success(res.message);
      closeModal();
      fetchData();
    } else {
      message.error(res.message);
    }
  };

  // 📍 Xóa
  const handleDelete = async (id) => {
    const res = await deleteIndustry(id);
    if (res.success) {
      message.success("Xóa ngành nghề thành công!");
      fetchData();
    } else {
      message.error(res.message);
    }
  };

  // 📋 Cấu hình cột bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "industry_id",
      key: "industry_id",
      width: 80,
    },
    {
      title: "Tên ngành nghề",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button type="link" onClick={() => openModal(record)}>
            ✏️ Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.industry_id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              🗑️ Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Danh sách ngành nghề</h3>
      <Button
        type="primary"
        onClick={() => openModal()}
        className="mb-3 bg-blue-600 hover:bg-blue-700"
      >
        ➕ Thêm ngành nghề
      </Button>

      <Table
        dataSource={industries}
        columns={columns}
        rowKey="industry_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={isModalOpen}
        title={editingIndustry ? "Cập nhật ngành nghề" : "Thêm ngành nghề mới"}
        okText={editingIndustry ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
        onCancel={closeModal}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên ngành nghề"
            rules={[
              { required: true, message: "Vui lòng nhập tên ngành nghề" },
            ]}
          >
            <Input placeholder="Nhập tên ngành nghề" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminIndustry;
