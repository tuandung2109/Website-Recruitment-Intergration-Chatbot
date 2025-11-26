import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Spin,
  Alert,
  message,
  Progress,
  Space,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TrophyOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import UseTitle from "../../../hooks/useTitle";
import {
  getCandidatesByJobPosting,
  updateApplicationStatus,
} from "../../../services/jobApplication";

const { Title, Text } = Typography;

function CandidatesByJob() {
  UseTitle("JobVip - Danh sách ứng viên");

  const { jobPostingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, [jobPostingId]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await getCandidatesByJobPosting(jobPostingId);

      if (res.success) {
        setCandidates(res.candidates || []);
        // Lấy tên công việc từ candidate đầu tiên (nếu có)
        if (res.candidates && res.candidates.length > 0) {
          setJobTitle(res.candidates[0].job_posting?.position_name || "");
        }
      } else {
        setError(res.message || "Không thể tải danh sách ứng viên");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (candidate) => {
    navigate(
      `/companyAdmin/job-postings/${jobPostingId}/candidates/${candidate.job_application_id}`
    );
  };

  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      const res = await updateApplicationStatus(candidateId, newStatus);
      if (res.success) {
        message.success(res.message);
        // Cập nhật lại danh sách
        setCandidates((prev) =>
          prev.map((item) =>
            item.job_application_id === candidateId
              ? { ...item, status: newStatus }
              : item
          )
        );
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  // Hàm xác định màu của điểm AI
  const getScoreColor = (score) => {
    if (score >= 85) return "#52c41a"; // Xanh lá
    if (score >= 70) return "#1890ff"; // Xanh dương
    if (score >= 60) return "#faad14"; // Vàng
    return "#ff4d4f"; // Đỏ
  };

  // Hàm xác định level của điểm
  const getScoreLevel = (score) => {
    if (score >= 85) return "Xuất sắc";
    if (score >= 70) return "Tốt";
    if (score >= 60) return "Trung bình";
    return "Cần cải thiện";
  };

  const columns = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 60,
      render: (_, __, index) => (
        <div style={{ textAlign: "center", fontWeight: "bold" }}>
          {index + 1}
        </div>
      ),
    },
    {
      title: "🏆 Điểm AI",
      dataIndex: "ai_score",
      key: "ai_score",
      width: 150,
      sorter: (a, b) => {
        if (a.ai_score === null) return 1;
        if (b.ai_score === null) return -1;
        return b.ai_score - a.ai_score;
      },
      render: (score) => {
        if (score === null) {
          return (
            <div style={{ textAlign: "center", color: "#999" }}>
              <Tag color="default">Chưa đánh giá</Tag>
            </div>
          );
        }
        return (
          <div style={{ textAlign: "center" }}>
            <Progress
              type="circle"
              percent={score}
              width={60}
              strokeColor={getScoreColor(score)}
              format={(percent) => (
                <span style={{ fontSize: 14, fontWeight: "bold" }}>
                  {percent}
                </span>
              )}
            />
            <div style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
              {getScoreLevel(score)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Ứng viên",
      dataIndex: "account",
      key: "account",
      render: (account) => (
        <div>
          <div style={{ fontWeight: "600", fontSize: 15 }}>
            <UserOutlined /> {account?.email || "N/A"}
          </div>
          <div style={{ color: "#666", fontSize: 13 }}>
            📞 {account?.phone_number || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const color =
          status === "pending"
            ? "orange"
            : status === "accept"
            ? "green"
            : "red";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Ngày nộp",
      dataIndex: "submitted_at",
      key: "submitted_at",
      width: 130,
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "—",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
            block
          >
            Xem chi tiết
          </Button>
          {record.status === "pending" && (
            <Space size="small">
              <Button
                type="primary"
                size="small"
                onClick={() =>
                  handleUpdateStatus(record.job_application_id, "accepted")
                }
              >
                Chấp nhận
              </Button>
              <Button
                danger
                size="small"
                onClick={() =>
                  handleUpdateStatus(record.job_application_id, "rejected")
                }
              >
                Từ chối
              </Button>
            </Space>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải danh sách ứng viên..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert message={error} type="error" showIcon />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginTop: 16 }}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Space>

          <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
            <TrophyOutlined style={{ color: "#1890ff" }} /> Danh sách ứng viên
          </Title>

          {jobTitle && (
            <Text type="secondary" style={{ fontSize: 16 }}>
              Vị trí: <strong>{jobTitle}</strong>
            </Text>
          )}

          <div style={{ marginTop: 12 }}>
            <Tag color="blue" style={{ fontSize: 14 }}>
              <UserOutlined /> Tổng số: {candidates.length} ứng viên
            </Tag>
            <Tag color="orange" style={{ fontSize: 14 }}>
              Chờ duyệt:{" "}
              {candidates.filter((c) => c.status === "pending").length}
            </Tag>
            <Tag color="green" style={{ fontSize: 14 }}>
              Đã chấp nhận:{" "}
              {candidates.filter((c) => c.status === "accept").length}
            </Tag>
            <Tag color="red" style={{ fontSize: 14 }}>
              Đã từ chối:{" "}
              {candidates.filter((c) => c.status === "reject").length}
            </Tag>
          </div>
        </div>

        {candidates.length === 0 ? (
          <Alert
            message="Chưa có ứng viên nào ứng tuyển vào vị trí này"
            type="info"
            showIcon
          />
        ) : (
          <Table
            dataSource={candidates}
            columns={columns}
            rowKey="job_application_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} ứng viên`,
            }}
            bordered
          />
        )}
      </Card>
    </div>
  );
}

export default CandidatesByJob;
