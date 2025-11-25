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
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  CreditCardOutlined,
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
} from "recharts";
import { getStatisticsRevenue } from "../../../services/statistics";
import UseTitle from "../../../hooks/useTitle";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ["#52c41a", "#1890ff", "#faad14", "#f5222d", "#722ed1"];

function StatisticsRevenue() {
  UseTitle("JobVip - Thống kê doanh thu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [form] = Form.useForm();

  // Filters
  const [filters, setFilters] = useState({
    paymentStatus: "all",
    paymentMethod: "all",
    dateRange: null,
  });

  // Fetch data
  const fetchData = async (filterParams = filters) => {
    setLoading(true);
    setError("");
    const res = await getStatisticsRevenue(filterParams);
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
      paymentStatus: values.paymentStatus || "all",
      paymentMethod: values.paymentMethod || "all",
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
      paymentStatus: "all",
      paymentMethod: "all",
      dateRange: null,
    };
    setFilters(defaultFilters);
    fetchData(defaultFilters);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (error) return <Alert type="error" message={error} />;
  if (!data && loading)
    return <Spin tip="Đang tải dữ liệu thống kê..." size="large" />;

  // Columns for invoices table
  const invoicesColumns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Mã giao dịch",
      dataIndex: "transaction_code",
      key: "transaction_code",
    },
    {
      title: "Email khách hàng",
      dataIndex: "account_email",
      key: "account_email",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Phương thức",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Ngân hàng",
      dataIndex: "bank_name",
      key: "bank_name",
    },
    {
      title: "Trạng thái",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) =>
        status === "completed" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Hoàn thành
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="warning">
            Chưa hoàn thành
          </Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : "N/A",
    },
  ];

  // Columns for top customers
  const topCustomersColumns = [
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
      title: "Số giao dịch",
      dataIndex: "invoice_count",
      key: "invoice_count",
      sorter: (a, b) => a.invoice_count - b.invoice_count,
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "total_spent",
      key: "total_spent",
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.total_spent - b.total_spent,
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 24 }}>💰 Thống kê doanh thu</h1>

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
            paymentStatus: "all",
            paymentMethod: "all",
          }}
        >
          <Form.Item name="paymentStatus" label="Trạng thái thanh toán">
            <Select style={{ width: 200 }}>
              <Option value="all">Tất cả</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="unfinished">Chưa hoàn thành</Option>
            </Select>
          </Form.Item>

          <Form.Item name="paymentMethod" label="Phương thức thanh toán">
            <Select style={{ width: 200 }}>
              <Option value="all">Tất cả</Option>
              {data?.paymentMethods?.map((method) => (
                <Option key={method} value={method}>
                  {method}
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
                  title="Tổng doanh thu"
                  value={data.totalRevenue}
                  prefix={<DollarOutlined />}
                  suffix="VND"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh thu hoàn thành"
                  value={data.completedRevenue}
                  prefix={<CheckCircleOutlined />}
                  suffix="VND"
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Doanh thu chưa hoàn thành"
                  value={data.unfinishedRevenue}
                  prefix={<CloseCircleOutlined />}
                  suffix="VND"
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng số giao dịch"
                  value={data.totalInvoices}
                  prefix={<CreditCardOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Invoice Status Stats */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Giao dịch hoàn thành"
                  value={data.completedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Giao dịch chưa hoàn thành"
                  value={data.unfinishedCount}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Giá trị trung bình/Giao dịch"
                  value={data.avgInvoiceAmount}
                  prefix={<DollarOutlined />}
                  suffix="VND"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="📊 Doanh thu theo trạng thái">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.revenueByStatus}
                      dataKey="amount"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.revenueByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="📊 Doanh thu theo phương thức thanh toán">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenueByPaymentMethod}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="amount" fill="#1890ff" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Revenue by Month */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24}>
              <Card title="📈 Doanh thu theo tháng">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#52c41a"
                      strokeWidth={2}
                      name="Doanh thu"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Top Banks */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="🏦 Top 5 ngân hàng">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenueByBank}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bank" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="amount" fill="#faad14" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="👑 Top 10 khách hàng">
                <Table
                  dataSource={data.topCustomers}
                  columns={topCustomersColumns}
                  rowKey="account_id"
                  pagination={false}
                  size="small"
                  scroll={{ y: 240 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Invoices Table */}
          <Card title="📋 Danh sách giao dịch">
            <Table
              dataSource={data.invoices}
              columns={invoicesColumns}
              rowKey="invoice_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} giao dịch`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </>
      ) : (
        <Alert type="info" message="Không có dữ liệu" />
      )}
    </div>
  );
}

export default StatisticsRevenue;
