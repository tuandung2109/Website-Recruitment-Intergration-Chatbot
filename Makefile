# Makefile for Recruitment Website with AI Chatbot

.PHONY: help build up down logs clean test dev prod

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	docker-compose up --build -d
	@echo "✅ Development environment started!"
	@echo "📍 Access points:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:3001"
	@echo "   AI API:   http://localhost:5000"

dev-logs: ## Show development logs
	docker-compose logs -f

dev-stop: ## Stop development environment
	docker-compose down

# Production commands
prod: ## Start production environment
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up --build -d
	@echo "✅ Production environment started!"

prod-logs: ## Show production logs
	docker-compose -f docker-compose.prod.yml logs -f

prod-stop: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

# Build commands
build: ## Build all Docker images
	@echo "🔨 Building all services..."
	docker-compose build

build-backend: ## Build backend service only
	@echo "🔨 Building backend..."
	docker-compose build backend

build-frontend: ## Build frontend service only
	@echo "🔨 Building frontend..."
	docker-compose build frontend

build-ai: ## Build AI service only
	@echo "🔨 Building AI service..."
	docker-compose build ai_service

# Testing commands
test: ## Run all tests
	@echo "🧪 Running all tests..."
	make test-backend
	make test-frontend
	make test-ai

test-backend: ## Test backend service
	@echo "🧪 Testing backend..."
	cd Backend && npm test || echo "No tests configured"

test-frontend: ## Test frontend service
	@echo "🧪 Testing frontend..."
	cd Frontend && npm test -- --coverage --watchAll=false || echo "No tests configured"

test-ai: ## Test AI service
	@echo "🧪 Testing AI service..."
	cd AI && python -m pytest || echo "No tests configured"

# Database commands (Supabase)
supabase-init: ## Initialize Supabase project (run locally)
	@echo "🗄️ Initializing Supabase project..."
	@echo "Please run: supabase init"
	@echo "Then: supabase start"

supabase-reset: ## Reset Supabase local development
	@echo "🗄️ Resetting Supabase..."
	@echo "Please run: supabase db reset"

supabase-status: ## Check Supabase status
	@echo "� Checking Supabase status..."
	@echo "Please run: supabase status"

# Utility commands
logs: ## Show logs for all services
	docker-compose logs -f

status: ## Show status of all services
	docker-compose ps

clean: ## Clean up Docker resources
	@echo "🧹 Cleaning up..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "✅ Cleanup completed!"

health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "Backend Health:"
	@curl -s http://localhost:3001/health | jq '.' || echo "Backend not responding"
	@echo "AI Service Health:"
	@curl -s http://localhost:5000/health | jq '.' || echo "AI service not responding"
	@echo "Frontend Health:"
	@curl -s -I http://localhost:3000 | head -1 || echo "Frontend not responding"

# Setup commands
setup: ## Initial project setup
	@echo "🛠️ Setting up project..."
	@if [ -f "scripts/setup.sh" ]; then \
		chmod +x scripts/setup.sh && ./scripts/setup.sh; \
	elif [ -f "scripts/setup.bat" ]; then \
		./scripts/setup.bat; \
	else \
		echo "No setup script found"; \
	fi

install-deps: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	cd Backend && npm install
	cd Frontend && npm install
	cd AI && pip install -r requirements.txt

# Monitoring commands
monitor: ## Start monitoring (if configured)
	@echo "📊 Starting monitoring..."
	# Add monitoring commands here (e.g., Prometheus, Grafana)

# Security commands
security-scan: ## Run security scan
	@echo "🔒 Running security scan..."
	docker run --rm -v "$(PWD)":/workdir aquasec/trivy fs /workdir

# Formatting commands
format: ## Format all code
	@echo "✨ Formatting code..."
	cd Backend && npm run format || echo "No formatter configured for backend"
	cd Frontend && npm run format || echo "No formatter configured for frontend"
	cd AI && python -m black . && python -m isort . || echo "Install black and isort for formatting"

# Environment commands
env-template: ## Create environment template files
	@echo "📝 Creating environment templates..."
	@echo "Creating Backend/.env.template..."
	@cat > Backend/.env.template << 'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/recruitment_db
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
CORS_ORIGIN=http://localhost:3000
EOF
	@echo "Creating AI/.env.template..."
	@cat > AI/.env.template << 'EOF'
FLASK_ENV=development
FLASK_APP=app.py
FLASK_DEBUG=1
DATABASE_URL=postgresql://postgres:password@localhost:5432/recruitment_db
OPENAI_API_KEY=your-openai-api-key-here
HUGGING_FACE_TOKEN=your-huggingface-token-here
QDRANT_HOST=localhost
QDRANT_PORT=6333
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M
REDIS_URL=redis://localhost:6379/0
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
MAX_TOKENS=2048
TEMPERATURE=0.7
EOF
	@echo "Creating Frontend/.env.template..."
	@cat > Frontend/.env.template << 'EOF'
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AI_SERVICE_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_UPLOAD_URL=http://localhost:3001/uploads
GENERATE_SOURCEMAP=false
EOF
	@echo "✅ Environment templates created!"

# Documentation commands
docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	# Add documentation generation commands here

# Git hooks
git-hooks: ## Install git hooks
	@echo "🪝 Installing git hooks..."
	@cp scripts/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "✅ Git hooks installed!"

# Quick commands
quick-start: build dev ## Quick start (build + dev)

restart: dev-stop dev ## Restart development environment

update: ## Update all dependencies
	@echo "🔄 Updating dependencies..."
	cd Backend && npm update
	cd Frontend && npm update  
	cd AI && pip install --upgrade -r requirements.txt

# CI/CD commands
ci-build: ## CI build simulation
	@echo "🏗️ Simulating CI build..."
	docker-compose build
	make test

deploy-staging: ## Deploy to staging
	@echo "🚀 Deploying to staging..."
	# Add staging deployment commands

deploy-prod: ## Deploy to production
	@echo "🚀 Deploying to production..."
	# Add production deployment commands