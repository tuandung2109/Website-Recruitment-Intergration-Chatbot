// src/pages/CompanyDetail/companydetail.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCompanyById } from "../../services/company";
import { listJobsByCompany } from "../../services/jobPosting";

function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState("");

  // Tải chi tiết công ty
  useEffect(() => {
    (async () => {
      setLoadingCompany(true);
      const res = await getCompanyById(id);
      if (res.success) setCompany(res.company);
      else setError(res.message || "Không thể tải chi tiết công ty");
      setLoadingCompany(false);
    })();
  }, [id]);

  // Tải job theo công ty
  useEffect(() => {
    (async () => {
      setLoadingJobs(true);
      const res = await listJobsByCompany(id);
      if (res.success) setJobs(res.jobs || []);
      setLoadingJobs(false);
    })();
  }, [id]);

  if (loadingCompany) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          ← Quay lại
        </button>
        <p className="text-red-500">{error || "Không tìm thấy công ty."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          ← Quay lại
        </button>

        {/* Thông tin công ty */}
        <div className="bg-white rounded-2xl shadow p-6 md:p-8">
          <div className="flex items-center gap-6">
            <img
              src={
                company.logo_url || "https://via.placeholder.com/120?text=Logo"
              }
              alt={company.name}
              className="w-24 h-24 object-contain rounded-full bg-gray-100 p-2"
            />
            <div>
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <p className="text-gray-600 mt-1">Quy mô: {company.size}</p>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mt-1 inline-block"
                >
                  {company.website}
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Giới thiệu</h2>
            <p className="text-gray-700">
              {company.description || "Chưa có mô tả."}
            </p>
          </div>
        </div>

        {/* Danh sách job */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Tin tuyển dụng của {company.name}
          </h2>

          {loadingJobs ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              Đang tải tin tuyển dụng...
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-gray-600">
              Hiện công ty chưa có tin tuyển dụng.
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.job_posting_id}
                  className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {job.position_name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {job.salary
                          ? `Mức lương: ${job.salary}`
                          : "Mức lương: Thỏa thuận"}
                        {" • "}
                        {job.working_time || "Thời gian: Không rõ"}
                        {job.experience_years != null
                          ? ` • Kinh nghiệm: ${job.experience_years} năm`
                          : ""}
                      </div>
                      {job.deadline && (
                        <div className="text-sm text-gray-500 mt-1">
                          Hạn nộp: {new Date(job.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/job/${job.job_posting_id}`)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;
