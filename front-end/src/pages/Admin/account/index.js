import { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Alert,
  Button,
  Popconfirm,
  message,
  Modal,
  Descriptions,
} from "antd";
import {
  listAccount,
  listAccountId,
  softDeleteAccount,
  unlockDeleteAccount,
} from "../../../services/account";
import UseTitle from "../../../hooks/useTitle";

function AdminAccount() {
  UseTitle(`JobVip - AdminAccount`);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await listAccount();
    if (res.success) {
      setAccounts(res.accounts || []);
    } else {
      setError(res.message || "Không thể tải danh sách tài khoản");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Khóa account
  const handleLock = async (record) => {
    const res = await softDeleteAccount(record.account_id);
    if (res.success) {
      message.success("Đã khóa tài khoản!");
      fetchData();
    } else {
      message.error(res.message || "Không thể khóa tài khoản");
    }
  };

  // ✅ Mở khóa account
  const handleUnlock = async (record) => {
    const res = await unlockDeleteAccount(record.account_id);
    if (res.success) {
      message.success("Đã mở khóa tài khoản!");
      fetchData();
    } else {
      message.error(res.message || "Không thể mở khóa tài khoản");
    }
  };

  // ✅ Xem chi tiết account
  const handleDetail = async (record) => {
    const res = await listAccountId(record.account_id);
    if (res.success) {
      setSelectedAccount(res.accounts[0]);
      setIsModalOpen(true);
    } else {
      message.error(res.message || "Không thể tải thông tin tài khoản");
    }
  };

  const handleDelete = (record) => {
    message.success(`Đã xóa account ID: ${record.account_id}`);
    setAccounts(accounts.filter((a) => a.account_id !== record.account_id));
  };

  const columns = [
    { title: "ID", dataIndex: "account_id", key: "account_id", width: 80 },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone_number", key: "phone_number" },

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
    { title: "Công ty ID", dataIndex: "company_id", key: "company_id" },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {record.status === "active" ? (
            <Button
              style={{ backgroundColor: "#faad14", color: "white" }}
              onClick={() => handleLock(record)}
            >
              Khóa
            </Button>
          ) : (
            <Button
              style={{ backgroundColor: "#52c41a", color: "white" }}
              onClick={() => handleUnlock(record)}
            >
              Mở khóa
            </Button>
          )}
          <Button type="primary" onClick={() => handleDetail(record)}>
            Chi tiết
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Xóa</Button>
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

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết tài khoản"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {selectedAccount && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">
              {selectedAccount.account_id}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedAccount.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedAccount.phone_number}
            </Descriptions.Item>

            <Descriptions.Item label="Số dư">
              {selectedAccount.amount}
            </Descriptions.Item>
            <Descriptions.Item label="password">
              {selectedAccount.password}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedAccount.gender || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedAccount.status}
            </Descriptions.Item>
            <Descriptions.Item label="Công ty ID">
              {selectedAccount.company_id}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {new Date(selectedAccount.updated_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Quyền">
              {selectedAccount.account_account_type
                ?.map((a) => a.account_type.role_name)
                .join(", ") || "Chưa có"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default AdminAccount;
