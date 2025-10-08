import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import AdminPage from "../pages/Admin";
import UseTitle from "../hooks/useTitle";
const AdminLayout = () => {
  UseTitle(`JobVip - Admin`);
  return (
    <>
      <Header />
      <div style={{ display: "flex" }}>
        <AdminPage />

        <div style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
