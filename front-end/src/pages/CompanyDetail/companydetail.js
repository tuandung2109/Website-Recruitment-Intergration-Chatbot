// src/pages/CompanyDetail/companydetail.js
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  Briefcase,
  DollarSign,
  ExternalLink,
  Globe,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-sky-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Đang tải thông tin công ty...
          </p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Quay lại
          </button>

          <div className="rounded-3xl border border-rose-100 bg-white p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Có lỗi xảy ra
                </h3>
                <p className="mt-1 text-sm font-medium text-rose-600">
                  {error || "Không tìm thấy công ty."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-500 hover:text-sky-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Quay lại
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex flex-col gap-10">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
              <div className="relative bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-white">
                <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
                <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative grid gap-6 px-6 py-8 md:grid-cols-[auto,1fr] md:px-10 md:py-12">
                  <div className="flex items-start justify-center md:justify-start">
                    <div className="rounded-3xl bg-white/95 p-6 shadow-lg ring-1 ring-white/30">
                      <img
                        src={company.logo_url || "https://via.placeholder.com/160?text=Logo"}
                        alt={company.name}
                        className="h-28 w-28 object-contain"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                      Công ty tuyển dụng
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                      {company.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-sm font-medium text-white/90">
                      {company.size && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                          <Users className="h-4 w-4" aria-hidden="true" />
                          {company.size}
                        </span>
                      )}
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 transition hover:bg-white/30"
                        >
                          <Globe className="h-4 w-4" aria-hidden="true" />
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 px-6 py-8 md:px-10 md:py-10">
                <div className="space-y-2">
                  <p
                    className={`text-base leading-relaxed text-slate-600 ${
                      isDescriptionExpanded ? "" : "line-clamp-4"
                    }`}
                  >
                    {company.description || "Chưa có mô tả."}
                  </p>
                  {company.description && company.description.length > 200 && (
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 underline-offset-4 transition hover:text-sky-700 hover:underline"
                    >
                      {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                      <ArrowRight
                        className={`h-4 w-4 transition ${
                          isDescriptionExpanded ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>

                {(industries.length > 0 || addresses.length > 0) && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {industries.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                            <Briefcase className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Ngành nghề
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {industries.length} lĩnh vực
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {industries.map((name, index) => (
                            <span
                              key={`industry-${index}`}
                              className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {addresses.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <MapPin className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Địa điểm hoạt động
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {addresses.length} địa điểm
                            </p>
                          </div>
                        </div>
                        <ul className="mt-3 space-y-2 text-sm font-medium text-emerald-700">
                          {addresses.map((address, index) => (
                            <li
                              key={`address-${index}`}
                              className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2"
                              title={address}
                            >
                              {address}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
                <h3 className="text-lg font-semibold text-slate-900">Thông tin nhanh</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Những thông tin quan trọng giúp bạn hiểu rõ hơn về doanh nghiệp.
                </p>
                <ul className="mt-5 space-y-4 text-sm text-slate-700">
                  <li className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                      <Users className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Quy mô công ty
                      </p>
                      <p className="font-medium text-slate-800">
                        {company.size || "Đang cập nhật"}
                      </p>
                    </div>
                  </li>
                  {company.website && (
                    <li className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                        <Globe className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Website chính thức
                        </p>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-sky-600 underline-offset-2 transition hover:text-sky-700 hover:underline"
                        >
                          {company.website.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </li>
                  )}
                  {addresses.length > 0 && (
                    <li className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Trụ sở chính
                        </p>
                        <p className="font-medium text-slate-800">
                          {addresses[0]}
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {addresses.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <MapPin className="h-5 w-5 text-sky-600" aria-hidden="true" />
                    Bản đồ vị trí
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Xem nhanh vị trí công ty trên Google Maps và lập lộ trình di chuyển.
                  </p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <iframe
                      title="Company Location"
                      width="100%"
                      height="260"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(addresses[0])}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresses[0])}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Mở Google Maps
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addresses[0])}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      Chỉ đường
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Tin tuyển dụng của {company.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Cập nhật cơ hội việc làm mới nhất từ doanh nghiệp.
                  </p>
                </div>
              </div>
              {!loadingJobs && jobs.length > 0 && (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase text-sky-600">
                  {jobs.length} vị trí
                </span>
              )}
            </div>

            {loadingJobs ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-sky-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    Đang tải tin tuyển dụng...
                  </p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-md">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Sparkles className="h-8 w-8" aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-medium text-slate-600">
                  Hiện công ty chưa có tin tuyển dụng.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <article
                    key={job.job_posting_id}
                    className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-sky-600">
                            {job.position_name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {addresses[0] || "Địa điểm đang cập nhật"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                            <DollarSign className="h-4 w-4" aria-hidden="true" />
                            {job.salary || "Thỏa thuận"}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-600">
                            <Clock3 className="h-4 w-4" aria-hidden="true" />
                            {job.working_time || "Không rõ"}
                          </span>
                          {job.experience_years != null && (
                            <span className="inline-flex items-center gap-2 rounded-2xl border border-purple-100 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-600">
                              <Sparkles className="h-4 w-4" aria-hidden="true" />
                              {job.experience_years} năm kinh nghiệm
                            </span>
                          )}
                        </div>

                        {job.deadline && (
                          <span className="inline-flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                            <CalendarDays className="h-4 w-4" aria-hidden="true" />
                            Hạn nộp: {new Date(job.deadline).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>

                      <div className="flex shrink-0 justify-end">
                        <button
                          onClick={() => navigate(`/job/${job.job_posting_id}`)}
                          className="group/cta inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-indigo-600"
                        >
                          Xem chi tiết
                          <ArrowRight
                            className="h-4 w-4 transition group-hover/cta:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;