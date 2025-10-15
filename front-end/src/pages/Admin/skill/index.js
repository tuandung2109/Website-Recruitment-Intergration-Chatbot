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
  listSkills,
  postSkill,
  updateSkill,
  deleteSkill,
} from "../../../services/skill";
import UseTitle from "../../../hooks/useTitle";

function AdminSkill() {
  UseTitle(`JobVip - AdminSkill`);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const res = await listSkills();
    if (res.success) {
      setSkills(res.skills || []);
    } else {
      setError(res.message || "Không thể tải danh sách kỹ năng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Mở modal thêm hoặc sửa
  const openModal = (record = null) => {
    setEditingSkill(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue({ skill_name: record.skill_name });
    } else {
      form.resetFields();
    }
  };

  // ✅ Xử lý thêm/sửa
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editingSkill) {
        res = await updateSkill(editingSkill.skill_id, values.skill_name);
      } else {
        res = await postSkill(values.skill_name);
      }

      if (res.success) {
        message.success(
          editingSkill
            ? "Cập nhật kỹ năng thành công"
            : "Thêm kỹ năng thành công"
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        message.error(res.message || "Lỗi khi lưu kỹ năng");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Xử lý xóa kỹ năng
  const handleDelete = async (id) => {
    const res = await deleteSkill(id);
    if (res.success) {
      message.success("Đã xóa kỹ năng");
      fetchData();
    } else {
      message.error(res.message || "Xóa thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "skill_id",
      key: "skill_id",
      width: 100,
    },
    {
      title: "Tên kỹ năng",
      dataIndex: "skill_name",
      key: "skill_name",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => openModal(record)}
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa kỹ năng này?"
            onConfirm={() => handleDelete(record.skill_id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  if (loading) return <Spin tip="Đang tải danh sách kỹ năng..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h3>Danh sách kỹ năng</h3>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        + Thêm kỹ năng
      </Button>

      <Table
        dataSource={skills}
        columns={columns}
        rowKey="skill_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSkill ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên kỹ năng"
            name="skill_name"
            rules={[{ required: true, message: "Vui lòng nhập tên kỹ năng" }]}
          >
            <Input placeholder="Nhập tên kỹ năng..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default AdminSkill;
