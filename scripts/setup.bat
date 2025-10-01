@echo off
echo 🚀 Bắt đầu setup Website Tuyển Dụng với Chatbot AI...

REM Kiểm tra Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker chưa được cài đặt. Vui lòng cài Docker Desktop trước.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose chưa được cài đặt. Vui lòng cài Docker Desktop trước.
    pause
    exit /b 1
)

echo 📝 Tạo file cấu hình environment...

REM Backend .env
if not exist "Backend\.env" (
    if exist "Backend\.env.template" (
        copy "Backend\.env.template" "Backend\.env"
        echo ✅ Tạo Backend\.env từ template
    ) else (
        (
            echo NODE_ENV=development
            echo PORT=3001
            echo # Supabase Configuration
            echo SUPABASE_URL=https://your-project-ref.supabase.co
            echo SUPABASE_ANON_KEY=your-supabase-anon-key
            echo SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
            echo DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres
            echo JWT_SECRET=your-super-secret-jwt-key-here
            echo JWT_EXPIRES_IN=7d
            echo.
            echo # Email configuration
            echo EMAIL_HOST=smtp.gmail.com
            echo EMAIL_PORT=587
            echo EMAIL_USER=your-email@gmail.com
            echo EMAIL_PASS=your-email-password
            echo.
            echo # Upload configuration
            echo MAX_FILE_SIZE=10485760
            echo UPLOAD_DIR=uploads
            echo.
            echo # CORS
            echo CORS_ORIGIN=http://localhost:3000
        ) > Backend\.env
        echo ✅ Tạo Backend\.env thành công
    )
)

REM AI .env
if not exist "AI\.env" (
    if exist "AI\.env.template" (
        copy "AI\.env.template" "AI\.env"
        echo ✅ Tạo AI\.env từ template
    ) else (
        (
            echo FLASK_ENV=development
            echo FLASK_APP=app.py
            echo FLASK_DEBUG=1
            echo.
            echo # Supabase Configuration
            echo SUPABASE_URL=https://your-project-ref.supabase.co
            echo SUPABASE_ANON_KEY=your-supabase-anon-key
            echo SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
            echo DATABASE_URL=postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres
            echo.
            echo # AI API Keys
            echo OPENAI_API_KEY=your-openai-api-key-here
            echo HUGGING_FACE_TOKEN=your-huggingface-token-here
            echo.
            echo # Vector Database
            echo QDRANT_HOST=qdrant
            echo QDRANT_PORT=6333
            echo.
            echo # Local LLM
            echo OLLAMA_URL=http://host.docker.internal:11434
            echo OLLAMA_MODEL=hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M
            echo.
            echo # Redis
            echo REDIS_URL=redis://redis:6379/0
            echo.
            echo # Model settings
            echo EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
            echo MAX_TOKENS=2048
            echo TEMPERATURE=0.7
        ) > AI\.env
        echo ✅ Tạo AI\.env thành công
    )
)

REM Frontend .env
if not exist "Frontend\.env" (
    if exist "Frontend\.env.template" (
        copy "Frontend\.env.template" "Frontend\.env"
        echo ✅ Tạo Frontend\.env từ template
    ) else (
        (
            echo REACT_APP_API_URL=http://localhost:3001
            echo REACT_APP_AI_SERVICE_URL=http://localhost:5000
            echo REACT_APP_SOCKET_URL=http://localhost:3001
            echo REACT_APP_UPLOAD_URL=http://localhost:3001/uploads
            echo REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
            echo REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
            echo GENERATE_SOURCEMAP=false
        ) > Frontend\.env
        echo ✅ Tạo Frontend\.env thành công
    )
)

REM Main .env file
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ Tạo .env từ template
    )
)

REM Tạo thư mục uploads
if not exist "Backend\uploads" mkdir Backend\uploads
echo. > Backend\uploads\.gitkeep

REM Tạo SSL directory
if not exist "Docker\ssl" mkdir Docker\ssl

echo 🐳 Bắt đầu build và chạy Docker containers...

REM Build và chạy containers
docker-compose down --remove-orphans
docker-compose up --build -d

echo ⏳ Đợi services khởi động...
timeout /t 60 /nobreak >nul

echo 📊 Kiểm tra trạng thái containers:
docker-compose ps

echo 📋 Kiểm tra logs của các services:
docker-compose logs --tail=10 backend
docker-compose logs --tail=10 frontend
docker-compose logs --tail=10 ai_service

echo 🤖 Kiểm tra Ollama service...
echo Nếu bạn muốn sử dụng Ollama local, hãy chạy:
echo docker-compose exec ollama ollama pull hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M

echo.
echo 🎉 Setup hoàn tất!
echo.
echo 📍 Truy cập ứng dụng tại:
echo    🌐 Frontend: http://localhost:3000
echo    🔧 Backend API: http://localhost:3001
echo    🤖 AI Service: http://localhost:5000
echo    🗄️ Supabase: https://your-project-ref.supabase.co
echo    🔍 QDrant: http://localhost:6333
echo    🦙 Ollama: http://localhost:11434
echo.
echo 🛠️ Các lệnh hữu ích:
echo    📝 Xem logs: docker-compose logs -f [service_name]
echo    🛑 Dừng: docker-compose down
echo    🔄 Restart: docker-compose restart [service_name]
echo    🧹 Cleanup: make clean
echo    🏥 Health check: make health
echo.
echo 📚 Sử dụng Makefile:
echo    make dev      - Start development
echo    make test     - Run tests
echo    make clean    - Clean up
echo    make help     - Show all commands
echo.
echo ✨ Chúc bạn code vui vẻ!
pause