import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import JobListings from "./pages/JobListings";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Company from "./pages/Company/company";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes - Không có Header/Footer */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main Routes - Có Header/Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/job" element={<JobListings />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/company" element={<Company />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
