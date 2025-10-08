import { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import { listJobsPosting } from "../../../services/jobPosting";
import UseTitle from "../../../hooks/useTitle";

function AdminJobPosting() {
  UseTitle(`JobVip - AdminJobPosting`);
  const [jobPostings, setJobPosting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listJobsPosting();
      if (res.success) {
        setJobPosting(res.jobs || []); // ✅ đúng key
      } else {
        setError(res.message || "Không thể tải danh sách công việc");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Vị trí",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Công ty",
      dataIndex: ["company", "name"],
      key: "company",
    },
    {
      title: "Mức lương (VND)",
      dataIndex: "salary",
      key: "salary",
      render: (s) => s.toLocaleString(),
    },
    {
      title: "Hạn nộp",
      dataIndex: "deadline",
      key: "deadline",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
  ];

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h3>Danh sách bài đăng tuyển dụng</h3>
      <Table
        dataSource={jobPostings}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </>
  );
}

export default AdminJobPosting;
