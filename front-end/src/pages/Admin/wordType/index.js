import { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import { listWorkType } from "../../../services/wordType";
import UseTitle from "../../../hooks/useTitle";

function AdminWorkType() {
  UseTitle(`JobVip - AdminWorkType`);
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listWorkType();
      if (res.success) {
        setWorkTypes(res.workTypes || []);
      } else {
        setError(res.message || "Không thể tải danh sách hình thức làm việc");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ✅ Định nghĩa cột cho bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "work_type_id",
      key: "work_type_id",
      width: 100,
    },
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
  ];

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h3>Danh sách hình thức làm việc</h3>
      <Table
        dataSource={workTypes}
        columns={columns}
        rowKey="work_type_id"
        pagination={{ pageSize: 10 }}
      />
    </>
  );
}

export default AdminWorkType;
