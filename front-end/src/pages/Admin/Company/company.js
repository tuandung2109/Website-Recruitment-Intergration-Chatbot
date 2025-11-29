import { useEffect, useState } from "react";
import { Table, Spin, Alert, Button, Popconfirm, message, Image } from "antd";
import {
  listCompanyAdmin,
  lockCompany,
  unlockCompany,
} from "../../../services/company";
import UseTitle from "../../../hooks/useTitle";
function AdminCompany() {
  UseTitle(`JobVip - AdminCompany`);
  const [companys, setCompanys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const res = await listCompanyAdmin();
      if (res.success) {
        setCompanys(res.companys || []);
      } else {
        setError(res.message || "Không thể tải danh sách công ty");
      }
      setLoading(false);
    };
    fetchData();
  }, []);
  // 🔒 Hàm khóa công ty
  const handleLock = async (record) => {
    const res = await lockCompany(record.company_id);
    if (res.success) {
      message.success("✅ Đã khóa công ty!");
      setCompanys((prev) =>
        prev.map((c) =>
          c.company_id === record.company_id ? { ...c, status: "inactive" } : c
        )
      );
    } else {
      message.error(res.message || "❌ Khóa công ty thất bại!");
    }
  };
  // 🔓 Hàm mở khóa công ty
  const handleUnlock = async (record) => {
    const res = await unlockCompany(record.company_id);
    if (res.success) {
      message.success("🔓 Đã mở khóa công ty!");
      setCompanys((prev) =>
        prev.map((c) =>
          c.company_id === record.company_id ? { ...c, status: "active" } : c
        )
      );
    } else {
      message.error(res.message || "❌ Mở khóa công ty thất bại!");
    }
  };
  // 🗑️ Hàm xóa công ty (tạm thời)
  const handleDelete = (record) => {
    message.success(`Đã xóa công ty ID: ${record.company_id}`);
    setCompanys(companys.filter((c) => c.company_id !== record.company_id));
  };
  const columns = [
    {
      title: "ID",
      dataIndex: "company_id",
      key: "company_id",
      width: 80,
    },
    {
      title: "Logo",
      dataIndex: "logo_url",
      key: "logo_url",
      render: (logo) => (
        <Image
          src={logo}
          alt="Logo"
          width={60}
          height={60}
          fallback="https://placehold.co/60x60?text=No+Logo"
        />
      ),
    },
    { title: "Tên công ty", dataIndex: "name", key: "name" },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      render: (url) => (
        <a href={url} target="_blank" rel="noreferrer">
          {url}
        </a>
      ),
    },
    { title: "Quy mô", dataIndex: "size", key: "size" },
    {
      title: "Ngành",
      key: "industry",
      render: (_, record) =>
        record.company_industry?.length > 0
          ? record.company_industry.map((c) => c.industry.name).join(", ")
          : "Chưa có",
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
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {record.status === "active" ? (
            <Popconfirm
              title="Bạn có chắc muốn khóa công ty này?"
              onConfirm={() => handleLock(record)}
              okText="Khóa"
              cancelText="Hủy"
            >
              <Button danger>Khóa</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có chắc muốn mở khóa công ty này?"
              onConfirm={() => handleUnlock(record)}
              okText="Mở khóa"
              cancelText="Hủy"
            >
              <Button type="primary">Mở khóa</Button>
            </Popconfirm>
          )}

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
  if (loading) return <Spin tip="Đang tải danh sách công ty..." />;
  if (error) return <Alert type="error" message={error} />;
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>🏢 Danh sách công ty</h2>
      <Table
        columns={columns}
        dataSource={companys}
        rowKey="company_id"
        bordered
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default AdminCompany;
