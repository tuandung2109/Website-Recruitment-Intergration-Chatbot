#!/bin/bash

# Script để setup và chạy toàn bộ dự án

echo "🚀 Bắt đầu setup Website Tuyển Dụng với Chatbot AI..."

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt. Vui lòng cài Docker trước."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt. Vui lòng cài Docker Compose trước."
    exit 1
fi

# Tạo các file .env nếu chưa có
echo "📝 Tạo file cấu hình environment..."

# Backend .env
if [ ! -f "./Backend/.env" ]; then
    cat > ./Backend/.env << EOL
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@postgres:5432/recruitment_db
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Upload configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# CORS
CORS_ORIGIN=http://localhost:3000
EOL
    echo "✅ Tạo Backend/.env thành công"
fi

# AI .env
if [ ! -f "./AI/.env" ]; then
    cat > ./AI/.env << EOL
FLASK_ENV=development
FLASK_APP=app.py
FLASK_DEBUG=1

# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/recruitment_db

# AI API Keys
OPENAI_API_KEY=your-openai-api-key-here
HUGGING_FACE_TOKEN=your-huggingface-token-here

# Vector Database
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# Local LLM
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=llama2

# Redis
REDIS_URL=redis://redis:6379/0

# Model settings
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
MAX_TOKENS=2048
TEMPERATURE=0.7
EOL
    echo "✅ Tạo AI/.env thành công"
fi

# Frontend .env
if [ ! -f "./Frontend/.env" ]; then
    cat > ./Frontend/.env << EOL
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AI_SERVICE_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_UPLOAD_URL=http://localhost:3001/uploads
GENERATE_SOURCEMAP=false
EOL
    echo "✅ Tạo Frontend/.env thành công"
fi

# Tạo thư mục uploads nếu chưa có
mkdir -p ./Backend/uploads
echo "" > ./Backend/uploads/.gitkeep

# Tạo SSL directory cho nginx (nếu cần)
mkdir -p ./Docker/ssl

echo "🐳 Bắt đầu build và chạy Docker containers..."

# Build và chạy containers
docker-compose down --remove-orphans
docker-compose up --build -d

echo "⏳ Đợi services khởi động..."
sleep 30

# Kiểm tra trạng thái containers
echo "📊 Kiểm tra trạng thái containers:"
docker-compose ps

# Kiểm tra logs nếu có container nào lỗi
echo "📋 Kiểm tra logs của các services:"
docker-compose logs --tail=10 postgres
docker-compose logs --tail=10 backend
docker-compose logs --tail=10 frontend
docker-compose logs --tail=10 ai_service

# Setup database (nếu cần)
echo "🗄️ Setup database..."
sleep 10
docker-compose exec postgres psql -U postgres -d recruitment_db -f /docker-entrypoint-initdb.d/init.sql || echo "Database đã được setup trước đó"

# Download Ollama model
echo "🤖 Download Ollama LLM model..."
docker-compose exec ollama ollama pull llama2 || echo "Model đã được download trước đó"

echo ""
echo "🎉 Setup hoàn tất!"
echo ""
echo "📍 Truy cập ứng dụng tại:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend API: http://localhost:3001"
echo "   🤖 AI Service: http://localhost:5000"
echo "   🗄️ Database: localhost:5432"
echo "   🔍 QDrant: http://localhost:6333"
echo "   🦙 Ollama: http://localhost:11434"
echo ""
echo "📝 Để xem logs: docker-compose logs -f [service_name]"
echo "🛑 Để dừng: docker-compose down"
echo "🔄 Để restart: docker-compose restart [service_name]"
echo ""
echo "✨ Chúc bạn code vui vẻ!"