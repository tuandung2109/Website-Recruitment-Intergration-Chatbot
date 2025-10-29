// src/pages/JobDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import JobApplicationModal from "../../components/Modal/JobApplicationModal";
import { listJobPostingById } from "../../services/jobPosting";
import { checkApplied } from "../../services/jobApplication";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const [isSaved, setIsSaved] = useState(false);
  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openApply, setOpenApply] = useState(false);
  
  // 🆕 State kiểm tra đã ứng tuyển
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(false);

  // Fetch job detail by id
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");

        // ✅ Gọi hàm lấy chi tiết job
        const { success, job_posting } = await listJobPostingById(id);
        if (!success || !job_posting) {
          throw new Error("Không tìm thấy công việc");
        }

        const job = job_posting;

        // console.log("📦 Chi tiết job chuẩn:", job);
        // console.log("🔍 Debug created_at:", {
        //   create_at: job.create_at,
        //   created_at: job.created_at,
        //   createdAt: job.createdAt,
        // });

        // ✅ Map dữ liệu giống format bạn muốn
        const mapped = {
          id: job.id,
          title: job.title || "Untitled",
          description: job.description || "",

          // ✅ Công ty
          company: job.company?.name || "Công ty chưa xác định",
          companyInfo: {
            name: job.company?.name || "",
            description: job.company?.description || "",
            size: job.company?.size || "",
            website: job.company?.website || "",
            logo: job.company?.logo || "",
          },

          // ✅ Địa chỉ
          location: job.company?.address || "",

          // ✅ Loại hình làm việc
          workTypes: Array.isArray(job.workTypes) ? job.workTypes : [],

          // ✅ Kỹ năng
          // skills: Array.isArray(job.skills) ? job.skills : [],

            // ✅ Kỹ năng: lấy từ job_posting_skill → skill.skill_name (JOIN từ BE)
          skills: Array.isArray(job.job_posting_skill)
            ? job.job_posting_skill
                .map((s) => s?.skill?.skill_name)
                .filter(Boolean)
            : Array.isArray(job.skills)
            ? job.skills
            : [],

          // ✅ Ngành nghề
          industries: Array.isArray(job.industries) ? job.industries : [],

          salaryRange: job.salary ? `${job.salary}` : "",
          experience:
            typeof job.experienceYears === "number"
              ? `${job.experienceYears} năm`
              : "",
          deadline: job.deadline || "",
          // ✅ Sử dụng create_at giống như JobListings
          postedDate: job.create_at || "",
          requirements: job.requirements || "",
          benefits: job.benefits || "",
        };

        setJob(mapped);

        // ✅ Optionally fetch related jobs
        const r = await fetch(
          `${process.env.REACT_APP_API_URL}/api/jobs?limit=3`
        );
        if (r.ok) {
          const j = await r.json();
          const rel = (j.jobs || [])
            .filter((it) => String(it.job_posting_id) !== String(id))
            .slice(0, 3)
            .map((it) => ({
              id: it.job_posting_id,
              title: it.position_name,
              company: mapped.company,
              salaryRange: it.salary ? `${it.salary}` : "",
            }));
          setRelatedJobs(rel);
        }
      } catch (e) {
        console.error("❌ Lỗi khi fetch chi tiết job:", e);
        setError("Không thể tải chi tiết công việc");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  // 🆕 Kiểm tra user đã ứng tuyển job này chưa
  useEffect(() => {
    const checkUserApplied = async () => {
      const account_id = localStorage.getItem("account_id");
      if (!account_id || !id) return;

      setCheckingApplied(true);
      const result = await checkApplied(id, account_id);
      setHasApplied(result.applied);
      setCheckingApplied(false);
    };

    checkUserApplied();
  }, [id]);

  // Scroll to top khi component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const getTimeAgo = (date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "";
    
    const now = new Date();
    const diff = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Hôm nay";
    if (diff === 1) return "1 ngày trước";
    if (diff < 7) return `${diff} ngày trước`;
    if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
    return `${Math.floor(diff / 30)} tháng trước`;
  };

  // Format ngày tháng cụ thể
  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "";
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleApply = () => setOpenApply(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200">
            Đang tải chi tiết công việc...
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
            {error || "Không tìm thấy công việc"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/job")}
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-100">
                  <img
                    src={job.companyInfo.logo}
                    alt={job.company || "Company logo"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                      {job.company}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {/* {job.type} */}
                      {formatDate(job.postedDate)}
                    </span>
                  </div>
                  <div className="flex items-center text-green-600 font-semibold text-xl">
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {job.salaryRange}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                  {job.workTypes && job.workTypes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.workTypes.map((wt, i) => (
                        <span
                          key={`wt-${i}`}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {wt}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.industries && job.industries.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.industries.map((ind, i) => (
                        <span
                          key={`ind-${i}`}
                          className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.skills.map((skill, i) => (
                        <span
                          key={`skill-${i}`}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 border-t pt-6">
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Đăng {getTimeAgo(job.postedDate)}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Kinh nghiệm: {job.experience}
                </span>
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Hạn nộp: {job.deadline}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex border-b">
                {["description", "requirements", "benefits"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      activeTab === tab
                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab === "description" && "Mô tả công việc"}
                    {tab === "requirements" && "Yêu cầu"}
                    {tab === "benefits" && "Quyền lợi"}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {job.description}
                    </p>
                  </div>
                )}

                {activeTab === "requirements" && (
                  <ul className="space-y-3">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {job.requirements}
                      </p>
                    </div>
                  </ul>
                )}

                {activeTab === "benefits" && (
                  <ul className="space-y-3">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {job.benefits}
                      </p>
                    </div>
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Công ty: {job.companyInfo.name}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {job.companyInfo.description}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-gray-600 text-sm">Quy mô:</span>
                    <p className="font-semibold text-gray-900">
                      {job.companyInfo.size}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Website:</span>
                    <a
                      href={`https://${job.companyInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline block"
                    >
                      {job.companyInfo.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <button
                  onClick={handleApply}
                  disabled={hasApplied || checkingApplied}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg mb-3 ${
                    hasApplied
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : checkingApplied
                      ? "bg-gray-300 text-gray-600 cursor-wait"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {checkingApplied
                    ? "Đang kiểm tra..."
                    : hasApplied
                    ? "Đã ứng tuyển"
                    : "Ứng tuyển ngay"}
                </button>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    isSaved
                      ? "bg-blue-50 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill={isSaved ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    {isSaved ? "Đã lưu" : "Lưu tin"}
                  </span>
                </button>
                {/* AI Review button removed - Chatbot will auto-suggest when user visits /job/:id/ai-review page */}
              </div>

              {relatedJobs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Công việc liên quan
                  </h3>
                  <div className="space-y-4">
                    {relatedJobs.map((rJob) => (
                      <div
                        key={rJob.id}
                        onClick={() => navigate(`/job/${rJob.id}`)}
                        className="p-4 border border-gray-200 rounded-xl hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {rJob.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {rJob.company}
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          {rJob.salaryRange}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal Ứng tuyển — để trong return, nằm cuối cùng */}
      <JobApplicationModal
        open={openApply}
        onClose={() => setOpenApply(false)}
        job={job}
      />
    </div>
  );
};

export default JobDetail;
