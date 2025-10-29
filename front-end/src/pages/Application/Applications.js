import React, { useEffect, useState, useMemo } from "react";
import { listJobApplication } from "../../services/jobApplication";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const res = await listJobApplication();
      if (res.success && user) {
        const filtered = res.jobApplications.filter(
          (a) => a.account_id === user.account_id || a.account_id === user.id
        );
        setApplications(filtered);
      }
      setLoading(false);
    };
    fetchApplications();
  }, [user]);

  if (!user)
    return (
      <div className="text-center mt-10 text-gray-600 min-h-screen pb-1">
        ⚠️ Bạn cần đăng nhập để xem các đơn ứng tuyển.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-6 min-h-screen pb-1">
      <h2 className="text-2xl font-semibold mb-6 text-blue-600 text-center">
        Danh sách đơn ứng tuyển của bạn
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải...</p>
      ) : applications.length === 0 ? (
        <p className="text-center text-gray-500">
          Bạn chưa nộp đơn ứng tuyển nào.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">STT</th>
                <th className="py-3 px-4 text-left">Công việc</th>
                <th className="py-3 px-4 text-left">CV</th>
                <th className="py-3 px-4 text-left">Thư ứng tuyển</th>
                <th className="py-3 px-4 text-left">Trạng thái</th>
                <th className="py-3 px-4 text-left">Ngày nộp</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr
                  key={app.job_application_id}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="py-2 px-4">{index + 1}</td>

                  <td
                    className="py-2 px-4 text-blue-600 hover:underline"
                    onClick={() => navigate(`/job/${app.job_posting_id}`)}
                  >
                    {/* Xem chi tiết công việc #{app.job_posting_id} */}
                    Xem chi tiết công việc
                  </td>

                  <td className="py-2 px-4 text-blue-500">
                    <a
                      href={app.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {app.file_upload}
                    </a>
                  </td>

                  <td className="py-2 px-4 text-gray-700 truncate max-w-[200px]">
                    {app.cover_letter}
                  </td>

                  <td
                    className={`py-2 px-4 font-medium ${
                      app.status === "accept"
                        ? "text-green-600"
                        : app.status === "reject"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {app.status}
                  </td>

                  <td className="py-2 px-4 text-gray-500">
                    {new Date(app.submitted_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Applications;
