import React, { useState, useEffect } from "react";
import { addJobApplication } from "../../services/jobApplication";

// const EDU_OPTIONS = ["No Requirements", "High School", "College", "University"];

const JobApplicationModal = ({ open, onClose, job }) => {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    cvId: "",
    cvLink: "",
    yearsExp: "",
    // eduLevel: EDU_OPTIONS[0],
    file: null,
    agree: false,
  });
  const [cvList, setCvList] = useState([]);
  const [cvMode, setCvMode] = useState("select");

  // 🚫 Khóa scroll + ESC
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key == "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // 🧠 Lấy CV (demo)
  useEffect(() => {
    if (!open) return;
    (async () => {
      const account_id = Number(localStorage.getItem("account_id"));
      if (!account_id) return;
      try {
        // const res = await listMyCVs(account_id);
        // setCvList(res);
        setCvList([
          {
            cv_id: 1,
            cv_link: "https://drive.google.com/cv1",
            years_experience: 2,
            education_level: "College",
          },
        ]);
      } catch {}
    })();
  }, [open]);

  const handleChange = (key, val) => setInfo((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    const account_id = Number(localStorage.getItem("account_id"));
    if (!account_id) return alert("Bạn chưa đăng nhập");
    if (!job?.id) return alert("Thiếu thông tin công việc");
    if (!info.coverLetter.trim()) return alert("Nhập thư giới thiệu");
    if (!info.agree) return alert("Vui lòng đồng ý điều khoản");
    // if (cvMode === "select" && !info.cvId) return alert("Chọn 1 CV trước khi nộp");

    const pickedCV = cvList.find((c) => c.cv_id == info.cvId);
    const payload = {
      account_id,
      job_posting_id: job.id,
      cv_id: info.cvId ? Number(info.cvId) : 0, // ✅ Nếu không có thì gửi 0
      cover_letter: info.coverLetter,
      file_upload: info.file?.name || "none.pdf",
      file_url: pickedCV?.cv_link || info.cvLink || "N/A",
    };

    try {
      setLoading(true);
      await addJobApplication(payload);
      alert("Nộp đơn thành công!");
      onClose();
    } catch (err) {
      alert(err?.message || "Nộp đơn thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Bỏ conditional hook — chỉ render null sau hooks
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <header className="flex items-center justify-between p-5 border-b">
            <h3 className="font-semibold">
              Ứng tuyển: <span className="text-blue-600">{job?.title}</span>
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100">
              ✕
            </button>
          </header>

          {/* Nội dung form */}
          <div className="p-5 space-y-6 text-sm">
            {/* Thông tin ứng viên */}
            <section>
              <h4 className="font-semibold mb-2">Thông tin ứng viên</h4>
              <div className="grid sm:grid-cols-3 gap-3">
                {["fullName", "email", "phone"].map((k) => (
                  <input
                    key={k}
                    className="border rounded-lg px-3 py-2"
                    placeholder={
                      k === "fullName"
                        ? "Họ và tên"
                        : k === "email"
                        ? "Email"
                        : "Số điện thoại"
                    }
                    type={k === "email" ? "email" : "text"}
                    value={info[k]}
                    onChange={(e) => handleChange(k, e.target.value)}
                  />
                ))}
              </div>
            </section>

            {/* Chọn CV */}
            <section>
              <h4 className="font-semibold mb-2">Chọn CV</h4>
              <div className="flex gap-3 mb-3">
                {["select", "link"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCvMode(mode)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      cvMode === mode
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {mode === "select" ? "Chọn từ danh sách" : "Dán link CV"}
                  </button>
                ))}
              </div>

              {cvMode === "select" ? (
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={info.cvId}
                  onChange={(e) => handleChange("cvId", e.target.value)}
                >
                  <option value="">Chọn CV</option>
                  {cvList.map((cv) => (
                    <option key={cv.cv_id} value={cv.cv_id}>
                      CV #{cv.cv_id} — {cv.education_level} —{" "}
                      {cv.years_experience} năm
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://drive.google.com/..."
                  value={info.cvLink}
                  onChange={(e) => handleChange("cvLink", e.target.value)}
                />
              )}
            </section>

            {/* Thư + File */}
            <section>
              <h4 className="font-semibold mb-2">Thư giới thiệu</h4>
              <textarea
                rows={4}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Giới thiệu bản thân, lý do ứng tuyển..."
                value={info.coverLetter}
                onChange={(e) => handleChange("coverLetter", e.target.value)}
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  handleChange("file", e.target.files?.[0] || null)
                }
                className="mt-2"
              />
            </section>

            {/* Đồng ý */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={info.agree}
                onChange={(e) => handleChange("agree", e.target.checked)}
              />
              Tôi đồng ý chia sẻ thông tin ứng tuyển với nhà tuyển dụng.
            </label>

            {/* Nút */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Để sau
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Đang gửi..." : "Gửi hồ sơ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
