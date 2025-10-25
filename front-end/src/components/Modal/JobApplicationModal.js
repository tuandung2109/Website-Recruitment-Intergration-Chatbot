import React, { useState, useEffect } from "react";
import { addJobApplication } from "../../services/jobApplication";
import { listMyCVs } from "../../services/CV";
// import { uploadCvFile } from "../../services/CV";
import { addJobApplicationWithFile } from "../../services/jobApplication";

const JobApplicationModal = ({ open, onClose, job }) => {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    cvId: "",
    file: null,
    agree: false,
  });
  const [cvList, setCvList] = useState([]);

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

  // 🧠 Lấy danh sách CV thật của user
  useEffect(() => {
    if (!open) return;
    (async () => {
      const user = JSON.parse(localStorage.getItem("account"));
      const account_id = user?.id || user?.account_id;
      if (!account_id) return;

      try {
        const res = await listMyCVs(account_id);
        setCvList(res || []);
      } catch {
        setCvList([]);
      }
    })();
  }, [open]);

  // 🧩 Khi chọn CV hoặc file
  const handleChange = (key, val) => {
    if (key === "cvId") {
      // Khi chọn CV -> xoá file đã chọn
      setInfo((p) => ({
        ...p,
        cvId: val,
        file: null,
      }));
      return;
    }
    if (key === "file") {
      // Khi chọn file -> bỏ chọn CV
      setInfo((p) => ({
        ...p,
        file: val,
        cvId: "",
      }));
      return;
    }
    setInfo((p) => ({ ...p, [key]: val }));
  };

  // 📨 Gửi đơn ứng tuyển
  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("account"));
    const account_id = user?.id || user?.account_id;

    if (!account_id) return alert("Bạn chưa đăng nhập");
    if (!job?.id) return alert("Thiếu thông tin công việc");
    if (!info.coverLetter.trim()) return alert("Nhập thư giới thiệu");
    if (!info.agree) return alert("Vui lòng đồng ý điều khoản");
    if (!info.cvId && !info.file)
      return alert("Vui lòng chọn CV từ danh sách hoặc tải tệp mới");

    try {
      setLoading(true);
      // await addJobApplication(payload);
      if (info.cvId) {
        // 💾 Dùng CV có sẵn: gửi JSON như cũ
        const pickedCV = cvList.find((c) => c.cv_id == info.cvId);
        if (!pickedCV) {
          alert("CV đã chọn không hợp lệ");
          setLoading(false);
          return;
        }
        const payload = {
          account_id,
          job_posting_id: job.id,
          cv_id: Number(info.cvId),
          cover_letter: info.coverLetter,
          // Có thể gửi luôn 2 field dưới (tùy BE có yêu cầu hay không)
          file_upload:
            pickedCV.cv_link?.split("/").pop() ||
            `cv_${info.cvId}.pdf ` ||
            `cv_${info.cvId}.jpg ` ||
            `cv_${info.cvId}.docx `,
          file_url: pickedCV.cv_link,
        };
        await addJobApplication(payload);
      } else {
        // 📎 Tải tệp mới: gửi multipart, KHÔNG tạo bản ghi CV
        const form = new FormData();
        form.append("account_id", account_id);
        form.append("job_posting_id", job.id);
        form.append("cover_letter", info.coverLetter);
        form.append("file", info.file); // <- file gốc
        await addJobApplicationWithFile(form); // endpoint mới multipart
      }

      alert("Nộp đơn thành công!");
      onClose();
    } catch (err) {
      alert(err?.message || "Nộp đơn thất bại");
    } finally {
      setLoading(false);
    }
  };

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

            {/* CV: chọn 1 trong 2 */}
            <section>
              <h4 className="font-semibold mb-2">CV của bạn</h4>

              {/* Chọn từ danh sách */}
              <div>
                <label className="block mb-1 font-medium">
                  Chọn từ danh sách có sẵn:
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  value={info.cvId}
                  onChange={(e) => handleChange("cvId", e.target.value)}
                  disabled={!!info.file} // Nếu có file thì disable
                >
                  <option value="">-- Chọn CV --</option>
                  {cvList.length > 0 ? (
                    cvList.map((cv) => (
                      <option key={cv.cv_id} value={cv.cv_id}>
                        {cv.cv_link?.split("/").pop() ||
                          `CV #${cv.cv_id} — ${cv.education_level} — ${cv.years_experience} năm`}
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có CV nào</option>
                  )}
                </select>
              </div>

              {/* <div className="my-3 text-center text-gray-500 font-medium">Hoặc</div> */}

              {/* Tải tệp mới */}
              <div>
                <label className="block mb-1 font-medium">
                  Tải tệp CV mới:
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    handleChange("file", e.target.files?.[0] || null)
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                  disabled={!!info.cvId} // Nếu đã chọn CV có sẵn thì disable
                />
              </div>
            </section>

            {/* Thư giới thiệu */}
            <section>
              <h4 className="font-semibold mb-2">Thư giới thiệu</h4>
              <textarea
                rows={4}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Giới thiệu bản thân, lý do ứng tuyển..."
                value={info.coverLetter}
                onChange={(e) => handleChange("coverLetter", e.target.value)}
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
