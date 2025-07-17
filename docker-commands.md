# 🐳 Docker Commands Reference

## Quick Start Commands

### Build and Start Application
```bash
# For Docker Compose V2 (newer)
docker compose up --build -d

# For Docker Compose V1 (legacy)
docker-compose up --build -d
```

### Stop Application
```bash
docker compose down
# or
docker-compose down
```

### View Logs
```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### Restart Services
```bash
docker compose restart
```

### Rebuild from Scratch
```bash
# Stop everything
docker compose down

# Remove containers and volumes
docker compose down -v

# Rebuild and start
docker compose up --build -d
```

## Debugging Commands

### Check Container Status
```bash
docker compose ps
```

### Execute Commands in Containers
```bash
# Backend container
docker compose exec backend bash

# Frontend container
docker compose exec frontend sh
```

### View Container Resource Usage
```bash
docker stats
```

### Clean Up Everything
```bash
# Remove all containers, networks, and volumes
docker compose down -v --remove-orphans

# Remove unused Docker images
docker image prune -f
```

## Access Points After Startup
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Testing**: http://localhost:8000/redoc

## Troubleshooting

### Port Conflicts
If ports 3000 or 8000 are in use:
```bash
# Kill processes using these ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

### Container Build Issues
```bash
# Force rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Database Issues
```bash
# Remove database volume and restart
docker compose down -v
docker compose up --build -d
``` 