import { useEffect, useState } from "react";
import {
  listInvoice,
  updateInvoiceStatus,
  createPayment,
} from "../../services/invoice";
import { Table, Button, message, Spin } from "antd";
import { listAccount } from "../../services/account";
function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const account = JSON.parse(localStorage.getItem("account"));
  const accountId = account?.account_id;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await listAccount(); // trả về mảng users
        setAccounts(data.docs || []);
      } catch (error) {
        console.error("❌ Lỗi tải danh sách users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await listInvoice();
    if (res.success) {
      setInvoices(res.invoices.filter((inv) => inv.account_id === accountId));
    } else {
      message.error(res.message);
    }
    setLoading(false);
  };
  const handleRecharge = async (amount) => {
    try {
      const res = await createPayment(accountId, amount);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        message.error("Không thể tạo liên kết VNPay");
      }
    } catch (err) {
      message.error("Lỗi tạo thanh toán");
    }
  };
  const handleUpdateInvoice = async (id) => {
    const res = await updateInvoiceStatus(id);
    if (res.success) {
      message.success("Cập nhật thành công!");
      fetchInvoices();
    } else {
      message.error(res.message || "Cập nhật thất bại!");
    }
  };
  const columns = [
    { title: "ID", dataIndex: "invoice_id" },
    { title: "Email", dataIndex: ["account", "email"] },
    { title: "Số tiền", dataIndex: "amount" },
    { title: "Ngân hàng", dataIndex: "bank_name" },
    { title: "Phương thức", dataIndex: "payment_method" },
    { title: "Trạng thái", dataIndex: "status" },
    {
      title: "Hành động",
      render: (_, record) =>
        record.status === "active" ? (
          <Button
            type="primary"
            onClick={() => handleUpdateInvoice(record.invoice_id)}
          >
            Cộng tiền
          </Button>
        ) : (
          <span>Đã xử lý</span>
        ),
    },
  ];
  return (
    <div style={{ padding: 24 }}>
      <h2>💳 Nạp tiền vào tài khoản</h2>
      <div style={{ marginBottom: 20 }}>
        <Button type="primary" onClick={() => handleRecharge(10000)}>
          Nạp 10.000đ
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => handleRecharge(20000)}>
          Nạp 20.000đ
        </Button>
        <Button style={{ marginLeft: 8 }} onClick={() => handleRecharge(50000)}>
          Nạp 50.000đ
        </Button>
      </div>
      <h3>Lịch sử giao dịch</h3>
      {loading ? (
        <Spin />
      ) : (
        <Table dataSource={invoices} columns={columns} rowKey="invoice_id" />
      )}
    </div>
  );
}

export default InvoicePage;
