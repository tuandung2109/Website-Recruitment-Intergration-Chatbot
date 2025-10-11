import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { filterCategories as staticFilterCategories } from "../../data/jobsData";
import { getAgentFilters } from "../../controller/agentController";
import { listJobsPosting } from "../../services/jobPosting";
import UseTitle from "../../hooks/useTitle";
import { listSkills } from "../../services/skill";

const JobListings = () => {
  UseTitle("JobVip - Việc làm");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchData, setSearchData] = useState({
    keywords: "",
    location: "",
    distance: "",
    skills: "", // ✅ thêm dòng này nếu chưa có
  });

  const [activeFilters, setActiveFilters] = useState({
    workType: [],
    salary: [],
    experience: [],
    industry: [],
    skills: [],
  });

  const [isVisible, setIsVisible] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const jobsPerPage = 5;
  const [skillOptions, setSkillOptions] = useState([]);

  // Data from API
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtersFromDb] = useState({
    workType: [],
    industry: [],
  });

  // Load filter options and fetch jobs from backend API once on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const json = await listJobsPosting();

        console.log("json123:", json);

        if (!json || !Array.isArray(json.jobs)) {
          throw new Error("Dữ liệu trả về không hợp lệ");
        }

        const mapped = json.jobs.map((j) => {
          // debug nhanh: bật lên console để thấy key thật sự
          console.log("DBG work keys:", {
            workTypes: j.workTypes,
            work_type: j.work_type,
            workingTime: j.workingTime,
            working_time: j.working_time,
          });

          // type: ưu tiên array -> map -> join, fallback sang string fields
          const type =
            Array.isArray(j.workTypes) && j.workTypes.length > 0
              ? j.workTypes.join(", ")
              : Array.isArray(j.work_type) && j.work_type.length > 0
              ? j.work_type
                  .map(
                    (w) =>
                      w.work_type_name ||
                      w.name ||
                      (w.work_type && w.work_type.work_type_name)
                  )
                  .filter(Boolean)
                  .join(", ")
              : typeof j.workingTime === "string" && j.workingTime.trim()
              ? j.workingTime.trim()
              : typeof j.working_time === "string" && j.working_time.trim()
              ? j.working_time.trim()
              : // đôi khi backend dùng workingTime là chuỗi, hoặc work_type là array, nên kiểm tra thêm
              Array.isArray(j.work_types) && j.work_types.length > 0
              ? j.work_types
                  .map((w) => w.work_type_name || w.name)
                  .filter(Boolean)
                  .join(", ")
              : "Không rõ";

          return {
            id: j.id ?? j.job_posting_id,
            title: j.title ?? j.position_name ?? "Untitled",
            company: j.company?.name || j.company || "Công ty chưa xác định",
            companyLogo:
              j.company?.logo || j.company?.logo_url || j.companyLogo || "",

            location:
              j.company?.address ||
              j.company?.address_detail ||
              j.company?.address?.[0]?.address_detail ||
              "Không rõ địa điểm",
            description: j.description || j.job_description || "",
            skills: Array.isArray(j.skills)
              ? j.skills
              : Array.isArray(j.job_posting_skill)
              ? j.job_posting_skill
                  .map((s) => s.skill?.skill_name)
                  .filter(Boolean)
              : [],
            industries: Array.isArray(j.industries)
              ? j.industries
              : Array.isArray(j.job_posting_industry)
              ? j.job_posting_industry
                  .map((i) => i.industry?.name)
                  .filter(Boolean)
              : [],
            type,
            experienceYears: j.experienceYears ?? j.experience_years ?? 0,
            salary: j.salary ?? 0,
            deadline: j.deadline || "",
          };
        });

        console.log("✅ Dữ liệu sau khi map ở FE123:", mapped);
        setJobs(mapped);
      } catch (e) {
        console.error("❌ Lỗi khi fetch jobs:", e);
        setError(e.message || "Không thể tải danh sách công việc");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // 🤖 Áp dụng agent filters khi có (từ chatbot agent mode)
  useEffect(() => {
    const agentFilters = getAgentFilters();

    if (agentFilters) {
      console.log("🤖 Agent filters detected, applying to JobListings...");

      // Áp dụng filters vào searchData
      if (agentFilters.title) {
        setSearchData((prev) => ({ ...prev, keywords: agentFilters.title }));
      }
      if (agentFilters.location) {
        setSearchData((prev) => ({ ...prev, location: agentFilters.location }));
      }

      // Áp dụng filters vào activeFilters
      if (agentFilters.workType) {
        setActiveFilters((prev) => ({
          ...prev,
          workType: [agentFilters.workType],
        }));
      }

      // Áp dụng filters vào skill
      if (agentFilters.skills) {
        setSearchData((prev) => ({
          ...prev,
          skills: Array.isArray(agentFilters.skills)
            ? agentFilters.skills.join(", ")
            : agentFilters.skills,
        }));
      }

      // Reset current page to 1 when new filters are applied
      setCurrentPage(1);

      // Scroll to top để người dùng thấy kết quả filter
      window.scrollTo({ top: 0, behavior: "smooth" });

      console.log("✅ Agent filters applied successfully");
    }
  }, [jobs]); // Chạy khi jobs đã được load

  // �� Add additional effect to handle navigation to same route
  useEffect(() => {
    // Check for agent filters on every render/mount or location change
    const checkForNewFilters = () => {
      const agentFilters = getAgentFilters();

      if (agentFilters) {
        console.log("🔄 New agent filters found on navigation check...");

        // Apply filters with a slight delay to ensure state is ready
        setTimeout(() => {
          // Áp dụng filters vào searchData
          if (agentFilters.title) {
            setSearchData((prev) => ({
              ...prev,
              keywords: agentFilters.title,
            }));
          }
          if (agentFilters.location) {
            setSearchData((prev) => ({
              ...prev,
              location: agentFilters.location,
            }));
          }

          // Áp dụng filters vào activeFilters
          if (agentFilters.workType) {
            setActiveFilters((prev) => ({
              ...prev,
              workType: [agentFilters.workType],
            }));
          }

          if (agentFilters.skills) {
            setSearchData((prev) => ({
              ...prev,
              skills: Array.isArray(agentFilters.skills)
                ? agentFilters.skills.join(", ")
                : agentFilters.skills,
            }));
          }

          // Reset current page to 1 when new filters are applied
          setCurrentPage(1);

          // Scroll to top to show filtered results
          window.scrollTo({ top: 0, behavior: "smooth" });

          console.log("✅ Agent filters re-applied on navigation");
        }, 100);
      }
    };

    checkForNewFilters();

    // Also listen for custom event when navigating from agent
    const handleAgentNavigation = () => {
      checkForNewFilters();
    };

    window.addEventListener("agentNavigation", handleAgentNavigation);

    return () => {
      window.removeEventListener("agentNavigation", handleAgentNavigation);
    };
  }, [location]); // Run on location change (same route navigation)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [
    /* reattach when list changes */ jobs,
    currentPage,
    sortBy,
    activeFilters,
    searchData,
  ]);

  useEffect(() => {
    const fetchSkillList = async () => {
      const res = await listSkills();
      if (res.success) {
        setSkillOptions(res.skills.map((s) => s.skill_name));
      } else {
        console.warn(res.message);
      }
    };
    fetchSkillList();
  }, []);

  // Hàm lọc công việc
  const filterJobs = () => {
    let filtered = [...jobs];

    // Lọc theo từ khóa
    if (searchData.keywords.trim()) {
      const keyword = searchData.keywords.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) ||
          job.company.toLowerCase().includes(keyword) ||
          job.description.toLowerCase().includes(keyword) ||
          job.skills.some((skill) => skill.toLowerCase().includes(keyword))
      );
    }

    // Lọc theo địa điểm
    if (searchData.location.trim()) {
      const location = searchData.location.toLowerCase();
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(location)
      );
    }

    // 🔍 Lọc theo kỹ năng (hỗ trợ nhiều kỹ năng, ví dụ: "React, Node")
    if (searchData.skills && searchData.skills.trim()) {
      const querySkills = searchData.skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      filtered = filtered.filter((job) => {
        const jobSkills = (Array.isArray(job.skills) ? job.skills : []).map(
          (x) => (x || "").toLowerCase()
        );
        return querySkills.some((q) => jobSkills.some((js) => js.includes(q)));
      });
    }

    // Lọc theo loại công việc (từ DB: work_types)
    if (activeFilters.workType.length > 0) {
      filtered = filtered.filter((job) => {
        const types =
          Array.isArray(job.work_types) && job.work_types.length > 0
            ? job.work_types
            : [job.type].filter(Boolean);
        return activeFilters.workType.some((t) => types.includes(t));
      });
    }

    // Lọc theo mức lương
    if (activeFilters.salary.length > 0) {
      filtered = filtered.filter((job) => {
        return activeFilters.salary.some((salaryFilter) => {
          const bucket = staticFilterCategories.salary.options.find(
            (opt) => opt.label === salaryFilter
          );
          if (!bucket) return false;
          const min = typeof bucket.min === "number" ? bucket.min : -Infinity;
          const max = typeof bucket.max === "number" ? bucket.max : Infinity;
          return job.salary >= min && job.salary <= max;
        });
      });
    }

    // Lọc theo kinh nghiệm (experience_years)
    if (activeFilters.experience.length > 0) {
      filtered = filtered.filter((job) => {
        return activeFilters.experience.some((expLabel) => {
          // Map nhãn -> khoảng số năm
          let min = 0,
            max = Infinity;
          if (expLabel === "Không yêu cầu") {
            min = 0;
            max = 0;
          } else if (expLabel === "1-2 năm") {
            min = 1;
            max = 2;
          } else if (expLabel === "2-5 năm") {
            min = 2;
            max = 5;
          } else if (expLabel === "5+ năm") {
            min = 5;
            max = Infinity;
          }
          return job.experienceYears >= min && job.experienceYears <= max;
        });
      });
    }

    // Lọc theo ngành nghề (từ DB: industries array)
    if (activeFilters.industry.length > 0) {
      filtered = filtered.filter((job) => {
        const inds = Array.isArray(job.industries) ? job.industries : [];
        return activeFilters.industry.some((i) => inds.includes(i));
      });
    }

    return filtered;
  };

  // Hàm sắp xếp
  const sortJobs = (jobs) => {
    const sorted = [...jobs];

    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => b.postedDate - a.postedDate);
      case "salary":
        return sorted.sort((a, b) => b.salary - a.salary);
      case "relevant":
        return sorted;
      default:
        return sorted;
    }
  };

  // Lấy công việc đã lọc và sắp xếp
  const filteredJobs = sortJobs(filterJobs());

  // Phân trang
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handleSearch = () => {
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleFilter = (category, value) => {
    setActiveFilters((prev) => {
      const currentFilters = prev[category];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter((f) => f !== value)
        : [...currentFilters, value];

      return { ...prev, [category]: newFilters };
    });
    setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
  };

  const clearAllFilters = () => {
    setActiveFilters({
      workType: [],
      salary: [],
      experience: [],
      industry: [],
      skills: [],
    });
    setSearchData({
      keywords: "",
      location: "",
      distance: "",
      skills: "",
    });
    setCurrentPage(1);
  };

  const removeFilter = (category, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((f) => f !== value),
    }));
    setCurrentPage(1);
  };

  // Đếm tổng số filter đang active
  const getTotalActiveFilters = () => {
    return Object.values(activeFilters).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  };

  // Format thời gian đăng
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Hôm nay";
    if (diff === 1) return "1 ngày trước";
    if (diff < 7) return `${diff} ngày trước`;
    if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
    return `${Math.floor(diff / 30)} tháng trước`;
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-200">
            Đang tải danh sách công việc...
          </div>
        </div>
      )}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        </div>
      )}

      {/* ///////////////////////////////////////// */}
      <section className="relative bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 py-16 overflow-hidden">
        {/* Background patterns and blobs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
            Tìm kiếm công việc mơ ước
          </h1>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="keywords"
                  placeholder="Từ khóa/chức danh"
                  value={searchData.keywords}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="location"
                  placeholder="Địa điểm"
                  value={searchData.location}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* ✅ Ô nhập kỹ năng gõ tự do */}
                <input
                  type="text"
                  name="skills"
                  placeholder="Nhập kỹ năng (vd: React, NodeJS...)"
                  value={searchData.skills}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  list="skills-list"
                  className="w-full pl-10 pr-10 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-400"
                />

                {/* ✅ Danh sách gợi ý (autocomplete) */}
                <datalist id="skills-list">
                  {skillOptions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>

                {/* ✅ Nút clear khi đã nhập */}
                {searchData.skills && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchData((prev) => ({ ...prev, skills: "" }));
                      setCurrentPage(1);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    title="Xóa kỹ năng"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold transform hover:scale-105 shadow-xl hover:shadow-2xl group backdrop-blur-sm"
              >
                <span className="flex items-center justify-center">
                  Tìm kiếm
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* ///////////////////////////// */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Bộ lọc{" "}
                  {getTotalActiveFilters() > 0 && (
                    <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
                      {getTotalActiveFilters()}
                    </span>
                  )}
                </h2>
                {getTotalActiveFilters() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {getTotalActiveFilters() > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([category, filters]) =>
                      filters.map((filter) => (
                        <span
                          key={`${category}-${filter}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                        >
                          {filter}
                          <button
                            onClick={() => removeFilter(category, filter)}
                            className="ml-2 hover:text-blue-900"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {staticFilterCategories.workType.name}
                </h3>
                <div className="space-y-2">
                  {(filtersFromDb.workType.length > 0
                    ? filtersFromDb.workType
                    : staticFilterCategories.workType.options
                  ).map((option) => (
                    <label
                      key={option}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.workType.includes(option)}
                        onChange={() => toggleFilter("workType", option)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-blue-600 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {staticFilterCategories.salary.name}
                </h3>
                <div className="space-y-2">
                  {staticFilterCategories.salary.options.map((option) => (
                    <label
                      key={option.label}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.salary.includes(option.label)}
                        onChange={() => toggleFilter("salary", option.label)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-blue-600 transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {staticFilterCategories.experience.name}
                </h3>
                <div className="space-y-2">
                  {staticFilterCategories.experience.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.experience.includes(option)}
                        onChange={() => toggleFilter("experience", option)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-blue-600 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {staticFilterCategories.industry.name}
                </h3>
                <div className="space-y-2">
                  {(filtersFromDb.industry.length > 0
                    ? filtersFromDb.industry
                    : staticFilterCategories.industry.options
                  ).map((option) => (
                    <label
                      key={option}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.industry.includes(option)}
                        onChange={() => toggleFilter("industry", option)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-blue-600 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:w-3/4">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Tìm thấy{" "}
                <span className="text-blue-600">{filteredJobs.length}</span>{" "}
                công việc
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Mới nhất</option>
                <option value="salary">Lương cao nhất</option>
                <option value="relevant">Phù hợp nhất</option>
              </select>
            </div>

            {currentJobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy công việc phù hợp
                </h3>
                <p className="text-gray-600 mb-6">
                  Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentJobs.map((job, index) => (
                    <div
                      key={job.id}
                      id={`job-${job.id}`}
                      data-animate
                      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:scale-[1.02] ${
                        isVisible[`job-${job.id}`]
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xl">
                                <img
                                  style={{ border: "1px solid red" }}
                                  src={
                                    job.companyLogo ||
                                    "https://placehold.co/200x200?text=No+Logo"
                                  }
                                  alt={job.company}
                                  // className="w-20 h-20 object-cover rounded-2xl"
                                />
                                {/* {job.company.charAt(0)} */}
                              </span>
                            </div>

                            <div className="flex-1">
                              <h3
                                onClick={() => navigate(`/job/${job.id}`)}
                                className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {job.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {job.type}
                              </p>
                              <p className="text-sm text-gray-600 mb-3">
                                công ty: <b>{job.company}</b>
                              </p>
                              <p className="text-gray-700 mb-4 leading-relaxed">
                                {/* {job.description} */}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {job.skills.map((skill, skillIndex) => (
                                  <span
                                    key={`skill-${skillIndex}`}
                                    className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full font-medium"
                                  >
                                    Skill: {skill}
                                  </span>
                                ))}
                                {job.industries &&
                                  job.industries.map((ind, indIndex) => (
                                    <span
                                      key={`ind-${indIndex}`}
                                      className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full font-medium"
                                    >
                                      {ind}
                                    </span>
                                  ))}
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Hạn nộp: {job.deadline}
                                </span>
                                <span className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Kinh nghiệm: {job.experienceYears}
                                </span>

                                <span className="flex items-center text-green-600 font-semibold">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {job.salary}
                                </span>

                                <span className="flex items-center text-green-600 font-semibold">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.05 3.05a7 7 0 019.9 9.9l-4.243 4.243a1 1 0 01-1.414 0L5.05 12.95a7 7 0 010-9.9zm4.95 3.45a2 2 0 100 4 2 2 0 000-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {job.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:items-end">
                          <button
                            onClick={() => navigate(`/job/${job.id}`)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                          >
                            Ứng tuyển ngay
                          </button>
                          <button className="text-gray-500 hover:text-blue-600 transition-colors">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>
                          <span className="text-sm text-gray-500 mt-2">
                            {getTimeAgo(job.postedDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                          currentPage === 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        Trước
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => paginate(pageNumber)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                currentPage === pageNumber
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <span key={pageNumber} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        Sau
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobListings;
