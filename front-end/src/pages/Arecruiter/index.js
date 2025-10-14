import React from "react";
import { AppstoreOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom"; // ✅ import thêm

function Recruiter() {
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
      label: "Quản lý công ty",
      icon: <SettingOutlined />,
      children: [
        { key: "companyInformation", label: "Thông tin công ty" },
        { key: "10", label: "Thêm người dùng" },
      ],
    },
    {
      key: "sub4",
      label: "Quản lý bài đăng",
      icon: <SettingOutlined />,
      children: [
        { key: "companyJobPosting", label: "Danh sách công việc" },
        { key: "companyAddJobPosting", label: "Thêm loại công việc" },
      ],
    },
    {
      key: "sub42",
      label: "Quản lý đơn ứng tuyển",
      icon: <SettingOutlined />,
      children: [{ key: "job_application", label: "Danh sách Đơn ứng tuyển" }],
    },
    {
      key: "sub422",
      label: "Quản lý công việc",
      icon: <SettingOutlined />,
      children: [
        { key: "jobPosting", label: "Danh sách công việc" },
        { key: "10", label: "Thêm công việc" },
      ],
    },
  ];

  // ✅ Đưa onClick ra ngoài
  const onClick = (e) => {
    console.log("click ", e);

    // ✅ kiểm tra key của item được click
    if (e.key === "company-list") {
      navigate("/companyAdmin/adminCompany");
    }
    if (e.key === "companyInformation") {
      navigate("/companyAdmin/companyInformation");
    }
    if (e.key === "home") {
      navigate("/companyAdmin");
    }
    if (e.key === "companyJobPosting") {
      navigate("/companyAdmin/companyJobPosting");
    }
    if (e.key === "companyAddJobPosting") {
      navigate("/companyAdmin/companyAddJobPosting");
    }
    if (e.key === "job_application") {
      navigate("/companyAdmin/companyListJobPosting");
    }
  };

  return (
    <>
      <Menu
        onClick={onClick}
        style={{ width: 256 }}
        defaultSelectedKeys={["1"]}
        defaultOpenKeys={["sub1"]}
        mode="inline"
        items={items}
      />
    </>
  );
}

export default Recruiter;
