// // src/services/jobApi.js

// // Lấy URL cơ sở từ biến môi trường (ENV) của React
// // Vì bạn đang dùng Node/Express, nên URL cơ sở sẽ là URL của server Express, ví dụ: http://localhost:5000
// // Tôi sẽ giả định API Express của bạn đang chạy ở cổng 5000.
// // (Bạn cần đảm bảo biến REACT_APP_API_URL trong .env của frontend được cấu hình đúng)

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// export const fetchAllJobs = async () => {
//   try {
//     const response = await fetch(`${API_URL}/api/jobs`); // Sử dụng route bạn đã định nghĩa: router.get('/jobs', ...)

//     if (!response.ok) {
//       // Xử lý lỗi HTTP (ví dụ: 404, 500)
//       const errorData = await response.json();
//       throw new Error(errorData.error || "Failed to fetch job postings");
//     }

//     const result = await response.json();
//     return result.data; // Backend trả về { success: true, data: jobs }
//   } catch (error) {
//     console.error("Error fetching job postings:", error);
//     // Tái ném lỗi để component có thể bắt và hiển thị
//     throw error;
//   }
// };

// // Bạn sẽ cần mở rộng hàm này để hỗ trợ tìm kiếm/lọc/phân trang sau
