#!/bin/bash

# Loan Module E2E Test Runner
# This script runs Playwright E2E tests for loan tables

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Loan Module - E2E Test Runner"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Set environment variables
export FRONTEND_BASE_URL=${FRONTEND_BASE_URL:-http://localhost:3000}
export BACKEND_BASE_URL=${BACKEND_BASE_URL:-http://localhost:8081/api}

echo "📍 Frontend URL: $FRONTEND_BASE_URL"
echo "📍 Backend URL: $BACKEND_BASE_URL"
echo ""

# Check if backend is running
echo "🔍 Checking backend connectivity..."
if curl -s "$BACKEND_BASE_URL/loans" > /dev/null 2>&1; then
    echo "✅ Backend is accessible"
else
    echo "❌ Backend is not accessible at $BACKEND_BASE_URL"
    echo "   Please start the backend first: cd backend && mvn spring-boot:run"
    exit 1
fi
echo ""

# Check if frontend is running (if not using webServer)
if [ "$CI" != "true" ]; then
    echo "🔍 Checking frontend connectivity..."
    if curl -s "$FRONTEND_BASE_URL" > /dev/null 2>&1; then
        echo "✅ Frontend is accessible"
    else
        echo "⚠️  Frontend not running - Playwright will start it automatically"
    fi
fi
echo ""

# Run Playwright tests
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Running Playwright E2E Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx playwright test tests/e2e/loans-table.spec.ts "$@"

TEST_EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All E2E tests passed!"
else
    echo "❌ Some tests failed"
    echo ""
    echo "📝 To view the HTML report:"
    echo "   npx playwright show-report"
    echo ""
    echo "📸 Screenshots and videos (if any) are in:"
    echo "   test-results/"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $TEST_EXIT_CODE
