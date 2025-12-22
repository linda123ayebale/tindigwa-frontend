# Deployment Guide - Environment Configuration

## Overview

The Tindigwa frontend now supports environment-based configuration, allowing you to build the application for different environments (development vs production) without changing code.

## How It Works

React uses environment variables prefixed with `REACT_APP_` that are embedded into the build at **build time**. This means:
- When you run `npm start`, it uses `.env.development`
- When you run `npm run build`, it uses `.env.production`

## Environment Files

### `.env.development` (Development - Local)
```env
REACT_APP_API_BASE_URL=http://localhost:8081/api
REACT_APP_WS_URL=http://localhost:8081/ws
```
**Used for:** Local development with `npm start`

### `.env.production` (Production - cashtankfinance.com)
```env
REACT_APP_API_BASE_URL=https://cashtankfinance.com/api
REACT_APP_WS_URL=https://cashtankfinance.com/ws
```
**Used for:** Production builds with `npm run build`

### `.env.example` (Template)
A template file showing all available environment variables. Not used directly.

## Development Workflow

### Local Development (No Changes Needed!)
Your development workflow remains unchanged:

```bash
# Start development server (uses .env.development)
npm start

# Your app connects to:
# - API: http://localhost:8081/api
# - WebSocket: http://localhost:8081/ws
```

### Production Build

To build for production deployment to cashtankfinance.com:

```bash
# Build for production (uses .env.production)
npm run build

# This creates a build/ folder with static files
# All API calls will point to:
# - API: https://cashtankfinance.com/api
# - WebSocket: https://cashtankfinance.com/ws
```

## Updated Files

### Files with Environment Support
1. **`src/services/api.js`** - Main API service (already had support, now improved)
2. **`src/pages/Auth/Setup.jsx`** - Setup page authentication
3. **`src/services/websocketService.js`** - WebSocket connections

All these files now use:
```javascript
const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';
```

This means:
- ✅ If environment variable exists → use it
- ✅ If not → fallback to localhost:8081 (safe default)

## Backend Configuration Required

### Development Backend (No Changes)
Your backend should continue running on `http://localhost:8081` with CORS allowing `http://localhost:3000`

### Production Backend (Updates Required)
For production, your backend at `cashtankfinance.com` needs:

1. **CORS Configuration** - Update Spring Boot to allow your production domain:
```java
@CrossOrigin(origins = {
    "http://localhost:3000",           // Development
    "https://cashtankfinance.com"      // Production
})
```

2. **SSL Certificate** - Ensure backend is accessible via HTTPS at `https://cashtankfinance.com`

3. **WebSocket Support** - Ensure WebSocket endpoint is accessible at `https://cashtankfinance.com/ws`

## Deployment Steps

### Step 1: Build the Production Bundle
```bash
cd /home/blessing/Projects/Others/tindigwa-frontend/frontend
npm run build
```

This creates a `build/` folder with production-ready static files pointing to cashtankfinance.com.

### Step 2: Deploy Build Folder
Upload the contents of the `build/` folder to your web server (Nginx, Apache, CDN, etc.)

### Step 3: Configure Web Server
Your web server should:
- Serve the static files from the `build/` folder
- Route all requests to `index.html` (for React Router to work)
- Support HTTPS

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name cashtankfinance.com;
    root /var/www/tindigwa-frontend/build;
    index index.html;

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Testing Before Deployment

### Test Development Build
```bash
npm start
# Should connect to localhost:8081
```

### Test Production Build Locally (Optional)
```bash
# Build production version
npm run build

# Serve it locally to test
npx serve -s build -p 3000

# Note: API calls will go to cashtankfinance.com (not localhost)
```

## Troubleshooting

### Issue: API calls still going to localhost after production build
**Solution:** 
- Verify you ran `npm run build` (not `npm start`)
- Check that `.env.production` exists and has correct URL
- Clear build folder and rebuild: `rm -rf build && npm run build`

### Issue: CORS errors in production
**Solution:**
- Update backend CORS configuration to allow production domain
- Ensure backend is accessible via HTTPS

### Issue: WebSocket connection fails
**Solution:**
- Verify WebSocket endpoint is accessible: `https://cashtankfinance.com/ws`
- Check firewall rules allow WebSocket connections
- Ensure SSL certificate covers WebSocket endpoint

## Environment Variables Reference

| Variable | Development | Production | Description |
|----------|------------|------------|-------------|
| `REACT_APP_API_BASE_URL` | `http://localhost:8081/api` | `https://cashtankfinance.com/api` | Backend REST API URL |
| `REACT_APP_WS_URL` | `http://localhost:8081/ws` | `https://cashtankfinance.com/ws` | Backend WebSocket URL |
| `REACT_APP_API_TIMEOUT` | `10000` | `15000` | API timeout (milliseconds) |
| `REACT_APP_DEBUG_MODE` | `true` | `false` | Enable debug logging |

## Security Notes

1. **Never commit sensitive values** to `.env` files
2. **`.env.local`** can be used for local overrides (already in `.gitignore`)
3. **Environment variables are PUBLIC** - They're embedded in the JavaScript bundle and visible in browser
4. **Never store secrets** in React environment variables (API keys, passwords, etc.)

## Additional Configuration

### Custom Environment
If you need a custom environment (e.g., staging):

1. Create `.env.staging`:
```env
REACT_APP_API_BASE_URL=https://staging.cashtankfinance.com/api
REACT_APP_WS_URL=https://staging.cashtankfinance.com/ws
```

2. Build with custom env:
```bash
REACT_APP_ENV=staging npm run build
```

Or use cross-env for Windows compatibility:
```bash
npm install --save-dev cross-env
cross-env REACT_APP_ENV=staging npm run build
```

## Quick Reference

| Command | Environment | API Target | Use Case |
|---------|------------|------------|----------|
| `npm start` | Development | `localhost:8081` | Local development |
| `npm run build` | Production | `cashtankfinance.com` | Production deployment |
| `npm test` | Test | `localhost:8081` | Running tests |

## Support

If you encounter issues:
1. Check that `.env.development` and `.env.production` exist
2. Verify environment variable names start with `REACT_APP_`
3. Restart development server after changing `.env` files
4. Clear build folder: `rm -rf build`
5. Rebuild: `npm run build`
