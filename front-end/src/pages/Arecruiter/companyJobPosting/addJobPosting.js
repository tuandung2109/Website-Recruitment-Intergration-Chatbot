import { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  DatePicker,
  message,
  Select,
  Spin,
} from "antd";
import UseTitle from "../../../hooks/useTitle";
import { postJobPosting } from "../../../services/jobPosting";
import { listIndustry } from "../../../services/industry";
import { listSkills } from "../../../services/skill";
import { postWorkType } from "../../../services/wordType";

function AddJobPosting() {
  UseTitle("JobVip - Tạo mới Job");

  const [loading, setLoading] = useState(false);
  const [industrys, setIndustrys] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(true);
  const [form] = Form.useForm();
  const [skills, setSkills] = useState([]);
  const [skillLoading, setSkillLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const result = await listSkills();
        if (result.success) {
          setSkills(result.skills || []);
        } else {
          message.error(result.message || "Không thể tải kỹ năng");
        }
      } catch (err) {
        console.error(err);
        message.error("Lỗi khi tải danh sách kỹ năng");
      } finally {
        setSkillLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // 📍 Lấy danh sách ngành nghề khi load trang
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const result = await listIndustry();
        if (result.success) {
          setIndustrys(result.industrys || []);
        } else {
          message.error(result.message || "Không thể tải ngành nghề");
        }
      } catch (err) {
        console.error(err);
        message.error("Lỗi khi tải danh sách ngành nghề");
      } finally {
        setIndustryLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  // 📍 Submit tạo job mới
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("account"));
      console.log("✅ User data:", userData);

      if (!userData || !userData.account_id || !userData.company_id) {
        message.error("Không tìm thấy thông tin tài khoản hoặc công ty!");
        setLoading(false); // <-- tránh spinner còn kẹt
        return;
      }

      const jobData = {
        account_id: userData.account_id,
        company_id: userData.company_id,
        position_name: values.position_name,
        job_description: values.job_description,
        requirements: values.requirements, // <-- đã có dữ liệu từ form
        salary: values.salary,
        deadline: values.deadline ? values.deadline.format("YYYY-MM-DD") : null,
        experience_years: values.experience_years,
        education_level: values.education_level,
        benefits: values.benefits,
        working_time: values.working_time,
        status: "inactive",
        deleted: false,
        industry_ids: values.industry_ids || [],
        skill_ids: values.skill_ids || [], // 👈 thêm dòng này
      };

      const result = await postJobPosting(jobData);

      if (result.success) {
        message.success("🎉 Tạo mới công việc thành công!");

        // ✅ Nếu BE trả về id job vừa tạo
        const job_posting_id =
          result.job_posting?.job_posting_id || result.job_id;

        // Gọi tiếp API tạo work type nếu user nhập
        if (job_posting_id && values.work_type_name) {
          const workTypeRes = await postWorkType({
            job_posting_id,
            work_type_name: values.work_type_name,
          });

          if (workTypeRes.success) {
            message.success("✅ Thêm hình thức làm việc thành công!");
          } else {
            message.warning(
              "⚠️ Job đã tạo, nhưng thêm hình thức làm việc thất bại"
            );
          }
        }

        form.resetFields();
      } else {
        message.error(result.message || "Tạo công việc thất bại");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi hệ thống khi tạo job!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Tạo mới tin tuyển dụng
      </h2>

      {industryLoading ? (
        <Spin tip="Đang tải danh sách ngành nghề..." />
      ) : (
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Vị trí tuyển dụng"
            name="position_name"
            rules={[
              { required: true, message: "Vui lòng nhập vị trí tuyển dụng" },
            ]}
          >
            <Input placeholder="VD: Lập trình viên Frontend" />
          </Form.Item>

          <Form.Item
            label="Mô tả công việc"
            name="job_description"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả công việc" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Mô tả chi tiết công việc..."
            />
          </Form.Item>

          {/* === THÊM YÊU CẦU (requirements) === */}
          <Form.Item label="Yêu cầu" name="requirements">
            <Input.TextArea
              rows={3}
              placeholder="Kinh nghiệm, kỹ năng, chứng chỉ... (ví dụ: ít nhất 2 năm với React)"
            />
          </Form.Item>

          <Form.Item
            label="Kỹ năng"
            name="skill_ids"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một kỹ năng" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn kỹ năng"
              loading={skillLoading}
              allowClear
            >
              {skills.map((s) => (
                <Select.Option key={s.skill_id} value={s.skill_id}>
                  {s.skill_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Hình thức làm việc"
            name="work_type_name"
            rules={[
              { required: true, message: "Vui lòng nhập hình thức làm việc" },
            ]}
          >
            <Input placeholder="VD: Full-time, Part-time, Remote..." />
          </Form.Item>

          <Form.Item label="Mức lương (VNĐ)" name="salary">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Ví dụ: 15000000"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item label="Hạn nộp hồ sơ" name="deadline">
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item label="Kinh nghiệm (năm)" name="experience_years">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Trình độ học vấn" name="education_level">
            <Select placeholder="Chọn trình độ">
              <Select.Option value="Not required">Không yêu cầu</Select.Option>
              <Select.Option value="High School">Trung học</Select.Option>
              <Select.Option value="College">Cao đẳng</Select.Option>
              <Select.Option value="University">Đại học</Select.Option>
              <Select.Option value="Master">Thạc sĩ</Select.Option>
              <Select.Option value="Doctor">Tiến sĩ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Quyền lợi" name="benefits">
            <Input.TextArea
              rows={2}
              placeholder="Các quyền lợi khi làm việc..."
            />
          </Form.Item>

          <Form.Item label="Thời gian làm việc" name="working_time">
            <Input placeholder="VD: 8h00 - 17h00" />
          </Form.Item>

          {/* ✅ Ngành nghề */}
          <Form.Item
            label="Ngành nghề"
            name="industry_ids"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ít nhất một ngành nghề",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn ngành nghề liên quan"
              allowClear
            >
              {industrys.map((item) => (
                <Select.Option key={item.industry_id} value={item.industry_id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Tạo công việc
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}

export default AddJobPosting;
