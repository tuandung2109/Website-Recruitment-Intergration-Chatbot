import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Alert, Statistic, Table } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  DollarOutlined,
  RiseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getStatisticsOverview } from "../../../services/statistics";
import UseTitle from "../../../hooks/useTitle";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function StatisticsOverview() {
  UseTitle("JobVip - Thống kê tổng quan");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getStatisticsOverview();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || "Không thể tải dữ liệu thống kê");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Spin tip="Đang tải dữ liệu thống kê..." size="large" />;
  if (error) return <Alert type="error" message={error} />;
  if (!data) return <Alert type="warning" message="Không có dữ liệu" />;

  // Columns cho top companies
  const topCompaniesColumns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên công ty",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số bài đăng",
      dataIndex: "job_count",
      key: "job_count",
      sorter: (a, b) => a.job_count - b.job_count,
    },
  ];

  // Columns cho recent activities
  const recentActivitiesColumns = [
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      render: (time) => new Date(time).toLocaleString("vi-VN"),
    },
    {
      title: "Hoạt động",
      dataIndex: "activity",
      key: "activity",
    },
    {
      title: "Chi tiết",
      dataIndex: "details",
      key: "details",
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 24 }}>📊 Thống kê tổng quan hệ thống</h1>

      {/* Các thẻ thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={data.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số công ty"
              value={data.totalCompanies}
              prefix={<BankOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số bài đăng"
              value={data.totalJobPostings}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={data.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê theo tháng */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người dùng mới (tháng này)"
              value={data.newUsersThisMonth}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Công ty mới (tháng này)"
              value={data.newCompaniesThisMonth}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bài đăng mới (tháng này)"
              value={data.newJobPostingsThisMonth}
              prefix={<RiseOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ứng viên (tháng này)"
              value={data.newApplicationsThisMonth}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ cột - Thống kê theo tháng */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="📈 Người dùng đăng ký theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.usersByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3f8600" name="Người dùng" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📈 Bài đăng tuyển dụng theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.jobPostingsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#cf1322" name="Bài đăng" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ đường - Doanh thu theo tháng */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="💰 Doanh thu theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#faad14"
                  strokeWidth={2}
                  name="Doanh thu (VND)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ tròn - Phân bố người dùng theo vai trò */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="👥 Phân bố người dùng theo vai trò">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.usersByRole}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.usersByRole.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="📊 Trạng thái bài đăng">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.jobPostingsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.jobPostingsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Top công ty có nhiều bài đăng nhất */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="🏆 Top 5 công ty có nhiều bài đăng nhất">
            <Table
              dataSource={data.topCompanies}
              columns={topCompaniesColumns}
              pagination={false}
              rowKey="company_id"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="🕒 Hoạt động gần đây">
            <Table
              dataSource={data.recentActivities}
              columns={recentActivitiesColumns}
              pagination={{ pageSize: 5 }}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StatisticsOverview;
