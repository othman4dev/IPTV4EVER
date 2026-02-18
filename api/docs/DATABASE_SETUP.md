# 🐬 MySQL Database Setup Guide

## Step 1: Install Docker Desktop for Mac

1. **Download:** https://www.docker.com/products/docker-desktop
2. **Install:** Open the downloaded .dmg file and drag Docker to Applications
3. **Launch:** Open Docker Desktop from Applications
4. **Wait:** Wait for Docker to start (whale icon in menu bar will be stable)

## Step 2: Start MySQL Database

Once Docker Desktop is running, open your terminal and run:

```bash
cd /Users/macbook/Desktop/iptv4ever
docker-compose up -d
```

This will:

- Download MySQL 8.0 image
- Create a container named `iptv4ever-mysql`
- Start MySQL on port 3306
- Create database `iptv4ever_db`
- Set up user `iptv4ever_user`

## Step 3: Verify MySQL is Running

```bash
docker ps
```

You should see `iptv4ever-mysql` container running.

## Step 4: Start Your Application

```bash
npm run dev
```

Your NestJS app will:

- Connect to MySQL
- Automatically create the `users` table
- Start the API on http://localhost:5001

## Database Credentials

```
Host: localhost
Port: 3306
Database: iptv4ever_db
Username: iptv4ever_user
Password: iptv4ever_pass_2026
Root Password: iptv4ever_root_2026
```

## Useful Docker Commands

### Start MySQL

```bash
docker-compose up -d
```

### Stop MySQL

```bash
docker-compose down
```

### View MySQL logs

```bash
docker-compose logs -f mysql
```

### Access MySQL CLI

```bash
docker exec -it iptv4ever-mysql mysql -u iptv4ever_user -piptv4ever_pass_2026 iptv4ever_db
```

### Check MySQL status

```bash
docker-compose ps
```

### Remove everything (including data)

```bash
docker-compose down -v
```

## Connect with MySQL Client (Optional)

You can use any MySQL client to connect:

**Popular options:**

- **MySQL Workbench** (Free, Official)
- **TablePlus** (Mac, Best UI)
- **Sequel Ace** (Mac, Free)
- **DBeaver** (Free, Cross-platform)

**Connection details:**

- Host: `127.0.0.1` or `localhost`
- Port: `3306`
- Username: `iptv4ever_user`
- Password: `iptv4ever_pass_2026`
- Database: `iptv4ever_db`

## What Changed in Your Code

✅ **Database Integration:**

- Added TypeORM with MySQL support
- Created User entity with auto-generated UUID
- Updated AuthService to use database instead of in-memory
- Auto-sync enabled (creates tables automatically in dev)

✅ **New Dependencies:**

- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - Database ORM
- `mysql2` - MySQL driver

✅ **Database Schema:**

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

## Troubleshooting

### MySQL won't start?

```bash
# Check if port 3306 is in use
lsof -i :3306

# If something is using it, change port in docker-compose.yml:
ports:
  - "3307:3306"  # Use 3307 instead

# Then update .env:
DB_PORT=3307
```

### Can't connect to database?

```bash
# Restart Docker
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs mysql
```

### Reset everything?

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Production Notes

⚠️ **Before deploying:**

1. Change all passwords in `.env`
2. Set `synchronize: false` in TypeORM config
3. Use migrations instead of auto-sync
4. Use a managed MySQL service (AWS RDS, DigitalOcean, etc.)
5. Enable SSL for database connection

## Next Steps

Once MySQL is running and your app starts successfully:

1. Test user registration
2. Test user login
3. Check that data persists after restart
4. View data in MySQL client

---

**🎉 Your MySQL database is ready to use!**
