import { useEffect, useState } from "react";
import {
  Card,
  Spin,
  Alert,
  Image,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import UseTitle from "../../hooks/useTitle";
import { getCompanyById, updateCompany } from "../../services/company";
import { listJobsPosting } from "../../services/jobPosting";
import { listJobApplication } from "../../services/jobApplication";

function CompanyHome() {
  UseTitle("JobVip - Company Information");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
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

      const [resJobs, resApps] = await Promise.all([
        listJobsPosting(),
        listJobApplication(),
      ]);

      if (resJobs.success && resApps.success) {
        const jobs = resJobs.jobs.filter(
          (j) => Number(j.company.id) === Number(userData.company_id)
        );
        const apps = resApps.jobApplications.filter(
          (a) => a.job_posting?.company?.company_id === userData.company_id
        );

        const jobCountByMonth = {};
        const appCountByMonth = {};

        jobs.forEach((job) => {
          const month = new Date(job.create_at).getMonth() + 1;
          jobCountByMonth[month] = (jobCountByMonth[month] || 0) + 1;
        });

        apps.forEach((app) => {
          const month = new Date(app.submitted_at).getMonth() + 1;
          appCountByMonth[month] = (appCountByMonth[month] || 0) + 1;
        });

        const data = Array.from({ length: 12 }, (_, i) => ({
          month: `Tháng ${i + 1}`,
          jobCount: jobCountByMonth[i + 1] || 0,
          appCount: appCountByMonth[i + 1] || 0,
        }));

        setChartData(data);
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

  const handleUpdate = async (values) => {
    try {
      // ✅ Lấy dữ liệu hiện tại để giữ lại các phần chưa sửa
      const updatedData = {
        ...company,
        ...values, // dữ liệu người dùng nhập từ form (tên, website, mô tả,...)
        company_industry: company.company_industry?.map((ci) => ({
          industry: {
            industry_id: ci.industry.industry_id,
            name: ci.industry.name,
          },
        })),
        address: company.address?.map((a) => ({
          address_detail: a.address_detail,
        })),
      };

      const res = await updateCompany(company.company_id, updatedData);

      if (res.success) {
        message.success("Cập nhật thông tin công ty thành công!");
        setOpenModal(false);
        fetchAll();
      } else {
        message.error(res.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra khi cập nhật!");
    }
  };

  if (loading) return <Spin tip="Đang tải dữ liệu..." />;
  if (error) return <Alert message={error} type="error" showIcon />;

  return (
    <>
      <h3>Tổng quan công ty:</h3>
      <div className="p-6 flex flex-col items-center gap-8">
        <Card
          style={{
            maxWidth: 800,
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: 12,
          }}
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src={company?.logo_url}
                  alt="Logo công ty"
                  width={100}
                  height={100}
                  style={{
                    borderRadius: 8,
                    objectFit: "contain",
                    border: "1px solid #ddd",
                  }}
                  preview={false}
                />
                <div>
                  <h2 style={{ margin: 0 }}>{company?.name}</h2>
                  <a
                    href={company?.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 14, color: "#1890ff" }}
                  >
                    {company?.website}
                  </a>
                </div>
              </div>

              {/* 🔘 Nút cập nhật */}
              <Button
                type="primary"
                onClick={() => {
                  setOpenModal(true);
                  form.setFieldsValue({
                    name: company?.name,
                    website: company?.website,
                    description: company?.description,
                  });
                }}
              >
                Cập nhật thông tin
              </Button>
            </div>
          }
        >
          <p>
            <strong>Địa chỉ:</strong>{" "}
            {company?.address?.map((a) => a.address_detail).join(", ") || "—"}
          </p>
          <p>
            <strong>Ngành nghề:</strong>{" "}
            {company?.company_industry
              ?.map((ci) => ci.industry?.name)
              .join(", ") || "—"}
          </p>
          <p>
            <strong>Mô tả:</strong> {company?.description || "—"}
          </p>
        </Card>

        {/* 📊 Biểu đồ */}
        <Card
          title="📊 Thống kê tuyển dụng theo tháng"
          style={{ width: "100%", maxWidth: 900, borderRadius: 12 }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jobCount" fill="#8884d8" name="Bài đăng tuyển" />
              <Bar dataKey="appCount" fill="#82ca9d" name="Người ứng tuyển" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 🪄 Modal cập nhật */}
      <Modal
        title="Cập nhật thông tin công ty"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Lưu thay đổi"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="name"
            label="Tên công ty"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="website" label="Website">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default CompanyHome;
