import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { _get } from "../../../utils/request";

const CVDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cv, setCv] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await _get(`/cv/listCvId/${id}`);
        const data = await res.json();
        if (!data?.cv) return setLoading(false);
        setCv(data.cv);

        const resSkill = await _get(`/cv/detail/${data.cv.account_id}`);
        const skillData = await resSkill.json();
        const list =
          skillData?.cvSkills
            ?.filter((x) => x.cv_id === Number(id))
            ?.map((x) => x.skill.skill_name) || [];
        setSkills(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const cvUrl = useMemo(
    () => (cv?.cv_link ? `http://localhost:9000${cv.cv_link}` : ""),
    [cv]
  );
  const isPdf = (cv?.cv_link || "").toLowerCase().endsWith(".pdf");

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-48" />
          <div className="h-44 bg-gray-100 rounded-2xl" />
          <div className="h-[72vh] bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          ← Quay lại
        </button>
        <div className="mt-6 p-6 rounded-2xl border bg-white">Không tìm thấy CV.</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header nhỏ */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          ← Quay lại
        </button>
        <div className="flex gap-2">
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Xem tệp gốc
          </a>
          <a
            href={cvUrl}
            download
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Tải xuống
          </a>
        </div>
      </div>

      {/* 1) Thông tin CV (trên) */}
      <section className="rounded-2xl border bg-white shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-emerald-700 mb-4">Chi tiết CV</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Tên tệp</p>
            <p className="font-semibold break-all">{cv.cv_link?.split("/").pop()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Ngày tạo</p>
            <p className="font-semibold">
              {new Date(cv.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Kinh nghiệm</p>
            <p className="font-semibold">{cv.years_experience ?? 0} năm</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Trình độ học vấn</p>
            <p className="font-semibold">{cv.education_level || "—"}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-semibold mb-2">Kỹ năng trong CV này</p>
          {skills.length ? (
            <ul className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <li
                  key={i}
                  className="px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700 border border-emerald-100"
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Chưa có kỹ năng nào.</p>
          )}
        </div>
      </section>

      {/* 2) Preview CV (dưới) */}
      <section className="rounded-2xl border bg-white shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">Xem trực tiếp CV</h2>

        {isPdf ? (
          <iframe
            src={cvUrl}
            title="CV Preview"
            className="w-full h-[72vh] rounded-xl border"
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-3">
              Tệp không phải PDF. Vui lòng mở/tải để xem.
            </p>
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Mở tệp
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default CVDetail;
