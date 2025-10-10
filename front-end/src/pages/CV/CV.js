import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { _get } from "../../utils/request";
// import { getCvDetail, updateCvSkills, deleteCv } from "../../services/CV";
import { getCvDetail, updateCvSkills, deleteCv, uploadCvFile } from "../../services/CV";

const MyCV = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
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

  // ✅ Hàm chuẩn hóa URL CV
  const buildCvUrl = (link) => {
    if (!link) return null;
    if (/^https?:\/\//i.test(link)) return link; // đã là http/https
    return link.startsWith("/") ? link : `/${link}`; // dạng /uploads/xxx.pdf
  };

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

  // const handleUpload = async (e) => {
  //   e.preventDefault();
  //   if (!file) return alert("Hãy chọn tệp CV!");
  //   if (!exp) return alert("Nhập số năm kinh nghiệm!");
  //   if (!edu) return alert("Chọn trình độ học vấn!");
  //   if (selectedSkills.length === 0) return alert("Chọn ít nhất 1 kỹ năng!");

  //   setSubmitting(true);
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("account_id", accountId);
  //   formData.append("years_experience", exp);
  //   formData.append("education_level", edu);

  //   try {
  //     const res = await fetch("http://localhost:9000/api/cv/upload", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     const result = await res.json();
  //     if (!result?.cv) {
  //       alert(result?.error || "Lỗi khi tải CV!");
  //       setSubmitting(false);
  //       return;
  //     }

  //     const newCvId = result.cv.cv_id;
  //     const skill_ids = selectedSkills.map((s) => s.value);
  //     const resSkill = await fetch("http://localhost:9000/api/cv/updateSkills", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ cv_id: newCvId, skill_ids }),
  //     });
  //     const dataSkill = await resSkill.json();

  //     if (dataSkill?.message) {
  //       alert("🎉 Tải CV thành công kèm kỹ năng!");
  //       setFile(null);
  //       setExp("");
  //       setEdu("");
  //       setSelectedSkills([]);
  //       loadCv();
  //     } else {
  //       alert("CV đã lưu, nhưng cập nhật kỹ năng bị lỗi!");
  //     }
  //   } catch (err) {
  //     console.error("❌ Lỗi upload:", err);
  //     alert("Lỗi khi tải CV!");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

    const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Hãy chọn tệp CV!");
    if (!exp) return alert("Nhập số năm kinh nghiệm!");
    if (!edu) return alert("Chọn trình độ học vấn!");
    if (selectedSkills.length === 0) return alert("Chọn ít nhất 1 kỹ năng!");

    setSubmitting(true);
    try {
      // 1) Upload lên Supabase (qua backend) để nhận cv_id, cv_link
      const created = await uploadCvFile({
        account_id: accountId,
        file,
        years_experience: exp,
        education_level: edu,
      });

      // 2) Cập nhật kỹ năng cho CV vừa tạo
      const skill_ids = selectedSkills.map((s) => s.value);
      await updateCvSkills({ cv_id: created.cv_id, skill_ids });

      alert("🎉 Tải CV thành công kèm kỹ năng!");
      setFile(null);
      setExp("");
      setEdu("");
      setSelectedSkills([]);
      loadCv();
    } catch (err) {
      console.error("❌ Lỗi upload:", err);
      alert(err?.message || "Lỗi khi tải CV!");
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

  const skillOptions = skills.map((s) => ({
    value: s.skill_id,
    label: s.skill_name,
  }));
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

  if (!accountId)
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">📄 CV của tôi</h1>
          <p className="text-gray-600">
            Hãy đăng nhập để sử dụng tính năng này.
          </p>
        </div>
      </div>
    );

  const alreadyHasCV = cvList.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 text-gray-900 py-12 md:py-16 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-sm">
            📄 CV của tôi
          </h1>
          <p className="mt-3 text-gray-700">
            {alreadyHasCV
              ? "Cập nhật trải nghiệm & kỹ năng để nổi bật hơn trước nhà tuyển dụng."
              : "Tải CV đầu tiên của bạn và thêm kỹ năng để bắt đầu ứng tuyển."}
          </p>
        </div>
      </section>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Upload */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold">
                {alreadyHasCV ? "📝 Cập nhật CV" : "📝 Tải CV mới"}
              </h2>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`mt-5 rounded-xl border-2 border-dashed p-5 transition ${
                  dragOver
                    ? "border-blue-500 bg-blue-50/60"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
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

              <form onSubmit={handleUpload} className="mt-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      🧭 Kinh nghiệm (năm)
                    </label>
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
                    <label className="block text-sm font-medium mb-1">
                      🎓 Trình độ học vấn
                    </label>
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
                  <label className="block text-sm font-medium mb-1">
                    💡 Kỹ năng
                  </label>
                  <Select
                    isMulti
                    options={skillOptions}
                    value={selectedSkills}
                    onChange={setSelectedSkills}
                    placeholder="Chọn kỹ năng..."
                    className="w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition ${
                    submitting ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? "Đang tải..." : "Upload CV"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: List CV */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-0 h-[80vh] flex flex-col">
              <div className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    📚 Danh sách CV của bạn
                  </h2>
                  <span className="text-sm text-gray-500">
                    {cvList.length} mục
                  </span>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 flex-1 overflow-y-auto space-y-4">
                {cvList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
                    <p>Chưa có CV nào</p>
                  </div>
                ) : (
                  cvList.map((cv) => {
                    const relatedSkills = cvSkills
                      .filter((cs) => cs.cv_id === cv.cv_id)
                      .map((cs) => cs.skill.skill_name);

                    const fileName = cv.cv_link?.split("/").pop();
                    const cvUrl = buildCvUrl(cv.cv_link); // ✅ tính trong map

                    return (
                      <div
                        key={cv.cv_id}
                        className="border border-gray-200 p-5 rounded-xl bg-white hover:shadow-md transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <a
                              href={cvUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 font-semibold hover:underline break-all"
                              title={fileName}
                            >
                              {fileName}
                            </a>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                              <span>
                                Kinh nghiệm:{" "}
                                <span className="font-medium">
                                  {cv.years_experience ?? 0}
                                </span>{" "}
                                năm
                              </span>
                              <span>
                                Trình độ:{" "}
                                <span className="font-medium">
                                  {cv.education_level || "-"}
                                </span>
                              </span>
                              <span>Ngày tạo: {fmtDate(cv.created_at)}</span>
                            </div>
                            <p className="text-sm mt-1">
                              📎{" "}
                              <a
                                href={cvUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Xem CV
                              </a>
                            </p>
                          </div>

                          <div className="flex sm:flex-col gap-2">
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
                            <p className="text-gray-500 text-sm">
                              Chưa có kỹ năng nào.
                            </p>
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

        <div className="mt-8 text-xs text-gray-500 text-center">
          Gợi ý: dùng PDF để hiển thị ổn định hơn trên mọi thiết bị.
        </div>
      </div>
    </div>
  );
};

export default MyCV;
