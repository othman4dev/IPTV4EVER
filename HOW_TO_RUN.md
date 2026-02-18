# 🚀 How to Run Your Project

## Two Options Available

### Option 1: Full Docker (Production-Ready) 🐳

**Everything runs in Docker containers**

```bash
./docker-start.sh
```

**Pros:**

- ✅ Production-ready
- ✅ Same environment everywhere
- ✅ Easy deployment
- ✅ Isolated services

**Cons:**

- ❌ Slower rebuild on code changes
- ❌ No hot reload
- ❌ More resource usage

**Use When:**

- Testing production build
- Deploying to server
- Sharing with team
- Want everything isolated

---

### Option 2: Hybrid - MySQL in Docker, Code Local 💻

**Database in Docker, API & Client run locally**

```bash
# Start MySQL only
docker-compose up -d mysql

# Run API and Client locally
npm run dev
```

**Pros:**

- ✅ Fast development
- ✅ Hot module reload
- ✅ Easy debugging
- ✅ Less resource usage

**Cons:**

- ❌ Need Node.js installed locally
- ❌ Different from production

**Use When:**

- Active development
- Making frequent code changes
- Debugging
- Learning

---

## Quick Commands Cheatsheet

### Full Docker

```bash
# Start everything
./docker-start.sh

# Stop everything
./docker-stop.sh

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build -d

# Reset everything
docker-compose down -v
```

### Hybrid (Development)

```bash
# Start MySQL
docker-compose up -d mysql

# Start API & Client
npm run dev

# Stop MySQL
docker-compose down
```

---

## Recommended Setup

**For Development (Daily Work):**

```bash
docker-compose up -d mysql
npm run dev
```

**For Testing Production Build:**

```bash
./docker-start.sh
```

**For Deployment:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## What's Running Where?

### Full Docker Mode

- MySQL: Docker container → localhost:3306
- API: Docker container → localhost:5001
- Client: Docker container → localhost:3000

### Hybrid Mode

- MySQL: Docker container → localhost:3306
- API: Your Mac → localhost:5001
- Client: Your Mac → localhost:3000

---

**Pick what works best for you! 🎯**
