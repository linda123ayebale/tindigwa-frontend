# 🚀 Tindigwa Quick Start Guide

**Frontend ↔ Backend Synchronization Setup**

## ⚡ **Quick Start Commands**

### **Option 1: Use the PowerShell Script (Recommended)**
```powershell
# In the root directory (tindigwa-frontend/)
./start-dev.ps1
```

### **Option 2: Manual Setup**

#### **1. Start Backend (Terminal 1)**
```bash
cd backend
mvn spring-boot:run
# Wait for: "Started Tindigwa in X seconds"
# Backend will be at: http://localhost:8080
```

#### **2. Start Frontend (Terminal 2)**
```bash
cd frontend
npm install    # First time only
npm start
# Frontend will be at: http://localhost:3000
```

## 🔧 **Configuration Overview**

### **Ports & URLs:**
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080/api`
- **CORS:** Enabled for localhost:3000

### **Environment Variables (.env):**
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_DEBUG=true
PORT=3000
```

## 🎯 **Testing the Integration**

### **1. Visual Connection Status**
- Look for the **Connection Status widget** in the top-right corner
- **Green ✅**: Backend is connected
- **Red ❌**: Backend is disconnected
- **Yellow 🔄**: Checking connection

### **2. Test API Calls in Browser Console**
```javascript
// Open browser dev tools (F12) and paste:

// Test basic connectivity
fetch('http://localhost:8080/api/clients')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Backend error:', err));

// Test authentication
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test@example.com',
    password: 'password'
  })
}).then(r => r.json()).then(console.log);
```

### **3. Test Login Flow**
1. Navigate to: `http://localhost:3000/login`
2. Enter any credentials (will attempt real backend login)
3. Check Network tab for API calls to `:8080`
4. Check Console for debug logs (if DEBUG=true)

## 🔍 **Debugging & Troubleshooting**

### **Debug Mode**
When `REACT_APP_DEBUG=true`, you'll see detailed API logs:
```
🔗 API Request: POST http://localhost:8080/api/auth/login
📤 Config: {headers: {...}, method: 'POST', body: '...'}
📥 Response Status: 200 OK
📊 Response Data: {token: '...', message: '...'}
✅ API Request Successful
```

### **Common Issues & Solutions**

#### **🚨 "Cannot connect to backend server"**
```
❌ Error: Cannot connect to backend server. Please ensure the backend is running on http://localhost:8080
```
**Solution:** Start the backend server first:
```bash
cd backend && mvn spring-boot:run
```

#### **🚨 CORS Policy Error**
```
Access to fetch at 'http://localhost:8080/api/...' blocked by CORS policy
```
**Solution:** Backend CORS is configured, but ensure:
- Backend is running
- No firewall blocking port 8080
- SecurityConfig.java has correct CORS setup

#### **🚨 404 Not Found**
```
GET http://localhost:8080/api/clients 404 (Not Found)
```
**Solution:** Check backend endpoints are properly mapped

#### **🚨 401 Unauthorized**
```
POST http://localhost:8080/api/auth/login 401 (Unauthorized)
```
**Solution:** Check if backend has valid user data or test endpoints

## 🎪 **Features Configured**

### **Frontend Features:**
- ✅ Environment-based API URLs
- ✅ JWT token management
- ✅ Real-time connection monitoring
- ✅ Enhanced error handling
- ✅ Debug logging
- ✅ CORS handling

### **Backend Features:**
- ✅ CORS enabled for localhost:3000
- ✅ JWT authentication ready
- ✅ REST API endpoints
- ✅ Spring Security configured
- ✅ MySQL database support

## 📱 **User Interface**

### **Connection Status Widget:**
- **Position:** Top-right corner
- **Auto-refresh:** Every 30 seconds
- **Manual refresh:** Click 🔄 button
- **Shows:** Connection status, last check time, errors

### **Debug Console Logs:**
- **API Requests:** Method, URL, config
- **API Responses:** Status, data
- **Errors:** Detailed error information
- **Connection Issues:** Helpful error messages

## 🚀 **Development Workflow**

1. **Start backend** (wait for startup complete)
2. **Start frontend** (auto-opens browser)
3. **Check connection status** (top-right widget)
4. **Test login** at `/login`
5. **Monitor console** for API calls
6. **Use debug logs** to troubleshoot issues

## 📚 **API Endpoints Available**

- `POST /api/auth/login` - Authentication
- `GET /api/clients` - Get all clients  
- `POST /api/clients` - Create client
- `GET /api/loans` - Get loans
- `GET /api/payments` - Get payments
- `GET /api/branches` - Get branches

## 🎯 **Success Indicators**

✅ **Backend started:** Console shows "Started Tindigwa in X seconds"
✅ **Frontend started:** Browser opens to localhost:3000  
✅ **Connection widget:** Shows green "Backend Connected"
✅ **No CORS errors:** Clean browser console
✅ **API calls work:** Network tab shows successful requests
✅ **Debug logs:** Detailed request/response information

---

**🎉 You're all set! Your frontend and backend are now synchronized and ready for development.**
