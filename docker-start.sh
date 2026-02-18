#!/bin/bash

# Check for mode argument
MODE=${1:-prod}

if [ "$MODE" == "dev" ]; then
    echo "🐳 Starting IPTV4EVER - Development Mode (Hot Reload Enabled)"
    COMPOSE_FILE="docker-compose.dev.yml"
else
    echo "🐳 Starting IPTV4EVER - Production Mode"
    COMPOSE_FILE="docker-compose.yml"
fi

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

# Build and start all services
if [ "$MODE" == "dev" ]; then
    echo "🏗️  Building and starting services with hot reload..."
    echo "   Your code changes will be reflected instantly!"
else
    echo "🏗️  Building and starting all services..."
    echo "   This may take a few minutes on first run..."
fi
echo ""

docker-compose -f $COMPOSE_FILE up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
echo ""

# Wait for MySQL
echo "   🐬 Waiting for MySQL..."
sleep 10

# Wait for API
echo "   🔧 Waiting for API..."
sleep 5

# Wait for Client
echo "   🌐 Waiting for Client..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All services are running!"
echo ""
echo "📊 Services:"
echo "   🐬 MySQL:    localhost:3306"
echo "   🔧 API:      http://localhost:5001"
echo "   🌐 Client:   http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo "   View status:      docker-compose ps"
echo ""
echo "🎉 Your application is ready at: http://localhost:3000"
echo ""
