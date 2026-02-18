# 🐳 Full Docker Setup - IPTV4EVER

## Overview

All services now run in Docker containers:

- 🐬 **MySQL** - Database
- 🔧 **NestJS API** - Backend
- 🌐 **React Client** - Frontend

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Docker Network                     │
│                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  MySQL   │◄───│   API    │◄───│  Client  │ │
│  │  :3306   │    │  :5001   │    │  :3000   │ │
│  └──────────┘    └──────────┘    └──────────┘ │
│       │               │               │        │
└───────┼───────────────┼───────────────┼────────┘
        │               │               │
    localhost:3306  localhost:5001  localhost:3000
```

## Quick Start

### 1. Start Everything

```bash
./docker-start.sh
```

This will:

- Build all Docker images
- Start MySQL, API, and Client
- Set up networking
- Wait for services to be ready

### 2. Access Your App

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5001
- **MySQL:** localhost:3306

### 3. Stop Everything

```bash
./docker-stop.sh
```

## Manual Commands

### Build and Start

```bash
docker-compose up --build -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f client
docker-compose logs -f mysql
```

### Check Status

```bash
docker-compose ps
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart api
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose up --build -d api
docker-compose up --build -d client

# Rebuild everything
docker-compose up --build -d
```

## Service Communication

### How They Communicate

**Inside Docker Network:**

- API connects to MySQL using hostname: `mysql`
- Client connects to API using hostname: `api` (but exposed to host as localhost:5001)

**From Your Computer:**

- Access via `localhost:3000` (Client)
- Access via `localhost:5001` (API)
- Access via `localhost:3306` (MySQL)

### Environment Variables

**API Container:**

```env
DB_HOST=mysql          # Uses Docker service name
DB_PORT=3306
PORT=5001
```

**Client Container:**

```env
VITE_API_URL=http://localhost:5001  # Public URL
```

## Development vs Production

### Development (Current Setup)

```bash
# Run locally without Docker
npm run dev

# MySQL only in Docker
docker-compose up -d mysql
```

### Production (Full Docker)

```bash
# Everything in Docker
./docker-start.sh
```

## File Structure

```
iptv4ever/
├── docker-compose.yml          # Orchestrates all services
├── docker-start.sh             # Start script
├── docker-stop.sh              # Stop script
│
├── api/
│   ├── Dockerfile              # API container config
│   ├── .dockerignore           # Files to exclude
│   └── src/                    # API source code
│
└── client/
    ├── Dockerfile              # Client container config
    ├── .dockerignore           # Files to exclude
    ├── nginx.conf              # Web server config
    └── src/                    # Client source code
```

## Dockerfile Explained

### API Dockerfile

- **Build Stage:** Compiles TypeScript to JavaScript
- **Production Stage:** Runs compiled code with Node.js
- Multi-stage build keeps image small

### Client Dockerfile

- **Build Stage:** Builds React app
- **Production Stage:** Serves with Nginx
- Static files served efficiently

## Troubleshooting

### Service Won't Start?

```bash
# Check logs
docker-compose logs [service-name]

# Rebuild
docker-compose up --build -d [service-name]
```

### Port Already in Use?

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5001
lsof -i :3306

# Stop conflicting process or change port in docker-compose.yml
```

### Database Connection Failed?

```bash
# Wait for MySQL to be ready
docker-compose logs mysql

# Restart API after MySQL is ready
docker-compose restart api
```

### Code Changes Not Reflecting?

```bash
# Rebuild the service
docker-compose up --build -d api
# or
docker-compose up --build -d client
```

### Reset Everything?

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Start fresh
docker-compose up --build -d
```

## Data Persistence

### MySQL Data

- Stored in Docker volume: `mysql_data`
- Persists across container restarts
- Only deleted with `docker-compose down -v`

### View Data Location

```bash
docker volume inspect iptv4ever_mysql_data
```

## Performance

### Build Times

- **First build:** 5-10 minutes (downloads images, installs dependencies)
- **Subsequent builds:** 1-2 minutes (uses cache)

### Resource Usage

- **MySQL:** ~200MB RAM
- **API:** ~100MB RAM
- **Client:** ~20MB RAM (Nginx is lightweight)

## Production Deployment

### Steps to Deploy

1. **Update docker-compose.yml for production:**
   - Change passwords
   - Set `NODE_ENV=production`
   - Remove port 3306 exposure (security)
   - Add SSL certificates

2. **Use environment files:**

   ```bash
   docker-compose --env-file .env.production up -d
   ```

3. **Enable HTTPS:**
   - Add Nginx SSL configuration
   - Use Let's Encrypt certificates

4. **Set up reverse proxy:**
   - Use Nginx or Traefik
   - Handle SSL termination
   - Load balancing

## Useful Commands

### Execute Commands in Container

```bash
# Access MySQL CLI
docker exec -it iptv4ever-mysql mysql -u iptv4ever_user -p

# Access API container shell
docker exec -it iptv4ever-api sh

# Access Client container shell
docker exec -it iptv4ever-client sh
```

### Check Container Resources

```bash
docker stats
```

### Clean Up Docker

```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

## Benefits of Full Docker Setup

✅ **Consistency:** Same environment everywhere  
✅ **Isolation:** Services don't conflict  
✅ **Portability:** Works on any OS  
✅ **Scalability:** Easy to add services  
✅ **Production-Ready:** Deploy anywhere  
✅ **Team Collaboration:** Same setup for everyone

## Development Workflow

### Option 1: Full Docker

```bash
# Start everything in Docker
./docker-start.sh

# Make code changes
# Rebuild affected service
docker-compose up --build -d api
```

### Option 2: Hybrid (Recommended for Development)

```bash
# MySQL in Docker
docker-compose up -d mysql

# API and Client locally
npm run dev
```

This gives you:

- Fast rebuild times
- Hot module replacement
- Easy debugging
- Real database

---

**You now have a production-ready, fully containerized IPTV platform! 🎉**
