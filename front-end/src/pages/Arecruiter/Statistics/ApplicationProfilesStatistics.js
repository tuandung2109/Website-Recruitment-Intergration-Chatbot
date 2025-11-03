import { useEffect, useState } from "react";
import { Card, Spin, Alert, Row, Col, Statistic, Table } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
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
import { getApplicationStatistics } from "../../../services/jobApplication";

function ApplicationProfilesStatistics() {
  UseTitle("JobVip - Thống kê hồ sơ ứng tuyển");

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

        const result = await getApplicationStatistics(userData.company_id);
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

  const COLORS = ["#faad14", "#52c41a", "#f5222d"];
  const pieData = [
    { name: "Chờ xử lý", value: statistics.pending },
    { name: "Đã duyệt", value: statistics.accepted },
    { name: "Từ chối", value: statistics.rejected },
  ];

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Vị trí tuyển dụng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số hồ sơ",
      dataIndex: "count",
      key: "count",
      align: "right",
      render: (count) => (
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>{count}</span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📋 Thống kê hồ sơ ứng tuyển</h2>

      {/* Tổng quan */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng số hồ sơ"
              value={statistics.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={statistics.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={statistics.accepted}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Từ chối"
              value={statistics.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={14}>
          <Card title="📈 Số hồ sơ nhận được theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#52c41a" name="Số hồ sơ" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="🥧 Tỷ lệ trạng thái hồ sơ">
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

      {/* Top vị trí */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="🏆 Top 5 vị trí nhận nhiều hồ sơ nhất">
            <Table
              dataSource={statistics.topPositions}
              columns={columns}
              pagination={false}
              rowKey="name"
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ApplicationProfilesStatistics;
