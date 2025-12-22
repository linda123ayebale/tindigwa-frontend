#!/bin/bash

echo "=========================================="
echo "🧹 CLEANING UP PORT 8081"
echo "=========================================="
echo ""

# Kill all backend JAR processes
echo "1. Stopping all tindigwa-1.0.0.jar processes..."
pkill -f "tindigwa-1.0.0.jar"
sleep 2

# Kill any Java process using port 8081
echo "2. Checking for processes on port 8081..."
PID=$(lsof -ti:8081 2>/dev/null)
if [ ! -z "$PID" ]; then
    echo "   Found process $PID using port 8081. Killing it..."
    kill -9 $PID
    sleep 1
else
    echo "   No process found on port 8081"
fi

# Verify
echo ""
echo "3. Verification:"
if lsof -i:8081 >/dev/null 2>&1; then
    echo "   ⚠️  WARNING: Port 8081 is still in use!"
    lsof -i:8081
else
    echo "   ✅ Port 8081 is FREE!"
fi

echo ""
echo "=========================================="
echo "✅ CLEANUP COMPLETE"
echo "You can now start IntelliJ backend"
echo "=========================================="
