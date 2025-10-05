import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import JobListings from "./pages/JobListings";
import JobDetail from "./pages/JobDetail";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
