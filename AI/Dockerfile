# Sử dụng Python 3.11 slim image
FROM python:3.11-slim

# Thiết lập working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and frontend templates
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set PYTHONPATH để có thể import modules
ENV PYTHONPATH=/app/backend

# Set Docker environment flag và Ollama URL for container
ENV DOCKER_ENV=true
ENV OLLAMA_URL=http://host.docker.internal:11434
ENV OLLAMA_MODEL=hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF:Q4_K_M 

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Command to run the application
CMD ["python", "backend/app/main.py"]
