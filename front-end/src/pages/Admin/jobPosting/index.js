import { useEffect, useState } from "react";
import {
  Table,
  Spin,
  Alert,
  Button,
  Modal,
  Tag,
  message,
  Descriptions,
  Tabs,
  Divider,
} from "antd";
import {
  listJobPostingAdmin,
  unlockJobPosting,
  softJobPosting,
  listJobPostingById,
  listPendingUpdates,
  approveJobUpdate,
  rejectJobUpdate,
} from "../../../services/jobPosting";
import UseTitle from "../../../hooks/useTitle";

function AdminJobPosting() {
  UseTitle(`JobVip - AdminJobPosting`);
  const [jobPostings, setJobPosting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState([]);

  const fetchPending = async () => {
    const res = await listPendingUpdates();
    if (res.success) {
      setPendingUpdates(res.data);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPending();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await listJobPostingAdmin();
    if (res.success) {
      setJobPosting(res.jobs || []);
    } else {
      setError(res.message || "Không thể tải danh sách công việc");
    }
    setLoading(false);
  };

  // 🟡 Khóa / mở khóa bài đăng
  const handleToggleStatus = async (record) => {
    try {
      let res;

      switch (record.status) {
        case "pending":
          // Duyệt tin → active
          res = await unlockJobPosting(record.id);
          if (res.success) {
            message.success("Duyệt bài đăng thành công!");
          }
          break;

        case "active":
          // Khóa → inactive
          res = await softJobPosting(record.id);
          if (res.success) {
            message.success("Đã khóa bài đăng!");
          }
          break;

        case "off":
          // Nhà tuyển dụng đã tắt → Admin mở lại active
          res = await unlockJobPosting(record.id);
          if (res.success) {
            message.success("Đã mở lại bài đăng!");
          }
          break;

        case "inactive":
          // Admin mở khóa → active
          res = await unlockJobPosting(record.id);
          if (res.success) {
            message.success("Đã mở khóa bài đăng!");
          }
          break;

        default:
          message.warning("Trạng thái không hợp lệ!");
          return;
      }

      if (!res.success) {
        return message.error(res.message || "Lỗi thao tác trạng thái!");
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  // 🔍 Xem chi tiết bài đăng
  const handleViewDetail = async (record) => {
    setModalVisible(true);
    setModalLoading(true);
    const res = await listJobPostingById(record.id);
    if (res.success) {
      setSelectedJob(res.job_posting);
      console.log("res123123:", res);
    } else {
      message.error("Không thể tải thông tin chi tiết");
    }
    console.log("res123123:", res);
    setModalLoading(false);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      align: "center",
    },
    {
      title: "Vị trí",
      dataIndex: "title",
      key: "title",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Công ty",
      dataIndex: ["company", "name"],
      key: "company",
    },
    {
      title: "Mức lương (VND)",
      dataIndex: "salary",
      key: "salary",
      render: (s) => s?.toLocaleString() || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        if (status === "active") return <Tag color="green">Đã duyệt</Tag>;
        if (status === "pending") return <Tag color="gold">Chờ duyệt</Tag>;
        if (status === "off") return <Tag color="gold">Đã tắt</Tag>;
        return <Tag color="red">Bị khóa</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="primary"
            onClick={() => handleViewDetail(record)}
            style={{ marginRight: 8 }}
          >
            Chi tiết
          </Button>

          <Button
            danger={record.status === "active"}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === "pending"
              ? "Duyệt"
              : record.status === "active"
              ? "Khóa"
              : record.status === "off"
              ? "Mở lại"
              : "Mở khóa"}
          </Button>
        </>
      ),
    },
  ];
  const handleApproveUpdate = async (record) => {
    const res = await approveJobUpdate(record.update_id);
    if (res.success) {
      message.success("Đã duyệt bản chỉnh sửa.");
      fetchPending();
      fetchData();
    }
  };

  const handleRejectUpdate = async (record) => {
    const res = await rejectJobUpdate(record.update_id);
    if (res.success) {
      message.warning("Đã từ chối bản chỉnh sửa.");
      fetchPending();
    }
  };

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <h2 style={{ marginBottom: 16 }}>Danh sách bài đăng tuyển dụng</h2>
      <Table
        bordered
        dataSource={jobPostings}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* 🧩 Modal xem chi tiết */}
      <Modal
        open={modalVisible}
        title="Chi tiết công việc"
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={850}
      >
        {modalLoading ? (
          <Spin />
        ) : selectedJob ? (
          <>
            <Divider orientation="left">
              <b>Thông tin cơ bản</b>
            </Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Vị trí">
                {selectedJob.title}
              </Descriptions.Item>
              <Descriptions.Item label="Công ty">
                {selectedJob.company?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mức lương">
                {selectedJob.salary?.toLocaleString()} VND
              </Descriptions.Item>
              <Descriptions.Item label="Hạn nộp">
                {selectedJob.deadline}
              </Descriptions.Item>
              <Descriptions.Item label="Kinh nghiệm">
                {selectedJob.experienceYears} năm
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedJob.status === "active"
                      ? "green"
                      : selectedJob.status === "pending"
                      ? "gold"
                      : "red"
                  }
                >
                  {selectedJob.status === "active"
                    ? "Đã duyệt"
                    : selectedJob.status === "pending"
                    ? "Chờ duyệt"
                    : "Bị khóa"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <b>Chi tiết công việc</b>
            </Divider>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mô tả công việc">
                {selectedJob.description}
              </Descriptions.Item>
              <Descriptions.Item label="Yêu cầu">
                {selectedJob.requirements}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedJob.company.address}
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức làm việc">
                {selectedJob.work_type?.map((w) => w.work_type_name).join(", ")}
                {selectedJob.workTypes}
              </Descriptions.Item>
              <Descriptions.Item label="Kỹ năng yêu cầu">
                {selectedJob.job_posting_skill
                  ?.map((s) => s.skill.skill_name)
                  .join(", ")}
                {selectedJob.skills}
              </Descriptions.Item>
              <Descriptions.Item label="Ngành nghề">
                {selectedJob.industries}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Alert message="Không có dữ liệu" type="warning" />
        )}
      </Modal>
    </>
  );
}
export default AdminJobPosting;
