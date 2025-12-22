# 🔒 SECURITY IMPLEMENTATION GUIDE
## Tindigwa Loan Management System - Backend Security Hardening

---

## 🚨 CRITICAL SECURITY VULNERABILITIES FOUND

### Vulnerability Summary
| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Exposed credentials in `application.properties` | CRITICAL | ❌ Not Fixed |
| 2 | Authentication completely disabled | CRITICAL | ❌ Not Fixed |
| 3 | Wildcard CORS allowing any origin | HIGH | ❌ Not Fixed |
| 4 | No input validation on endpoints | HIGH | ❌ Not Fixed |
| 5 | Verbose error messages expose internals | MEDIUM-HIGH | ❌ Not Fixed |
| 6 | Path traversal in file operations | HIGH | ❌ Not Fixed |
| 7 | No rate limiting | MEDIUM | ❌ Not Fixed |
| 8 | Insecure JWT configuration | MEDIUM | ❌ Not Fixed |
| 9 | No role-based access control | HIGH | ❌ Not Fixed |
| 10 | SQL injection potential | MEDIUM | ❌ Not Fixed |

---

## 📋 IMPLEMENTATION CHECKLIST

### PHASE 1: IMMEDIATE CRITICAL FIXES (MUST DO BEFORE HOSTING)

#### ✅ Step 1: Protect Sensitive Configuration Files

```bash
# 1. Add application.properties to .gitignore
echo "application.properties" >> backend/.gitignore
echo "application-*.properties" >> backend/.gitignore
echo ".env" >> backend/.gitignore

# 2. Remove from git history (if already committed)
cd backend
git rm --cached src/main/resources/application.properties
git commit -m "Remove sensitive configuration from version control"

# 3. Generate new JWT secret
openssl rand -base64 64

# 4. Copy template and configure
cp src/main/resources/application.properties.template src/main/resources/application.properties

# 5. Edit application.properties with your values
# NEVER commit this file!
```

**Critical: Change ALL secrets immediately:**
- Generate new JWT secret (64+ characters)
- Change database password
- Use strong passwords (min 16 characters, mixed case, numbers, symbols)

---

#### ✅ Step 2: Enable Authentication

```bash
# Replace SecurityConfig.java with the secure version
cd backend/src/main/java/org/example/config/
mv SecurityConfig.java SecurityConfig_INSECURE_BACKUP.java
mv SecurityConfig_SECURE.java SecurityConfig.java
```

**What this fixes:**
- ✅ Enables JWT authentication on all endpoints
- ✅ Restricts CORS to specific frontend URLs
- ✅ Implements role-based access control
- ✅ Only allows public access to login/setup endpoints

---

#### ✅ Step 3: Enable Secure Error Handling

```bash
# Replace GlobalExceptionHandler with secure version
cd backend/src/main/java/org/example/Exceptions/
mv GlobalExceptionHandler.java GlobalExceptionHandler_INSECURE_BACKUP.java
mv SecureGlobalExceptionHandler.java GlobalExceptionHandler.java
```

**What this fixes:**
- ✅ No stack traces exposed to clients
- ✅ Generic error messages in production
- ✅ Request ID tracking for debugging
- ✅ Proper authentication error handling

---

#### ✅ Step 4: Configure Environment Variables

Create `.env` file in backend directory:

```bash
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/tindigwa
DB_USERNAME=tindigwa_user  # DO NOT use 'root' in production!
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD_HERE

# JWT Configuration
JWT_SECRET=YOUR_64_CHARACTER_JWT_SECRET_HERE
JWT_EXPIRATION=3600000

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Production Settings
DB_DDL_AUTO=validate  # NEVER use 'update' in production
DB_SHOW_SQL=false
APP_LOG_LEVEL=WARN
```

**Load environment variables:**

```bash
# For local development
export $(cat .env | xargs)

# For production (use proper secret management like AWS Secrets Manager, HashiCorp Vault, etc.)
```

---

#### ✅ Step 5: Update pom.xml with Security Dependencies

Add these to `pom.xml`:

```xml
<!-- Rate Limiting -->
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>

<!-- SLF4J for secure logging -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
</dependency>

<!-- OWASP Dependency Check (for build-time security scanning) -->
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>9.0.0</version>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

---

### PHASE 2: HIGH PRIORITY FIXES

#### ✅ Step 6: Fix FileStorageService Path Traversal

Update `FileStorageService.java` `loadFileAsResource` method:

```java
public Resource loadFileAsResource(String filePath) {
    try {
        Path file = this.fileStorageLocation.resolve(filePath).normalize();
        
        // SECURITY: Ensure file is within allowed directory
        if (!file.startsWith(this.fileStorageLocation)) {
            throw new SecurityException("Access denied: Path traversal attempt detected");
        }
        
        Resource resource = new UrlResource(file.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("File not found " + filePath);
        }
    } catch (MalformedURLException ex) {
        throw new RuntimeException("File not found " + filePath, ex);
    }
}
```

---

#### ✅ Step 7: Add Input Validation

Add `@Valid` annotations to all controller endpoints:

```java
// BEFORE (Insecure)
@PostMapping
public ResponseEntity<?> createLoan(@RequestBody LoanDetails loanDetails) {

// AFTER (Secure)
@PostMapping
public ResponseEntity<?> createLoan(@Valid @RequestBody LoanDetails loanDetails) {
```

Add validation annotations to DTOs:

```java
import jakarta.validation.constraints.*;

public class LoanDetails {
    @NotNull(message = "Loan amount is required")
    @Positive(message = "Loan amount must be positive")
    @Max(value = 100000000, message = "Loan amount exceeds maximum")
    private BigDecimal amount;
    
    @NotBlank(message = "Client ID is required")
    private String clientId;
    
    @Email(message = "Invalid email format")
    private String email;
}
```

---

#### ✅ Step 8: Implement Rate Limiting

Create `RateLimitFilter.java`:

```java
package org.example.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter implements Filter {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String key = getClientIP(httpRequest);
        Bucket bucket = cache.computeIfAbsent(key, k -> createBucket());
        
        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
        }
    }
    
    private Bucket createBucket() {
        // Allow 100 requests per minute
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
```

Register filter in `SecurityConfig`:

```java
http.addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
```

---

#### ✅ Step 9: Add Role-Based Access Control

Add `@PreAuthorize` annotations to controllers:

```java
@RestController
@RequestMapping("/api/loans")
public class LoanDetailsController {
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getAllLoansForAdmin() {
        // Only admins can access
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOAN_OFFICER')")
    public ResponseEntity<?> createLoan(@Valid @RequestBody LoanDetails loanDetails) {
        // Admins and loan officers can create loans
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLoan(@PathVariable Long id) {
        // Only admins can delete
    }
}
```

---

### PHASE 3: MEDIUM PRIORITY FIXES

#### ✅ Step 10: Implement JWT Token Refresh

Create refresh token mechanism:

```java
// Add refresh token to User entity
@Column(name = "refresh_token")
private String refreshToken;

// Add refresh endpoint to AuthController
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestHeader("Refresh-Token") String refreshToken) {
    // Validate refresh token
    // Generate new access token
    // Return new access token
}
```

---

#### ✅ Step 11: Database Security

```sql
-- Create dedicated database user (DO NOT use root!)
CREATE USER 'tindigwa_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';

-- Grant only necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON tindigwa.* TO 'tindigwa_app'@'localhost';

-- Revoke dangerous privileges
REVOKE ALL PRIVILEGES ON *.* FROM 'tindigwa_app'@'localhost';

FLUSH PRIVILEGES;
```

Update `application.properties`:

```properties
spring.datasource.username=tindigwa_app
spring.datasource.password=${DB_PASSWORD}
```

---

#### ✅ Step 12: Enable HTTPS

Generate SSL certificate:

```bash
# For development (self-signed)
keytool -genkeypair -alias tomcat -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore keystore.p12 -validity 365

# For production: Use Let's Encrypt or purchase certificate
```

Update `application.properties`:

```properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat

# Enforce HTTPS
server.ssl.enabled=true
security.require-ssl=true
```

---

#### ✅ Step 13: Security Headers

Add security headers configuration:

```java
@Bean
public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
    FilterRegistrationBean<SecurityHeadersFilter> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(new SecurityHeadersFilter());
    registrationBean.addUrlPatterns("/*");
    return registrationBean;
}

// SecurityHeadersFilter.java
public class SecurityHeadersFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Prevent clickjacking
        httpResponse.setHeader("X-Frame-Options", "DENY");
        
        // Prevent MIME sniffing
        httpResponse.setHeader("X-Content-Type-Options", "nosniff");
        
        // XSS Protection
        httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
        
        // Content Security Policy
        httpResponse.setHeader("Content-Security-Policy", "default-src 'self'");
        
        // Strict Transport Security (HTTPS only)
        httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        
        chain.doFilter(request, response);
    }
}
```

---

### PHASE 4: ADDITIONAL SECURITY MEASURES

#### ✅ Step 14: Audit Logging

Implement audit trail for sensitive operations:

```java
@Entity
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String action;
    private String entityType;
    private Long entityId;
    private String ipAddress;
    private LocalDateTime timestamp;
    private String details;
}

// Log all admin operations
@PostMapping
public ResponseEntity<?> createLoan(@Valid @RequestBody LoanDetails loan, Principal principal) {
    auditService.log(principal.getName(), "CREATE_LOAN", loan.getId(), request.getRemoteAddr());
    // ... rest of code
}
```

---

#### ✅ Step 15: Security Testing

```bash
# 1. Dependency vulnerability scanning
mvn org.owasp:dependency-check-maven:check

# 2. Static code analysis
mvn spotbugs:check

# 3. Run security tests
mvn test -Dtest=SecurityTest

# 4. Penetration testing (use tools like OWASP ZAP)
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All secrets moved to environment variables
- [ ] `application.properties` not in version control
- [ ] Authentication enabled and tested
- [ ] CORS restricted to production domain
- [ ] HTTPS enabled with valid certificate
- [ ] Database using dedicated user (not root)
- [ ] Rate limiting implemented
- [ ] Error messages don't expose internals
- [ ] All endpoints have proper authorization
- [ ] Input validation on all endpoints
- [ ] File upload path traversal fixed
- [ ] Security headers configured
- [ ] Audit logging implemented
- [ ] Dependency vulnerability scan passed
- [ ] Penetration testing completed

---

## 📊 SECURITY TESTING COMMANDS

```bash
# Test authentication
curl -X POST http://localhost:8081/api/loans \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
# Should return 401 Unauthorized

# Test with valid token
curl -X POST http://localhost:8081/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 1000}'
# Should succeed

# Test rate limiting
for i in {1..150}; do
  curl http://localhost:8081/api/auth/login
done
# Should return 429 after 100 requests

# Test path traversal
curl http://localhost:8081/api/images/../../../../etc/passwd
# Should return 403 Forbidden or 400 Bad Request
```

---

## 🆘 SUPPORT

If you encounter issues during implementation:

1. Check logs: `tail -f backend/logs/application.log`
2. Verify configuration: Ensure all environment variables are set
3. Test incrementally: Implement one fix at a time
4. Rollback if needed: Use git to revert changes

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [MySQL Security](https://dev.mysql.com/doc/refman/8.0/en/security.html)

---

**REMEMBER: Security is not a one-time task. Regularly update dependencies, review code, and test for vulnerabilities.**
