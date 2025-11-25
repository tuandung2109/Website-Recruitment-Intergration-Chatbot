const supabase = require("../config/supabase");

// Thống kê tổng quan
const getStatisticsOverview = async (req, res) => {
  try {
    // Tổng số người dùng
    const { count: totalUsers } = await supabase
      .from("account")
      .select("*", { count: "exact", head: true });

    // Tổng số công ty
    const { count: totalCompanies } = await supabase
      .from("company")
      .select("*", { count: "exact", head: true });

    // Tổng số bài đăng
    const { count: totalJobPostings } = await supabase
      .from("job_posting")
      .select("*", { count: "exact", head: true });

    // Tổng doanh thu
    const { data: revenueData } = await supabase
      .from("invoice")
      .select("amount");
    const totalRevenue = revenueData
      ? revenueData.reduce((sum, item) => sum + (item.amount || 0), 0)
      : 0;

    // Tính ngày đầu và cuối tháng hiện tại (xử lý timezone đúng)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const firstDayISO = firstDayOfMonth.toISOString();
    const lastDayISO = lastDayOfMonth.toISOString();

    // Người dùng mới tháng này (dùng updated_at vì account không có create_at)
    const { count: newUsersThisMonth } = await supabase
      .from("account")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", firstDayISO)
      .lte("updated_at", lastDayISO);

    // Công ty mới tháng này (company không có cột thời gian, trả về 0)
    // Note: Schema không có cột thời gian cho company, có thể cần thêm sau
    const { count: newCompaniesThisMonth } = 0; // Tạm thời trả về 0

    // Bài đăng mới tháng này (kiểm tra xem có create_at không, nếu không dùng deadline)
    let newJobPostingsThisMonth = 0;
    try {
      const { count } = await supabase
        .from("job_posting")
        .select("*", { count: "exact", head: true })
        .gte("create_at", firstDayISO)
        .lte("create_at", lastDayISO);
      newJobPostingsThisMonth = count || 0;
    } catch (error) {
      // Nếu không có cột create_at, thử dùng deadline
      const { count } = await supabase
        .from("job_posting")
        .select("*", { count: "exact", head: true })
        .gte("deadline", firstDayISO)
        .lte("deadline", lastDayISO);
      newJobPostingsThisMonth = count || 0;
    }

    // Ứng viên mới tháng này (dùng submitted_at, lọc chính xác trong tháng)
    const { count: newApplicationsThisMonth, error: appCountError } = await supabase
      .from("job_application")
      .select("*", { count: "exact", head: true })
      .gte("submitted_at", firstDayISO)
      .lte("submitted_at", lastDayISO);
    
    // Log để debug nếu cần
    if (appCountError) {
      console.warn("Lỗi khi đếm ứng viên tháng này:", appCountError);
    }

    // Người dùng theo tháng (6 tháng gần nhất) - dùng updated_at
    const { data: usersData } = await supabase
      .from("account")
      .select("updated_at")
      .order("updated_at", { ascending: true });

    const usersByMonth = getUsersByMonth(usersData, 6, "updated_at");

    // Bài đăng theo tháng (6 tháng gần nhất) - thử create_at, nếu không có thì dùng deadline
    let jobPostingsData = null;
    try {
      const { data } = await supabase
        .from("job_posting")
        .select("create_at")
        .order("create_at", { ascending: true });
      jobPostingsData = data;
    } catch (error) {
      // Nếu không có create_at, dùng deadline
      const { data } = await supabase
        .from("job_posting")
        .select("deadline")
        .order("deadline", { ascending: true });
      jobPostingsData = data?.map(item => ({ create_at: item.deadline })) || [];
    }

    const jobPostingsByMonth = getUsersByMonth(jobPostingsData, 6, "create_at");

    // Doanh thu theo tháng (6 tháng gần nhất) - invoice không có create_at trong schema
    // Tạm thời trả về mảng rỗng với cấu trúc đúng
    let revenueByMonth = [];
    try {
      const { data: invoicesData } = await supabase
        .from("invoice")
        .select("create_at, amount")
        .order("create_at", { ascending: true });
      if (invoicesData && invoicesData.length > 0 && invoicesData[0].create_at) {
        revenueByMonth = getRevenueByMonth(invoicesData, 6);
      } else {
        // Nếu không có create_at, tạo mảng rỗng với cấu trúc đúng
        revenueByMonth = getRevenueByMonth([], 6);
      }
    } catch (error) {
      // Invoice không có cột create_at, tạo mảng rỗng với cấu trúc đúng
      console.warn("Invoice table không có cột create_at, không thể thống kê doanh thu theo tháng");
      revenueByMonth = getRevenueByMonth([], 6);
    }

    // Người dùng theo vai trò
    const { data: accountTypes } = await supabase
      .from("account_account_type")
      .select(
        `
        account_type_id,
        account_type (type_name)
      `
      );

    const usersByRole = getUsersByRole(accountTypes);

    // Trạng thái bài đăng
    const { data: jobPostings } = await supabase
      .from("job_posting")
      .select("status");

    const jobPostingsByStatus = getJobPostingsByStatus(jobPostings);

    // Top 5 công ty có nhiều bài đăng nhất
    const { data: topCompaniesData } = await supabase.rpc(
      "get_top_companies_by_job_count",
      { limit_count: 5 }
    );

    // Nếu không có stored procedure, dùng cách thủ công
    let topCompanies = [];
    if (!topCompaniesData) {
      const { data: allJobPostings } = await supabase
        .from("job_posting")
        .select("company_id, company(name)");

      topCompanies = getTopCompaniesByJobCount(allJobPostings, 5);
    } else {
      topCompanies = topCompaniesData;
    }

    // Hoạt động gần đây
    const recentActivities = await getRecentActivities();

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0,
        totalJobPostings: totalJobPostings || 0,
        totalRevenue: totalRevenue || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        newCompaniesThisMonth: newCompaniesThisMonth || 0,
        newJobPostingsThisMonth: newJobPostingsThisMonth || 0,
        newApplicationsThisMonth: newApplicationsThisMonth || 0,
        usersByMonth,
        jobPostingsByMonth,
        revenueByMonth,
        usersByRole,
        jobPostingsByStatus,
        topCompanies,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Error in getStatisticsOverview:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê tổng quan",
      error: error.message,
    });
  }
};

// Helper functions
function getUsersByMonth(data, monthCount = 6, dateField = "create_at") {
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const result = {};
  const currentDate = new Date();

  // Initialize last N months
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    result[key] = {
      month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      count: 0,
    };
  }

  // Count data
  if (data && data.length > 0) {
    data.forEach((item) => {
      const dateValue = item[dateField] || item.create_at || item.updated_at;
      if (dateValue) {
        const date = new Date(dateValue);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (result[key]) {
          result[key].count++;
        }
      }
    });
  }

  return Object.values(result);
}

function getRevenueByMonth(data, monthCount = 6, dateField = "create_at") {
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const result = {};
  const currentDate = new Date();

  // Initialize last N months
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    result[key] = {
      month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      amount: 0,
    };
  }

  // Sum revenue
  if (data && data.length > 0) {
    data.forEach((item) => {
      const dateValue = item[dateField] || item.create_at;
      if (dateValue && item.amount) {
        const date = new Date(dateValue);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (result[key]) {
          result[key].amount += parseFloat(item.amount) || 0;
        }
      }
    });
  }

  return Object.values(result);
}

function getUsersByRole(accountTypes) {
  const roleCount = {};

  if (accountTypes && accountTypes.length > 0) {
    accountTypes.forEach((item) => {
      const roleName = item.account_type?.type_name || "Unknown";
      if (!roleCount[roleName]) {
        roleCount[roleName] = 0;
      }
      roleCount[roleName]++;
    });
  }

  return Object.keys(roleCount).map((role) => ({
    role,
    count: roleCount[role],
  }));
}

function getJobPostingsByStatus(jobPostings) {
  const statusCount = {};

  if (jobPostings && jobPostings.length > 0) {
    jobPostings.forEach((item) => {
      const status = item.status || "Unknown";
      if (!statusCount[status]) {
        statusCount[status] = 0;
      }
      statusCount[status]++;
    });
  }

  return Object.keys(statusCount).map((status) => ({
    status: status === "active" ? "Đang hoạt động" : "Không hoạt động",
    count: statusCount[status],
  }));
}

function getTopCompaniesByJobCount(jobPostings, limit = 5) {
  const companyCount = {};

  if (jobPostings && jobPostings.length > 0) {
    jobPostings.forEach((item) => {
      const companyId = item.company_id;
      const companyName = item.company?.name || "Unknown";
      if (!companyCount[companyId]) {
        companyCount[companyId] = { company_id: companyId, name: companyName, job_count: 0 };
      }
      companyCount[companyId].job_count++;
    });
  }

  return Object.values(companyCount)
    .sort((a, b) => b.job_count - a.job_count)
    .slice(0, limit);
}

async function getRecentActivities() {
  // Lấy các hoạt động gần đây từ nhiều bảng
  const activities = [];

  // Lấy user mới nhất - dùng updated_at vì account không có create_at
  const { data: recentUsers } = await supabase
    .from("account")
    .select("account_id, email, updated_at")
    .order("updated_at", { ascending: false })
    .limit(3);

  if (recentUsers) {
    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.account_id}`,
        time: user.updated_at,
        activity: "Đăng ký mới",
        details: `${user.email} đã đăng ký tài khoản`,
      });
    });
  }

  // Lấy bài đăng mới nhất - thử create_at, nếu không có thì dùng deadline
  let recentJobs = null;
  try {
    const { data } = await supabase
      .from("job_posting")
      .select("job_posting_id, position_name, create_at")
      .order("create_at", { ascending: false })
      .limit(3);
    recentJobs = data;
  } catch (error) {
    // Nếu không có create_at, dùng deadline
    const { data } = await supabase
      .from("job_posting")
      .select("job_posting_id, position_name, deadline")
      .order("deadline", { ascending: false })
      .limit(3);
    recentJobs = data;
  }

  if (recentJobs) {
    recentJobs.forEach((job) => {
      activities.push({
        id: `job-${job.job_posting_id}`,
        time: job.create_at || job.deadline,
        activity: "Bài đăng mới",
        details: `Đăng tin: ${job.position_name}`,
      });
    });
  }

  // Sắp xếp theo thời gian
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  return activities.slice(0, 10);
}

// Thống kê tài khoản
const getStatisticsAccounts = async (req, res) => {
  try {
    const { accountType, status, startDate, endDate } = req.query;

    // Build query với filters
    let query = supabase.from("account").select(
      `
      account_id,
      email,
      phone_number,
      status,
      updated_at,
      account_account_type (
        account_type (
          role_name
        )
      )
    `
    );

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (startDate && endDate) {
      query = query.gte("updated_at", startDate).lte("updated_at", endDate);
    }

    const { data: accounts, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) throw error;

    // Transform data to include role
    const transformedAccounts = accounts.map((acc) => ({
      account_id: acc.account_id,
      email: acc.email,
      phone_number: acc.phone_number,
      status: acc.status,
      create_at: acc.updated_at, // Sử dụng updated_at vì không có create_at
      role:
        acc.account_account_type?.[0]?.account_type?.role_name || "Unknown",
    }));

    // Filter by accountType if provided
    let filteredAccounts = transformedAccounts;
    if (accountType && accountType !== "all") {
      filteredAccounts = transformedAccounts.filter(
        (acc) => acc.role === accountType
      );
    }

    // Calculate statistics
    const totalAccounts = filteredAccounts.length;
    const activeAccounts = filteredAccounts.filter(
      (acc) => acc.status === "active"
    ).length;
    const inactiveAccounts = filteredAccounts.filter(
      (acc) => acc.status === "inactive"
    ).length;

    // New accounts in last 30 days (based on updated_at)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newAccountsLast30Days = filteredAccounts.filter(
      (acc) => acc.create_at && new Date(acc.create_at) >= thirtyDaysAgo
    ).length;

    // Accounts by role
    const roleCount = {};
    filteredAccounts.forEach((acc) => {
      const role = acc.role || "Unknown";
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    const accountsByRole = Object.keys(roleCount).map((role) => ({
      role,
      count: roleCount[role],
    }));

    // Accounts by status
    const accountsByStatus = [
      {
        status: "Hoạt động",
        count: activeAccounts,
      },
      {
        status: "Ngừng hoạt động",
        count: inactiveAccounts,
      },
    ];

    // Accounts by month (last 6 months)
    const accountsByMonth = getAccountsByMonth(filteredAccounts, 6);

    return res.status(200).json({
      success: true,
      data: {
        totalAccounts,
        activeAccounts,
        inactiveAccounts,
        newAccountsLast30Days,
        accountsByRole,
        accountsByStatus,
        accountsByMonth,
        accounts: filteredAccounts,
      },
    });
  } catch (error) {
    console.error("Error in getStatisticsAccounts:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê tài khoản",
      error: error.message,
    });
  }
};

// Helper function for accounts by month
function getAccountsByMonth(accounts, monthCount = 6) {
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const result = {};
  const currentDate = new Date();

  // Initialize last N months
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    result[key] = {
      month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      count: 0,
    };
  }

  // Count accounts
  if (accounts && accounts.length > 0) {
    accounts.forEach((acc) => {
      if (acc.create_at) {
        const date = new Date(acc.create_at);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (result[key]) {
          result[key].count++;
        }
      }
    });
  }

  return Object.values(result);
}

// Thống kê tuyển dụng
const getStatisticsRecruitment = async (req, res) => {
  try {
    const { status, companyId, startDate, endDate } = req.query;

    // Build query for job postings
    let jobQuery = supabase.from("job_posting").select(
      `
      job_posting_id,
      position_name,
      status,
      deadline,
      company:company_id (
        company_id,
        name
      )
    `
    );

    // Apply filters
    if (status && status !== "all") {
      jobQuery = jobQuery.eq("status", status);
    }

    if (companyId && companyId !== "all") {
      jobQuery = jobQuery.eq("company_id", companyId);
    }

    if (startDate && endDate) {
      jobQuery = jobQuery.gte("deadline", startDate).lte("deadline", endDate);
    }

    const { data: jobPostings, error: jobError } = await jobQuery;

    if (jobError) throw jobError;

    // Get all applications
    const { data: applications, error: appError } = await supabase
      .from("job_application")
      .select("job_application_id, job_posting_id, status, submitted_at");

    if (appError) throw appError;

    // Get all companies for filter dropdown
    const { data: companies, error: compError } = await supabase
      .from("company")
      .select("company_id, name")
      .order("name");

    if (compError) throw compError;

    // Transform job postings with application count
    const jobPostingsWithApps = jobPostings.map((job) => {
      const jobApps = applications.filter(
        (app) => app.job_posting_id === job.job_posting_id
      );
      return {
        job_posting_id: job.job_posting_id,
        position_name: job.position_name,
        status: job.status,
        deadline: job.deadline,
        company_name: job.company?.name || "N/A",
        company_id: job.company?.company_id,
        application_count: jobApps.length,
      };
    });

    // Calculate statistics
    const totalJobPostings = jobPostingsWithApps.length;
    const openJobPostings = jobPostingsWithApps.filter(
      (job) => job.status === "open"
    ).length;
    const closedJobPostings = jobPostingsWithApps.filter(
      (job) => job.status === "closed"
    ).length;

    // Filter applications by job postings (if filtered)
    const jobPostingIds = jobPostingsWithApps.map((job) => job.job_posting_id);
    const filteredApplications = applications.filter((app) =>
      jobPostingIds.includes(app.job_posting_id)
    );

    const totalApplications = filteredApplications.length;
    const pendingApplications = filteredApplications.filter(
      (app) => app.status === "pending"
    ).length;
    const acceptedApplications = filteredApplications.filter(
      (app) => app.status === "accept"
    ).length;
    const rejectedApplications = filteredApplications.filter(
      (app) => app.status === "reject"
    ).length;

    // Success rate
    const processedApps = acceptedApplications + rejectedApplications;
    const successRate =
      processedApps > 0
        ? Math.round((acceptedApplications / processedApps) * 100)
        : 0;

    // Average applications per job
    const avgApplicationsPerJob =
      totalJobPostings > 0
        ? (totalApplications / totalJobPostings).toFixed(1)
        : 0;

    // Count unique companies
    const uniqueCompanies = new Set(
      jobPostingsWithApps
        .filter((job) => job.company_id)
        .map((job) => job.company_id)
    );
    const totalCompaniesRecruiting = uniqueCompanies.size;

    // Job postings by status
    const jobPostingsByStatus = [
      { status: "Đang mở", count: openJobPostings },
      { status: "Đã đóng", count: closedJobPostings },
    ];

    // Applications by status
    const applicationsByStatus = [
      { status: "Chờ xử lý", count: pendingApplications },
      { status: "Chấp nhận", count: acceptedApplications },
      { status: "Từ chối", count: rejectedApplications },
    ];

    // Jobs and Applications by month (last 6 months)
    const jobsAndApplicationsByMonth = getJobsAndApplicationsByMonth(
      jobPostings,
      applications,
      6
    );

    // Top companies by job count
    const companyJobCount = {};
    jobPostingsWithApps.forEach((job) => {
      if (job.company_id && job.company_name) {
        if (!companyJobCount[job.company_id]) {
          companyJobCount[job.company_id] = {
            company_id: job.company_id,
            name: job.company_name,
            job_count: 0,
            total_applications: 0,
          };
        }
        companyJobCount[job.company_id].job_count++;
        companyJobCount[job.company_id].total_applications +=
          job.application_count;
      }
    });

    const topCompanies = Object.values(companyJobCount)
      .sort((a, b) => b.job_count - a.job_count)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        totalJobPostings,
        openJobPostings,
        closedJobPostings,
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        successRate,
        avgApplicationsPerJob: parseFloat(avgApplicationsPerJob),
        totalCompaniesRecruiting,
        jobPostingsByStatus,
        applicationsByStatus,
        jobsAndApplicationsByMonth,
        topCompanies,
        jobPostings: jobPostingsWithApps,
        companies, // For filter dropdown
      },
    });
  } catch (error) {
    console.error("Error in getStatisticsRecruitment:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê tuyển dụng",
      error: error.message,
    });
  }
};

// Helper function for jobs and applications by month
function getJobsAndApplicationsByMonth(jobs, applications, monthCount = 6) {
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const result = {};
  const currentDate = new Date();

  // Initialize last N months
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    result[key] = {
      month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      jobs: 0,
      applications: 0,
    };
  }

  // Count jobs by deadline month
  if (jobs && jobs.length > 0) {
    jobs.forEach((job) => {
      if (job.deadline) {
        const date = new Date(job.deadline);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (result[key]) {
          result[key].jobs++;
        }
      }
    });
  }

  // Count applications by submitted month
  if (applications && applications.length > 0) {
    applications.forEach((app) => {
      if (app.submitted_at) {
        const date = new Date(app.submitted_at);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (result[key]) {
          result[key].applications++;
        }
      }
    });
  }

  return Object.values(result);
}

module.exports = {
  getStatisticsOverview,
  getStatisticsAccounts,
  getStatisticsRecruitment,
};
