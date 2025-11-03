import { useEffect, useState } from "react";
import { Card, Spin, Alert, Row, Col, Statistic, Table, Progress } from "antd";
import {
  PercentageOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import UseTitle from "../../../hooks/useTitle";
import { getApplicationResults } from "../../../services/jobApplication";

function ApplicationResultsStatistics() {
  UseTitle("JobVip - Kết quả ứng tuyển");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("account"));
        if (!userData || !userData.company_id) {
          setError("Không tìm thấy thông tin công ty");
          setLoading(false);
          return;
        }

        const result = await getApplicationResults(userData.company_id);
        if (result.success) {
          setResults(result.results);
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

    fetchResults();
  }, []);

  if (loading) return <Spin tip="Đang tải thống kê..." size="large" />;
  if (error) return <Alert message={error} type="error" showIcon />;

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
      title: "Tổng hồ sơ",
      dataIndex: "total",
      key: "total",
      align: "center",
    },
    {
      title: "Đã duyệt",
      dataIndex: "accepted",
      key: "accepted",
      align: "center",
      render: (val) => (
        <span style={{ color: "#52c41a", fontWeight: "bold" }}>{val}</span>
      ),
    },
    {
      title: "Từ chối",
      dataIndex: "rejected",
      key: "rejected",
      align: "center",
      render: (val) => (
        <span style={{ color: "#f5222d", fontWeight: "bold" }}>{val}</span>
      ),
    },
    {
      title: "Chờ xử lý",
      dataIndex: "pending",
      key: "pending",
      align: "center",
      render: (val) => (
        <span style={{ color: "#faad14", fontWeight: "bold" }}>{val}</span>
      ),
    },
    {
      title: "Tỷ lệ thành công",
      dataIndex: "rate",
      key: "rate",
      align: "center",
      render: (rate) => (
        <Progress
          type="circle"
          percent={parseFloat(rate)}
          width={50}
          format={(percent) => `${percent}%`}
          strokeColor={
            rate >= 50 ? "#52c41a" : rate >= 30 ? "#faad14" : "#f5222d"
          }
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📊 Kết quả ứng tuyển</h2>

      {/* Tổng quan */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tỷ lệ chuyển đổi"
              value={results.conversionRate}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{
                color:
                  results.conversionRate >= 50
                    ? "#52c41a"
                    : results.conversionRate >= 30
                    ? "#faad14"
                    : "#f5222d",
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Tỷ lệ hồ sơ được duyệt/tổng hồ sơ
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Thời gian xử lý TB"
              value={results.avgProcessingTime}
              suffix="ngày"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Thời gian trung bình để xử lý 1 hồ sơ
            </p>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Hiệu suất tuyển dụng"
              value={
                results.conversionRate >= 50
                  ? "Tốt"
                  : results.conversionRate >= 30
                  ? "Trung bình"
                  : "Cần cải thiện"
              }
              prefix={<RiseOutlined />}
              valueStyle={{
                color:
                  results.conversionRate >= 50
                    ? "#52c41a"
                    : results.conversionRate >= 30
                    ? "#faad14"
                    : "#f5222d",
                fontSize: "20px",
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Đánh giá dựa trên tỷ lệ chuyển đổi
            </p>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ xu hướng */}
      <Row gutter={16} className="mb-6">
        <Col span={24}>
          <Card title="📈 Xu hướng tuyển dụng theo thời gian">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={results.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="#1890ff"
                  name="Hồ sơ nhận được"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke="#52c41a"
                  name="Đã duyệt"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#f5222d"
                  name="Từ chối"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bảng kết quả theo vị trí */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="🎯 Kết quả tuyển dụng theo vị trí">
            <Table
              dataSource={results.positionResults}
              columns={columns}
              pagination={{ pageSize: 10 }}
              rowKey="name"
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ApplicationResultsStatistics;
