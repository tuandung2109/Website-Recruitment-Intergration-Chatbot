import { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import { listIndustry } from "../../../services/industry";
import UseTitle from "../../../hooks/useTitle";

function AdminIndustry() {
  UseTitle(`JobVip - AdminIndustry`);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listIndustry(); // ✅ gọi đúng service
      if (res.success) {
        setIndustries(res.industrys || []); // ✅ lấy đúng dữ liệu
      } else {
        setError(res.message || "Không thể tải danh sách ngành nghề");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ✅ Cấu hình cột cho bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "industry_id",
      key: "industry_id",
      width: 100,
    },
    {
      title: "Tên ngành nghề",
      dataIndex: "name",
      key: "name",
    },
  ];

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h3>Danh sách ngành nghề</h3>
      <Table
        dataSource={industries}
        columns={columns}
        rowKey="industry_id"
        pagination={{ pageSize: 10 }}
      />
    </>
  );
}

export default AdminIndustry;
