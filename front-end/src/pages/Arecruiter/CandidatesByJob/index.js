import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Spin,
  Alert,
  Modal,
  Descriptions,
  message,
  Progress,
  Space,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TrophyOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import UseTitle from "../../../hooks/useTitle";
import { getCandidatesByJobPosting, updateApplicationStatus } from "../../../services/jobApplication";

const { Title, Text } = Typography;

function CandidatesByJob() {
  UseTitle("JobVip - Danh sách ứng viên");
  
  const { jobPostingId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
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
        setIsModalOpen(false);
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
      title: "Kinh nghiệm",
      dataIndex: "cv",
      key: "experience",
      width: 120,
      render: (cv) => (
        <Tag color="blue">
          {cv?.years_experience ? `${cv.years_experience} năm` : "Chưa rõ"}
        </Tag>
      ),
    },
    {
      title: "Trình độ",
      dataIndex: "cv",
      key: "education",
      width: 150,
      render: (cv) => (
        <Tag color="purple">{cv?.education_level || "Chưa rõ"}</Tag>
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
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
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

      {/* Modal chi tiết */}
      <Modal
        title={
          <span>
            <FileTextOutlined /> Chi tiết ứng viên
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ 
          maxHeight: "calc(100vh - 200px)", 
          overflowY: "auto",
          paddingRight: 12
        }}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedCandidate && (
          <div>
            {/* Hiển thị đánh giá AI nếu có */}
            {selectedCandidate.ai_score !== null && selectedCandidate.ai_evaluation ? (
              <>
                {/* Điểm AI tổng hợp */}
                <Card
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    marginBottom: 20,
                    textAlign: "center",
                  }}
                >
                  <Title level={4} style={{ color: "white", margin: 0 }}>
                    🏆 Điểm đánh giá AI tổng hợp
                  </Title>
                  <div style={{ marginTop: 12 }}>
                    <Progress
                      type="circle"
                      percent={selectedCandidate.ai_score}
                      width={120}
                      strokeWidth={10}
                      strokeColor="#fff"
                      trailColor="rgba(255,255,255,0.3)"
                      format={(percent) => (
                        <span style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
                          {percent}
                        </span>
                      )}
                    />
                  </div>
                  <Text style={{ color: "white", fontSize: 16, display: "block", marginTop: 8 }}>
                    {getScoreLevel(selectedCandidate.ai_score)}
                  </Text>
                </Card>

                {/* Chi tiết điểm từng phần */}
                <Card
                  title="📊 Điểm chi tiết từng tiêu chí"
                  style={{ marginBottom: 20 }}
                  bordered={false}
                >
                  <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <div>
                      <Text strong>🎯 Kỹ năng (Skill):</Text>
                      <Progress
                        percent={(selectedCandidate.ai_evaluation.skill / 10) * 100}
                        format={() => `${selectedCandidate.ai_evaluation.skill}/10`}
                        strokeColor="#52c41a"
                      />
                    </div>
                    <div>
                      <Text strong>🎓 Học vấn (Education):</Text>
                      <Progress
                        percent={(selectedCandidate.ai_evaluation.education / 10) * 100}
                        format={() => `${selectedCandidate.ai_evaluation.education}/10`}
                        strokeColor="#1890ff"
                      />
                    </div>
                    <div>
                      <Text strong>💼 Phù hợp vị trí (Position):</Text>
                      <Progress
                        percent={(selectedCandidate.ai_evaluation.position / 10) * 100}
                        format={() => `${selectedCandidate.ai_evaluation.position}/10`}
                        strokeColor="#722ed1"
                      />
                    </div>
                    <div>
                      <Text strong>⏱️ Kinh nghiệm (Experiences):</Text>
                      <Progress
                        percent={(selectedCandidate.ai_evaluation.experiences / 10) * 100}
                        format={() => `${selectedCandidate.ai_evaluation.experiences}/10`}
                        strokeColor="#faad14"
                      />
                    </div>
                    <div>
                      <Text strong>⭐ Tổng quan (General):</Text>
                      <Progress
                        percent={(selectedCandidate.ai_evaluation.general / 10) * 100}
                        format={() => `${selectedCandidate.ai_evaluation.general}/10`}
                        strokeColor="#eb2f96"
                      />
                    </div>
                  </Space>
                </Card>

                {/* Điểm mạnh - Điểm yếu */}
                <Card
                  title="💡 Phân tích điểm mạnh & điểm yếu"
                  style={{ marginBottom: 20 }}
                  bordered={false}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Tag color="green" style={{ fontSize: 14, padding: "4px 12px" }}>
                      ✅ Điểm mạnh
                    </Tag>
                    <div style={{ marginTop: 8, padding: 12, background: "#f6ffed", borderRadius: 6, border: "1px solid #b7eb8f" }}>
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {selectedCandidate.ai_evaluation.strong || "Chưa có đánh giá"}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Tag color="orange" style={{ fontSize: 14, padding: "4px 12px" }}>
                      ⚠️ Điểm yếu
                    </Tag>
                    <div style={{ marginTop: 8, padding: 12, background: "#fff7e6", borderRadius: 6, border: "1px solid #ffd591" }}>
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {selectedCandidate.ai_evaluation.weak || "Chưa có đánh giá"}
                      </Text>
                    </div>
                  </div>
                </Card>

                {/* Phân tích chi tiết */}
                {selectedCandidate.ai_evaluation.detail_analysis && (
                  <Card
                    title="🔍 Phân tích chi tiết từ AI"
                    style={{ marginBottom: 20 }}
                    bordered={false}
                  >
                    <div style={{ padding: 12, background: "#f0f5ff", borderRadius: 6, border: "1px solid #adc6ff" }}>
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {selectedCandidate.ai_evaluation.detail_analysis}
                      </Text>
                    </div>
                  </Card>
                )}

                {/* Câu hỏi phỏng vấn gợi ý */}
                {selectedCandidate.ai_evaluation.interview_question && (
                  <Card
                    title="❓ Câu hỏi phỏng vấn gợi ý"
                    style={{ marginBottom: 20 }}
                    bordered={false}
                  >
                    <div style={{ padding: 12, background: "#fff1f0", borderRadius: 6, border: "1px solid #ffccc7" }}>
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {selectedCandidate.ai_evaluation.interview_question}
                      </Text>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Alert
                message="Chưa có đánh giá AI"
                description="Ứng viên này chưa được AI đánh giá. Vui lòng sử dụng tính năng đánh giá AI để có kết quả chi tiết."
                type="warning"
                showIcon
                style={{ marginBottom: 20 }}
              />
            )}

            {/* Thông tin cơ bản ứng viên */}
            <Card
              title="👤 Thông tin ứng viên"
              style={{ marginBottom: 20 }}
              bordered={false}
            >
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Email">
                {selectedCandidate.account?.email}
              </Descriptions.Item>
              
              <Descriptions.Item label="Số điện thoại">
                {selectedCandidate.account?.phone_number || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Kinh nghiệm">
                {selectedCandidate.cv?.years_experience
                  ? `${selectedCandidate.cv.years_experience} năm`
                  : "Chưa rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="Trình độ học vấn">
                {selectedCandidate.cv?.education_level || "Chưa rõ"}
              </Descriptions.Item>

              <Descriptions.Item label="Thư xin việc">
                {selectedCandidate.cover_letter || <i>Không có</i>}
              </Descriptions.Item>

              <Descriptions.Item label="CV / File đính kèm">
                {selectedCandidate.file_url ? (
                  <a
                    href={
                      selectedCandidate.file_url.startsWith("http")
                        ? selectedCandidate.file_url
                        : `${process.env.REACT_APP_API_BASE || "http://localhost:9000"}${selectedCandidate.file_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "blue" }}
                  >
                    📄 Xem file đính kèm
                  </a>
                ) : selectedCandidate.cv?.cv_link ? (
                  <a
                    href={
                      selectedCandidate.cv.cv_link.startsWith("http")
                        ? selectedCandidate.cv.cv_link
                        : `${process.env.REACT_APP_API_BASE || "http://localhost:9000"}/files/${selectedCandidate.cv.cv_link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 Xem CV
                  </a>
                ) : (
                  <span className="text-gray-400">Không có file</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedCandidate.status === "pending"
                      ? "orange"
                      : selectedCandidate.status === "accept"
                      ? "green"
                      : "red"
                  }
                >
                  {selectedCandidate.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày nộp đơn">
                {new Date(selectedCandidate.submitted_at).toLocaleString("vi-VN")}
              </Descriptions.Item>
            </Descriptions>
            </Card>

            {/* Nút hành động */}
            {selectedCandidate.status === "pending" && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedCandidate.job_application_id,
                        "accepted"
                      )
                    }
                  >
                    ✅ Chấp nhận ứng viên
                  </Button>
                  <Button
                    danger
                    size="large"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedCandidate.job_application_id,
                        "rejected"
                      )
                    }
                  >
                    ❌ Từ chối ứng viên
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CandidatesByJob;
