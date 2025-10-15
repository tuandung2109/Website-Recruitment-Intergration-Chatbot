import { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
} from "antd";
import {
  listWorkType,
  postWorkType,
  updateWorkType,
  deleteWorkType,
} from "../../../services/wordType";
import UseTitle from "../../../hooks/useTitle";

function AdminWorkType() {
  UseTitle(`JobVip - AdminWorkType`);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const res = await listWorkType();
    if (res.success) {
      setWorkTypes(res.workTypes || []);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (record = null) => {
    setEditing(record);
    setIsModalOpen(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let res;
      if (editing) {
        res = await updateWorkType(editing.work_type_id, values);
      } else {
        res = await postWorkType(values);
      }

      if (res.success) {
        message.success(editing ? "Cập nhật thành công" : "Thêm thành công");
        setIsModalOpen(false);
        fetchData();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteWorkType(id);
    if (res.success) {
      message.success("Đã xóa hình thức làm việc");
      fetchData();
    } else {
      message.error(res.message);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "work_type_id", key: "work_type_id", width: 80 },
    {
      title: "Tên hình thức làm việc",
      dataIndex: "work_type_name",
      key: "work_type_name",
    },
    {
      title: "ID bài đăng việc",
      dataIndex: "job_posting_id",
      key: "job_posting_id",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => openModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa hình thức này?"
            onConfirm={() => handleDelete(record.work_type_id)}
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

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h3>Danh sách hình thức làm việc</h3>
      <Button
        type="primary"
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        + Thêm hình thức làm việc
      </Button>
      <Table
        dataSource={workTypes}
        columns={columns}
        rowKey="work_type_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? "Cập nhật hình thức" : "Thêm hình thức làm việc"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="work_type_name"
            label="Tên hình thức làm việc"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên hình thức làm việc",
              },
            ]}
          >
            <Input placeholder="Ví dụ: Toàn thời gian, Bán thời gian..." />
          </Form.Item>
          <Form.Item
            name="job_posting_id"
            label="ID bài đăng việc (nếu có)"
            rules={[
              { required: true, message: "Vui lòng nhập ID bài đăng việc" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default AdminWorkType;
