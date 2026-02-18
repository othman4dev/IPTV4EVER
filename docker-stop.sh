#!/bin/bash

# Check for mode argument
MODE=${1:-prod}

if [ "$MODE" == "dev" ]; then
    echo "🛑 Stopping IPTV4EVER - Development Mode"
    COMPOSE_FILE="docker-compose.dev.yml"
else
    echo "🛑 Stopping IPTV4EVER - Production Mode"
    COMPOSE_FILE="docker-compose.yml"
fi

echo ""

docker-compose -f $COMPOSE_FILE down

echo ""
echo "✅ All services stopped!"
echo ""
echo "💡 To remove all data (including database), run:"
echo "   docker-compose down -v"
echo ""
