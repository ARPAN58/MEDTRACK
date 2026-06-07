#!/bin/bash

# MedTrack - Security Fix Verification Script
# Run this script to verify all security improvements are in place

echo "=================================================="
echo "  MedTrack Security & Quality Fixes Verification"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
    return 0
  else
    echo -e "${RED}✗${NC} $1 missing"
    return 1
  fi
}

check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $1 contains '$2'"
    return 0
  else
    echo -e "${RED}✗${NC} $1 missing '$2'"
    return 1
  fi
}

echo -e "${BLUE}=== Backend Files ===${NC}"
check_file "server/.env.example"
check_file "server/src/middleware/errorHandler.js"
check_file "server/src/utils/logger.js"
check_file "server/src/utils/validators.js"
check_file "server/jest.config.js"
check_file "server/src/__tests__/validation.test.js"

echo ""
echo -e "${BLUE}=== Frontend Files ===${NC}"
check_file "client/.env.example"

echo ""
echo -e "${BLUE}=== Documentation ===${NC}"
check_file "SECURITY_FIXES.md"
check_file "QUICK_START.md"

echo ""
echo -e "${BLUE}=== Server Configuration ===${NC}"
check_content "server/constant.js" "JWT_EXPIRES_IN"
check_content "server/constant.js" "process.exit(1)" # Env validation
check_content "server/server.js" "helmet()"
check_content "server/server.js" "rateLimit"
check_content "server/server.js" "errorHandler"

echo ""
echo -e "${BLUE}=== Authentication Routes ===${NC}"
check_content "server/src/routes/auth.js" "/api/v1"
check_content "server/src/routes/auth.js" "validate(signupSchema)"

echo ""
echo -e "${BLUE}=== Controllers ===${NC}"
check_content "server/src/controllers/authController.js" "logger.info"
check_content "server/src/controllers/authController.js" "refreshToken"
check_content "server/src/controllers/authController.js" "asyncHandler"

echo ""
echo -e "${BLUE}=== Frontend Configuration ===${NC}"
check_content "client/src/contexts/AuthContext.jsx" "import.meta.env.VITE_API_BASE_URL"
check_content "client/src/contexts/AuthContext.jsx" "/api/v1/auth"

echo ""
echo -e "${BLUE}=== Package Dependencies ===${NC}"
check_content "server/package.json" "helmet"
check_content "server/package.json" "express-rate-limit"
check_content "server/package.json" "joi"
check_content "server/package.json" "winston"
check_content "server/package.json" "xss"

echo ""
echo -e "${BLUE}=== Code Quality Checks ===${NC}"
if ! grep -r "console.log" "server/src/controllers" "server/src/middleware" 2>/dev/null | grep -v "node_modules"; then
  echo -e "${GREEN}✓${NC} No console.log in controllers/middleware"
else
  echo -e "${RED}✗${NC} console.log found in controllers/middleware"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✓ Fix Verification Complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. cd server && npm install"
echo "2. cp .env.example .env"
echo "3. Edit .env with your configuration"
echo "4. npm run dev"
echo ""
echo "5. cd ../client && npm install"
echo "6. cp .env.example .env"
echo "7. Edit .env with API URL"
echo "8. npm run dev"
echo ""
