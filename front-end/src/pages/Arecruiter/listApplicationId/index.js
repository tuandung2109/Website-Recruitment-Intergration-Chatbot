import { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Alert,
  Table,
  Tag,
  Button,
  Modal,
  Descriptions,
  Typography,
  message,
} from "antd";
import UseTitle from "../../../hooks/useTitle";
import { sendEmail } from "../../../services/email";
import {
  listJobApplication,
  updateApplicationStatus,
} from "../../../services/jobApplication";

const { Paragraph } = Typography;

function CompanyListJobPosting() {
  UseTitle("JobVip - Company Job Applications");
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleStatusChange = async (record, newStatus) => {
    const result = await updateApplicationStatus(
      record.job_application_id,
      newStatus
    );
    if (result.success) {
      message.success(result.message);
      // Cập nhật lại danh sách đơn
      setApplications((prev) =>
        prev.map((item) =>
          item.job_application_id === record.job_application_id
            ? { ...item, status: newStatus }
            : item
        )
      );
      setIsModalOpen(false);
    } else {
      message.error(result.message);
    }
  };
  console.log(handleStatusChange);
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("account"));
        const companyId = user?.company?.company_id;

        if (!companyId) {
          setError("Không tìm thấy thông tin công ty");
          setLoading(false);
          return;
        }

        const res = await listJobApplication();

        if (res.success) {
          const filtered = res.jobApplications.filter(
            (app) => app.job_posting?.company?.company_id === companyId
          );
          setApplications(filtered);
        } else {
          setError(res.message);
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải danh sách ứng tuyển");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const showDetailModal = (record) => {
    setSelectedApp(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  // ✅ Hàm cập nhật trạng thái đơn ứng tuyển
  const handleUpdateStatus1 = async (id, newStatus) => {
    try {
      const res = await updateApplicationStatus(id, newStatus);
      if (res.success) {
        message.success(res.message);
        // Cập nhật lại trạng thái ngay trong bảng
        setApplications((prev) =>
          prev.map((app) =>
            app.job_application_id === id ? { ...app, status: newStatus } : app
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
  const handleUpdateStatus = async (id, newStatus, record) => {
    try {
      const res = await updateApplicationStatus(id, newStatus);
      if (res.success) {
        message.success(res.message);

        // ✅ Cập nhật trạng thái trong danh sách
        setApplications((prev) =>
          prev.map((app) =>
            app.job_application_id === id ? { ...app, status: newStatus } : app
          )
        );

        // ✅ Nếu là chấp nhận thì gửi email
        if (newStatus === "accepted") {
          const emailData = {
            to: record.account?.email,
            subject: "Chúc mừng! Đơn ứng tuyển của bạn đã được chấp nhận 🎉",
            html: `
            <p>Xin chào ${record.account?.email},</p>
            <p>Chúc mừng bạn! Đơn ứng tuyển vị trí <b>${record.job_posting?.position_name}</b> tại công ty <b>${record.job_posting?.company?.name}</b> đã được <b>chấp nhận</b>.</p>
            <p>Chúng tôi sẽ sớm liên hệ với bạn để trao đổi thêm chi tiết.</p>
            <p>Trân trọng,<br/>Đội ngũ JobVip</p>
          `,
          };
          const emailRes = await sendEmail(emailData);
          console.log("emailRes:", emailRes); // 👈 kiểm tra xem có success không
          if (emailRes?.success) {
            message.success("✅ Email thông báo đã được gửi cho ứng viên");
          } else {
            console.error("SendEmail error:", emailRes);
            message.warning("⚠️ Cập nhật thành công nhưng gửi email thất bại");
          }
        }
        if (newStatus === "rejected") {
          const emailData = {
            to: record.account?.email,
            subject: `Thông báo! Thân gửi bạn:  ${record.account?.email} .`,
            html: `
            <p>Xin chào ${record.account?.email},</p>
            <p>Công ty <b>${record.job_posting?.company?.name}</b> cảm ơn bạn đã quan tâm đến lời mời hợp tác của chúng tôi trong đợt tuyển dụng vị trí <b>${record.job_posting?.position_name}</b> vừa qua.  Chúng tôi rất tiếc vì hồ sơ ứng tuyển của bạn chưa phù hợp với công ty ở thời điểm hiện tại. 
            Tuy nhiên, chúng tôi xin phép lưu hồ sơ của bạn cho những đợt tuyển dụng tiếp theo. 
            Rất mong có thể hợp tác với bạn trong thời gian tới.
            </p>
            <p>Bạn vui lòng liên hệ với bộ phận Tuyển dụng qua địa chỉ email này khi cần sự trợ giúp liên quan đến thông tin việc làm từ: <b>${record.job_posting?.company?.name}</b></p>
            <p>Trân trọng,<br/>Đội ngũ JobVip</p>
          `,
          };
          const emailRes = await sendEmail(emailData);
          console.log("emailRes:", emailRes); // 👈 kiểm tra xem có success không
          if (emailRes?.success) {
            message.success("✅ Email thông báo đã được gửi cho ứng viên");
          } else {
            console.error("SendEmail error:", emailRes);
            message.warning("⚠️ Cập nhật thành công nhưng gửi email thất bại");
          }
        }
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const columns = [
    {
      title: "Ứng viên",
      dataIndex: ["account", "email"],
      key: "email",
      render: (email, record) => (
        <div>
          <div className="font-semibold">{email}</div>
          <div className="text-gray-500 text-sm">
            {record.account?.phone_number}
          </div>
        </div>
      ),
    },
    {
      title: "Vị trí ứng tuyển",
      dataIndex: ["job_posting", "position_name"],
      key: "position_name",
    },
    {
      title: "CV / File đính kèm",
      dataIndex: "file_url",
      key: "file_url",
      render: (file_url, record) =>
        file_url ? (
          <a
            style={{
              color: "blue",
              textDecoration: "underline", // 👈 gạch chân
              cursor: "pointer",
            }}
            href={
              file_url.startsWith("http")
                ? file_url
                : `${
                    process.env.REACT_APP_API_BASE || "http://localhost:9000"
                  }${file_url}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem file
          </a>
        ) : record.cv?.cv_link ? (
          <a
            href={
              record.cv.cv_link.startsWith("http")
                ? record.cv.cv_link
                : `${
                    process.env.REACT_APP_API_BASE || "http://localhost:9000"
                  }/files/${record.cv.cv_link}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem CV
          </a>
        ) : (
          <span className="text-gray-400">Không có file</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "pending"
            ? "orange"
            : status === "accepted"
            ? "green"
            : "red";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Ngày nộp",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (date) => (date ? new Date(date).toLocaleString() : ""),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const status = record.status;

        return (
          <div className="flex gap-2">
            {/* Nút Xem chi tiết */}
            <Button
              style={{ backgroundColor: "green" }}
              type="primary"
              onClick={() => showDetailModal(record)}
            >
              Xem chi tiết
            </Button>

            {/* ✅ Chỉ hiện nút khi trạng thái là pending */}
            {status === "pending" && (
              <>
                <Button
                  type="primary"
                  onClick={() =>
                    handleUpdateStatus(
                      record.job_application_id,
                      "accepted",
                      record
                    )
                  }
                >
                  Chấp nhận
                </Button>

                <Button
                  danger
                  onClick={() =>
                    handleUpdateStatus(
                      record.job_application_id,
                      "rejected",
                      record
                    )
                  }
                >
                  Từ chối
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 flex flex-col items-center gap-8 w-full">
      <Card title="📄 Danh sách đơn ứng tuyển vào công ty" className="w-full">
        {loading ? (
          <Spin tip="Đang tải dữ liệu..." />
        ) : error ? (
          <Alert message={error} type="error" />
        ) : applications.length === 0 ? (
          <Alert
            message="Chưa có đơn ứng tuyển nào vào công ty này"
            type="info"
          />
        ) : (
          <Table
            rowKey="job_application_id"
            columns={columns}
            dataSource={applications}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết đơn ứng tuyển"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedApp && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Ứng viên">
              {selectedApp.account?.email} <br />
              <span className="text-gray-500">
                {selectedApp.account?.phone_number}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Vị trí ứng tuyển">
              {selectedApp.job_posting?.position_name}
            </Descriptions.Item>

            <Descriptions.Item label="Công ty">
              {selectedApp.job_posting?.company?.name}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  selectedApp.status === "pending"
                    ? "orange"
                    : selectedApp.status === "accepted"
                    ? "green"
                    : "red"
                }
              >
                {selectedApp.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Ngày nộp">
              {new Date(selectedApp.submitted_at).toLocaleString()}
            </Descriptions.Item>

            <Descriptions.Item label="Thư xin việc">
              {selectedApp.cover_letter || <i>Không có</i>}
            </Descriptions.Item>

            <Descriptions.Item label="CV / File đính kèm">
              {selectedApp.file_url ? (
                <a
                  href={
                    selectedApp.file_url.startsWith("http")
                      ? selectedApp.file_url
                      : `${
                          process.env.REACT_APP_API_BASE ||
                          "http://localhost:9000"
                        }${selectedApp.file_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "blue" }}
                >
                  Xem file đính kèm
                </a>
              ) : selectedApp.cv?.cv_link ? (
                <a
                  href={
                    selectedApp.cv.cv_link.startsWith("http")
                      ? selectedApp.cv.cv_link
                      : `${
                          process.env.REACT_APP_API_BASE ||
                          "http://localhost:9000"
                        }/files/${selectedApp.cv.cv_link}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem CV
                </a>
              ) : (
                <span className="text-gray-400">Không có file</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Yêu cầu công việc">
              {selectedApp.job_posting?.requirements || "Không có"}
            </Descriptions.Item>

            <Descriptions.Item label="Mức lương">
              {selectedApp.job_posting?.salary
                ? `${selectedApp.job_posting.salary.toLocaleString()} USD`
                : "Không rõ"}
            </Descriptions.Item>

            <Descriptions.Item label="Mô tả công việc">
              <Paragraph
                ellipsis={{ rows: 5, expandable: true, symbol: "Xem thêm" }}
              >
                {selectedApp.job_posting?.job_description || "Không có"}
              </Paragraph>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default CompanyListJobPosting;
