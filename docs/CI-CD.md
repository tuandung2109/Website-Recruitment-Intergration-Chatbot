# CI/CD Documentation

## 🚀 CI/CD Pipeline Overview

Dự án này sử dụng GitHub Actions để tự động hóa quá trình build, test và deploy cho 3 services chính:
- **Backend** (Node.js)
- **Frontend** (React)
- **AI Service** (Python/Flask)

## 📋 Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` hoặc `develop` branch
- Pull request to `main` branch

**Jobs:**
1. **Test Jobs**: Test từng service riêng biệt
2. **Build & Push**: Build Docker images và push lên GitHub Container Registry
3. **Deploy**: Deploy lên production environment
4. **Security Scan**: Scan vulnerabilities với Trivy
5. **Notify**: Thông báo kết quả deployment

### 2. PR Validation (`.github/workflows/pr-validation.yml`)

**Triggers:**
- Pull request tới `main` hoặc `develop`

**Jobs:**
1. **Validate**: Kiểm tra PR title, Docker files, code formatting
2. **Build Test**: Build Docker images (không push)
3. **Integration Test**: Chạy integration tests với test database

## 🔧 Setup CI/CD

### 1. GitHub Secrets

Cần thiết lập các secrets sau trong GitHub repository:

```bash
# Database
POSTGRES_PASSWORD=your-secure-password

# Backend
JWT_SECRET=your-jwt-secret-key

# AI Service
OPENAI_API_KEY=your-openai-api-key
HUGGING_FACE_TOKEN=your-huggingface-token

# Deployment (nếu deploy lên server)
HOST=your-server-ip
USERNAME=your-server-username
SSH_KEY=your-ssh-private-key
PORT=22
```

### 2. Container Registry

Pipeline sử dụng GitHub Container Registry (ghcr.io) để lưu trữ Docker images:

```bash
ghcr.io/your-username/website-recruitment-intergration-chatbot-backend:latest
ghcr.io/your-username/website-recruitment-intergration-chatbot-frontend:latest
ghcr.io/your-username/website-recruitment-intergration-chatbot-ai:latest
```

### 3. Environment Variables

#### Development
```bash
NODE_ENV=development
FLASK_ENV=development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_AI_SERVICE_URL=http://localhost:5000
```

#### Production
```bash
NODE_ENV=production
FLASK_ENV=production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_AI_SERVICE_URL=https://ai.yourdomain.com
```

## 🐳 Docker Configuration

### Multi-stage Builds

Tất cả services sử dụng optimized Docker builds:

**Frontend**: Multi-stage build với Nginx để serve static files
**Backend**: Single-stage với health checks
**AI Service**: Single-stage với Python optimizations

### Health Checks

Mỗi service có health check endpoint:
- Backend: `GET /health`
- AI Service: `GET /health`
- Frontend: HTTP 200 check

## 📦 Deployment Strategies

### 1. Development Deployment

```bash
# Local development
make dev

# Hoặc
docker-compose up --build -d
```

### 2. Production Deployment

```bash
# Sử dụng production compose file
docker-compose -f docker-compose.prod.yml up -d

# Hoặc với Makefile
make prod
```

### 3. Auto Deployment

Pipeline tự động deploy khi push lên `main` branch. Để enable auto-deployment lên server:

1. Uncomment deployment steps trong `ci-cd.yml`
2. Setup SSH keys và server credentials
3. Configure server với Docker và docker-compose

## 🧪 Testing Strategy

### Unit Tests
- **Backend**: Jest/Mocha tests
- **Frontend**: React Testing Library
- **AI Service**: pytest

### Integration Tests
- Database integration với test PostgreSQL
- API endpoint testing
- Service-to-service communication

### E2E Tests (Planned)
- Cypress tests cho complete user flows
- Chatbot conversation testing

## 🔒 Security

### Container Security
- Trivy vulnerability scanning
- Non-root user trong containers
- Minimal base images (Alpine/Slim)

### Code Security
- Dependency vulnerability checks
- Secret scanning
- SAST tools integration

### Runtime Security
- Health checks và restart policies
- Resource limits
- Network isolation

## 📊 Monitoring & Logging

### Logging
```bash
# View logs
docker-compose logs -f [service]

# With Makefile
make logs
make health
```

### Metrics (Planned)
- Prometheus metrics collection
- Grafana dashboards
- Application performance monitoring

## 🚀 Quick Commands

```bash
# Development
make dev                # Start development environment
make test              # Run all tests
make clean             # Clean up resources

# CI/CD
make ci-build          # Simulate CI build
make security-scan     # Run security scan

# Production
make prod              # Start production environment
make deploy-staging    # Deploy to staging
make deploy-prod       # Deploy to production
```

## 🔄 Rollback Strategy

### Quick Rollback
```bash
# Rollback to previous version
docker-compose down
docker-compose pull
docker-compose up -d
```

### Database Rollback
```bash
# Restore from backup
make db-backup         # Create backup first
# Then restore from specific backup file
```

## 📈 Performance Optimization

### Build Optimization
- Docker layer caching
- Multi-platform builds (AMD64, ARM64)
- Dependency caching
- Parallel builds

### Runtime Optimization
- Resource limits và requests
- Connection pooling
- Redis caching
- CDN integration (planned)

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
```bash
# Check build context
docker-compose build --no-cache

# Check logs
docker-compose logs [service]
```

2. **Service Not Starting**
```bash
# Check health
make health

# Check dependencies
docker-compose ps
```

3. **Database Connection Issues**
```bash
# Reset database
make db-reset

# Check connection
docker-compose exec postgres pg_isready
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
docker-compose up
```

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Container Security Guide](https://kubernetes.io/docs/concepts/security/)

---

**Note**: Đây là setup CI/CD cơ bản. Tùy theo requirements thực tế, có thể cần customize thêm cho production environment.