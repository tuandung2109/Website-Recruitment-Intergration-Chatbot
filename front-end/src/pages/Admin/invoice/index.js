import { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import { listInvoice } from "../../../services/invoice";

function AdminInvoice() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listInvoice();
      if (res.success) {
        setInvoices(res.invoices || []); // sửa từ res.invoice → res.invoices
      } else {
        setError(res.message || "Không thể tải danh sách hóa đơn");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Định nghĩa cột cho Table
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoice_id",
      key: "invoice_id",
    },
    {
      title: "Email",
      dataIndex: ["account", "email"], // nested object
      key: "email",
    },
    {
      title: "Card Number",
      dataIndex: "card_number",
      key: "card_number",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `${amount.toLocaleString()} VND`,
    },
    {
      title: "Bank Name",
      dataIndex: "bank_name",
      key: "bank_name",
    },
    {
      title: "description",
      dataIndex: "description",
      key: "description",
    },
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
      <Table dataSource={invoices} columns={columns} rowKey="invoice_id" />
    </>
  );
}

export default AdminInvoice;
