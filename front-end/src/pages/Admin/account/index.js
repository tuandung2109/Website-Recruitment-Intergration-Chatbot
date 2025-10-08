import { useEffect, useState } from "react";
import { Table, Spin, Alert, Button, Popconfirm, message } from "antd";
import { listAccount } from "../../../services/account";
import UseTitle from "../../../hooks/useTitle";
function AdminAccount() {
  UseTitle(`JobVip - AdminAccount`);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listAccount();
      if (res.success) {
        setAccounts(res.accounts || []);
      } else {
        setError(res.message || "Không thể tải danh sách tài khoản");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleEdit = (record) => {
    // Ví dụ điều hướng sang trang edit account
    message.info(`Bạn chọn cập nhật account ID: ${record.account_id}`);
    // navigate(`/admin/editAccount/${record.account_id}`);
  };

  const handleDelete = (record) => {
    // Gọi API xóa account
    message.success(`Đã xóa account ID: ${record.account_id}`);
    setAccounts(accounts.filter((a) => a.account_id !== record.account_id));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "account_id",
      key: "account_id",
      width: 80,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (g) => g || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <span style={{ color: "green" }}>Active</span>
        ) : (
          <span style={{ color: "red" }}>Inactive</span>
        ),
    },
    {
      title: "Quyền",
      key: "role",
      render: (_, record) =>
        record.account_account_type?.length > 0
          ? record.account_account_type
              .map((a) => a.account_type.role_name)
              .join(", ")
          : "Chưa có",
    },
    {
      title: "Công ty ID",
      dataIndex: "company_id",
      key: "company_id",
      render: (id) => id || "—",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => new Date(date).toLocaleString(),
    },

    // ✅ Cột hành động
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Cập nhật
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="danger">Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (loading) return <Spin tip="Đang tải danh sách tài khoản..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>📋 Danh sách tài khoản</h2>
      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="account_id"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default AdminAccount;
