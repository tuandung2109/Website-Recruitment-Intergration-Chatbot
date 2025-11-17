import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  Search,
  Shield,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { listJobApplication } from "../../services/jobApplication";
import ApplicationTimeline from "./ApplicationTimeline";

const Applications = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("account"));
    } catch {
      return null;
    }
  }, []);

  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const pendingCount = useMemo(
    () => applications.filter((app) => app.status === "pending").length,
    [applications]
  );
  const acceptedCount = useMemo(
    () => applications.filter((app) => app.status === "accept").length,
    [applications]
  );
  const rejectedCount = useMemo(
    () => applications.filter((app) => app.status === "reject").length,
    [applications]
  );

  const statSummary = useMemo(
    () => [
      {
        key: "total",
        label: "Tổng đơn",
        value: applications.length,
        icon: Briefcase,
        accentBg: "bg-sky-100",
        accentText: "text-sky-600",
        border: "border-sky-100",
      },
      {
        key: "pending",
        label: "Đang chờ",
        value: pendingCount,
        icon: Clock3,
        accentBg: "bg-amber-100",
        accentText: "text-amber-600",
        border: "border-amber-100",
      },
      {
        key: "accepted",
        label: "Đã chấp nhận",
        value: acceptedCount,
        icon: CheckCircle2,
        accentBg: "bg-emerald-100",
        accentText: "text-emerald-600",
        border: "border-emerald-100",
      },
      {
        key: "rejected",
        label: "Đã từ chối",
        value: rejectedCount,
        icon: XCircle,
        accentBg: "bg-rose-100",
        accentText: "text-rose-600",
        border: "border-rose-100",
      },
    ],
    [applications.length, pendingCount, acceptedCount, rejectedCount]
  );

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) {
        setApplications([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await listJobApplication();

        if (res.success) {
          const filtered = res.jobApplications.filter(
            (application) =>
              (application.account_id === user.account_id ||
                application.account_id === user.id) &&
              application.job_posting !== null
          );

          setApplications(filtered);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("Failed to load applications", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const handleViewTimeline = (application) => {
    setSelectedApp(application);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
          <div className="absolute -right-20 -top-16 h-40 w-40 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl" />
          <div className="relative space-y-6 px-8 py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Shield className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Yêu cầu đăng nhập</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Vui lòng đăng nhập để theo dõi trạng thái các đơn ứng tuyển mà bạn đã gửi.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-indigo-600"
            >
              <Shield className="h-5 w-5" aria-hidden="true" />
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/90 shadow-xl shadow-slate-900/5">
          <div className="absolute -right-24 top-0 h-48 w-48 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-indigo-100/50 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-slate-50/80 to-white/85" />
          <div className="relative flex flex-col gap-6 px-8 py-10 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-600">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Hành trình nghề nghiệp
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
                  Đơn ứng tuyển của tôi
                </h1>
                <p className="max-w-2xl text-base text-slate-600">
                  Theo dõi tiến trình và quản lý các đơn ứng tuyển của bạn ở một nơi duy nhất.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/job")}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-indigo-600"
            >
              <Search className="h-5 w-5 transition group-hover:scale-110" aria-hidden="true" />
              Tìm việc mới
            </button>
          </div>
        </section>

        {!loading && applications.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statSummary.map(({ key, label, value, icon: Icon, accentBg, accentText, border }) => (
              <div
                key={key}
                className={`rounded-2xl border ${border} bg-white/90 p-5 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-3xl font-semibold text-slate-900">{value}</p>
                  </div>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentBg} ${accentText}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-sky-100" />
                <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">Đang tải dữ liệu...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                <Briefcase className="h-12 w-12" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-900">Chưa có đơn ứng tuyển</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                Hãy khám phá thêm những cơ hội việc làm mới để bắt đầu hành trình nghề nghiệp của bạn.
              </p>
              <button
                onClick={() => navigate("/job")}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-indigo-600"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
                Tìm việc làm ngay
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">STT</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Công việc</th>
                    <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Tiến trình</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Trạng thái</th>
                    <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Ngày nộp</th>
                    <th className="py-4 px-6 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((application, index) => (
                    <tr key={application.job_application_id} className="transition hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sm font-semibold text-sky-600">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white">
                            <Briefcase className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => navigate(`/job/${application.job_posting_id}`)}
                              className="truncate text-left text-sm font-semibold text-slate-900 transition hover:text-sky-600"
                            >
                              {application.job_posting?.position_name || "Công việc đã bị xóa"}
                            </button>
                            <div className="mt-1 flex items-center gap-2">
                              <a
                                href={application.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 transition hover:text-sky-700"
                              >
                                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                Xem CV
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <ApplicationTimeline status={application.status} submittedAt={application.submitted_at} compact />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                            application.status === "accept"
                              ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                              : application.status === "reject"
                              ? "border border-rose-100 bg-rose-50 text-rose-600"
                              : "border border-amber-100 bg-amber-50 text-amber-600"
                          }`}
                        >
                          {application.status === "accept"
                            ? "Đã chấp nhận"
                            : application.status === "reject"
                            ? "Đã từ chối"
                            : "Đang chờ"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {new Date(application.submitted_at).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleViewTimeline(application)}
                            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:from-sky-600 hover:to-indigo-600"
                          >
                            <Eye className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-6 py-6 text-white">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <ClipboardList className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold leading-tight">Tiến trình ứng tuyển</h2>
                      <p className="text-xs text-slate-100/80">
                        Theo dõi chi tiết từng bước trong quá trình xét duyệt hồ sơ của bạn.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                    <p className="text-base font-semibold">
                      {selectedApp.job_posting?.position_name || "Công việc đã bị xóa"}
                    </p>
                    <p className="mt-1 text-xs text-slate-100/80">
                      Nộp ngày {" "}
                      {new Date(selectedApp.submitted_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Đóng</span>
                </button>
              </div>
            </div>

            <div className="max-h-[68vh] space-y-6 overflow-y-auto px-6 py-6">
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Sparkles className="h-5 w-5 text-sky-500" aria-hidden="true" />
                  Thông tin ứng tuyển
                </h3>
                <div className="mt-3 grid gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <CalendarDays className="h-4 w-4 text-sky-500" aria-hidden="true" />
                      Ngày nộp
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {new Date(selectedApp.submitted_at).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <FileText className="h-4 w-4 text-sky-500" aria-hidden="true" />
                      CV đính kèm
                    </div>
                    <a
                      href={selectedApp.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700"
                    >
                      <span className="truncate">{selectedApp.file_upload}</span>
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                {selectedApp.cover_letter && (
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Thư ứng tuyển</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {selectedApp.cover_letter}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ClipboardList className="h-5 w-5 text-sky-500" aria-hidden="true" />
                  Lộ trình ứng tuyển
                </h3>
                <div className="mt-3">
                  <ApplicationTimeline status={selectedApp.status} submittedAt={selectedApp.submitted_at} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => {
                  navigate(`/job/${selectedApp.job_posting_id}`);
                  closeModal();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:border-sky-400 hover:text-sky-700 sm:w-auto"
              >
                <Briefcase className="h-5 w-5" aria-hidden="true" />
                Xem chi tiết công việc
              </button>
              <button
                onClick={closeModal}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-indigo-600 sm:w-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
