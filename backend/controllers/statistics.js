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

    // Người dùng mới tháng này
    const firstDayOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const { count: newUsersThisMonth } = await supabase
      .from("account")
      .select("*", { count: "exact", head: true })
      .gte("create_at", firstDayOfMonth);

    // Công ty mới tháng này
    const { count: newCompaniesThisMonth } = await supabase
      .from("company")
      .select("*", { count: "exact", head: true })
      .gte("create_at", firstDayOfMonth);

    // Bài đăng mới tháng này
    const { count: newJobPostingsThisMonth } = await supabase
      .from("job_posting")
      .select("*", { count: "exact", head: true })
      .gte("create_at", firstDayOfMonth);

    // Ứng viên mới tháng này
    const { count: newApplicationsThisMonth } = await supabase
      .from("job_application")
      .select("*", { count: "exact", head: true })
      .gte("create_at", firstDayOfMonth);

    // Người dùng theo tháng (6 tháng gần nhất)
    const { data: usersData } = await supabase
      .from("account")
      .select("create_at")
      .order("create_at", { ascending: true });

    const usersByMonth = getUsersByMonth(usersData, 6);

    // Bài đăng theo tháng (6 tháng gần nhất)
    const { data: jobPostingsData } = await supabase
      .from("job_posting")
      .select("create_at")
      .order("create_at", { ascending: true });

    const jobPostingsByMonth = getUsersByMonth(jobPostingsData, 6);

    // Doanh thu theo tháng (6 tháng gần nhất)
    const { data: invoicesData } = await supabase
      .from("invoice")
      .select("create_at, amount")
      .order("create_at", { ascending: true });

    const revenueByMonth = getRevenueByMonth(invoicesData, 6);

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
function getUsersByMonth(data, monthCount = 6) {
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
      if (item.create_at) {
        const date = new Date(item.create_at);
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

function getRevenueByMonth(data, monthCount = 6) {
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
      if (item.create_at && item.amount) {
        const date = new Date(item.create_at);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (result[key]) {
          result[key].amount += item.amount;
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

  // Lấy user mới nhất
  const { data: recentUsers } = await supabase
    .from("account")
    .select("account_id, email, create_at")
    .order("create_at", { ascending: false })
    .limit(3);

  if (recentUsers) {
    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.account_id}`,
        time: user.create_at,
        activity: "Đăng ký mới",
        details: `${user.email} đã đăng ký tài khoản`,
      });
    });
  }

  // Lấy bài đăng mới nhất
  const { data: recentJobs } = await supabase
    .from("job_posting")
    .select("job_posting_id, title, create_at")
    .order("create_at", { ascending: false })
    .limit(3);

  if (recentJobs) {
    recentJobs.forEach((job) => {
      activities.push({
        id: `job-${job.job_posting_id}`,
        time: job.create_at,
        activity: "Bài đăng mới",
        details: `Đăng tin: ${job.title}`,
      });
    });
  }

  // Sắp xếp theo thời gian
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  return activities.slice(0, 10);
}

module.exports = {
  getStatisticsOverview,
};
