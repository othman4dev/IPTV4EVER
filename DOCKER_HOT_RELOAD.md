# Docker Hot Reload Setup 🔥

## Overview

This project supports **two Docker modes**:

1. **Production Mode** - Optimized builds, no hot reload
2. **Development Mode** - Hot reload enabled via volume mounting

## Quick Start

### Development Mode (Hot Reload)

```bash
./docker-start.sh dev
```

Your code changes will be **instantly reflected** without rebuilding containers!

### Production Mode

```bash
./docker-start.sh
# or
./docker-start.sh prod
```

## How It Works

### Development Mode

- Uses `docker-compose.dev.yml`
- Mounts your source code into containers via volumes
- Code changes → Instant reload (no rebuild needed)
- NestJS uses `npm run start:dev` (watch mode)
- Vite uses `npm run dev` (HMR enabled)

### Production Mode

- Uses `docker-compose.yml`
- Builds optimized production images
- Code is baked into the container
- Code changes require rebuild

## Volume Mounting (Dev Mode)

### API (NestJS)

```yaml
volumes:
  - ./api/src:/app/src # Source code
  - ./api/tsconfig.json:/app/tsconfig.json
  - /app/node_modules # Preserve in container
```

### Client (React + Vite)

```yaml
volumes:
  - ./client/src:/app/src # Source code
  - ./client/vite.config.ts:/app/vite.config.ts
  - /app/node_modules # Preserve in container
```

## Commands Reference

### Start Services

```bash
# Development with hot reload
./docker-start.sh dev

# Production
./docker-start.sh prod
```

### Stop Services

```bash
# Stop development containers
./docker-stop.sh dev

# Stop production containers
./docker-stop.sh prod
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f api
docker-compose -f docker-compose.dev.yml logs -f client
```

### Rebuild After package.json Changes

If you add new npm packages, rebuild the containers:

```bash
./docker-stop.sh dev
./docker-start.sh dev
```

## When to Use Each Mode

### Use Development Mode When:

- ✅ Active development
- ✅ Need instant feedback on code changes
- ✅ Testing features quickly
- ✅ Working on frontend/backend simultaneously

### Use Production Mode When:

- ✅ Testing production builds
- ✅ Performance benchmarking
- ✅ Final deployment preparation
- ✅ CI/CD pipelines

## Local Development (Alternative)

For **fastest** development experience, run services locally:

```bash
# Terminal 1: Start MySQL only
docker-compose up mysql

# Terminal 2: API
cd api
npm run start:dev

# Terminal 3: Client
cd client
npm run dev
```

This gives you:

- ⚡ Fastest hot reload
- 🔍 Better debugging
- 📊 Direct terminal output

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5001  # API
lsof -i :3000  # Client
lsof -i :3306  # MySQL

# Kill the process
kill -9 <PID>
```

### Hot Reload Not Working

1. Check if dev mode is running:

   ```bash
   docker ps
   # Should see: iptv4ever-api-dev, iptv4ever-client-dev
   ```

2. Check logs for errors:

   ```bash
   docker-compose -f docker-compose.dev.yml logs -f api
   ```

3. Rebuild containers:
   ```bash
   ./docker-stop.sh dev
   ./docker-start.sh dev
   ```

### Node Modules Issues

If you see module not found errors after adding packages:

```bash
# Rebuild to install new dependencies
./docker-stop.sh dev
./docker-start.sh dev
```

## File Structure

```
iptv4ever/
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup (hot reload)
├── docker-start.sh             # Start script (supports dev/prod)
├── docker-stop.sh              # Stop script (supports dev/prod)
├── api/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development (hot reload)
│   └── src/                    # Mounted in dev mode
└── client/
    ├── Dockerfile              # Production build
    ├── Dockerfile.dev          # Development (hot reload)
    └── src/                    # Mounted in dev mode
```

## Performance Comparison

| Mode            | Startup Time | Code Change → Visible | Use Case          |
| --------------- | ------------ | --------------------- | ----------------- |
| **Local Dev**   | ~5 seconds   | < 1 second            | Daily development |
| **Docker Dev**  | ~30 seconds  | 1-3 seconds           | Docker testing    |
| **Docker Prod** | ~2 minutes   | Rebuild required      | Production prep   |

## Best Practices

1. **Daily Development**: Use local development
2. **Testing Docker Setup**: Use dev mode
3. **Pre-deployment**: Test production mode
4. **CI/CD**: Use production mode

## Environment Variables

Both modes use the same `.env` file in the `api/` directory:

```env
DB_HOST=mysql
DB_PORT=3306
DB_USER=hotiptv_user
DB_PASSWORD=hotiptv_pass123
DB_NAME=iptv4ever
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d
```

## Summary

**Development Mode**: Code changes = Instant reload ⚡  
**Production Mode**: Code changes = Rebuild required 🏗️

Choose the mode that fits your workflow!
