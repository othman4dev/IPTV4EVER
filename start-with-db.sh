#!/bin/bash

echo "🚀 Starting IPTV4EVER with MySQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop first, then run this script again."
    echo ""
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start MySQL
echo "🐬 Starting MySQL database..."
docker-compose up -d

echo ""
echo "⏳ Waiting for MySQL to be ready..."
sleep 5

# Check MySQL health
if docker-compose ps | grep -q "Up"; then
    echo "✅ MySQL is running!"
else
    echo "❌ MySQL failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Database Info:"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   Database: iptv4ever_db"
echo "   Username: iptv4ever_user"
echo ""
echo "🔧 API Server: http://localhost:5001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the application
npm run dev
