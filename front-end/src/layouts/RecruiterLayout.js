import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import AdminPage from "../pages/Admin";
import UseTitle from "../hooks/useTitle";
import Recruiter from "../pages/Arecruiter";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
const RecruiterLayout = () => {
  UseTitle(`JobVip - Admin`);
  return (
    <>
      <Header />
      <div style={{ display: "flex" }}>
        <Recruiter />

        <div style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </div>
      </div>
      <Footer />
      <Chatbot />
    </>
  );
};

export default RecruiterLayout;
