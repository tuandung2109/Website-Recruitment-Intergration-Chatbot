# Tech Stack Overview

## 🛠️ Technology Stack cho Website Tuyển Dụng với AI Chatbot

### 🎨 **Frontend Layer**
```
React 18 + TypeScript
├── UI Framework: Ant Design
├── Styling: Tailwind CSS
├── State Management: Redux Toolkit
├── Routing: React Router DOM
├── HTTP Client: Axios
└── Real-time: Socket.IO Client
```

### 🚀 **Backend Layer**
```
Node.js + Express.js
├── Database Client: Supabase JS
├── Authentication: JWT + Supabase Auth
├── File Upload: Multer
├── Email: Nodemailer
├── Validation: Joi
├── Security: Helmet + CORS
└── Real-time: Socket.IO
```

### 🗄️ **Database Layer**
```
Supabase (PostgreSQL as a Service)
├── Database: Managed PostgreSQL
├── Authentication: Built-in Auth
├── Real-time: Built-in Subscriptions
├── Storage: Built-in File Storage
├── Security: Row Level Security (RLS)
└── APIs: Auto-generated REST + GraphQL
```

### 🤖 **AI/ML Layer**
```
Python + Flask
├── Web Framework: Flask
├── LLM Service: Ollama (Local)
├── Vector Database: QDrant
├── ML Models: Hugging Face Transformers
├── NLP Processing: Custom implementations
├── Database Client: Supabase Python
└── WSGI Server: Gunicorn
```

### 🐳 **DevOps & Infrastructure**
```
Docker + Docker Compose
├── Containerization: Docker
├── Orchestration: Docker Compose
├── Reverse Proxy: Nginx
├── CI/CD: GitHub Actions
├── Registry: GitHub Container Registry
└── Monitoring: Built-in health checks
```

## 📊 **Architecture Decisions**

### ✅ **What We Use**
- **Supabase**: Database-as-a-Service thay vì self-hosted PostgreSQL
- **Ollama**: Local LLM deployment thay vì cloud APIs only
- **QDrant**: Vector database cho semantic search
- **Docker**: Containerization cho consistent deployment
- **GitHub Actions**: CI/CD automation

### ❌ **What We Don't Use**
- **LangChain**: Quá complex cho simple chatbot use case
- **Sequelize**: Thay bằng Supabase client for better integration
- **Self-hosted PostgreSQL**: Supabase provides better DX
- **Complex microservices**: Monolithic approach for simplicity

## 🔧 **Key Libraries & Versions**

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "typescript": "^4.9.0",
  "antd": "^5.2.0",
  "tailwindcss": "^3.2.0",
  "@reduxjs/toolkit": "^1.9.0",
  "@supabase/supabase-js": "^2.38.0"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.0",
  "@supabase/supabase-js": "^2.38.0",
  "jsonwebtoken": "^9.0.0",
  "socket.io": "^4.6.0",
  "joi": "^17.7.0"
}
```

### AI Service Dependencies
```txt
flask==2.3.2
ollama>=0.4.0
qdrant-client
supabase>=2.0.0
transformers
torch
```

## 🎯 **Rationale Behind Choices**

### 🗄️ **Supabase vs PostgreSQL**
**Why Supabase:**
- ✅ Managed infrastructure
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Auto-generated APIs
- ✅ Better developer experience
- ✅ Cost-effective for MVP

### 🤖 **Ollama vs OpenAI only**
**Why Ollama:**
- ✅ Local deployment (privacy)
- ✅ No API costs for inference
- ✅ Offline capability
- ✅ Custom model flexibility
- ✅ No rate limiting

### 🔍 **QDrant vs other Vector DBs**
**Why QDrant:**
- ✅ High performance
- ✅ Easy Docker deployment
- ✅ Python client support
- ✅ Advanced filtering
- ✅ Good documentation

### 🚫 **Why No LangChain**
**Reasons to avoid:**
- ❌ Over-engineering for simple chatbot
- ❌ Heavy dependencies
- ❌ Rapid breaking changes
- ❌ Complex abstractions
- ❌ Better to understand fundamentals first

**Our approach:**
- ✅ Direct Ollama integration
- ✅ Custom conversation management
- ✅ Simple prompt engineering
- ✅ Lightweight and maintainable

## 🚀 **Deployment Strategy**

### Development
```bash
# Local development với Docker
docker-compose up -d

# Services:
# - Frontend: localhost:3000
# - Backend: localhost:3001  
# - AI Service: localhost:5000
# - Supabase: Remote (Cloud)
```

### Production
```bash
# GitHub Actions CI/CD
# - Build Docker images
# - Push to GitHub Container Registry  
# - Deploy to production server
# - Health checks & monitoring
```

## 📈 **Scalability Considerations**

### Current Architecture (MVP)
- **Frontend**: Single React app
- **Backend**: Single Node.js service
- **AI**: Single Python service
- **Database**: Supabase (auto-scaling)

### Future Scaling Options
- **Frontend**: CDN deployment, code splitting
- **Backend**: Load balancing, horizontal scaling
- **AI**: GPU acceleration, model optimization
- **Database**: Supabase auto-handles scaling

## 🔒 **Security Measures**

- **Authentication**: Supabase Auth + JWT
- **Authorization**: Row Level Security (RLS)
- **API Security**: CORS, Helmet, rate limiting
- **Container Security**: Non-root users, health checks
- **Secret Management**: Environment variables
- **HTTPS**: SSL/TLS termination at nginx

---

**Note**: Tech stack được thiết kế để balance giữa simplicity và functionality, phù hợp cho MVP và có thể scale sau này.