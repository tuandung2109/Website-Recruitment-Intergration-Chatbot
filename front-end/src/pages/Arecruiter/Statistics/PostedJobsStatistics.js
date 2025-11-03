import { useEffect, useState } from "react";
import { Card, Spin, Alert, Row, Col, Statistic } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import UseTitle from "../../../hooks/useTitle";
import { getJobPostingStatistics } from "../../../services/jobPosting";

function PostedJobsStatistics() {
  UseTitle("JobVip - Thống kê số tin đã đăng");

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("account"));
        if (!userData || !userData.company_id) {
          setError("Không tìm thấy thông tin công ty");
          setLoading(false);
          return;
        }

        const result = await getJobPostingStatistics(userData.company_id);
        if (result.success) {
          setStatistics(result.statistics);
        } else {
          setError(result.message || "Không thể tải thống kê");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) return <Spin tip="Đang tải thống kê..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

  const COLORS = ["#52c41a", "#f5222d"];
  const pieData = [
    { name: "Đang hoạt động", value: statistics.active },
    { name: "Đã khóa", value: statistics.inactive },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📊 Thống kê số tin đã đăng</h2>

      {/* Tổng quan */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số tin"
              value={statistics.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={statistics.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã khóa"
              value={statistics.inactive}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="📈 Số tin đăng theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1890ff" name="Số tin đăng" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="🥧 Tỷ lệ trạng thái">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PostedJobsStatistics;
