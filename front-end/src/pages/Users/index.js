import { useEffect, useState } from "react";
import {
  listAccountId,
  updateAccount,
  changePassword,
} from "../../services/account";
import { Spin, Card, message, Button, Form, Input, Modal } from "antd";

function InfoUser() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [isChangePw, setIsChangePw] = useState(false);

  const [form] = Form.useForm();
  const [formPw] = Form.useForm();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("account"));
        if (!user || !user.account_id) {
          message.error("Không tìm thấy tài khoản đăng nhập!");
          setLoading(false);
          return;
        }
        const result = await listAccountId(user.account_id);
        if (result.success && result.accounts.length > 0) {
          setAccount(result.accounts[0]);
        } else message.error(result.message);
      } catch (err) {
        console.error("❌", err);
        message.error("Lỗi khi tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  if (loading) return <Spin tip="Đang tải thông tin người dùng..." />;

  if (!account) return <p>Không có thông tin tài khoản</p>;

  const roleName =
    account.account_account_type?.[0]?.account_type?.role_name ||
    "Không xác định";

  const handleUpdate = async (values) => {
    const res = await updateAccount({
      account_id: account.account_id,
      ...values,
    });
    if (res.success) {
      message.success("Cập nhật thành công!");
      setAccount({ ...account, ...values });
      setIsEdit(false);
    } else message.error(res.message);
  };

  const handleChangePassword = async (values) => {
    const res = await changePassword({
      account_id: account.account_id,
      ...values,
    });
    if (res.success) {
      message.success("Đổi mật khẩu thành công!");
      setIsChangePw(false);
      formPw.resetFields();
    } else message.error(res.message);
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <Card
        title="Thông tin cá nhân"
        bordered
        style={{ borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        extra={
          <>
            <Button type="link" onClick={() => setIsEdit(true)}>
              ✏️ Cập nhật
            </Button>
            <Button type="link" onClick={() => setIsChangePw(true)}>
              🔒 Đổi mật khẩu
            </Button>
          </>
        }
      >
        <p>
          <strong>Mã tài khoản:</strong> {account.account_id}
        </p>
        <p>
          <strong>Email:</strong> {account.email}
        </p>
        <p>
          <strong>Giới tính:</strong> {account.gender || "Chưa cập nhật"}
        </p>
        <p>
          <strong>Số điện thoại:</strong> {account.phone_number || "Chưa có"}
        </p>
        <p>
          <strong>Vai trò:</strong> {roleName}
        </p>
        <p>
          <strong>Trạng thái:</strong>{" "}
          {account.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
        </p>
      </Card>

      {/* Modal cập nhật thông tin */}
      <Modal
        open={isEdit}
        title="Cập nhật thông tin cá nhân"
        okText="Lưu"
        cancelText="Hủy"
        onCancel={() => setIsEdit(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            gender: account.gender,
            phone_number: account.phone_number,
          }}
          onFinish={handleUpdate}
        >
          <Form.Item name="gender" label="Giới tính">
            <Input placeholder="Nam / Nữ / Khác" />
          </Form.Item>
          <Form.Item name="phone_number" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal
        open={isChangePw}
        title="Đổi mật khẩu"
        okText="Đổi"
        cancelText="Hủy"
        onCancel={() => setIsChangePw(false)}
        onOk={() => formPw.submit()}
      >
        <Form form={formPw} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="old_password"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="Mật khẩu mới"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default InfoUser;
