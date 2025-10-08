import { useEffect, useState } from "react";
import { listCompany } from "../../services/company";
import { useNavigate } from "react-router-dom";
import UseTitle from "../../hooks/useTitle";
function Company() {
  UseTitle("JobVip - Công ty");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await listCompany();
      if (res.success) {
        setCompanies(res.companys || []);
      } else {
        setError(res.message || "Không thể tải danh sách công ty.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = companies.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 text-lg font-medium mt-10">
        {error}
      </div>
    );

  if (companies.length === 0)
    return (
      <div className="text-center text-gray-500 text-lg mt-10">
        Hiện chưa có công ty nào được đăng tải.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🌈 Hiệu ứng nền + tiêu đề */}
      <section className="relative bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 text-gray-800 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg">
            🌐 Danh sách công ty tuyển dụng
          </h2>
          <p className="text-gray-700 text-lg mt-4">
            Khám phá các công ty đang tìm kiếm nhân tài như bạn
          </p>
        </div>
      </section>

      {/* 📋 Danh sách công ty */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {currentCompanies.map((company) => (
            <div
              key={company.company_id}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={
                    company.logo_url ||
                    "https://via.placeholder.com/120x120?text=No+Logo"
                  }
                  alt={company.name}
                  className="w-24 h-24 object-contain mb-4 rounded-full bg-gray-100 p-2 group-hover:scale-110 transition-transform"
                />
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>

                <p className="text-sm text-gray-500 mt-2 line-clamp-3 h-16">
                  {company.description || "Không có mô tả chi tiết."}
                </p>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium text-gray-700">Quy mô:</span>{" "}
                    {company.size}
                  </p>
                  {company.website && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Website:
                      </span>{" "}
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate(`/company/${company.company_id}`)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 🔢 Phân trang */}
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            Trước
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-2 rounded-lg ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-white text-blue-600 border hover:bg-blue-50"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}

export default Company;
