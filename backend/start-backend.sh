#!/bin/bash

echo "🚀 Starting Tindigwa Backend..."

# Kill any existing backend process
pkill -f "tindigwa-1.0.0.jar"
sleep 2

# Load environment variables from .env file
set -a
source /home/blessing/Projects/Others/tindigwa-frontend/backend/.env
set +a

echo "✅ Environment variables loaded"
echo "   SMTP_USERNAME: $SMTP_USERNAME"
echo "   SMTP_FROM_EMAIL: $SMTP_FROM_EMAIL"

# Start backend
cd /home/blessing/Projects/Others/tindigwa-frontend/backend
nohup java -jar target/tindigwa-1.0.0.jar > /tmp/backend.log 2>&1 &

echo "⏳ Waiting for backend to start..."
sleep 20

# Check if backend is running
if curl -s http://localhost:8081/api/auth/setup-status > /dev/null; then
    echo "✅ Backend started successfully!"
    echo "   URL: http://localhost:8081"
    echo "   Logs: tail -f /tmp/backend.log"
else
    echo "❌ Backend failed to start. Check logs:"
    echo "   tail -50 /tmp/backend.log"
    exit 1
fi
