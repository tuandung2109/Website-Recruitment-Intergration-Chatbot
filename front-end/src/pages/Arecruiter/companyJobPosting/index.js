import { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Alert,
  Tag,
  Table,
  Button,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import UseTitle from "../../../hooks/useTitle";
import { getCompanyById } from "../../../services/company";
import {
  listJobsPosting,
  updateJobPosting,
} from "../../../services/jobPosting";

function CompanyJobPosting() {
  UseTitle("JobVip - Company Job Postings");
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [isLockModal, setIsLockModal] = useState(false);

  const [form] = Form.useForm();

  const fetchAll = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("account"));
      if (!userData || !userData.company_id) {
        setError("Không tìm thấy thông tin công ty của tài khoản này");
        setLoading(false);
        return;
      }

      const resCompany = await getCompanyById(userData.company_id);
      if (!resCompany.success) {
        setError(resCompany.message || "Không thể tải thông tin công ty");
        setLoading(false);
        return;
      }
      setCompany(resCompany.company);

      const resJobs = await listJobsPosting();
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

  const handleEdit = (job) => {
    setSelectedJob(job);
    form.setFieldsValue({
      position_name: job.title,
      job_description: job.description,
      requirements: job.requirements,
      salary: job.salary,
      deadline: job.deadline ? dayjs(job.deadline) : null,
      working_time: job.workingTime,
      status: job.status,
    });
    setIsEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      const updatedJob = {
        position_name: values.position_name,
        job_description: values.job_description,
        requirements: values.requirements,
        salary: values.salary,
        deadline: values.deadline,
        working_time: values.working_time,
        status: values.status,
      };

      const res = await updateJobPosting(
        selectedJob.id || selectedJob.job_posting_id,
        updatedJob
      );

      if (res.success) {
        message.success("Cập nhật bài đăng thành công!");
        setIsEditModal(false);
        form.resetFields();
        // ✅ Reload lại danh sách job
        await fetchAll();
      } else {
        message.error(res.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật bài đăng!");
    }
  };

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert message={error} type="error" showIcon />;
  return (
    <div className="p-6 flex flex-col items-center gap-8">
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
          rowKey="id"
          bordered
          pagination={{ pageSize: 5 }}
          columns={[
            { title: "ID", dataIndex: "id", width: 70 },
            { title: "Vị trí", dataIndex: "title" },
            {
              title: "Mức lương (VNĐ)",
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
                    style={{ background: "#8dff91" }}
                    onClick={() => {
                      setSelectedJob(record);
                      setIsViewModal(true);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    type="link"
                    style={{ background: "#eeff8d" }}
                    onClick={() => handleEdit(record)}
                  >
                    Sửa bài đăng
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

        {/* Modal Xem chi tiết */}
        <Modal
          title={`📝 Thông tin chi tiết - ${selectedJob?.title || ""}`}
          open={isViewModal}
          onCancel={() => setIsViewModal(false)}
          footer={[
            <Button key="close" onClick={() => setIsViewModal(false)}>
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
                {selectedJob.salary?.toLocaleString() || "—"} VNĐ
              </p>
              <p>
                <strong>Hạn nộp:</strong>{" "}
                {selectedJob.deadline
                  ? new Date(selectedJob.deadline).toLocaleDateString("vi-VN")
                  : "—"}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedJob.status}
              </p>
            </div>
          ) : (
            <Spin tip="Đang tải..." />
          )}
        </Modal>

        {/* Modal Sửa bài đăng */}
        <Modal
          title={`📝 Sửa bài đăng - ${selectedJob?.title || ""}`}
          open={isEditModal}
          onCancel={() => setIsEditModal(false)}
          onOk={handleUpdate}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          width={700}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="position_name"
              label="Tên vị trí"
              rules={[{ required: true, message: "Vui lòng nhập tên vị trí" }]}
            >
              <Input placeholder="Nhập tên vị trí" />
            </Form.Item>
            <Form.Item name="job_description" label="Mô tả công việc">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="requirements" label="Yêu cầu">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="salary" label="Mức lương (VNĐ)">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="deadline" label="Hạn nộp">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="working_time" label="Thời gian làm việc">
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái">
              <Select
                options={[
                  { label: "Hoạt động", value: "active" },
                  { label: "Đã khóa", value: "inactive" },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal Khóa bài đăng */}
        <Modal
          title={`⚠️ Khóa bài đăng - ${selectedJob?.title || ""}`}
          open={isLockModal}
          onCancel={() => setIsLockModal(false)}
          onOk={() => message.info("Tính năng khóa bài đang được phát triển")}
          okText="Khóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc muốn khóa bài đăng này không?</p>
        </Modal>
      </Card>
    </div>
  );
}

export default CompanyJobPosting;
