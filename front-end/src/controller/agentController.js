/**
 * Agent Controller - Điều hướng và xử lý filter trên website tuyển dụng
 * 
 * Controller này chịu trách nhiệm:
 * 1. Điều hướng người dùng đến các trang khác nhau dựa trên intent
 * 2. Áp dụng các bộ lọc (filters) cho trang tìm kiếm công việc
 * 3. Tích hợp với chatbot agent mode để xử lý tự động
 */

/**
 * Helper function - Xử lý navigation với filters và events
 * @param {string} targetPath - Đường dẫn trang đích
 * @param {function} navigate - Hook useNavigate() 
 * @param {object} filters - Object chứa các bộ lọc
 * @param {string} intent - Intent hiện tại
 */
const handleNavigationWithFilters = (targetPath, navigate, filters, intent) => {
  // Lưu filters vào sessionStorage nếu có
  if (filters && Object.keys(filters).length > 0) {
    sessionStorage.setItem("agentFilters", JSON.stringify(filters));
    console.log("💾 Filters saved to sessionStorage");
  }

  const isOnTargetPage = window.location.pathname === targetPath;

  if (isOnTargetPage) {
    // Đã ở trang đích, dispatch event ngay lập tức
    console.log(`🔄 Already on ${targetPath} page, dispatching event immediately`);
    window.dispatchEvent(new CustomEvent('agentNavigation', {
      detail: { filters, intent }
    }));
  } else {
    // Điều hướng đến trang đích
    console.log(`✅ Navigating to ${targetPath} page...`);
    navigate(targetPath);

    // Dispatch event sau khi navigation
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('agentNavigation', {
        detail: { filters, intent }
      }));
    }, 100);
  }
};

/**
 * Hàm xử lý intent và điều hướng người dùng
 * 
 * @param {string} intent - Intent từ AI agent
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

  // Mapping intent đến route
  const intentRouteMap = {
    intent_jd: { path: "/job", needsFilters: true },
    intent_company_info: { path: "/company", needsFilters: true },
    evaluate_cv: { path: "/evaluate_cv", needsFilters: true },
    "job-suggestions": { path: "/job-suggestions", needsFilters: true },
    simulate_interview: { path: "/ai-interview", needsFilters: true },
    intent_login: { path: "/login", needsFilters: false },
    intent_register: { path: "/register", needsFilters: false },
    "intent_forgot-password": { path: "/forgot-password", needsFilters: false },
    intent_applications: { path: "/applications", needsFilters: false }
  };

  const routeConfig = intentRouteMap[intent];

  if (routeConfig) {
    const { path, needsFilters } = routeConfig;
    
    if (needsFilters) {
      handleNavigationWithFilters(path, navigate, filters, intent);
    } else {
      console.log(`✅ Navigating to ${path} page...`);
      navigate(path);
    }
  } else {
    // Intent không được xử lý
    console.log("⚠️ Intent not handled:", intent);
    console.log("ℹ️ Available intents:", Object.keys(intentRouteMap).join(", "));
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

  let filteredJobs = [...jobsData];

  // Helper function để kiểm tra string matching
  const matchesKeyword = (value, keyword) => {
    return value ? value.toLowerCase().includes(keyword.toLowerCase().trim()) : false;
  };

  // 1️⃣ Lọc theo title (tên vị trí công việc)
  if (filters.title?.trim()) {
    const titleKeyword = filters.title.trim();
    filteredJobs = filteredJobs.filter((job) => {
      const searchFields = [
        job.title,
        job.description,
        Array.isArray(job.skills) ? job.skills.join(" ") : ""
      ].join(" ");
      
      return matchesKeyword(searchFields, titleKeyword);
    });
    console.log(`✅ Filtered by title "${filters.title}":`, filteredJobs.length, "jobs");
  }

  // 2️⃣ Lọc theo location (địa điểm)
  if (filters.location?.trim()) {
    filteredJobs = filteredJobs.filter((job) => 
      matchesKeyword(job.location, filters.location)
    );
    console.log(`✅ Filtered by location "${filters.location}":`, filteredJobs.length, "jobs");
  }

  // 3️⃣ Lọc theo company (tên công ty)
  if (filters.company?.trim()) {
    filteredJobs = filteredJobs.filter((job) => 
      matchesKeyword(job.company, filters.company)
    );
    console.log(`✅ Filtered by company "${filters.company}":`, filteredJobs.length, "jobs");
  }

  // 4️⃣ Lọc theo workType (loại công việc)
  if (filters.workType?.trim()) {
    filteredJobs = filteredJobs.filter((job) => 
      matchesKeyword(job.type, filters.workType)
    );
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
      const jobExp = Number(job.experienceYears) || 0;
      return jobExp <= requiredExp; // Người dùng có đủ kinh nghiệm
    });
    console.log(`✅ Filtered by experience >= ${filters.experience} years:`, filteredJobs.length, "jobs");
  }

  // 7️⃣ Lọc theo industry (ngành nghề)
  if (filters.industry?.trim()) {
    filteredJobs = filteredJobs.filter((job) => {
      const jobIndustries = Array.isArray(job.industries)
        ? job.industries.join(" ")
        : "";
      return matchesKeyword(jobIndustries, filters.industry);
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
