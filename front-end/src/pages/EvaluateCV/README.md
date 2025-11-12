# CV Job Matcher - AI Resume Checker

## 📋 Mô tả

Hệ thống đánh giá CV dựa trên Job Description (JD) với giao diện đẹp mắt tương tự Cake Resume. Hệ thống giúp ứng viên:
- Upload CV và paste JD để so sánh
- Nhận điểm số ATS (Applicant Tracking System)
- Xem phân tích chi tiết về kỹ năng, nội dung, format
- Nhận gợi ý cải thiện CV

## 🎯 Tính năng

### 1. Upload CV
- Hỗ trợ định dạng: PDF, DOC, DOCX
- Kích thước tối đa: 5MB
- Hỗ trợ tất cả ngôn ngữ
- Drag & drop hoặc chọn file

### 2. Nhập Job Description
- Paste text trực tiếp
- Hoặc tìm kiếm công việc trên hệ thống
- Tự động phân tích yêu cầu công việc

### 3. Phân tích AI
- **Match Score**: Điểm tổng thể (0-100)
- **Content Analysis**: Đo lường kết quả, ngữ pháp
- **Skills Matching**: So sánh hard skills và soft skills
- **Format Review**: Đánh giá format và cấu trúc
- **Sections**: Kiểm tra các phần thiếu
- **Style**: Đánh giá phong cách viết

### 4. Hiển thị kết quả
- Biểu đồ radar cho tổng quan
- Biểu đồ bar cho so sánh kỹ năng
- Highlights (điểm mạnh)
- Improvements (cần cải thiện)
- Chi tiết từng category với suggestions

## 📁 Cấu trúc File

```
EvaluateCV/
├── CVJobMatcher.js              # Component chính - Form upload
├── CVJobMatcherResult.js        # Component hiển thị kết quả
├── CVJobMatcherDemo.js          # Landing page demo
├── CVJobMatcher.css             # Styles cho tất cả components
├── CVJobMatcherDemo.css         # Styles cho demo page
├── mockData.js                  # Mock data mẫu
├── EvaluateCV.js               # Component cũ (giữ lại)
├── EvaluateCV.css              # Styles cũ
├── index.js                    # Export các components
└── README.md                   # File này
```

## 🚀 Cách sử dụng

### 1. Truy cập các routes

```
/cv-matcher-demo     # Landing page giới thiệu
/cv-job-matcher      # Tool chính để đánh giá CV
```

### 2. Sử dụng trong code

```javascript
// Import component
import { CVJobMatcher, CVJobMatcherDemo } from './pages/EvaluateCV';

// Hoặc import riêng lẻ
import CVJobMatcher from './pages/EvaluateCV/CVJobMatcher';
```

### 3. Mock Data

File `mockData.js` chứa 2 bộ data mẫu:

- **mockEvaluationData**: Unity Mobile Game Developer (Score: 56)
- **mockEvaluationData2**: Backend Engineer / Google (Score: 92)

## 🎨 Design

Giao diện được thiết kế dựa trên:
- **Cake Resume AI Checker** (https://www.cakeresume.com)
- Color scheme: Purple gradient (#667eea → #764ba2)
- Modern, clean design với animations mượt mà
- Responsive trên mọi thiết bị

## 🔧 Công nghệ sử dụng

- **React 18**: UI framework
- **React Router**: Routing
- **Recharts**: Biểu đồ (Radar, Bar charts)
- **Lucide React**: Icons
- **CSS3**: Styling với animations

## 📊 Cấu trúc dữ liệu

### Input
```javascript
{
  cvFile: File,           // File CV đã upload
  jobDescription: String  // Job description text
}
```

### Output (Evaluation Data)
```javascript
{
  jobInfo: {
    title: String,
    company: String
  },
  overview: {
    matchScore: Number (0-100),
    totalIssues: Number,
    summary: String,
    detailedSummary: String,
    categories: {
      content: { name, score, issues },
      skills: { name, score, issues },
      format: { name, score, issues },
      sections: { name, score, issues },
      style: { name, score, issues }
    },
    highlights: Array<String>,
    improvements: Array<String>
  },
  content: {
    measurableResults: { issues, description, suggestions },
    spellingGrammar: { issues, description, suggestions }
  },
  skills: {
    hardSkills: Array<{
      name, required, requiredCount, foundCount,
      status, jobDescriptionMentions
    }>,
    softSkills: Array<{...}>
  },
  format: {
    issues, suggestions
  },
  sections: {
    missing, present
  }
}
```

## 🔄 Flow hoạt động

1. **Upload Page** (`CVJobMatcher.js`)
   - User upload CV
   - User nhập JD
   - Click "Start Scanning"
   - Loading animation 2.5s
   - Chuyển sang Result Page

2. **Result Page** (`CVJobMatcherResult.js`)
   - Hiển thị match score
   - Show radar chart
   - List highlights & improvements
   - Chi tiết từng category
   - Skills comparison charts
   - Suggestions cho từng vấn đề

## 🎯 Tích hợp API Backend

Để tích hợp với backend thực, thay đổi trong `CVJobMatcher.js`:

```javascript
const handleStartScanning = async () => {
    if (!cvFile || !jobDescription.trim()) {
        alert('Please upload your CV and add a job description');
        return;
    }

    setIsScanning(true);
    
    try {
        // Tạo FormData
        const formData = new FormData();
        formData.append('cv', cvFile);
        formData.append('jobDescription', jobDescription);
        
        // Call API
        const response = await fetch('/api/evaluate-cv', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        setEvaluationData(data);
        setStep(2);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze CV. Please try again.');
    } finally {
        setIsScanning(false);
    }
};
```

## 🎨 Customization

### Thay đổi màu sắc

Trong `CVJobMatcher.css`, tìm các biến gradient:

```css
/* Main gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Success color */
#10b981

/* Warning color */
#f59e0b

/* Error color */
#ef4444
```

### Thay đổi scoring logic

Trong `mockData.js`, điều chỉnh các giá trị:

```javascript
getScoreColor(score) {
    if (score >= 75) return '#10b981'; // Excellent
    if (score >= 50) return '#f59e0b'; // Good
    return '#ef4444'; // Needs Improvement
}
```

## 📱 Responsive Breakpoints

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

## 🐛 Troubleshooting

### Issue: Charts không hiển thị
**Solution**: Kiểm tra xem `recharts` đã được cài đặt chưa
```bash
npm install recharts
```

### Issue: Icons không hiển thị
**Solution**: Cài đặt `lucide-react`
```bash
npm install lucide-react
```

### Issue: CSS không apply
**Solution**: Đảm bảo import CSS files
```javascript
import './CVJobMatcher.css';
```

## 🚀 Development

### Start development server
```bash
npm start
```

### Build for production
```bash
npm run build
```

## 📝 TODO

- [ ] Tích hợp backend API thực
- [ ] Thêm export PDF report
- [ ] Thêm save/load history
- [ ] Thêm comparison với nhiều JD
- [ ] Thêm AI suggestions chi tiết hơn
- [ ] Multi-language support
- [ ] Dark mode

## 👥 Contributors

- Frontend Design: Inspired by Cake Resume
- Implementation: Your Team

## 📄 License

MIT License
