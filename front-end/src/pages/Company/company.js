import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Filter,
  Globe,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";
import { listCompany } from "../../services/company";
import UseTitle from "../../hooks/useTitle";
import { getAgentFilters } from "../../controller/agentController";

function Company() {
  UseTitle("JobVip - Công ty");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
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

  // 🤖 Áp dụng agent filters khi component mount hoặc companies thay đổi
  useEffect(() => {
    const agentFillters = getAgentFilters();
    if (agentFillters) {
      console.log("🎯 Company Page - Received agent filters:", agentFillters);

      // ✅ Đảm bảo các giá trị không bao giờ là undefined
      setSearchText(agentFillters.name || "");
      setSelectedIndustry(agentFillters.industry || "");
      setSelectedAddress(agentFillters.location || "");

      setCurrentPage(1);

      // Scroll to top để người dùng thấy kết quả filter
      window.scrollTo({ top: 0, behavior: "smooth" });

      console.log("✅ Agent filters applied successfully");
    }
  }, [companies]); // Chạy khi companies đã được load

  // 🔄 Lắng nghe sự kiện navigation mới từ Agent (khi đang ở trang Company)
  useEffect(() => {
    const handleAgentNavigation = (event) => {
      if (event.detail?.filters) {
        console.log(
          "🔄 New agent filters received while on Company page:",
          event.detail.filters
        );
        const filters = event.detail.filters;

        // Áp dụng filters mới
        setSearchText(filters.name || "");
        setSelectedIndustry(filters.industry || "");
        setSelectedAddress(filters.location || "");

        setCurrentPage(1);

        // Scroll to top để người dùng thấy kết quả filter
        window.scrollTo({ top: 0, behavior: "smooth" });

        console.log("✅ New agent filters applied successfully");
      }
    };

    // Lắng nghe custom event từ agentController
    window.addEventListener("agentNavigation", handleAgentNavigation);

    return () => {
      window.removeEventListener("agentNavigation", handleAgentNavigation);
    };
  }, []); // Chỉ chạy một lần khi mount

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
    if (searchText && typeof searchText === "string" && searchText.trim()) {
      const s = searchText.toLowerCase();
      data = data.filter((c) => (c?.name || "").toLowerCase().includes(s));
    }

    // 🏭 Lọc theo ngành nghề
    if (
      selectedIndustry &&
      typeof selectedIndustry === "string" &&
      selectedIndustry.trim()
    ) {
      data = data.filter(
        (c) =>
          Array.isArray(c?.company_industry) &&
          c.company_industry.some((ci) =>
            (ci?.industry?.name || "")
              .toLowerCase()
              .includes(selectedIndustry.toLowerCase())
          )
      );
    }

    // 📍 Lọc theo địa chỉ
    if (
      selectedAddress &&
      typeof selectedAddress === "string" &&
      selectedAddress.trim()
    ) {
      data = data.filter(
        (c) =>
          Array.isArray(c?.address) &&
          c.address.some((a) =>
            (a?.address_detail || "")
              .toLowerCase()
              .includes(selectedAddress.toLowerCase())
          )
      );
    }

    return data;
  }, [companies, selectedIndustry, selectedAddress, searchText]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedIndustry, selectedAddress, searchText, itemsPerPage]);

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
    <div className="min-h-screen bg-slate-50">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-sky-100 py-20 text-slate-900">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -right-52 top-8 h-64 w-64 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-slate-200/70 blur-2xl" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm shadow-slate-200">
            <Building2 className="h-6 w-6 text-sky-600" aria-hidden="true" />
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Danh sách công ty tuyển dụng
          </h2>
          <p className="max-w-2xl text-base text-slate-600 md:text-lg">
            Khám phá những doanh nghiệp đang tìm kiếm nhân sự phù hợp với năng
            lực của bạn.
          </p>
        </div>
      </section>

      <div className="relative z-10 -mt-10 px-4">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-900/5">
          <div className="flex flex-col gap-2 border-b border-slate-100 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <Filter className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="text-left">
                <p className="text-base font-semibold text-slate-900">
                  Bộ lọc tìm kiếm
                </p>
                <p className="text-sm text-slate-500">
                  Tối ưu tìm kiếm của bạn chỉ với vài thao tác đơn giản.
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Đang hiển thị {filteredCompanies.length} công ty
            </p>
          </div>

          <div className="space-y-6 px-6 py-7">
            <div className="grid gap-5 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Tên hoặc mô tả công ty
                </label>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Nhập tên công ty bạn quan tâm"
                    aria-label="Tìm kiếm công ty"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={() => setSearchText("")}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-600"
                      aria-label="Xóa tìm kiếm"
                      title="Xóa tìm kiếm"
                    >
                      <XCircle className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Ngành nghề
                </label>
                <div className="relative mt-2">
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Tất cả ngành</option>
                    {industryOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Địa chỉ
                </label>
                <div className="relative mt-2">
                  <input
                    list="address-list"
                    type="text"
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    placeholder="Nhập địa điểm mong muốn"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <datalist id="address-list">
                    {addressOptions.map((addr) => (
                      <option key={addr} value={addr} />
                    ))}
                  </datalist>
                  {selectedAddress && (
                    <button
                      type="button"
                      onClick={() => setSelectedAddress("")}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-600"
                      aria-label="Xóa địa chỉ"
                      title="Xóa địa chỉ"
                    >
                      <XCircle className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Điều chỉnh bộ lọc để thu hẹp danh sách công ty phù hợp nhất.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="company-page-size"
                    className="text-sm font-semibold text-slate-600"
                  >
                    Số công ty/trang
                  </label>
                  <select
                    id="company-page-size"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  >
                    {[6, 9, 12, 18].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setSearchText("");
                    setSelectedIndustry("");
                    setSelectedAddress("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-500 hover:text-sky-600"
                >
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentCompanies.map((company) => {
            const industries = Array.isArray(company?.company_industry)
              ? company.company_industry
                  .map((ci) => ci?.industry?.name)
                  .filter(Boolean)
              : [];

            const addresses = Array.isArray(company?.address)
              ? company.address.map((a) => a?.address_detail).filter(Boolean)
              : [];

            return (
              <div
                key={company.company_id}
                className="group flex h-full flex-col rounded-3xl border border-slate-100 bg-white shadow-md shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative flex flex-col items-center gap-4 px-6 pb-6 pt-10">
                  <div className="absolute right-6 top-6">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                      Đang tuyển
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition group-hover:shadow">
                    <img
                      src={
                        company.logo_url ||
                        "https://via.placeholder.com/120x120?text=No+Logo"
                      }
                      alt={company.name}
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                  <h3
                    className="text-center text-lg font-semibold text-slate-900 transition group-hover:text-sky-600 line-clamp-2"
                    title={company.name}
                  >
                    {company.name}
                  </h3>
                  <p
                    className="text-center text-sm text-slate-600 line-clamp-3"
                    title={company.description}
                  >
                    {company.description || "Không có mô tả chi tiết."}
                  </p>
                </div>

                <div className="flex-1 space-y-3 px-6 pb-6 text-sm text-slate-600">
                  {[
                    {
                      key: "size",
                      icon: Users,
                      label: "Quy mô",
                      renderValue: () => (
                        <p
                          className="truncate font-medium text-slate-800"
                          title={company.size}
                        >
                          {company.size || "Đang cập nhật"}
                        </p>
                      ),
                    },
                    industries.length > 0
                      ? {
                          key: "industries",
                          icon: Briefcase,
                          label: "Ngành nghề",
                          renderValue: () => (
                            <p
                              className="line-clamp-2 font-medium text-slate-800"
                              title={industries.join(", ")}
                            >
                              {industries.join(", ")}
                            </p>
                          ),
                        }
                      : null,
                    addresses.length > 0
                      ? {
                          key: "addresses",
                          icon: MapPin,
                          label: "Địa chỉ",
                          renderValue: () => (
                            <p
                              className="line-clamp-2 font-medium text-slate-800"
                              title={addresses.join(" • ")}
                            >
                              {addresses.join(" • ")}
                            </p>
                          ),
                        }
                      : null,
                    company.website
                      ? {
                          key: "website",
                          icon: Globe,
                          label: "Website",
                          renderValue: () => (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate font-medium text-slate-800 underline-offset-2 transition hover:text-sky-600 hover:underline"
                              title={company.website}
                            >
                              {company.website.replace(/^https?:\/\//, "")}
                            </a>
                          ),
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {item.label}
                            </p>
                            {item.renderValue()}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate(`/company/${company.company_id}`)}
                    className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-indigo-600"
                  >
                    Xem chi tiết
                    <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-0.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${
                currentPage === 1
                  ? "cursor-not-allowed border-slate-200 text-slate-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-500 hover:text-sky-600"
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Trước
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                    isActive
                      ? "border-sky-500 bg-sky-500 text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-500 hover:text-sky-600"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed border-slate-200 text-slate-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-500 hover:text-sky-600"
              }`}
            >
              Sau
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Company;
