#!/bin/bash

# Loan Edit E2E Test Runner
# This script runs the comprehensive E2E tests for the loan edit functionality

set -e

echo "🧪 Tindigwa Loan Edit E2E Tests"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="${FRONTEND_BASE_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_BASE_URL:-http://localhost:8081/api}"
MODE="${1:-headless}"

echo "📋 Configuration:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo "  Mode:     $MODE"
echo ""

# Check if frontend is running
echo "🔍 Checking frontend availability..."
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible at $FRONTEND_URL${NC}"
    echo "   Please start the frontend: npm start"
    exit 1
fi

# Check if backend is running
echo "🔍 Checking backend availability..."
if curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL/\/api/}/actuator/health" | grep -q "200"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
elif curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/loans" | grep -q "200\|401"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may not be accessible at $BACKEND_URL${NC}"
    echo "   Tests may fail. Please ensure backend is running."
fi

echo ""
echo "🚀 Starting Playwright tests..."
echo ""

# Run tests based on mode
case "$MODE" in
    "headless"|"")
        echo "Running tests in headless mode..."
        FRONTEND_BASE_URL="$FRONTEND_URL" BACKEND_BASE_URL="$BACKEND_URL" \
            npx playwright test tests/e2e/loan-edit.spec.ts
        ;;
    "headed")
        echo "Running tests with visible browser..."
        FRONTEND_BASE_URL="$FRONTEND_URL" BACKEND_BASE_URL="$BACKEND_URL" \
            npx playwright test tests/e2e/loan-edit.spec.ts --headed
        ;;
    "debug")
        echo "Running tests in debug mode..."
        FRONTEND_BASE_URL="$FRONTEND_URL" BACKEND_BASE_URL="$BACKEND_URL" \
            npx playwright test tests/e2e/loan-edit.spec.ts --debug
        ;;
    "ui")
        echo "Opening Playwright UI..."
        FRONTEND_BASE_URL="$FRONTEND_URL" BACKEND_BASE_URL="$BACKEND_URL" \
            npx playwright test tests/e2e/loan-edit.spec.ts --ui
        ;;
    *)
        echo -e "${RED}❌ Invalid mode: $MODE${NC}"
        echo "Usage: $0 [headless|headed|debug|ui]"
        exit 1
        ;;
esac

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "📊 View detailed report:"
    echo "   npx playwright show-report"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "🔍 Debugging tips:"
    echo "   1. View HTML report: npx playwright show-report"
    echo "   2. Check test output above for details"
    echo "   3. Run in debug mode: $0 debug"
    echo "   4. Check screenshots in test-results/"
fi

echo ""
exit $TEST_EXIT_CODE
