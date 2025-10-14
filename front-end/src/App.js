import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home/Home";
import JobListings from "./pages/JobListing/JobListings";
import JobDetail from "./pages/JobDetail/JobDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Company from "./pages/Company/company";
import CompanyDetail from "./pages/CompanyDetail/companydetail";
import CV from "./pages/CV/CV";
import CVDetail from "./pages/CV/CVDetail/CVDetail";
import Applications from "./pages/Application/Applications";
import EvaluateCV from "./pages/EvaluateCV/EvaluateCV";

import "./App.css";
import AdminCompany from "./pages/Admin/Company/company";
import AdminAccount from "./pages/Admin/account";
import AdminInvoice from "./pages/Admin/invoice";
import AdminIndustry from "./pages/Admin/industry";
import AdminWorkType from "./pages/Admin/wordType";
import AdminJobPosting from "./pages/Admin/jobPosting";
import AdminSkill from "./pages/Admin/skill";

import RecruiterLayout from "./layouts/RecruiterLayout";
import CompanyInformation from "./pages/Arecruiter/companyInformation";
import CompanyJobPosting from "./pages/Arecruiter/companyJobPosting";
import AddJobPosting from "./pages/Arecruiter/companyJobPosting/addJobPosting";

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
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/cv/:id" element={<CVDetail />} />
          <Route path="/evaluate_cv" element={<EvaluateCV />} />
          <Route path="/applications" element={<Applications />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="adminCompany" element={<AdminCompany />} />
          <Route path="adminAccount" element={<AdminAccount />} />
          <Route path="adminInvoice" element={<AdminInvoice />} />
          <Route path="adminIndustry" element={<AdminIndustry />} />
          <Route path="adminWorkType" element={<AdminWorkType />} />
          <Route path="adminJobPosting" element={<AdminJobPosting />} />
          <Route path="adminSkills" element={<AdminSkill />} />
        </Route>
        <Route path="/companyAdmin" element={<RecruiterLayout />}>
          <Route path="companyInformation" element={<CompanyInformation />} />
          <Route path="companyJobPosting" element={<CompanyJobPosting />} />
          <Route path="companyAddJobPosting" element={<AddJobPosting />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
