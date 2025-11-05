import React from "react";
import { AppstoreOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom"; // ✅ import thêm

function AdminPage() {
  const navigate = useNavigate(); // ✅ dùng để điều hướng
  const items = [
    ,
    {
      key: "sub1",
      label: "Trang chủ",
      icon: <AppstoreOutlined />,
      children: [
        { key: "home", label: "Trang chủ" },
        { key: "6", label: "Đồ thị doanh thu CV online" },
      ],
    },
    {
      key: "sub3",
      label: "Quản lý tài khoản",
      icon: <SettingOutlined />,
      children: [
        { key: "account", label: "Danh sách người dùng" },
        { key: "10", label: "Thêm người dùng" },
      ],
    },
    {
      key: "sub4",
      label: "Quản lý loại công việc",
      icon: <SettingOutlined />,
      children: [{ key: "jobPosting", label: "Danh sách loại công việc" }],
    },
    {
      key: "sub24",
      label: "Quản lý công ty",
      icon: <SettingOutlined />,
      children: [
        { key: "company-list", label: "Danh sách công ty" }, // ✅ đổi key cho dễ nhận
      ],
    },
    {
      key: "sub5",
      label: "Quản lý kỹ năng",
      icon: <SettingOutlined />,
      children: [{ key: "skills", label: "Danh sách kỹ năng" }],
    },
    {
      key: "sub7",
      label: "Quản lý hình thức làm việc",
      icon: <SettingOutlined />,
      children: [{ key: "work_type", label: "Danh sách hình thức" }],
    },
    {
      key: "sub9",
      label: "Quản lý ngành nghề",
      icon: <SettingOutlined />,
      children: [{ key: "industry", label: "Danh sách ngành nghề" }],
    },
    {
      key: "sub10",
      label: "Quản lý gói bài đăng",
      icon: <SettingOutlined />,
      children: [
        { key: "jobPosting123", label: "Danh sách gói bài đăng" },
        { key: "10", label: "Thêm gói bài đăng" },
      ],
    },
    {
      key: "sub22",
      label: "Quản lý hóa đơn",
      icon: <SettingOutlined />,
      children: [
        { key: "invoice", label: "Lịch sử gói bài đăng" },
        { key: "10", label: "Lịch sử gói xem ứng viên" },
      ],
    },
    {
      key: "sub23",
      label: "Quản lý thống kê",
      icon: <AppstoreOutlined />,
      children: [
        { key: "statistics-overview", label: "Thống kê tổng quan" },
        { key: "statistics-accounts", label: "Thống kê tài khoản" },
        { key: "statistics-recruitment", label: "Thống kê tuyển dụng" },
        { key: "statistics-revenue", label: "Thống kê doanh thu" },
      ],
    },
  ];

  // ✅ Đưa onClick ra ngoài
  const onClick = (e) => {
    console.log("click ", e);

    // ✅ kiểm tra key của item được click
    if (e.key === "company-list") {
      navigate("/admin/adminCompany");
    }
    if (e.key === "account") {
      navigate("/admin/adminAccount");
    }
    if (e.key === "home") {
      navigate("/admin");
    }
    if (e.key === "invoice") {
      navigate("/admin/adminInvoice");
    }
    if (e.key === "industry") {
      navigate("/admin/adminIndustry");
    }
    if (e.key === "work_type") {
      navigate("/admin/adminWorkType");
    }
    if (e.key === "jobPosting") {
      navigate("/admin/adminJobPosting");
    }
    if (e.key === "skills") {
      navigate("/admin/adminSkills");
    }
    
    // ✅ Thêm navigation cho Quản lý thống kê
    if (e.key === "statistics-overview") {
      navigate("/admin/statistics/overview");
    }
    if (e.key === "statistics-accounts") {
      navigate("/admin/statistics/accounts");
    }
    if (e.key === "statistics-recruitment") {
      navigate("/admin/statistics/recruitment");
    }
    if (e.key === "statistics-revenue") {
      navigate("/admin/statistics/revenue");
    }
  };

  return (
    <Menu
      onClick={onClick}
      style={{ width: 256 }}
      defaultSelectedKeys={["1"]}
      defaultOpenKeys={["sub1"]}
      mode="inline"
      items={items}
    />
  );
}

export default AdminPage;
