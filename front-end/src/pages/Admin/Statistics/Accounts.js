import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Statistic,
  Table,
  Form,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { getStatisticsAccounts } from "../../../services/statistics";
import UseTitle from "../../../hooks/useTitle";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ["#3f8600", "#1890ff", "#faad14", "#f5222d", "#722ed1"];

function StatisticsAccounts() {
  UseTitle("JobVip - Thống kê tài khoản");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [form] = Form.useForm();

  // Filters
  const [filters, setFilters] = useState({
    accountType: "all", // all, Seeker, Employer, Admin
    status: "all", // all, active, inactive
    dateRange: null, // [startDate, endDate]
  });

  // Fetch data
  const fetchData = async (filterParams = filters) => {
    setLoading(true);
    setError("");
    const res = await getStatisticsAccounts(filterParams);
    if (res.success) {
      setData(res.data);
    } else {
      setError(res.message || "Không thể tải dữ liệu thống kê");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle filter submit
  const onFinish = (values) => {
    const newFilters = {
      accountType: values.accountType || "all",
      status: values.status || "all",
      dateRange: values.dateRange
        ? [
            values.dateRange[0].format("YYYY-MM-DD"),
            values.dateRange[1].format("YYYY-MM-DD"),
          ]
        : null,
    };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    form.resetFields();
    const defaultFilters = {
      accountType: "all",
      status: "all",
      dateRange: null,
    };
    setFilters(defaultFilters);
    fetchData(defaultFilters);
  };

  if (error) return <Alert type="error" message={error} />;
  if (!data && loading)
    return <Spin tip="Đang tải dữ liệu thống kê..." size="large" />;

  // Columns for accounts table
  const accountsColumns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Loại tài khoản",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colors = {
          Seeker: "blue",
          Employer: "green",
          Admin: "red",
        };
        return <Tag color={colors[role] || "default"}>{role}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Hoạt động
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="error">
            Ngừng hoạt động
          </Tag>
        ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "create_at",
      key: "create_at",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 24 }}>👥 Thống kê tài khoản</h1>

      {/* Filter Form */}
      <Card
        title={
          <Space>
            <FilterOutlined /> Bộ lọc điều kiện
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={onFinish}
          initialValues={{
            accountType: "all",
            status: "all",
          }}
        >
          <Form.Item name="accountType" label="Loại tài khoản">
            <Select style={{ width: 200 }}>
              <Option value="all">Tất cả</Option>
              <Option value="Seeker">Người tìm việc</Option>
              <Option value="Employer">Nhà tuyển dụng</Option>
              <Option value="Admin">Quản trị viên</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select style={{ width: 200 }}>
              <Option value="all">Tất cả</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Khoảng thời gian">
            <RangePicker format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lọc
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {loading ? (
        <Spin tip="Đang tải dữ liệu..." />
      ) : data ? (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số tài khoản"
                  value={data.totalAccounts}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tài khoản hoạt động"
                  value={data.activeAccounts}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tài khoản ngừng hoạt động"
                  value={data.inactiveAccounts}
                  prefix={<StopOutlined />}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tài khoản mới (30 ngày)"
                  value={data.newAccountsLast30Days}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="📊 Phân bố theo loại tài khoản">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.accountsByRole}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.accountsByRole.map((entry, index) => (
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
              <Card title="📊 Phân bố theo trạng thái">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.accountsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.accountsByStatus.map((entry, index) => (
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

          {/* Line Chart - Accounts by Month */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title="📈 Số lượng tài khoản đăng ký theo tháng">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.accountsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#1890ff"
                      strokeWidth={2}
                      name="Số tài khoản"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Bar Chart - By Role */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title="📊 So sánh số lượng theo loại tài khoản">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.accountsByRole}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#1890ff" name="Số lượng" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Accounts Table */}
          <Card title="📋 Danh sách tài khoản chi tiết">
            <Table
              dataSource={data.accounts}
              columns={accountsColumns}
              rowKey="account_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} tài khoản`,
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        </>
      ) : (
        <Alert type="info" message="Không có dữ liệu" />
      )}
    </div>
  );
}

export default StatisticsAccounts;
