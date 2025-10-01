# Website Tuyển Dụng Tích Hợp Chatbot AI

## 📋 Mô tả dự án

Hệ thống website tuyển dụng hiện đại với chatbot AI tích hợp, giúp tự động hóa quá trình tuyển dụng và cải thiện trải nghiệm người dùng.

## 🏗️ Kiến trúc hệ thống

### Frontend (ReactJS)
- **Công nghệ**: React 18, TypeScript, Tailwind CSS, Ant Design
- **Tính năng**: 
  - Giao diện responsive
  - Quản lý state với Redux Toolkit
  - Real-time chat với Socket.IO
  - Authentication & Authorization

### Backend (NodeJS)
- **Công nghệ**: Express.js, Sequelize ORM
- **Tính năng**:
  - RESTful API
  - JWT Authentication
  - File upload (CV/Resume)
  - Email notifications
  - Real-time messaging

### Database (Supabase)
- **Công nghệ**: Supabase (PostgreSQL as a Service)
- **Tính năng**:
  - Managed PostgreSQL database
  - Built-in Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Auto-generated APIs
  - File storage

### AI Chatbot (Python)
- **Công nghệ**: 
  - Flask API
  - Hugging Face Transformers
  - Ollama (Local LLM)
  - QDrant (Vector Database)
- **Tính năng**:
  - Natural Language Processing
  - Resume analysis
  - Job matching
  - Conversation memory

### DevOps (Docker)
- **Containers**: 
  - Frontend (React)
  - Backend (Node.js)
  - AI Service (Python/Flask)
  - Database (PostgreSQL)
  - Vector DB (QDrant)
  - LLM Service (Ollama)

## 📁 Cấu trúc thư mục

```
Website-Recruitment-Integration-Chatbot/
│
├── Frontend/                          # ReactJS Frontend
│   ├── public/                        # Static files
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── common/              # Shared components
│   │   │   ├── recruitment/         # Job-related components
│   │   │   ├── chatbot/            # Chatbot interface
│   │   │   ├── auth/               # Authentication components
│   │   │   └── dashboard/          # Dashboard components
│   │   ├── pages/                  # Page components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API services
│   │   ├── utils/                  # Utility functions
│   │   ├── styles/                 # CSS/SCSS files
│   │   └── context/               # React contexts
│   └── package.json
│
├── Backend/                          # NodeJS Backend
│   ├── src/
│   │   ├── controllers/            # Route controllers
│   │   ├── models/                 # Database models
│   │   ├── routes/                 # API routes
│   │   ├── middlewares/            # Custom middlewares
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Utility functions
│   │   └── config/                 # Configuration files
│   ├── uploads/                    # File uploads
│   └── package.json
│
├── AI/                              # Python AI Service
│   ├── models/                     # AI models
│   ├── api/                        # Flask API routes
│   ├── services/                   # AI services
│   ├── utils/                      # Utility functions
│   ├── config/                     # Configuration
│   ├── data/                       # Training data
│   ├── training/                   # Model training scripts
│   └── requirements.txt
│
├── Database/                        # Database files
│   ├── migrations/                 # Database migrations
│   ├── seeds/                      # Seed data
│   └── schemas/                    # Database schemas
│
├── Docker/                          # Docker configuration
│   ├── nginx.conf                  # Nginx configuration
│   └── ssl/                        # SSL certificates
│
├── docs/                           # Documentation
├── tests/                          # Test files
├── scripts/                        # Build/deployment scripts
├── docker-compose.yml              # Docker compose file
├── .gitignore
├── README.md
└── LICENSE
```

## 🚀 Tính năng chính

### 1. Website Tuyển Dụng
- ✅ Đăng/tìm kiếm việc làm
- ✅ Quản lý hồ sơ ứng viên
- ✅ Dashboard cho nhà tuyển dụng
- ✅ Hệ thống đánh giá và review
- ✅ Thông báo real-time

### 2. Chatbot AI
- 🤖 Tư vấn nghề nghiệp
- 📄 Phân tích CV/Resume
- 🎯 Gợi ý việc làm phù hợp
- ❓ Trả lời câu hỏi tuyển dụng
- 💬 Hỗ trợ 24/7

### 3. Tích hợp AI
- 🧠 LLM: Ollama (Local) + OpenAI GPT
- 🔍 Vector Search: QDrant
- 🤗 NLP: Hugging Face Transformers

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Ant Design |
| **Backend** | Node.js, Express.js, Supabase Client |
| **Database** | Supabase (PostgreSQL as a Service) |
| **AI/ML** | Python, Flask, Hugging Face, Ollama, QDrant |
| **DevOps** | Docker, Docker Compose |
| **Deployment** | Nginx, SSL/TLS |

## 📦 Cài đặt và chạy

### 1. Yêu cầu hệ thống
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- PostgreSQL 15+

### 2. Clone repository
```bash
git clone https://github.com/your-username/Website-Recruitment-Integration-Chatbot.git
cd Website-Recruitment-Integration-Chatbot
```

### 3. Chạy với Docker
```bash
docker-compose up -d
```

### 4. Truy cập ứng dụng
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- AI Service: http://localhost:5000
- Supabase Dashboard: https://your-project-ref.supabase.co

## 🔧 Cấu hình

### Environment Variables
Tạo file `.env` trong mỗi thư mục:

**Backend/.env**
```
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres
JWT_SECRET=your-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

**AI/.env**
```
FLASK_ENV=development
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres
OLLAMA_HOST=http://localhost:11434
```

## 📖 API Documentation

### Backend APIs
ví dụ nhé
- `GET /api/jobs` - Lấy danh sách việc làm
- `POST /api/jobs` - Tạo việc làm mới
- `GET /api/users/profile` - Lấy thông tin profile
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### AI APIs
- `POST /api/chat` - Chat với bot
- `POST /api/analyze-resume` - Phân tích CV
- `GET /api/job-recommendations` - Gợi ý việc làm

## 🧪 Testing

```bash
# Frontend tests
cd Frontend && npm test

# Backend tests
cd Backend && npm test

# AI service tests
cd AI && python -m pytest
```

## 🚀 Deployment

### Production với Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD với GitHub Actions
File `.github/workflows/deploy.yml` được cấu hình sẵn cho auto-deployment.

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Developer**: Your Name
- **Email**: your-email@example.com
- **Project Link**: https://github.com/your-username/Website-Recruitment-Integration-Chatbot

---

⭐ **Star** repository này nếu bạn thấy hữu ích!