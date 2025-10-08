import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { _get } from "../../utils/request";
import { getCvDetail, updateCvSkills, deleteCv } from "../../services/CV";

const MyCV = () => {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  }, []);
  const navigate = useNavigate();
  const accountId = user?.id ?? user?.account_id ?? null;

  const [cvList, setCvList] = useState([]);
  const [cvSkills, setCvSkills] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [file, setFile] = useState(null);
  const [exp, setExp] = useState("");
  const [edu, setEdu] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSkills = async () => {
    const res = await _get("/skill/listSkill");
    const data = await res.json();
    if (data?.skill) setSkills(data.skill);
  };

  const loadCv = async () => {
    if (!accountId) return;
    const data = await getCvDetail(accountId);
    if (data?.cvList) setCvList(data.cvList);
    if (data?.cvSkills) setCvSkills(data.cvSkills);
  };

  useEffect(() => {
    if (!accountId) return;
    loadSkills();
    loadCv();
  }, [accountId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Hãy chọn tệp CV!");
    if (!exp) return alert("Nhập số năm kinh nghiệm!");
    if (!edu) return alert("Chọn trình độ học vấn!");
    if (selectedSkills.length === 0) return alert("Chọn ít nhất 1 kỹ năng!");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("account_id", accountId);
    formData.append("years_experience", exp);
    formData.append("education_level", edu);

    try {
      const res = await fetch("http://localhost:9000/api/cv/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!result?.cv) { alert(result?.error || "Lỗi khi tải CV!"); setSubmitting(false); return; }

      const newCvId = result.cv.cv_id;
      const skill_ids = selectedSkills.map((s) => s.value);
      const resSkill = await fetch("http://localhost:9000/api/cv/updateSkills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: newCvId, skill_ids }),
      });
      const dataSkill = await resSkill.json();
      if (dataSkill?.message) {
        alert("🎉 Tải CV thành công kèm kỹ năng!");
        setFile(null); setExp(""); setEdu(""); setSelectedSkills([]);
        loadCv();
      } else alert("CV đã lưu, nhưng cập nhật kỹ năng bị lỗi!");
    } catch (err) {
      console.error("❌ Lỗi upload:", err);
      alert("Lỗi khi tải CV!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cv_id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa CV này?")) return;
    const res = await deleteCv(cv_id);
    alert(res.message);
    loadCv();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const skillOptions = skills.map((s) => ({ value: s.skill_id, label: s.skill_name }));
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

  if (!accountId)
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">📄 CV của tôi</h1>
          <p className="text-gray-600">Hãy đăng nhập để sử dụng tính năng này.</p>
        </div>
      </div>
    );

  const alreadyHasCV = cvList.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header gradient + blobs */}
      <section className="relative bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 text-gray-900 py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">📄 CV của tôi</h1>
          <p className="mt-3 text-gray-700">
            {alreadyHasCV ? "Cập nhật trải nghiệm & kỹ năng để nổi bật hơn trước nhà tuyển dụng." : "Tải CV đầu tiên của bạn và thêm kỹ năng để bắt đầu ứng tuyển."}
          </p>
        </div>
      </section>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Upload / Edit */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">📝 {alreadyHasCV ? "Thay thế / cập nhật CV" : "Thêm CV mới"}</h2>
                  <p className="text-gray-500 text-sm mt-1">Chọn tệp, điền thông tin & gán kỹ năng</p>
                </div>
                {alreadyHasCV && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1">
                    Hiện có {cvList.length} CV
                  </span>
                )}
              </div>

              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={[
                  "mt-5 rounded-xl border-2 border-dashed p-5 transition",
                  dragOver ? "border-blue-500 bg-blue-50/60" : "border-gray-300 bg-gray-50"
                ].join(" ")}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">
                    Kéo & thả CV vào đây, hoặc <span className="font-medium text-blue-600">chọn từ máy</span>
                  </p>
                  <p className="text-xs text-gray-500">Hỗ trợ: PDF, DOC, DOCX</p>
                  <label className="mt-2 inline-flex items-center px-3 py-2 rounded-lg bg-white border text-sm cursor-pointer hover:bg-gray-50">
                    Chọn tệp
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                  {file && (
                    <p className="mt-2 text-xs text-gray-600">
                      Đã chọn: <span className="font-medium">{file.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Fields */}
              <form onSubmit={handleUpload} className="mt-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">🧭 Kinh nghiệm (năm)</label>
                    <input
                      type="number"
                      placeholder="VD: 2"
                      className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={exp}
                      onChange={(e) => setExp(e.target.value)}
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">🎓 Trình độ học vấn</label>
                    <select
                      value={edu}
                      onChange={(e) => setEdu(e.target.value)}
                      className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn trình độ --</option>
                      <option value="High School">THPT</option>
                      <option value="College">Cao đẳng</option>
                      <option value="University">Đại học</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">💡 Kỹ năng</label>
                  <Select
                    isMulti
                    options={skillOptions}
                    value={selectedSkills}
                    onChange={setSelectedSkills}
                    placeholder="Chọn kỹ năng..."
                    className="w-full"
                    classNamePrefix="rs"
                    styles={{
                      control: (base) => ({ ...base, borderRadius: 8, borderColor: "#e5e7eb" }),
                      multiValue: (base) => ({ ...base, backgroundColor: "#f3f4f6" }),
                      multiValueLabel: (base) => ({ ...base, color: "#111827" }),
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition ${submitting ? "opacity-80 cursor-not-allowed" : ""}`}
                  title={alreadyHasCV ? "Nếu backend chỉ cho 1 CV, thao tác này sẽ thay thế." : "Tải CV mới"}
                >
                  {submitting && (
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"></path>
                    </svg>
                  )}
                  {alreadyHasCV ? "Cập nhật / Thay CV" : "Upload CV"}
                </button>

                {alreadyHasCV && (
                  <p className="text-xs text-gray-500">
                    {/* Hệ thống có thể giới hạn mỗi tài khoản 1 CV. Nếu backend của bạn ép ràng buộc, thao tác upload sẽ ghi đè. */}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right: List CV */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-0 h-[80vh] flex flex-col">
              <div className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">📚 Danh sách CV của bạn</h2>
                  <span className="text-sm text-gray-500">{cvList.length} mục</span>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 flex-1 overflow-y-auto space-y-4">
                {cvList.length === 0 ? (
                  <div className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M9 8h6M4 6a2 2 0 012-2h7.172a2 2 0 011.414.586l3.828 3.828A2 2 0 0120 9.828V18a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                    <p className="mt-3 text-gray-700 font-medium">Chưa có CV nào</p>
                    <p className="text-gray-500 text-sm">Tải CV ở khung bên trái để bắt đầu.</p>
                  </div>
                ) : (
                  cvList.map((cv) => {
                    const relatedSkills = cvSkills
                      .filter((cs) => cs.cv_id === cv.cv_id)
                      .map((cs) => cs.skill.skill_name);

                    const fileName = cv.cv_link?.split("/").pop();

                    return (
                      <div
                        key={cv.cv_id}
                        className="border border-gray-200 p-5 rounded-xl bg-white hover:shadow-md transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="hidden sm:flex w-10 h-10 rounded-lg bg-blue-50 items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <div className="space-y-1">
                              <a
                                href={`http://localhost:9000${cv.cv_link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 font-semibold hover:underline break-all"
                                title={fileName}
                              >
                                {fileName}
                              </a>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                                <span>Kinh nghiệm: <span className="font-medium">{cv.years_experience ?? 0}</span> năm</span>
                                <span>Trình độ: <span className="font-medium">{cv.education_level || "-"}</span></span>
                                <span>Ngày tạo: {fmtDate(cv.created_at)}</span>
                              </div>
                              <p className="text-sm">
                                📎{" "}
                                <a
                                  href={`http://localhost:9000${cv.cv_link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  Xem CV
                                </a>
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 sm:gap-2 shrink-0">
                            <button
                              onClick={() => navigate(`/cv/${cv.cv_id}`)}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                              Chi tiết CV
                            </button>
                            <button
                              onClick={() => handleDelete(cv.cv_id)}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-4">
                          <p className="font-medium mb-2">Kỹ năng</p>
                          {relatedSkills.length > 0 ? (
                            <ul className="flex flex-wrap gap-2">
                              {relatedSkills.map((s, idx) => (
                                <li
                                  key={idx}
                                  className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs border border-gray-200"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">Chưa có kỹ năng nào.</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tips nhỏ */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          Gợi ý: dùng PDF để hiển thị ổn định hơn trên mọi thiết bị.
        </div>
      </div>
    </div>
  );
};

export default MyCV;
