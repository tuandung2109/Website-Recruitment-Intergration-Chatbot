import { useEffect, useState } from "react";
import { Card, Spin, Alert, Tag, Table, Button, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import UseTitle from "../../../hooks/useTitle";
import { getCompanyById } from "../../../services/company";
import { listJobsPosting } from "../../../services/jobPosting";
function CompanyJobPosting() {
  UseTitle("JobVip - Company Job Postings");
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAll = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("account"));
      if (!userData || !userData.company_id) {
        setError("Không tìm thấy thông tin công ty của tài khoản này");
        setLoading(false);
        return;
      }

      // 🔹 Lấy thông tin công ty
      const resCompany = await getCompanyById(userData.company_id);
      console.log("userData.company_id: ", userData.company_id);
      if (!resCompany.success) {
        setError(resCompany.message || "Không thể tải thông tin công ty");
        setLoading(false);
        return;
      }
      setCompany(resCompany.company);
      console.log("company123321:", company);

      // 🔹 Lấy toàn bộ jobPosting rồi lọc theo company_id
      const resJobs = await listJobsPosting();
      console.log("📋 Tất cả job posting111111111:", resJobs);
      console.log("🏢 company_id hiện tại22222222:", userData.company_id);

      if (resJobs.success && Array.isArray(resJobs.jobs)) {
        const filtered = resJobs.jobs.filter(
          (job) => Number(job.company.id) === Number(userData.company_id)
        );
        setJobPostings(filtered);
      } else {
        message.warning("Không có bài đăng tuyển nào");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <div className="p-6 flex flex-col items-center gap-8">
      {/* 🏢 Thông tin công ty */}

      {/* 💼 Danh sách bài đăng tuyển */}
      <Card
        style={{
          maxWidth: 1000,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
        title="💼 Danh sách bài đăng tuyển dụng của công ty"
      >
        <Table
          dataSource={jobPostings}
          rowKey="job_posting_id"
          bordered
          pagination={{ pageSize: 5 }}
          columns={[
            { title: "ID", dataIndex: "id", width: 70 },
            { title: "Vị trí", dataIndex: "title" },

            {
              title: "Mức lương (USD)",
              dataIndex: "salary",
              render: (salary) => salary?.toLocaleString() || "—",
              width: 120,
            },
            {
              title: "Hạn nộp",
              dataIndex: "deadline",
              render: (date) =>
                date
                  ? new Date(date).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "—",
              width: 130,
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>
                  {status}
                </Tag>
              ),
              width: 100,
            },
            {
              title: "Thao tác",
              width: 200,
              render: (_, record) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <Button
                    type="link"
                    onClick={() => {
                      setSelectedJob(record);
                      setIsModalOpen(true);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    style={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "none",
                      fontWeight: "600",
                    }}
                    onClick={() => {
                      navigate(`/companyAdmin/evaluateCandidates/${record.id}`);
                    }}
                  >
                    🤖 Đánh giá AI
                  </Button>
                </div>
              ),
            },
          ]}
        />
        <Modal
          title={`📝 Thông tin chi tiết - ${selectedJob?.title || ""}`}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={700}
        >
          {selectedJob ? (
            <div className="space-y-3">
              <p>
                <strong>Mô tả:</strong> {selectedJob.description || "—"}
              </p>
              <p>
                <strong>Yêu cầu:</strong> {selectedJob.requirements || "—"}
              </p>
              <p>
                <strong>Quyền lợi:</strong> {selectedJob.benefits || "—"}
              </p>
              <p>
                <strong>Mức lương:</strong>{" "}
                {selectedJob.salary
                  ? selectedJob.salary.toLocaleString() + " USD"
                  : "—"}
              </p>
              <p>
                <strong>Hạn nộp:</strong>{" "}
                {selectedJob.deadline
                  ? new Date(selectedJob.deadline).toLocaleDateString("vi-VN")
                  : "—"}
              </p>
              <p>
                <strong>Kỹ năng:</strong>{" "}
                {selectedJob.skills?.length
                  ? selectedJob.skills.join(", ")
                  : "—"}
              </p>
              <p>
                <strong>Hình thức làm việc:</strong>{" "}
                {selectedJob.workTypes?.length
                  ? selectedJob.workTypes.join(", ")
                  : "—"}
              </p>
              <p>
                <strong>Ngành nghề:</strong>{" "}
                {selectedJob.industries?.length
                  ? selectedJob.industries.join(", ")
                  : "—"}
              </p>
              <p>
                <strong>Thời gian làm việc:</strong>{" "}
                {selectedJob.workingTime || "—"}
              </p>
              <p>
                <strong>Công ty:</strong> {selectedJob.company?.name || "—"}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {selectedJob.company?.address || "—"}
              </p>
            </div>
          ) : (
            <Spin tip="Đang tải..." />
          )}
        </Modal>
      </Card>
    </div>
  );
}

export default CompanyJobPosting;
