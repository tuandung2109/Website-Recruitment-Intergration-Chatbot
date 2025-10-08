import { useEffect, useState } from "react";
import { Table, Spin, Alert } from "antd";
import { listSkills } from "../../../services/skill";
import UseTitle from "../../../hooks/useTitle";

function AdminSkill() {
  UseTitle(`JobVip - AdminSkill`);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await listSkills();
      if (res.success) {
        setSkills(res.skills || []);
      } else {
        setError(res.message || "Không thể tải danh sách kỹ năng");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "skill_id",
      key: "skill_id",
    },
    {
      title: "Tên kỹ năng",
      dataIndex: "skill_name",
      key: "skill_name",
    },
  ];

  if (loading) return <Spin tip="Đang tải danh sách kỹ năng..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h3>Danh sách kỹ năng</h3>
      <Table
        dataSource={skills}
        columns={columns}
        rowKey="skill_id"
        pagination={{ pageSize: 10 }}
      />
    </>
  );
}

export default AdminSkill;
