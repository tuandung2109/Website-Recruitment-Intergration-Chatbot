# Hướng dẫn sử dụng trang Thống kê tổng quan

## 📊 Tính năng đã được thêm vào

### Frontend
- ✅ Trang "Thống kê tổng quan" tại `/admin/statistics/overview`
- ✅ Component `StatisticsOverview` với các biểu đồ và thống kê chi tiết
- ✅ Service API `statistics.js` để gọi backend

### Backend
- ✅ Controller `statistics.js` xử lý logic thống kê
- ✅ Route `/api/statistics/overview` để lấy dữ liệu

### Menu Admin
- ✅ Đã thêm menu "Quản lý thống kê" với 5 mục con

## 📈 Các thống kê hiển thị

### 1. Thẻ thống kê tổng quan (Cards)
- Tổng số người dùng
- Tổng số công ty
- Tổng số bài đăng
- Tổng doanh thu

### 2. Thẻ thống kê tháng này
- Người dùng mới tháng này
- Công ty mới tháng này
- Bài đăng mới tháng này
- Ứng viên mới tháng này

### 3. Biểu đồ cột (Bar Chart)
- Người dùng đăng ký theo 6 tháng gần nhất
- Bài đăng tuyển dụng theo 6 tháng gần nhất

### 4. Biểu đồ đường (Line Chart)
- Doanh thu theo 6 tháng gần nhất

### 5. Biểu đồ tròn (Pie Chart)
- Phân bố người dùng theo vai trò (Seeker, Employer, Admin)
- Trạng thái bài đăng (Active/Inactive)

### 6. Bảng dữ liệu (Tables)
- Top 5 công ty có nhiều bài đăng nhất
- 10 hoạt động gần đây trong hệ thống

## 🚀 Cách chạy

1. **Khởi động Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Khởi động Frontend:**
   ```bash
   cd front-end
   npm install
   npm start
   ```

3. **Truy cập:**
   - Đăng nhập với tài khoản Admin
   - Vào menu "Quản lý thống kê" → "Thống kê tổng quan"

## 📝 Lưu ý

- Backend sử dụng Supabase để lấy dữ liệu
- Tất cả dữ liệu được tính toán real-time từ database
- Các biểu đồ sử dụng thư viện `recharts`
- Responsive design, hoạt động tốt trên mobile và desktop

## 🔧 Các bước tiếp theo (tuỳ chọn)

1. **Thống kê ứng viên** - Chi tiết về ứng viên
2. **Thống kê bài đăng tuyển dụng** - Phân tích bài đăng
3. **Thống kê doanh thu** - Chi tiết doanh thu
4. **Báo cáo tuyển dụng** - Báo cáo tổng hợp với bộ lọc

Bạn có muốn tôi tạo thêm các trang thống kê khác không? 😊
