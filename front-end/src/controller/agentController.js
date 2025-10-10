/**
 * Agent Controller - Điều hướng và xử lý filter trên website tuyển dụng
 * 
 * Controller này chịu trách nhiệm:
 * 1. Điều hướng người dùng đến các trang khác nhau dựa trên intent
 * 2. Áp dụng các bộ lọc (filters) cho trang tìm kiếm công việc
 * 3. Tích hợp với chatbot agent mode để xử lý tự động
 */

/**
 * Hàm xử lý intent và điều hướng người dùng
 * 
 * @param {string} intent - Intent từ AI agent (ví dụ: "intent_jd", "intent_company", etc.)
 * @param {function} navigate - Hook useNavigate() từ react-router-dom
 * @param {object} filters - Object chứa các bộ lọc (optional)
 * 
 * Cách sử dụng:
 * const navigate = useNavigate();
 * handleIntent("intent_jd", navigate, { title: "Backend", location: "Hà Nội" });
 */
export const handleIntent = (intent, navigate, filters = null) => {
  console.log("🎯 Agent Controller - Processing intent:", intent);
  console.log("📦 Filters received:", filters);

  switch (intent) {
    case "intent_jd":
      // Intent tìm kiếm công việc (Job Description)
      console.log("✅ Navigating to /job page...");

      // Nếu có filters, lưu vào sessionStorage để trang /job có thể đọc
      if (filters && Object.keys(filters).length > 0) {
        sessionStorage.setItem("agentFilters", JSON.stringify(filters));
        console.log("💾 Filters saved to sessionStorage");
      }

      // Điều hướng đến trang danh sách công việc
      navigate("/job");

      // Dispatch custom event to notify JobListings component about new filters
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('agentNavigation', {
          detail: { filters, intent }
        }));
      }, 100);
      break;

    case "intent_company_info":
      // Intent tìm hiểu về công ty
      if (filters && Object.keys(filters).length > 0) {
        sessionStorage.setItem("agentFilters", JSON.stringify(filters));
        console.log("💾 Filters saved to sessionStorage");
      }
      console.log("✅ Navigating to /company page...");
      navigate("/company");

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('agentNavigation', {
          detail: { filters, intent }
        }));
      }, 100);
      break;

    case "intent_login":
      // Intent về đăng nhập
      console.log("✅ Navigating to /login page...");
      navigate("/login");
      break;

    case "intent_register":
      // Intent về đăng ký
      console.log("✅ Navigating to /register page...");
      navigate("/register");
      break;

    case "intent_forgot-password":
      // Intent về quên mật khẩu
      console.log("✅ Navigating to /forgot-password page...");
      navigate("/forgot-password");
      break;
      
    case "intent_applications":
      // Intent về hồ sơ ứng tuyển
      console.log("✅ Navigating to /applications page...");
      navigate("/applications");
      break;

    default:
      // Intent không được xử lý
      console.log("⚠️ Intent not handled:", intent);
      console.log("ℹ️ Available intents: intent_jd, intent_company, intent_cv, intent_support");
      break;
  }
};

/**
 * Hàm áp dụng bộ lọc cho danh sách công việc
 * 
 * @param {Array} jobsData - Mảng chứa danh sách tất cả công việc
 * @param {Object} filters - Object chứa các tiêu chí lọc
 * @returns {Array} - Mảng công việc đã được lọc
 * 
 * Cấu trúc filters:
 * {
 *   title: "Backend Developer",      // Tìm trong job title
 *   location: "Hà Nội",               // Tìm trong location
 *   company: "FinBank",               // Tìm trong company name
 *   workType: "Full-time",            // Loại công việc (Full-time, Part-time, Remote, etc.)
 *   salary: 15000,                    // Mức lương tối thiểu
 *   experience: 2,                    // Số năm kinh nghiệm
 *   industry: "Software"              // Ngành nghề
 * }
 * 
 * Cách sử dụng:
 * const filteredJobs = applyJobFilters(allJobs, {
 *   title: "Backend",
 *   location: "Hà Nội",
 *   workType: "Full-time"
 * });
 */
export const applyJobFilters = (jobsData, filters) => {
  console.log("🔍 Agent Controller - Applying filters...");
  console.log("📊 Total jobs:", jobsData.length);
  console.log("🎯 Filters:", filters);

  // Nếu không có filter nào, trả về toàn bộ danh sách
  if (!filters || Object.keys(filters).length === 0) {
    console.log("ℹ️ No filters applied, returning all jobs");
    return jobsData;
  }

  // Bắt đầu lọc
  let filteredJobs = [...jobsData];

  // 1️⃣ Lọc theo title (tên vị trí công việc)
  if (filters.title && filters.title.trim() !== "") {
    const titleKeyword = filters.title.toLowerCase().trim();
    filteredJobs = filteredJobs.filter((job) => {
      const jobTitle = job.title ? job.title.toLowerCase() : "";
      const jobDescription = job.description ? job.description.toLowerCase() : "";
      const jobSkills = Array.isArray(job.skills) 
        ? job.skills.join(" ").toLowerCase() 
        : "";
      
      return (
        jobTitle.includes(titleKeyword) ||
        jobDescription.includes(titleKeyword) ||
        jobSkills.includes(titleKeyword)
      );
    });
    console.log(`✅ Filtered by title "${filters.title}":`, filteredJobs.length, "jobs");
  }

  // 2️⃣ Lọc theo location (địa điểm)
  if (filters.location && filters.location.trim() !== "") {
    const locationKeyword = filters.location.toLowerCase().trim();
    filteredJobs = filteredJobs.filter((job) => {
      const jobLocation = job.location ? job.location.toLowerCase() : "";
      return jobLocation.includes(locationKeyword);
    });
    console.log(`✅ Filtered by location "${filters.location}":`, filteredJobs.length, "jobs");
  }

  // 3️⃣ Lọc theo company (tên công ty)
  if (filters.company && filters.company.trim() !== "") {
    const companyKeyword = filters.company.toLowerCase().trim();
    filteredJobs = filteredJobs.filter((job) => {
      const jobCompany = job.company ? job.company.toLowerCase() : "";
      return jobCompany.includes(companyKeyword);
    });
    console.log(`✅ Filtered by company "${filters.company}":`, filteredJobs.length, "jobs");
  }

  // 4️⃣ Lọc theo workType (loại công việc: Full-time, Part-time, Remote, etc.)
  if (filters.workType && filters.workType.trim() !== "") {
    const workTypeKeyword = filters.workType.toLowerCase().trim();
    filteredJobs = filteredJobs.filter((job) => {
      const jobType = job.type ? job.type.toLowerCase() : "";
      return jobType.includes(workTypeKeyword);
    });
    console.log(`✅ Filtered by workType "${filters.workType}":`, filteredJobs.length, "jobs");
  }

  // 5️⃣ Lọc theo salary (mức lương tối thiểu)
  if (filters.salary && !isNaN(filters.salary)) {
    const minSalary = Number(filters.salary);
    filteredJobs = filteredJobs.filter((job) => {
      const jobSalary = Number(job.salary) || 0;
      return jobSalary >= minSalary;
    });
    console.log(`✅ Filtered by salary >= ${filters.salary}:`, filteredJobs.length, "jobs");
  }

  // 6️⃣ Lọc theo experience (số năm kinh nghiệm)
  if (filters.experience && !isNaN(filters.experience)) {
    const requiredExp = Number(filters.experience);
    filteredJobs = filteredJobs.filter((job) => {
      const jobExp = job.experienceYears || 0;
      return jobExp <= requiredExp; // Người dùng có đủ kinh nghiệm
    });
    console.log(`✅ Filtered by experience >= ${filters.experience} years:`, filteredJobs.length, "jobs");
  }

  // 7️⃣ Lọc theo industry (ngành nghề)
  if (filters.industry && filters.industry.trim() !== "") {
    const industryKeyword = filters.industry.toLowerCase().trim();
    filteredJobs = filteredJobs.filter((job) => {
      const jobIndustries = Array.isArray(job.industries)
        ? job.industries.join(" ").toLowerCase()
        : "";
      return jobIndustries.includes(industryKeyword);
    });
    console.log(`✅ Filtered by industry "${filters.industry}":`, filteredJobs.length, "jobs");
  }

  console.log("🎉 Final filtered jobs count:", filteredJobs.length);
  return filteredJobs;
};

/**
 * Hàm lấy filters từ sessionStorage
 * (Dùng trong component JobListings để đọc filters được lưu)
 * 
 * @returns {Object|null} - Object filters hoặc null nếu không có
 */
export const getAgentFilters = () => {
  try {
    const filtersJson = sessionStorage.getItem("agentFilters");
    if (filtersJson) {
      const filters = JSON.parse(filtersJson);
      console.log("📖 Retrieved filters from sessionStorage:", filters);
      
      // Xóa sau khi đọc để tránh áp dụng lại filters cũ
      sessionStorage.removeItem("agentFilters");
      
      return filters;
    }
  } catch (error) {
    console.error("❌ Error reading filters from sessionStorage:", error);
  }
  return null;
};

/**
 * Hàm xóa filters khỏi sessionStorage
 * (Dùng khi người dùng muốn reset filters)
 */
export const clearAgentFilters = () => {
  sessionStorage.removeItem("agentFilters");
  console.log("🗑️ Agent filters cleared");
};

/**
 * Hàm parse response từ AI agent để trích xuất intent và filters
 * 
 * @param {string} aiResponse - Response text từ AI
 * @returns {Object} - { intent: string, filters: Object }
 * 
 * Ví dụ AI response:
 * "Tôi sẽ giúp bạn tìm công việc Backend ở Hà Nội. [INTENT:intent_jd] [FILTERS:{\"title\":\"Backend\",\"location\":\"Hà Nội\"}]"
 */
export const parseAIResponse = (aiResponse) => {
  console.log("🤖 Parsing AI response:", aiResponse);

  let intent = null;
  let filters = {};

  try {
    intent = aiResponse["intent"];
    const extractedFeatures = aiResponse["extracted_features"];

    // Parse extracted_features if it's a string
    if (typeof extractedFeatures === "string") {
      filters = JSON.parse(extractedFeatures);
    } else {
      filters = extractedFeatures;
    }

    console.log("🎯 Parsed intent:", intent);
    console.log("🔍 Parsed filters:", filters);
  } catch (error) {
    console.error("❌ Error parsing AI response:", error);
    console.error("❌ AI response data:", aiResponse);
  }

  return { intent, filters };
};

/**
 * Export tất cả functions để sử dụng
 */
export default {
  handleIntent,
  applyJobFilters,
  getAgentFilters,
  clearAgentFilters,
  parseAIResponse,
};
