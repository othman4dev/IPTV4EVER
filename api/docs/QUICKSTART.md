# 🎯 Quick Start Guide

## 1️⃣ Install Docker Desktop for Mac

**Download:** https://www.docker.com/products/docker-desktop

- Open the .dmg file
- Drag Docker to Applications
- Launch Docker Desktop
- Wait for the whale icon in menu bar to be stable

## 2️⃣ Start Everything

Once Docker is running:

```bash
cd /Users/macbook/Desktop/iptv4ever
./start-with-db.sh
```

Or manually:

```bash
# Start MySQL
docker-compose up -d

# Start app
npm run dev
```

## 3️⃣ Test It Works

**Register a user:**

```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@iptv4ever.com",
    "name": "Test User",
    "password": "TestP@ss123"
  }'
```

## ✅ What You Have Now

- ✅ MySQL database running in Docker
- ✅ Users stored in real database (not memory)
- ✅ Data persists after restart
- ✅ Professional database setup
- ✅ Ready for production scaling

## 🔧 Common Commands

```bash
# Start MySQL
docker-compose up -d

# Stop MySQL
docker-compose down

# View database
docker exec -it iptv4ever-mysql mysql -u iptv4ever_user -p
# Password: iptv4ever_pass_2026

# Check MySQL logs
docker-compose logs mysql

# Restart everything
docker-compose restart
```

## 📊 Database Clients (Optional)

Install any to view your data:

- **TablePlus** (Best for Mac)
- **MySQL Workbench** (Free, Official)
- **Sequel Ace** (Free, Mac)

Connection:

- Host: `localhost`
- Port: `3306`
- User: `iptv4ever_user`
- Password: `iptv4ever_pass_2026`
- Database: `iptv4ever_db`

---

**That's it! You're ready to go! 🚀**
