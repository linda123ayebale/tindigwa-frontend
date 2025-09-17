# Tindigwa Frontend-Backend Integration Testing Guide

## 🎯 **Integration Status: COMPLETE**

Both the React frontend and Spring Boot backend are now fully integrated and ready for testing!

## 📋 **Prerequisites**

### Backend Requirements:
- **Java 11** or higher
- **Maven 3.6+**
- **MySQL 8.0+**

### Frontend Requirements:
- **Node.js 16+**  
- **npm**

## 🚀 **Step 1: Start the Backend Server**

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Configure Database** (Update `src/main/resources/application.properties`):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tindigwa_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Start the Spring Boot server:**
   ```bash
   mvn spring-boot:run
   ```

   ✅ **Backend will be running at:** `http://localhost:8080`

## 🌐 **Step 2: Start the Frontend Server**

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (first time only):**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

   ✅ **Frontend will be running at:** `http://localhost:3000`

## 🧪 **Step 3: Test the Integration**

### **Test 1: Backend API Endpoints**

**Direct API Testing** (use Postman or curl):

```bash
# Test Authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "password"}'

# Test Clients API
curl -X GET http://localhost:8080/api/clients

# Test Branches API  
curl -X GET http://localhost:8080/api/branches
```

### **Test 2: Frontend-Backend Communication**

1. **Open Frontend:** `http://localhost:3000`
2. **Login Test:**
   - Navigate to `/login`
   - Enter credentials
   - Check browser Network tab for API calls to `localhost:8080`
   - Verify JWT token storage in localStorage

3. **Check CORS:**
   - Look for any CORS errors in browser console
   - API calls should succeed without cross-origin issues

### **Test 3: Authentication Flow**

1. **Login with valid credentials**
2. **Check localStorage for `authToken`**
3. **Navigate to protected routes**
4. **Verify API calls include `Authorization: Bearer {token}` header**

## 🔧 **API Service Testing**

### **Test Client Service:**
```javascript
// In browser console:
import ClientService from './services/clientService';

// Test getting all clients
ClientService.getAllClients()
  .then(clients => console.log('Clients:', clients))
  .catch(error => console.error('Error:', error));
```

### **Test Authentication Service:**
```javascript
// In browser console:
import AuthService from './services/authService';

// Test login
AuthService.login('username', 'password')
  .then(response => console.log('Login successful:', response))
  .catch(error => console.error('Login failed:', error));
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **1. CORS Errors**
```
Access to fetch at 'http://localhost:8080/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:** Ensure backend `SecurityConfig.java` includes CORS configuration:
```java
configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
```

#### **2. Connection Refused**
```
Failed to fetch: net::ERR_CONNECTION_REFUSED
```

**Solution:** 
- Verify backend is running on port 8080
- Check firewall settings
- Ensure MySQL database is running

#### **3. Authentication Errors**
```
401 Unauthorized
```

**Solution:**
- Check JWT token generation in backend
- Verify token is being sent in request headers
- Check token expiration

#### **4. Database Connection Issues**
```
Could not create connection to database server
```

**Solution:**
- Start MySQL service
- Create database: `CREATE DATABASE tindigwa_db;`
- Update connection credentials in `application.properties`

## 📊 **Success Indicators**

✅ **Backend Started:** Server logs show "Started Tindigwa in X seconds"  
✅ **Frontend Started:** Browser opens to `http://localhost:3000`  
✅ **CORS Working:** No cross-origin errors in browser console  
✅ **Authentication:** Login returns JWT token  
✅ **API Calls:** Network tab shows successful API requests  
✅ **Data Flow:** Frontend can create/read/update data via backend APIs  

## 🎉 **Integration Complete!**

Your Tindigwa frontend and backend are now fully integrated! The system supports:

- **JWT Authentication** 🔐
- **Client Management** 👥  
- **Loan Processing** 💰
- **Payment Tracking** 💳
- **CORS-enabled API** 🌐

## 📞 **Need Help?**

- Check browser developer console for errors
- Review backend logs for server-side issues  
- Verify database connectivity
- Ensure both servers are running on correct ports

---

**Happy Testing!** 🚀
