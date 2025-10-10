import { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Alert,
  Image,
  Tag,
  Table,
  Button,
  Popconfirm,
  message,
} from "antd";
import UseTitle from "../../../hooks/useTitle";
import { getCompanyById } from "../../../services/company";
import { listAccount, unlinkCompany } from "../../../services/account";

function CompanyInformation() {
  UseTitle("JobVip - Company Information");
  const [company, setCompany] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("account"));
      if (!userData || !userData.company_id) {
        setError("Không tìm thấy thông tin công ty của tài khoản này");
        setLoading(false);
        return;
      }

      // Lấy thông tin công ty
      const resCompany = await getCompanyById(userData.company_id);
      if (!resCompany.success) {
        setError(resCompany.message || "Không thể tải thông tin công ty");
        setLoading(false);
        return;
      }

      setCompany(resCompany.company);

      // Lấy danh sách tài khoản
      const resAccounts = await listAccount();
      if (resAccounts.success && Array.isArray(resAccounts.accounts)) {
        const filtered = resAccounts.accounts.filter(
          (acc) => acc.company_id === resCompany.company.company_id
        );
        setMembers(filtered);
      }
    } catch (err) {
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // 🔹 Hàm hủy liên kết thành viên
  const handleUnlink = async (account_id) => {
    try {
      const res = await unlinkCompany(account_id);
      if (res.success) {
        message.success("✅ Đã hủy liên kết thành viên");
        // Cập nhật lại danh sách
        setMembers((prev) => prev.filter((m) => m.account_id !== account_id));
      } else {
        message.error(res.message || "Không thể hủy liên kết");
      }
    } catch (err) {
      message.error(err.message || "Lỗi khi hủy liên kết");
    }
  };

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <div className="p-6 flex flex-col items-center gap-8">
      {/* Card công ty */}
      <Card
        style={{
          maxWidth: 800,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
        title={
          <div className="flex items-center gap-3">
            <Image
              src={company?.logo_url}
              alt="Logo công ty"
              width={60}
              height={60}
              style={{ borderRadius: 8, objectFit: "contain" }}
              preview={false}
            />
            <div>
              <h2 style={{ margin: 0 }}>{company?.name}</h2>
              <a
                href={company?.website}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 14, color: "#1890ff" }}
              >
                {company?.website}
              </a>
            </div>
          </div>
        }
      >
        <p>
          <strong>Địa chỉ:</strong>{" "}
          {company?.address?.map((a) => a.address_detail).join(", ") || "—"}
        </p>
        <p>
          <strong>Ngành nghề:</strong>{" "}
          {company?.company_industry
            ?.map((ci) => ci.industry?.name)
            .join(", ") || "—"}
        </p>
        <p>
          <strong>Mô tả:</strong> {company?.description || "—"}
        </p>
      </Card>

      {/* Bảng thành viên */}
      <Card
        style={{
          maxWidth: 800,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
        title="👥 Danh sách thành viên công ty"
      >
        <Table
          dataSource={members}
          rowKey="account_id"
          bordered
          pagination={false}
          columns={[
            { title: "ID", dataIndex: "account_id", width: 80 },
            { title: "Email", dataIndex: "email" },
            { title: "Số điện thoại", dataIndex: "phone_number" },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>
                  {status}
                </Tag>
              ),
              width: 100,
            },
            {
              title: "Thao tác",
              width: 130,
              render: (_, record) => (
                <Popconfirm
                  title="Hủy liên kết công ty?"
                  onConfirm={() => handleUnlink(record.account_id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Button danger size="small">
                    Hủy liên kết
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

export default CompanyInformation;
