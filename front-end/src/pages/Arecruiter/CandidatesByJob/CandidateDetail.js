import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Alert,
  message,
  Space,
  Typography,
  Divider,
  Tag,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import UseTitle from "../../../hooks/useTitle";
import { getCandidatesByJobPosting, updateApplicationStatus } from "../../../services/jobApplication";

const { Title, Text, Paragraph } = Typography;

function CandidateDetail() {
  UseTitle("Chi tiết ứng viên");
  
  const { jobPostingId, candidateId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCandidateDetail();
  }, [jobPostingId, candidateId]);

  const fetchCandidateDetail = async () => {
    try {
      setLoading(true);
      const res = await getCandidatesByJobPosting(jobPostingId);
      
      if (res.success) {
        const found = res.candidates?.find(
          (c) => c.job_application_id === parseInt(candidateId)
        );
        
        if (found) {
          setCandidate(found);
        } else {
          setError("Không tìm thấy ứng viên");
        }
      } else {
        setError(res.message || "Không thể tải thông tin ứng viên");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await updateApplicationStatus(parseInt(candidateId), newStatus);
      if (res.success) {
        message.success(res.message);
        setCandidate((prev) => ({ ...prev, status: newStatus }));
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#52c41a";
    if (score >= 70) return "#1890ff";
    if (score >= 60) return "#faad14";
    return "#ff4d4f";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Xuất sắc";
    if (score >= 70) return "Tốt";
    if (score >= 60) return "Trung bình";
    return "Cần cải thiện";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div style={{ padding: "24px", maxWidth: 800, margin: "0 auto" }}>
        <Alert message={error || "Không tìm thấy ứng viên"} type="error" showIcon />
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
    <div style={{ 
      padding: "32px 24px", 
      background: "#f0f2f5", 
      minHeight: "100vh" 
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            size="large"
            style={{ 
              marginBottom: 16
            }}
          >
            Quay lại danh sách
          </Button>
          <Title level={2} style={{ color: "#262626", margin: 0 }}>
            <UserOutlined /> Chi tiết ứng viên
          </Title>
        </div>

        {/* Main Content Container */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Thông tin & Điểm AI */}
          <Col xs={24} lg={10}>
            {/* Thông tin liên hệ */}
            <Card
              style={{ 
                marginBottom: 24, 
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: 36,
                  color: "white"
                }}>
                  <UserOutlined />
                </div>
                <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                  {candidate.account?.email?.split('@')[0] || "Ứng viên"}
                </Title>
                <Tag
                  color={
                    candidate.status === "pending"
                      ? "orange"
                      : candidate.status === "accept"
                      ? "green"
                      : "red"
                  }
                  style={{ fontSize: 13, padding: "4px 12px" }}
                >
                  {candidate.status === "pending"
                    ? "Chờ duyệt"
                    : candidate.status === "accept"
                    ? "Đã chấp nhận"
                    : "Đã từ chối"}
                </Tag>
              </div>

              <Divider style={{ margin: "20px 0" }} />

              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <div style={{ 
                  padding: "12px 16px", 
                  background: "#f0f5ff", 
                  borderRadius: 8,
                  border: "1px solid #d6e4ff"
                }}>
                  <MailOutlined style={{ marginRight: 8, color: "#1890ff", fontSize: 18 }} />
                  <Text strong style={{ color: "#1890ff" }}>Email</Text>
                  <div style={{ marginTop: 4, marginLeft: 26 }}>
                    <Text style={{ fontSize: 15 }}>{candidate.account?.email || "N/A"}</Text>
                  </div>
                </div>
                
                <div style={{ 
                  padding: "12px 16px", 
                  background: "#f6ffed", 
                  borderRadius: 8,
                  border: "1px solid #b7eb8f"
                }}>
                  <PhoneOutlined style={{ marginRight: 8, color: "#52c41a", fontSize: 18 }} />
                  <Text strong style={{ color: "#52c41a" }}>Số điện thoại</Text>
                  <div style={{ marginTop: 4, marginLeft: 26 }}>
                    <Text style={{ fontSize: 15 }}>
                      {candidate.account?.phone_number || "N/A"}
                    </Text>
                  </div>
                </div>

                <div style={{ 
                  padding: "12px 16px", 
                  background: "#fff7e6", 
                  borderRadius: 8,
                  border: "1px solid #ffd591"
                }}>
                  <CalendarOutlined style={{ marginRight: 8, color: "#faad14", fontSize: 18 }} />
                  <Text strong style={{ color: "#faad14" }}>Ngày nộp đơn</Text>
                  <div style={{ marginTop: 4, marginLeft: 26 }}>
                    <Text style={{ fontSize: 15 }}>
                      {new Date(candidate.submitted_at).toLocaleString("vi-VN")}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>



            {/* Điểm AI */}
            {candidate.ai_score !== null && (
              <Card
                style={{ 
                  marginBottom: 24, 
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  background: "#ffffff"
                }}
              >
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <Title level={4} style={{ color: "#457b9d", margin: 0, marginBottom: 16 }}>
                    <TrophyOutlined /> Đánh giá AI
                  </Title>
                  <div
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${getScoreColor(candidate.ai_score)}20, ${getScoreColor(candidate.ai_score)}40)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      border: `4px solid ${getScoreColor(candidate.ai_score)}`
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 48, fontWeight: "bold", color: getScoreColor(candidate.ai_score) }}>
                        {candidate.ai_score}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>điểm</div>
                    </div>
                  </div>
                  <Text style={{ fontSize: 16, color: "#595959", fontWeight: "500" }}>
                    {getScoreLabel(candidate.ai_score)}
                  </Text>
                </div>

                {candidate.ai_evaluation && (
                  <div style={{ marginTop: 20 }}>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <div style={{ 
                          background: "#e6f7ff", 
                          padding: "12px", 
                          borderRadius: 8,
                          textAlign: "center",
                          border: "1px solid #91d5ff"
                        }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Kỹ năng</Text>
                          <div style={{ fontSize: 24, fontWeight: "bold", color: "#1890ff" }}>
                            {candidate.ai_evaluation.skill}/10
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ 
                          background: "#f6ffed", 
                          padding: "12px", 
                          borderRadius: 8,
                          textAlign: "center",
                          border: "1px solid #b7eb8f"
                        }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Học vấn</Text>
                          <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
                            {candidate.ai_evaluation.education}/10
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ 
                          background: "#fffbe6", 
                          padding: "12px", 
                          borderRadius: 8,
                          textAlign: "center",
                          border: "1px solid #ffe58f"
                        }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Kinh nghiệm</Text>
                          <div style={{ fontSize: 24, fontWeight: "bold", color: "#faad14" }}>
                            {candidate.ai_evaluation.experiences}/10
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ 
                          background: "#fff0f6", 
                          padding: "12px", 
                          borderRadius: 8,
                          textAlign: "center",
                          border: "1px solid #ffadd2"
                        }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Phù hợp</Text>
                          <div style={{ fontSize: 24, fontWeight: "bold", color: "#eb2f96" }}>
                            {candidate.ai_evaluation.position}/10
                          </div>
                        </div>
                      </Col>
                      {candidate.ai_evaluation.general && (
                        <Col span={24}>
                          <div style={{ 
                            background: "#f9f0ff", 
                            padding: "12px", 
                            borderRadius: 8,
                            textAlign: "center",
                            border: "1px solid #d3adf7"
                          }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Tổng quan</Text>
                            <div style={{ fontSize: 24, fontWeight: "bold", color: "#722ed1" }}>
                              {candidate.ai_evaluation.general}/10
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>
                  </div>
                )}
              </Card>
            )}
          </Col>

          {/* Right Column - Đánh giá chi tiết */}
          <Col xs={24} lg={14}>
            {candidate.ai_evaluation && (
              <>
                {/* Điểm mạnh */}
                {candidate.ai_evaluation.strong && (
                  <Card 
                    size="small" 
                    style={{ 
                      marginBottom: 16, 
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderLeft: "4px solid #52c41a"
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Tag color="green" style={{ fontSize: 13, padding: "4px 12px" }}>
                        ✅ Điểm mạnh
                      </Tag>
                    </div>
                    <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                      {candidate.ai_evaluation.strong}
                    </Paragraph>
                  </Card>
                )}

                {/* Điểm yếu */}
                {candidate.ai_evaluation.weak && (
                  <Card 
                    size="small" 
                    style={{ 
                      marginBottom: 16, 
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderLeft: "4px solid #faad14"
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Tag color="orange" style={{ fontSize: 13, padding: "4px 12px" }}>
                        ⚠️ Điểm yếu
                      </Tag>
                    </div>
                    <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                      {candidate.ai_evaluation.weak}
                    </Paragraph>
                  </Card>
                )}

                {/* Phân tích chi tiết */}
                {candidate.ai_evaluation.detail_analysis && (
                  <Card 
                    size="small" 
                    style={{ 
                      marginBottom: 16, 
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderLeft: "4px solid #1890ff"
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Tag color="blue" style={{ fontSize: 13, padding: "4px 12px" }}>
                        🔍 Phân tích chi tiết
                      </Tag>
                    </div>
                    <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                      {candidate.ai_evaluation.detail_analysis}
                    </Paragraph>
                  </Card>
                )}

                {/* Câu hỏi phỏng vấn */}
                {candidate.ai_evaluation.interview_question && (
                  <Card 
                    size="small" 
                    style={{ 
                      marginBottom: 16, 
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      borderLeft: "4px solid #722ed1"
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Tag color="purple" style={{ fontSize: 13, padding: "4px 12px" }}>
                        ❓ Câu hỏi phỏng vấn gợi ý
                      </Tag>
                    </div>
                    <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                      {candidate.ai_evaluation.interview_question}
                    </Paragraph>
                  </Card>
                )}
              </>
            )}

            {/* Thư xin việc */}
            {candidate.cover_letter && (
              <Card
                style={{ 
                  marginBottom: 16, 
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderLeft: "4px solid #13c2c2"
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <Tag color="cyan" style={{ fontSize: 13, padding: "4px 12px" }}>
                    📝 Thư xin việc
                  </Tag>
                </div>
                <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
                  {candidate.cover_letter}
                </Paragraph>
              </Card>
            )}

            {/* CV / File đính kèm */}
            {(candidate.file_url || candidate.cv?.cv_link) && (
              <Card style={{ 
                marginBottom: 16, 
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}>
                <a
                  href={
                    candidate.file_url?.startsWith("http")
                      ? candidate.file_url
                      : candidate.cv?.cv_link?.startsWith("http")
                      ? candidate.cv.cv_link
                      : `${
                          process.env.REACT_APP_API_BASE || "http://localhost:9000"
                        }${candidate.file_url || `/files/${candidate.cv?.cv_link}`}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button 
                    type="primary" 
                    icon={<FileTextOutlined />} 
                    size="large" 
                    block
                    style={{
                      height: 50,
                      fontSize: 16,
                      borderRadius: 8
                    }}
                  >
                    📄 Xem CV / File đính kèm
                  </Button>
                </a>
              </Card>
            )}
          </Col>
        </Row>

        {/* Actions - Full width at bottom */}
        {candidate.status === "pending" && (
          <Card 
            style={{ 
              borderRadius: 12, 
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              marginTop: 24
            }}
          >
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus("accepted")}
                style={{ 
                  minWidth: 180,
                  height: 50,
                  fontSize: 16,
                  borderRadius: 8,
                  background: "#95de64",
                  borderColor: "#95de64",
                  color: "#135200"
                }}
              >
                Chấp nhận ứng viên
              </Button>
              <Button
                size="large"
                icon={<CloseCircleOutlined />}
                onClick={() => handleUpdateStatus("rejected")}
                style={{ 
                  minWidth: 180,
                  height: 50,
                  fontSize: 16,
                  borderRadius: 8,
                  background: "#ffa39e",
                  borderColor: "#ffa39e",
                  color: "#820014"
                }}
              >
                Từ chối ứng viên
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
}

export default CandidateDetail;
