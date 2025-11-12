# Hướng dẫn sử dụng CV Job Matcher

## 🎯 Giới thiệu

Đây là công cụ đánh giá CV dựa trên Job Description (JD) với giao diện đẹp mắt tương tự Cake Resume.

## 📍 Các trang có thể truy cập

1. **Demo Page**: `http://localhost:3000/cv-matcher-demo`
   - Trang giới thiệu về tính năng
   - Landing page với design đẹp
   - Có nút CTA để chuyển sang tool chính

2. **CV Job Matcher**: `http://localhost:3000/cv-job-matcher`
   - Tool chính để upload CV và JD
   - Phân tích và hiển thị kết quả

3. **Evaluate CV (Cũ)**: `http://localhost:3000/evaluate_cv`
   - Component cũ vẫn giữ nguyên

## 🚀 Cách sử dụng

### Bước 1: Upload CV
1. Truy cập `/cv-job-matcher`
2. Click vào khung "Upload File" hoặc kéo thả file CV
3. Hỗ trợ: PDF, DOC, DOCX (max 5MB)
4. File đã upload sẽ hiển thị với tên và kích thước

### Bước 2: Nhập Job Description
1. Chọn tab "Paste Text" (mặc định)
2. Dán nội dung Job Description vào ô textarea
3. Hoặc chọn tab "Search Jobs" để tìm việc trên hệ thống

### Bước 3: Phân tích
1. Click nút "Start Scanning" (màu xanh lá)
2. Chờ 2.5 giây loading
3. Tự động chuyển sang trang kết quả

### Bước 4: Xem kết quả
Trang kết quả bao gồm:

#### Sidebar (Bên trái)
- **Match Score**: Điểm tổng thể (vòng tròn lớn)
- **Category Scores**: Điểm cho từng hạng mục
  - Content (Nội dung)
  - Skills (Kỹ năng)
  - Format (Định dạng)
  - Sections (Phần mục)
  - Style (Phong cách)

#### Main Content (Bên phải)
- **Overview**: Tổng quan với biểu đồ radar
- **Highlights**: Điểm mạnh của CV
- **Improvements**: Điểm cần cải thiện
- **Content Details**: Chi tiết về nội dung
  - Measurable Results (Kết quả đo lường)
  - Spelling & Grammar (Chính tả & Ngữ pháp)
- **Hard Skills**: So sánh kỹ năng cứng (Table layout giống Cake Resume)
  - Table layout với header: Skill | Job Description | Your Resume
  - Click vào mỗi row để expand/collapse chi tiết
  - Icon check (xanh) cho kỹ năng có, X (đỏ) cho thiếu
  - Background màu vàng nhạt cho missing, xanh nhạt cho found
  - Expandable content hiển thị Job Description mentions
- **Soft Skills**: Kỹ năng mềm với badge layout
  - Grid layout dễ nhìn
  - Status icons (check/x)
  - Required badge

## 📊 Mock Data

Hiện tại tool sử dụng mock data để demo:

### Data 1: Unity Mobile Game Developer
- Match Score: **56/100**
- Highlights: Unity experience, C# skills, AI/ML projects
- Improvements: Thêm Unity game projects, teamwork experience
- Hard Skills thiếu: Phát triển Mobile Game, Google Play, Apple Store
- Soft Skills thiếu: Độc lập, Làm việc nhóm

### Data 2: Backend Engineer / Google (trong mockData.js)
- Match Score: **92/100**
- Rất phù hợp với yêu cầu backend
- Node.js, AWS, SQL/NoSQL đầy đủ

## 🎨 Màu sắc & Ý nghĩa

### Match Score Colors
- **Xanh lá (#10b981)**: >= 75 điểm (Excellent)
- **Cam (#f59e0b)**: 50-74 điểm (Good)
- **Đỏ (#ef4444)**: < 50 điểm (Needs Improvement)

### Status Colors
- **Xanh lá**: Điểm mạnh, kỹ năng có
- **Cam**: Cần cải thiện
- **Đỏ**: Thiếu, cần thêm

## 🔧 Tùy chỉnh

### Thay đổi Mock Data
Mở file `mockData.js` và chỉnh sửa:

```javascript
export const mockEvaluationData = {
    jobInfo: {
        title: "Tên công việc của bạn",
        company: "Tên công ty"
    },
    overview: {
        matchScore: 75, // Thay đổi điểm
        // ... các thông tin khác
    }
}
```

### Thêm JD mẫu mới
Trong `CVJobMatcher.js`, placeholder của textarea:

```javascript
<textarea
    placeholder="Dán Job Description của bạn vào đây..."
    value={jobDescription}
    onChange={(e) => setJobDescription(e.target.value)}
    rows={12}
/>
```

## 📱 Responsive

Giao diện tự động điều chỉnh theo màn hình:
- **Desktop**: Sidebar trái + Content phải (2 cột)
- **Tablet**: Vẫn 2 cột nhưng thu hẹp
- **Mobile**: Chuyển thành 1 cột dọc

## 🔗 Tích hợp Backend

Để kết nối với backend API thực:

1. Mở file `CVJobMatcher.js`
2. Tìm function `handleStartScanning`
3. Thay thế phần mock data:

```javascript
const handleStartScanning = async () => {
    // ... validation code ...
    
    setIsScanning(true);
    
    try {
        const formData = new FormData();
        formData.append('cv', cvFile);
        formData.append('jobDescription', jobDescription);
        
        const response = await fetch('http://localhost:5000/api/evaluate-cv', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        setEvaluationData(data);
        setStep(2);
    } catch (error) {
        console.error('Error:', error);
        alert('Không thể phân tích CV. Vui lòng thử lại.');
    } finally {
        setIsScanning(false);
    }
};
```

## 🎯 Features chưa có

- [ ] Export PDF report
- [ ] Save history
- [ ] Compare multiple JDs
- [ ] Edit CV suggestions
- [ ] Generate cover letter
- [ ] Dark mode

## 🐛 Xử lý lỗi

### Lỗi: File quá lớn
- Giới hạn: 5MB
- Giải pháp: Nén file PDF hoặc chuyển sang PDF/A

### Lỗi: Format không hỗ trợ
- Hỗ trợ: .pdf, .doc, .docx
- Giải pháp: Chuyển đổi sang định dạng được hỗ trợ

### Lỗi: Charts không hiển thị
- Nguyên nhân: Thiếu package `recharts`
- Giải pháp: Chạy `npm install recharts`

## 💡 Tips

1. **JD càng chi tiết càng tốt**: Kết quả phân tích sẽ chính xác hơn
2. **CV nên có định dạng chuẩn**: PDF là tốt nhất
3. **Kiểm tra Match Score**: >= 75 là tốt cho ATS
4. **Đọc kỹ Improvements**: Những gợi ý quan trọng để cải thiện CV
5. **So sánh Skills**: Tập trung vào Hard Skills thiếu

## 📞 Support

Nếu có vấn đề, check:
1. Console log (F12)
2. Network tab (F12)
3. README.md file

## 🎉 Demo

Để xem demo ngay:
```bash
npm start
```

Sau đó truy cập:
- Demo: http://localhost:3000/cv-matcher-demo
- Tool: http://localhost:3000/cv-job-matcher

Enjoy! 🚀
