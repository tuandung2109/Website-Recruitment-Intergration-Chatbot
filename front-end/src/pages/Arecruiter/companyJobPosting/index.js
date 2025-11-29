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
  Row,
  Col,
  Space,
  Collapse,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import UseTitle from "../../../hooks/useTitle";
import { getCompanyById } from "../../../services/company";
import {
  updateJobPosting,
  unlockJobPosting,
  listJobPostingsEmployer,
  offJobPosting,
  submitJobUpdate,
  deleteJobPosting,
  listJobPostingsCompany,
} from "../../../services/jobPosting";
import { listIndustry } from "../../../services/industry";
import { listSkills } from "../../../services/skill";

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

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
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  // 📌 Dữ liệu cho filter
  const [industries, setIndustries] = useState([]);
  const [industrys, setIndustrys] = useState([]);
  const [skills, setSkills] = useState([]);

  // 📌 Trạng thái filter
  const [filterParams, setFilterParams] = useState({});
  console.log(company);
  console.log(filterParams);
  const fetchAll = async (params = {}) => {
    try {
      setLoading(true);
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

      // ✅ Gọi API với filter params
      const resJobs = await listJobPostingsCompany(params);
      if (resJobs.success && Array.isArray(resJobs.jobs)) {
        const filtered = resJobs.jobs.filter(
          (job) => Number(job.company.id) === Number(userData.company_id)
        );
        setJobPostings(filtered);
      } else {
        setJobPostings([]);
        message.warning("Không có bài đăng tuyển nào");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [indRes, skillRes] = await Promise.all([
        listIndustry(),
        listSkills(),
      ]);
      if (indRes.success) setIndustries(indRes.industrys || []);
      if (skillRes.success) setSkills(skillRes.skills || []);
    } catch (err) {
      console.error("Lỗi tải filter data:", err);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchFiltersData();
  }, []);

  // ✅ Xử lý khi submit filter
  const handleFilter = (values) => {
    const params = {};
    if (values.searchText) params.searchText = values.searchText;
    if (values.status) params.status = values.status;
    if (values.salaryMin) params.salaryMin = values.salaryMin;
    if (values.salaryMax) params.salaryMax = values.salaryMax;
    if (values.deadlineRange && values.deadlineRange[0]) {
      params.deadlineFrom = values.deadlineRange[0].format("YYYY-MM-DD");
    }
    if (values.deadlineRange && values.deadlineRange[1]) {
      params.deadlineTo = values.deadlineRange[1].format("YYYY-MM-DD");
    }
    if (values.industryIds && values.industryIds.length > 0) {
      params.industryIds = values.industryIds.join(",");
    }
    if (values.skillIds && values.skillIds.length > 0) {
      params.skillIds = values.skillIds.join(",");
    }

    setFilterParams(params);
    fetchAll(params);
  };
  // ✅ Reset filter
  const handleResetFilter = () => {
    filterForm.resetFields();
    setFilterParams({});
    fetchAll();
  };
  console.log("selectedJob", selectedJob);
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
      deleted: job.deleted,
      account_id: job.account.account_id,
      company_id: job.company.company_id,
      benefits: job.benefits,
      education_level: job.educationLevel,
      experience_years: job.experienceYears,
      skillIds: job.skills
        ? job.skills.map((s) => s.skill_name ?? s.skill_id ?? String(s))
        : job.skill_names
        ? job.skill_names
        : [],
      industryIds: job.industrys
        ? job.industrys.map(
            (s) => s.industry_name ?? s.industry_id ?? String(s)
          )
        : job.industry_name
        ? job.industry_name
        : [],
    });
    setIsEditModal(true);
  };
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      // Filter skill_ids - chỉ giữ các ID hợp lệ (số và > 0)
      const validSkillIds = (values.skillIds || [])
        .filter((id) => id && !isNaN(parseInt(id)))
        .map((id) => parseInt(id));
      const validIndustryIds = (values.industryIds || [])
        .filter((id) => id && !isNaN(parseInt(id)))
        .map((id) => parseInt(id));

      const updateData = {
        position_name: values.position_name,
        job_description: values.job_description,
        requirements: values.requirements,
        salary: values.salary,
        deadline: values.deadline?.format("YYYY-MM-DD"),
        working_time: values.working_time,
        benefits: values.benefits,
        education_level: values.education_level,
        experience_years: values.experience_years,
        skill_ids: validSkillIds,
        industry_ids: validIndustryIds,
        status: "inactive", // Chờ duyệt từ admin
      };

      console.log("📤 Gửi dữ liệu:", updateData);
      console.log("📤 Job ID:", selectedJob.id || selectedJob.job_posting_id);

      // Cập nhật job posting
      const submitRes = await submitJobUpdate(
        selectedJob.id || selectedJob.job_posting_id,
        updateData
      );

      console.log("📥 Phản hồi từ server:", submitRes);

      if (submitRes && submitRes.success) {
        message.success(
          "Yêu cầu chỉnh sửa đã được gửi lên admin. Vui lòng chờ duyệt!"
        );

        // Cập nhật dữ liệu trên UI với status inactive
        const updated = {
          ...selectedJob,
          title: updateData.position_name || selectedJob.title,
          description: updateData.job_description || selectedJob.description,
          requirements: updateData.requirements || selectedJob.requirements,
          salary:
            updateData.salary !== undefined
              ? updateData.salary
              : selectedJob.salary,
          deadline: updateData.deadline || selectedJob.deadline,
          workingTime: updateData.working_time || selectedJob.workingTime,
          benefits: updateData.benefits || selectedJob.benefits,
          educationLevel:
            updateData.education_level || selectedJob.educationLevel,
          experienceYears:
            updateData.experience_years !== undefined
              ? updateData.experience_years
              : selectedJob.experienceYears,
          status: "inactive", // Đánh dấu chờ duyệt
        };

        setJobPostings((prev) =>
          prev.map((j) =>
            j.id === (selectedJob.id || selectedJob.job_posting_id)
              ? updated
              : j
          )
        );
        setSelectedJob(updated);
        setIsEditModal(false);
        form.resetFields();
        // Reload dữ liệu để đảm bảo consistency
        await fetchAll(filterParams);
      } else {
        message.error(submitRes?.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      message.error("Lỗi khi cập nhật bài đăng!");
    }
  };
  const handleToggleStatus = async (job) => {
    try {
      if (job.status === "pending") {
        return message.warning(
          "Tin đang chờ duyệt, không thể thay đổi trạng thái"
        );
      }
      if (job.status === "inactive") {
        return message.error("Tin này đã bị admin khóa, bạn không thể mở lại");
      }
      // Nếu tin đang active → tắt tin
      if (job.status === "active") {
        const res = await offJobPosting(job.id || job.job_posting_id);
        if (res.success) {
          message.success("Tắt tin thành công!");
          await fetchAll();
        } else {
          message.error(res.message || "Tắt tin thất bại!");
        }
        return;
      }
      // Nếu tin đang off → mở lại tin
      if (job.status === "off") {
        const res = await unlockJobPosting(job.id || job.job_posting_id);
        if (res.success) {
          message.success("Mở tin thành công!");
          await fetchAll();
        } else {
          message.error(res.message || "Mở tin thất bại!");
        }
        return;
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi thao tác trạng thái!");
    }
  };
  // Xử lý xóa job posting
  const handleDelete = (job) => {
    setSelectedJob(job);
    setIsDeleteModal(true);
  };
  const handleConfirmDelete = async () => {
    try {
      if (!selectedJob) return;
      const res = await deleteJobPosting(
        selectedJob.id || selectedJob.job_posting_id
      );
      if (res.success) {
        message.success("Xóa job posting thành công!");
        setIsDeleteModal(false);
        setSelectedJob(null);
        await fetchAll();
      } else {
        message.error(res.message || "Xóa job posting thất bại!");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi xóa job posting!");
    }
  };
  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert message={error} type="error" showIcon />;
  return (
    <div className="p-6 flex flex-col items-center gap-8">
      <Card
        style={{
          maxWidth: 1200,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
        title="💼 Danh sách bài đăng tuyển dụng của công ty"
      >
        {/* 🔍 BỘ LỌC */}
        <Collapse
          defaultActiveKey={["1"]}
          style={{ marginBottom: 20 }}
          expandIcon={({ isActive }) => (
            <FilterOutlined rotate={isActive ? 90 : 0} />
          )}
        >
          <Panel header="🔍 Bộ lọc tìm kiếm" key="1">
            <Form
              form={filterForm}
              layout="vertical"
              onFinish={handleFilter}
              autoComplete="off"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="searchText" label="Tìm kiếm theo tên vị trí">
                    <Input
                      placeholder="Nhập tên vị trí..."
                      prefix={<SearchOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select placeholder="Chọn trạng thái" allowClear>
                      <Select.Option value="active">
                        <Tag color="green">Active</Tag>
                      </Select.Option>
                      <Select.Option value="inactive">
                        <Tag color="red">Inactive</Tag>
                      </Select.Option>
                      <Select.Option value="pending">
                        <Tag color="orange">Pending</Tag>
                      </Select.Option>
                      <Select.Option value="off">
                        <Tag color="gray">Off</Tag>
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="deadlineRange" label="Hạn nộp hồ sơ">
                    <RangePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder={["Từ ngày", "Đến ngày"]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="salaryMin" label="Lương tối thiểu (VNĐ)">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Ví dụ: 10000000"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="salaryMax" label="Lương tối đa (VNĐ)">
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Ví dụ: 30000000"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="industryIds" label="Ngành nghề">
                    <Select
                      mode="multiple"
                      placeholder="Chọn ngành nghề"
                      allowClear
                      maxTagCount={2}
                    >
                      {industries.map((ind) => (
                        <Select.Option
                          key={ind.industry_id}
                          value={ind.industry_id}
                        >
                          {ind.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="skillIds" label="Kỹ năng">
                    <Select
                      mode="multiple"
                      placeholder="Chọn kỹ năng"
                      allowClear
                      maxTagCount={2}
                    >
                      {skills.map((skill) => (
                        <Select.Option
                          key={skill.skill_id}
                          value={skill.skill_id}
                        >
                          {skill.skill_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  Tìm kiếm
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
                  Đặt lại
                </Button>
              </Space>
            </Form>
          </Panel>
        </Collapse>

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
              width: 120,
              align: "center",
              render: (_, record) => {
                const menuItems = [
                  {
                    key: "view",
                    label: "📝 Xem chi tiết",
                    onClick: () => {
                      setSelectedJob(record);
                      setIsViewModal(true);
                    },
                  },
                  {
                    key: "toggle",
                    label:
                      record.status === "active" ? "🔴 Tắt tin" : "🟢 Mở tin",
                    onClick: () => handleToggleStatus(record),
                    disabled:
                      record.status === "pending" ||
                      record.status === "inactive",
                  },
                  {
                    key: "edit",
                    label: "✏️ Gửi yêu cầu chỉnh sửa",
                    onClick: () => handleEdit(record),
                    disabled: record.status === "pending",
                  },
                  {
                    key: "candidates",
                    label: "👥 Xem ứng viên",
                    onClick: () => {
                      navigate(
                        `/companyAdmin/job-postings/${record.id}/candidates`
                      );
                    },
                  },
                  {
                    type: "divider",
                  },
                  {
                    key: "delete",
                    label: "🗑️ Xóa bài đăng",
                    onClick: () => handleDelete(record),
                    danger: true,
                  },
                ];

                return (
                  <Dropdown
                    menu={{ items: menuItems }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button type="primary" icon={<MoreOutlined />}>
                      Thao tác
                    </Button>
                  </Dropdown>
                );
              },
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
              <p>
                <strong>Ngày tạo:</strong> {selectedJob.create_at}
              </p>
              <p>
                <strong>Ngày cập nhật:</strong> {selectedJob.update_at}
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
            {/* Skills: show existing and allow adding new skills */}
            <Form.Item name="skillIds" label="Kỹ năng yêu cầu">
              <Select
                mode="multiple"
                placeholder="Chọn kỹ năng"
                options={skills.map((s) => ({
                  value: s.skill_id,
                  label: s.skill_name,
                }))}
              />
            </Form.Item>
            <Form.Item name="industryIds" label="Ngành nghề">
              <Select
                mode="multiple"
                placeholder="Chọn ngành nghề"
                options={industries.map((ind) => ({
                  value: ind.industry_id,
                  label: ind.name,
                }))}
              />
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
            <Form.Item name="benefits" label="Quyền lợi">
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

            <Form.Item name="education_level" label="education_level">
              <Input />
            </Form.Item>
            <Form.Item name="experience_years" label="experience_years">
              <Input />
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

        {/* Modal Xác nhận xóa */}
        <Modal
          title={`🗑️ Xóa bài đăng - ${selectedJob?.title || ""}`}
          open={isDeleteModal}
          onCancel={() => {
            setIsDeleteModal(false);
            setSelectedJob(null);
          }}
          onOk={handleConfirmDelete}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>
            ⚠️ Bạn có chắc chắn muốn xóa bài đăng này không?
          </p>
          <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
            Hành động này không thể hoàn tác! Bài đăng sẽ bị xóa vĩnh viễn khỏi
            hệ thống.
          </p>
          {selectedJob && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                background: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              <p>
                <strong>Vị trí:</strong> {selectedJob.title}
              </p>
              <p>
                <strong>ID:</strong>{" "}
                {selectedJob.id || selectedJob.job_posting_id}
              </p>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
}
export default CompanyJobPosting;
