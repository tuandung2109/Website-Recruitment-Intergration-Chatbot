import { useEffect, useState } from "react";
import {
  listAccountId,
  updateAccount,
  changePassword,
} from "../../services/account";
import { Spin, message, Modal, Form, Input } from "antd";
import { Button } from "antd";
import { User, CheckCircle, XCircle } from "lucide-react";

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
        console.log("result123123:", result);
        if (result.success && result.accounts.length > 0) {
          setAccount(result.accounts[0]);
          console.log("account123", account);
          console.log("Đã setAccount với:", result.accounts[0]);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin tip="Đang tải thông tin người dùng..." />
      </div>
    );

  if (!account)
    return (
      <p className="text-center text-gray-500 mt-10">
        Không có thông tin tài khoản
      </p>
    );

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
      message.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      formPw.resetFields();
      setIsChangePw(false);
      // Xoá thông tin đăng nhập hiện tại
      localStorage.removeItem("account");
      localStorage.removeItem("token");
      // Chuyển hướng về trang đăng nhập (điều chỉnh nếu route khác)
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } else {
      message.error(res.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </h2>
          <div className="space-x-2">
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsEdit(true)}
            >
              ✏️ Cập nhật
            </Button>
            <Button
              danger
              className="hover:bg-red-600"
              onClick={() => setIsChangePw(true)}
            >
              🔒 Đổi mật khẩu
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="space-y-4 text-gray-700">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Mã tài khoản:</span>
            <span>{account.account_id}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Email:</span>
            <span>{account.email}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Giới tính:</span>
            <span>{account.gender || "Chưa cập nhật"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Số điện thoại:</span>
            <span>{account.phone_number || "Chưa có"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Số dư:</span>
            <span>{account.amount || "Chưa có"}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Vai trò:</span>
            <span>{roleName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Trạng thái:</span>
            <span
              className={`flex items-center gap-1 ${
                account.status === "active" ? "text-green-600" : "text-red-600"
              }`}
            >
              {account.status === "active" ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Đang hoạt động
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Không hoạt động
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Modal cập nhật thông tin */}
      <Modal
        open={isEdit}
        title="Cập nhật thông tin cá nhân"
        okText="Lưu thay đổi"
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
            <Input.Password placeholder="Nhập mật khẩu cũ" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="Mật khẩu mới"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default InfoUser;
