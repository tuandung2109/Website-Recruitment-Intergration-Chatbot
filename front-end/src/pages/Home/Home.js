import { useEffect, useMemo, useState } from "react";
import UseTitle from "../../hooks/useTitle";
import { useNavigate } from "react-router-dom";
import { Building2, Sparkles, Users, Briefcase } from "lucide-react";
import { listJobsPosting } from "../../services/jobPosting";
import { getStatisticsOverview } from "../../services/statistics";

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return "Thoả thuận";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value) => {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleDateString("vi-VN");
};

const formatNumber = (value) => {
  if (typeof value !== "number") return "0";
  return value.toLocaleString("vi-VN");
};

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({ keywords: "", location: "" });
  const [jobs, setJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const account = JSON.parse(localStorage.getItem("account"));
    if (account) {
      const role = account.account_account_type?.[0]?.account_type?.role_name;
      if (role === "Admin") {
        navigate("/admin", { replace: true });
      } else if (role === "Employer") {
        navigate("/companyAdmin", { replace: true }) || navigate("/", { replace: true });
      }
    }
  }, [navigate]);

  UseTitle("JobVip - Trang chủ");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await getStatisticsOverview();
        if (response?.success && response.data) {
          setStats(response.data);
        } else {
          setStatsError(response?.message || "Không thể tải thống kê");
        }
      } catch (error) {
        setStatsError(error.message || "Không thể tải thống kê");
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchJobs = async () => {
      try {
        setJobLoading(true);
        const response = await listJobsPosting({ limit: 6 });
        if (response?.success && Array.isArray(response.jobs)) {
          setJobs(response.jobs.slice(0, 6));
        } else {
          setJobError(response?.message || "Không thể tải danh sách việc làm");
        }
      } catch (error) {
        setJobError(error.message || "Không thể tải danh sách việc làm");
      } finally {
        setJobLoading(false);
      }
    };

    fetchStats();
    fetchJobs();
  }, []);

  const statItems = useMemo(
    () => [
      { key: "totalJobPostings", label: "Việc đang tuyển", icon: Briefcase },
      { key: "totalCompanies", label: "Công ty đối tác", icon: Building2 },
      { key: "totalUsers", label: "Ứng viên tham gia", icon: Users },
      { key: "newJobPostingsThisMonth", label: "Việc mới trong tháng", icon: Sparkles },
    ],
    []
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate("/job", { state: { searchData } });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 text-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" aria-hidden />
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200 mix-blend-multiply blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-200 mix-blend-multiply blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-pink-200 mix-blend-multiply blur-3xl" />
        </div>
        <div className="relative mx-auto flex min-h-[480px] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
            Tham gia thế hệ người tìm việc mới và tải CV của bạn ngay!
          </h1>
          <p className="mb-8 max-w-3xl text-lg text-slate-700 md:text-xl">
            Tăng cơ hội được nhà tuyển dụng tìm thấy với hệ thống matching AI của JobVip.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/cv-job-matcher")}
              className="flex items-center rounded-full bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Trải nghiệm CV Matcher
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/job")}
              className="rounded-full border border-white/70 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-white/40"
            >
              Khám phá việc làm
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-5xl px-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl md:flex-row md:items-center"
        >
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="keywords">
              Vị trí mong muốn
            </label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              value={searchData.keywords}
              onChange={handleInputChange}
              placeholder="VD: Product Manager, Backend NodeJS..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="location">
              Địa điểm làm việc
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={searchData.location}
              onChange={handleInputChange}
              placeholder="Hà Nội, TP.HCM, Đà Nẵng..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-500 md:w-auto"
          >
            Tìm việc ngay
          </button>
        </form>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Những con số ấn tượng</h2>
            <p className="text-slate-500">JobVip kết nối hàng nghìn ứng viên và nhà tuyển dụng mỗi ngày.</p>
          </div>
          {statsError && !statsLoading && (
            <span className="text-sm text-rose-500">{statsError}</span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={`stat-skeleton-${index}`} className="h-32 animate-pulse rounded-2xl bg-white/80" />
              ))
            : statItems
                .filter((item) => stats && item.key in stats)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="text-sm font-medium text-slate-500">{item.label}</span>
                      </div>
                      <p className="text-3xl font-semibold text-slate-900">{formatNumber(stats?.[item.key])}</p>
                    </div>
                  );
                })}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Việc làm mới nhất</h2>
            <p className="text-slate-500">Cập nhật liên tục từ các nhà tuyển dụng uy tín.</p>
          </div>
          <button
            onClick={() => navigate("/job")}
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            Xem tất cả việc làm
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {jobLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`job-skeleton-${index}`} className="h-44 animate-pulse rounded-2xl bg-white/80" />
            ))}
          </div>
        ) : jobError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-rose-500">{jobError}</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
            Hiện chưa có việc làm nào được đăng tải. Bạn quay lại sau nhé!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => navigate(`/job/${job.id}`)}
                className="group flex h-full flex-col rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    {(job.company?.name || "JV").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-900">{job.title || "Chưa có tiêu đề"}</h3>
                    <p className="truncate text-sm text-slate-500">
                      {job.company?.name || job.company?.company_name || "Nhà tuyển dụng ẩn danh"}
                    </p>
                  </div>
                </div>
                <div className="mt-auto space-y-3 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      {formatCurrency(job.salary)}
                    </span>
                    {Array.isArray(job.workTypes) && job.workTypes.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {job.workTypes.join(" • ")}
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-3 text-sm text-slate-500">
                    {job.description || "Mô tả đang được cập nhật."}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Hạn nộp: <strong className="text-slate-600">{formatDate(job.deadline || job.create_at)}</strong>
                    </span>
                    <span>{job.company?.address || job.company?.location || "Không rõ địa điểm"}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-24 max-w-5xl px-4 pb-20">
        <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-10 text-white shadow-xl md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h3 className="text-2xl font-semibold md:text-3xl">Nhà tuyển dụng? Hợp tác cùng JobVip</h3>
            <p className="text-white/80">
              Đăng tin nhanh chóng, nhận gợi ý ứng viên từ AI và theo dõi quá trình tuyển dụng chỉ trong một bảng điều khiển.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
          >
            Bắt đầu ngay
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
