import { useEffect, useState } from "react";
import { Table, Spin, Alert, Card } from "antd";
import { listInvoice } from "../../../services/invoice";
import UseTitle from "../../../hooks/useTitle";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminInvoice() {
  UseTitle(`JobVip - AdminInvoice`);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listInvoice();
      if (res.success) {
        setInvoices(res.invoices || []);
      } else {
        setError(res.message || "Không thể tải danh sách hóa đơn");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Gom tổng số tiền theo ngày
  const chartData = Object.values(
    invoices.reduce((acc, item) => {
      const date = new Date(item.create_at).toLocaleDateString("vi-VN");
      if (!acc[date]) acc[date] = { date, total: 0 };
      acc[date].total += item.amount;
      return acc;
    }, {})
  );

  const columns = [
    { title: "Invoice ID", dataIndex: "invoice_id", key: "invoice_id" },
    { title: "Email", dataIndex: ["account", "email"], key: "email" },
    { title: "Card Number", dataIndex: "card_number", key: "card_number" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString()} VND`,
    },
    { title: "Bank Name", dataIndex: "bank_name", key: "bank_name" },
    {
      title: "Create",
      dataIndex: "create_at",
      key: "create_at",
      render: (val) => new Date(val).toLocaleString("vi-VN"),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
    },
  ];

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h3>Danh sách hóa đơn</h3>
      <Table
        dataSource={invoices}
        columns={columns}
        rowKey="invoice_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Biểu đồ tổng tiền nạp theo ngày */}
      <Card title="Tổng số tiền nạp theo ngày" style={{ marginTop: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#1890ff" name="Tổng tiền (VND)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}

export default AdminInvoice;
