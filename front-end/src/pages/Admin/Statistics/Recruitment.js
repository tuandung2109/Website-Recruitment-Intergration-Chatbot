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
  Progress,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  TeamOutlined,
  BankOutlined,
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
  ComposedChart,
} from "recharts";
import { getStatisticsRecruitment } from "../../../services/statistics";
import UseTitle from "../../../hooks/useTitle";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ["#52c41a", "#1890ff", "#faad14", "#f5222d", "#722ed1"];

function StatisticsRecruitment() {
  UseTitle("JobVip - Thống kê tuyển dụng");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [form] = Form.useForm();

  // Filters
  const [filters, setFilters] = useState({
    status: "all", // all, open, closed
    dateRange: null,
    companyId: "all",
  });

  // Fetch data
  const fetchData = async (filterParams = filters) => {
    setLoading(true);
    setError("");
    const res = await getStatisticsRecruitment(filterParams);
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
      status: values.status || "all",
      companyId: values.companyId || "all",
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
      status: "all",
      companyId: "all",
      dateRange: null,
    };
    setFilters(defaultFilters);
    fetchData(defaultFilters);
  };

  if (error) return <Alert type="error" message={error} />;
  if (!data && loading)
    return <Spin tip="Đang tải dữ liệu thống kê..." size="large" />;

  // Columns for job postings table
  const jobPostingsColumns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Vị trí tuyển dụng",
      dataIndex: "position_name",
      key: "position_name",
      ellipsis: true,
    },
    {
      title: "Công ty",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Số ứng tuyển",
      dataIndex: "application_count",
      key: "application_count",
      sorter: (a, b) => a.application_count - b.application_count,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đang hoạt động
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Không hoạt động
          </Tag>
        ),
    },
    {
      title: "Hạn nộp",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"),
    },
  ];

  // Columns for top companies
  const topCompaniesColumns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Công ty",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số bài đăng",
      dataIndex: "job_count",
      key: "job_count",
      sorter: (a, b) => a.job_count - b.job_count,
    },
    {
      title: "Tổng ứng tuyển",
      dataIndex: "total_applications",
      key: "total_applications",
      sorter: (a, b) => a.total_applications - b.total_applications,
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 24 }}>💼 Thống kê tuyển dụng</h1>

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
            status: "all",
            companyId: "all",
          }}
        >
          <Form.Item name="status" label="Trạng thái bài đăng">
            <Select style={{ width: 200 }}>
              <Option value="all">Tất cả</Option>
              <Option value="active">Đang hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item name="companyId" label="Công ty">
            <Select style={{ width: 250 }}>
              <Option value="all">Tất cả công ty</Option>
              {data?.companies?.map((company) => (
                <Option key={company.company_id} value={company.company_id}>
                  {company.name}
                </Option>
              ))}
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
                  title="Tổng số bài đăng"
                  value={data.totalJobPostings}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Bài đăng đang hoạt động"
                  value={data.openJobPostings}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số ứng tuyển"
                  value={data.totalApplications}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Số công ty tuyển dụng"
                  value={data.totalCompaniesRecruiting}
                  prefix={<BankOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Application Status Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đơn chờ xử lý"
                  value={data.pendingApplications}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đơn được chấp nhận"
                  value={data.acceptedApplications}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Đơn bị từ chối"
                  value={data.rejectedApplications}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#f5222d" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Success Rate */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="📊 Tỷ lệ thành công">
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={data.successRate}
                    format={(percent) => `${percent}%`}
                    strokeColor={{
                      "0%": "#108ee9",
                      "100%": "#87d068",
                    }}
                    width={200}
                  />
                  <p style={{ marginTop: 16, fontSize: 16 }}>
                    Tỷ lệ chấp nhận đơn ứng tuyển
                  </p>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="📈 Trung bình ứng tuyển/Bài đăng">
                <div style={{ textAlign: "center", paddingTop: 60 }}>
                  <Statistic
                    value={data.avgApplicationsPerJob}
                    precision={1}
                    valueStyle={{ fontSize: 48, color: "#1890ff" }}
                    suffix="ứng viên/bài"
                  />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="📊 Phân bố trạng thái bài đăng">
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

            <Col xs={24} lg={12}>
              <Card title="📊 Phân bố trạng thái đơn ứng tuyển">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.applicationsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.applicationsByStatus.map((entry, index) => (
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

          {/* Combined Chart - Jobs and Applications by Month */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title="📈 Bài đăng & Ứng tuyển theo tháng">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={data.jobsAndApplicationsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="jobs"
                      fill="#1890ff"
                      name="Bài đăng"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="applications"
                      stroke="#52c41a"
                      strokeWidth={2}
                      name="Ứng tuyển"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Top Companies */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title="🏆 Top công ty tuyển dụng nhiều nhất">
                <Table
                  dataSource={data.topCompanies}
                  columns={topCompaniesColumns}
                  rowKey="company_id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {/* Job Postings Table */}
          <Card title="📋 Danh sách bài đăng tuyển dụng">
            <Table
              dataSource={data.jobPostings}
              columns={jobPostingsColumns}
              rowKey="job_posting_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bài đăng`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </>
      ) : (
        <Alert type="info" message="Không có dữ liệu" />
      )}
    </div>
  );
}

export default StatisticsRecruitment;
