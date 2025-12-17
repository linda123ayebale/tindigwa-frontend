#!/bin/bash

# Script to run Loan Details E2E tests
# Usage: ./test-loan-details.sh [options]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Loan Details Page - E2E Test Runner            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

# Check if backend is running
echo -e "\n${YELLOW}🔍 Checking if backend is running...${NC}"
if curl -s http://localhost:8081/api/loans/4/complete > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo -e "${YELLOW}   Start backend with: cd ../backend && mvn spring-boot:run${NC}"
    exit 1
fi

# Parse command line options
HEADED=false
SLOW_MO=0
PROJECT="chromium"
SPECIFIC_TEST=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADED=true
            shift
            ;;
        --slow)
            SLOW_MO=500
            shift
            ;;
        --chrome)
            PROJECT="Google Chrome"
            shift
            ;;
        --pending)
            SPECIFIC_TEST="PENDING_APPROVAL State"
            shift
            ;;
        --approved)
            SPECIFIC_TEST="APPROVED State"
            shift
            ;;
        --disbursed)
            SPECIFIC_TEST="DISBURSED State"
            shift
            ;;
        --rejected)
            SPECIFIC_TEST="REJECTED State"
            shift
            ;;
        --responsive)
            SPECIFIC_TEST="Responsive Design"
            shift
            ;;
        --consistency)
            SPECIFIC_TEST="Backend-Frontend Data Consistency"
            shift
            ;;
        --help)
            echo ""
            echo "Usage: ./test-loan-details.sh [options]"
            echo ""
            echo "Options:"
            echo "  --headed        Run tests in headed mode (see browser)"
            echo "  --slow          Run tests in slow motion (500ms delay)"
            echo "  --chrome        Use Google Chrome instead of Chromium"
            echo ""
            echo "Test Filters:"
            echo "  --pending       Run only PENDING_APPROVAL state tests"
            echo "  --approved      Run only APPROVED state tests"
            echo "  --disbursed     Run only DISBURSED state tests"
            echo "  --rejected      Run only REJECTED state tests"
            echo "  --responsive    Run only responsive design tests"
            echo "  --consistency   Run only data consistency tests"
            echo ""
            echo "Examples:"
            echo "  ./test-loan-details.sh --headed --slow --pending"
            echo "  ./test-loan-details.sh --chrome --responsive"
            echo "  ./test-loan-details.sh"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build command
CMD="npx playwright test tests/e2e/loan-details.spec.ts"

# Add project selection
CMD="$CMD --project=\"$PROJECT\""

# Add headed mode if requested
if [ "$HEADED" = true ]; then
    CMD="HEADLESS=false $CMD"
    echo -e "${YELLOW}🖥️  Running in HEADED mode${NC}"
fi

# Add slow motion if requested
if [ "$SLOW_MO" -gt 0 ]; then
    CMD="SLOW_MO=$SLOW_MO $CMD"
    echo -e "${YELLOW}🐌 Running in SLOW MOTION (${SLOW_MO}ms)${NC}"
fi

# Add test filter if specified
if [ -n "$SPECIFIC_TEST" ]; then
    CMD="$CMD --grep=\"$SPECIFIC_TEST\""
    echo -e "${BLUE}🎯 Running only: $SPECIFIC_TEST${NC}"
fi

# Show command being run
echo -e "\n${BLUE}📋 Command:${NC} $CMD"
echo ""

# Run tests
eval $CMD

# Show results
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ ALL TESTS PASSED!                    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 View HTML report:${NC} npx playwright show-report"
else
    echo -e "\n${RED}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║           ❌ SOME TESTS FAILED                    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📊 View HTML report:${NC} npx playwright show-report"
    echo -e "${YELLOW}📸 Check screenshots in: test-results/${NC}"
    exit 1
fi
