import { useEffect, useState, useMemo } from "react";
import { listCompany } from "../../services/company";
import { useNavigate } from "react-router-dom";
import UseTitle from "../../hooks/useTitle";
import { getAgentFilters } from "../../controller/agentController";

function Company() {
  UseTitle("JobVip - Công ty");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [searchText, setSearchText] = useState("");

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

  // Lắng nghe sự kiện điều hướng từ Agent
  useEffect(() => {
    const agentFillters = getAgentFilters();
    if (agentFillters) {
      console.log("🎯 Company Page - Received agent filters:", agentFillters);

      if (agentFillters.name) {
        setSearchText(agentFillters.name);
      }

      if (agentFillters.industry) {
        setSelectedIndustry(agentFillters.industry);
      }

      if (agentFillters.location) {
        setSelectedAddress(agentFillters.location);
      }
       setCurrentPage(1);

      // Scroll to top để người dùng thấy kết quả filter
      window.scrollTo({ top: 0, behavior: "smooth" });

      console.log("✅ Agent filters applied successfully");
    }
  }, [companies]); // Chạy khi companies đã được load

      

  const { industryOptions, addressOptions } = useMemo(() => {
    const industrySet = new Set();
    const addressSet = new Set();

    (companies || []).forEach((c) => {
      if (Array.isArray(c?.company_industry)) {
        c.company_industry.forEach((ci) => {
          const name = ci?.industry?.name;
          if (name) industrySet.add(name);
        });
      }
      if (Array.isArray(c?.address)) {
        c.address.forEach((a) => {
          const detail = a?.address_detail;
          if (detail) addressSet.add(detail);
        });
      }
    });

    return {
      industryOptions: Array.from(industrySet).sort(),
      addressOptions: Array.from(addressSet).sort(),
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let data = companies;

      // 🔎 Lọc theo từ khóa (tên công ty hoặc mô tả)
    if (searchText && searchText.trim()) {
      const s = searchText.toLowerCase();
      data = data.filter((c) =>
        (c?.name || "").toLowerCase().includes(s)
      );
    }


    if (selectedIndustry) {
      data = data.filter((c) =>
        Array.isArray(c?.company_industry) &&
        c.company_industry.some(
          (ci) =>
            (ci?.industry?.name || "")
              .toLowerCase()
              .includes(selectedIndustry.toLowerCase())
        )
      );
    }

    if (selectedAddress) {
      data = data.filter((c) =>
        Array.isArray(c?.address) &&
        c.address.some((a) =>
          (a?.address_detail || "")
            .toLowerCase()
            .includes(selectedAddress.toLowerCase())
        )
      );
    }

    return data;
  }, [companies, selectedIndustry, selectedAddress , searchText]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedIndustry, selectedAddress , searchText]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative text-center max-w-7xl mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold drop-shadow-2xl mb-4">
            🌐 Danh sách công ty tuyển dụng
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Khám phá các công ty đang tìm kiếm nhân tài như bạn
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">🔍 Bộ lọc tìm kiếm</h3>
            <p className="text-sm text-gray-600 mt-1">Tìm kiếm công ty phù hợp với bạn</p>
          </div>
          
        <div className="p-6">
          <div className="grid gap-5 md:grid-cols-4">
            {/* Ô tìm kiếm */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tìm kiếm công ty
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Nhập tên công ty hoặc mô tả..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium"
                  aria-label="Tìm kiếm công ty"
                />
                {/* Icon kính lúp (bên trái) */}
                {/* <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 text-lg">🔎</span> */}
                {/* Nút xóa nhanh (bên phải) */}
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText("")}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    aria-label="Xóa tìm kiếm"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Lọc theo ngành */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lọc theo ngành nghề
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium"
              >
                <option value="">Tất cả ngành</option>
                {industryOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Lọc theo địa chỉ */}
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lọc theo địa chỉ
              </label>
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium"
              >
                <option value="">Tất cả địa chỉ</option>
                {addressOptions.map((addr) => (
                  <option key={addr} value={addr}>{addr}</option>
                ))}
              </select>
            </div> */}
            <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tìm kiếm theo địa chỉ
        </label>
        <div className="relative">
          <input
            list="address-list"
            type="text"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            placeholder="Nhập địa chỉ công ty..."
            className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-700 font-medium"
          />
          <datalist id="address-list">
            {addressOptions.map((addr) => (
              <option key={addr} value={addr} />
            ))}
          </datalist>

          {/* Nút xóa nhanh bên phải */}
          {selectedAddress && (
            <button
              type="button"
              onClick={() => setSelectedAddress("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label="Xóa địa chỉ"
              title="Xóa địa chỉ"
            >
              ✕
            </button>
          )}
        </div>
      </div>


            {/* Nút xóa bộ lọc */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedIndustry("");
                  setSelectedAddress("");
                }}
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-md hover:shadow-xl"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Dòng nhỏ hiển thị số kết quả (tuỳ chọn) */}
          <p className="text-sm text-gray-500 mt-3">
            Đang hiển thị {filteredCompanies.length} công ty
          </p>
        </div>

        </div>
      </div>

      {/* Company Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {currentCompanies.map((company) => {
            const industries = Array.isArray(company?.company_industry)
              ? company.company_industry
                  .map((ci) => ci?.industry?.name)
                  .filter(Boolean)
              : [];

            const addresses = Array.isArray(company?.address)
              ? company.address
                  .map((a) => a?.address_detail)
                  .filter(Boolean)
              : [];

            return (
              <div
                key={company.company_id}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Card Header with Gradient */}
                <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 pb-8">
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <img
                        src={
                          company.logo_url ||
                          "https://via.placeholder.com/120x120?text=No+Logo"
                        }
                        alt={company.name}
                        className="relative w-24 h-24 object-contain rounded-2xl bg-white p-3 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 -mt-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {company.name}
                  </h3>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-3 h-16 mb-4">
                    {company.description || "Không có mô tả chi tiết."}
                  </p>

                  <div className="space-y-2.5 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-xs">👥</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">Quy mô:</span> {company.size}
                      </div>
                    </div>

                    {industries.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-bold text-xs">💼</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">Ngành:</span>{" "}
                          <span className="line-clamp-2">{industries.join(", ")}</span>
                        </div>
                      </div>
                    )}

                    {addresses.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold text-xs">📍</span>
                        </div>
                        <div className="flex-1 line-clamp-2">
                          <span className="font-semibold text-gray-800">Địa chỉ:</span>{" "}
                          {addresses.join(" • ")}
                        </div>
                      </div>
                    )}

                    {company.website && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 font-bold text-xs">🌐</span>
                        </div>
                        <div className="flex-1 truncate">
                          <span className="font-semibold text-gray-800">Website:</span>{" "}
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {company.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate(`/company/${company.company_id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-3 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-md hover:shadow-lg"
            }`}
          >
            ← Trước
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`w-12 h-12 rounded-xl font-bold transition-all ${
                currentPage === i + 1
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-md"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-md hover:shadow-lg"
            }`}
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Company;