// src/pages/CompanyDetail/companydetail.js
import { useEffect, useState, useMemo } from "react";
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

  // Chuẩn hoá dữ liệu ngành & địa chỉ để dễ render
  const { industries, addresses } = useMemo(() => {
    const inds =
      Array.isArray(company?.company_industry)
        ? company.company_industry
            .map((ci) => ci?.industry?.name)
            .filter(Boolean)
        : [];
    const addrs =
      Array.isArray(company?.address)
        ? company.address
            .map((a) => a?.address_detail)
            .filter(Boolean)
        : [];
    return { industries: inds, addresses: addrs };
  }, [company]);

  if (loadingCompany) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="group mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-red-400 hover:shadow-lg transition-all duration-300"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-medium">Quay lại</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                <p className="text-red-600 font-medium">{error || "Không tìm thấy công ty."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Line 99 omitted */}
      <div className="py-4">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <span>←</span>
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Company Info Card - Hero Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8 hover:shadow-3xl transition-shadow duration-300">
          {/* Decorative top border */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Logo với hiệu ứng */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-25 group-hover:opacity-40 blur transition duration-300"></div>
                  <img
                    src={company.logo_url || "https://via.placeholder.com/120?text=Logo"}
                    alt={company.name}
                    className="relative w-28 h-28 object-contain rounded-full bg-gradient-to-br from-gray-50 to-gray-100 p-3 ring-4 ring-white shadow-xl"
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
                  {company.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                    <span className="text-lg">👥</span>
                    <span className="font-semibold text-gray-700">Quy mô: {company.size}</span>
                  </div>
                  
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full border border-green-200 hover:shadow-md transition-all duration-300 group"
                    >
                      <span className="text-lg">🌐</span>
                      <span className="font-medium text-green-700 group-hover:text-green-800">Website</span>
                      <span className="text-green-600 group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                  )}
                </div>

                {/* Ngành nghề chips */}
                {industries.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-600">🏢 Ngành nghề:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {industries.map((n, i) => (
                        <span
                          key={`ind-${i}`}
                          className="px-4 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-sm font-semibold ring-2 ring-purple-100 hover:ring-purple-300 hover:shadow-md transition-all duration-300 cursor-default"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Địa chỉ chips */}
                {addresses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-600">📍 Địa điểm:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {addresses.map((a, i) => (
                        <span
                          key={`addr-${i}`}
                          className="px-4 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-full text-sm font-semibold ring-2 ring-emerald-100 hover:ring-emerald-300 hover:shadow-md transition-all duration-300 cursor-default"
                          title={a}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Giới thiệu */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">Giới thiệu công ty</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {company.description || "Chưa có mô tả."}
              </p>
            </div>

            {/* Vị trí công ty trên bản đồ */}
            {addresses.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Vị trí công ty
                </h3>
                <p className="text-gray-700 mb-3">{addresses[0]}</p>
                
                {/* Google Maps Embed */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                  <iframe
                    title="Company Location"
                    width="100%"
                    height="350"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(addresses[0])}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                
                {/* Nút hành động Maps */}
                <div className="flex gap-3 mt-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[0])}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm hover:shadow-md"
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Mở Google Maps
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addresses[0])}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-sm hover:shadow-md"
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
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    Chỉ đường
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Jobs Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">
                Tin tuyển dụng của {company.name}
              </h2>
            </div>
            {!loadingJobs && jobs.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {jobs.length} vị trí
              </span>
            )}
          </div>

          {loadingJobs ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Đang tải tin tuyển dụng...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg font-medium">
                Hiện công ty chưa có tin tuyển dụng.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.job_posting_id}
                  className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {job.position_name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm">💰</span>
                          <span className="text-sm font-semibold text-green-700">
                            {job.salary || "Thỏa thuận"}
                          </span>
                        </div>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-sm">⏰</span>
                          <span className="text-sm font-semibold text-blue-700">
                            {job.working_time || "Không rõ"}
                          </span>
                        </div>
                        
                        {job.experience_years != null && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-sm">📊</span>
                            <span className="text-sm font-semibold text-purple-700">
                              {job.experience_years} năm kinh nghiệm
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {job.deadline && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
                          <span className="text-sm">📅</span>
                          <span className="text-sm font-semibold text-orange-700">
                            Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => navigate(`/job/${job.job_posting_id}`)}
                        className="w-full lg:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      >
                        Xem chi tiết →
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