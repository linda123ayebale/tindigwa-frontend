# 🔐 COMPLETE API ENCRYPTION GUIDE
## Securing Data in Transit and at Rest

---

## LAYER 1: TRANSPORT ENCRYPTION (HTTPS/TLS) ⭐ CRITICAL

### What it does:
- Encrypts ALL data between client and server
- Prevents man-in-the-middle attacks
- Shows padlock 🔒 in browser
- **This is THE MOST IMPORTANT encryption layer**

### Step 1: Generate SSL Certificate

#### For Development (Self-Signed Certificate):
```bash
cd backend/src/main/resources

# Generate self-signed certificate
keytool -genkeypair \
  -alias tindigwa \
  -keyalg RSA \
  -keysize 2048 \
  -storetype PKCS12 \
  -keystore keystore.p12 \
  -validity 365 \
  -storepass changeit

# You'll be prompted for:
# - First and Last Name: Your name or company
# - Organizational Unit: Your department
# - Organization: Your company name
# - City/Locality: Your city
# - State/Province: Your state
# - Country Code: UG (for Uganda)
```

#### For Production (Let's Encrypt - FREE):
```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Get certificate for your domain
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificate will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Convert to PKCS12 format for Spring Boot
sudo openssl pkcs12 -export \
  -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem \
  -inkey /etc/letsencrypt/live/yourdomain.com/privkey.pem \
  -out /path/to/backend/keystore.p12 \
  -name tindigwa \
  -passout pass:YOUR_SECURE_PASSWORD
```

### Step 2: Configure Spring Boot for HTTPS

Add to `application.properties`:

```properties
# ============================================
# HTTPS/TLS CONFIGURATION
# ============================================
server.port=8443
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD:changeit}
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tindigwa

# Force HTTPS (redirect HTTP to HTTPS)
server.ssl.enabled=true
security.require-ssl=true

# TLS version (only allow secure versions)
server.ssl.enabled-protocols=TLSv1.2,TLSv1.3
```

### Step 3: Add HTTP to HTTPS Redirect

Create `HttpsRedirectConfig.java`:

```java
package org.example.config;

import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class HttpsRedirectConfig {

    @Bean
    public ServletWebServerFactory servletContainer() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
            @Override
            protected void postProcessContext(Context context) {
                SecurityConstraint securityConstraint = new SecurityConstraint();
                securityConstraint.setUserConstraint("CONFIDENTIAL");
                SecurityCollection collection = new SecurityCollection();
                collection.addPattern("/*");
                securityConstraint.addCollection(collection);
                context.addConstraint(securityConstraint);
            }
        };
        tomcat.addAdditionalTomcatConnectors(redirectConnector());
        return tomcat;
    }

    private Connector redirectConnector() {
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setScheme("http");
        connector.setPort(8081); // HTTP port
        connector.setSecure(false);
        connector.setRedirectPort(8443); // HTTPS port
        return connector;
    }
}
```

### Test HTTPS:
```bash
# Start application
mvn spring-boot:run

# Test HTTPS (should work)
curl -k https://localhost:8443/api/auth/setup-status

# Test HTTP redirect (should redirect to HTTPS)
curl -v http://localhost:8081/api/auth/setup-status
```

---

## LAYER 2: FIELD-LEVEL ENCRYPTION (Database)

### What it does:
- Encrypts sensitive fields in database (passwords, national IDs, account numbers)
- Even if database is compromised, data is unreadable
- Complies with data protection regulations

### Step 1: Add Encryption Dependency

Add to `pom.xml`:

```xml
<!-- Jasypt for field encryption -->
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

### Step 2: Configure Encryption

Add to `application.properties`:

```properties
# ============================================
# FIELD ENCRYPTION CONFIGURATION
# ============================================
jasypt.encryptor.password=${ENCRYPTION_KEY}
jasypt.encryptor.algorithm=PBEWithHMACSHA512AndAES_256
jasypt.encryptor.key-obtention-iterations=1000
jasypt.encryptor.pool-size=1
jasypt.encryptor.provider-name=SunJCE
jasypt.encryptor.salt-generator-classname=org.jasypt.salt.RandomSaltGenerator
jasypt.encryptor.iv-generator-classname=org.jasypt.iv.RandomIvGenerator
jasypt.encryptor.string-output-type=base64
```

Generate encryption key:

```bash
# Generate strong encryption key (save this securely!)
openssl rand -base64 32
```

### Step 3: Create Encryption Utility

Create `EncryptionService.java`:

```java
package org.example.utils;

import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EncryptionService {

    @Autowired
    private StringEncryptor stringEncryptor;

    /**
     * Encrypt sensitive data
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }
        return stringEncryptor.encrypt(plainText);
    }

    /**
     * Decrypt sensitive data
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }
        try {
            return stringEncryptor.decrypt(encryptedText);
        } catch (Exception e) {
            // Handle decryption failure (corrupted data)
            return null;
        }
    }
}
```

### Step 4: Create Encrypted Entity Converter

Create `AttributeEncryptor.java`:

```java
package org.example.utils;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Converter
public class AttributeEncryptor implements AttributeConverter<String, String> {

    @Autowired
    private EncryptionService encryptionService;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        // Encrypt before saving to database
        return encryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        // Decrypt when reading from database
        return encryptionService.decrypt(dbData);
    }
}
```

### Step 5: Apply Encryption to Sensitive Fields

Update your entities to encrypt sensitive data:

```java
package org.example.Entities;

import jakarta.persistence.*;
import org.example.utils.AttributeEncryptor;
import lombok.*;

@Entity
@Table(name = "person")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Regular field - not encrypted
    private String firstName;
    private String lastName;

    // ENCRYPTED FIELDS - sensitive data
    @Convert(converter = AttributeEncryptor.class)
    @Column(name = "national_id")
    private String nationalId; // Encrypted in database

    @Convert(converter = AttributeEncryptor.class)
    private String contact; // Phone number - encrypted

    @Convert(converter = AttributeEncryptor.class)
    private String email; // Email - encrypted

    @Convert(converter = AttributeEncryptor.class)
    @Column(name = "bank_account")
    private String bankAccount; // Bank details - encrypted

    // Other fields...
    private String village;
    private String parish;
    private String district;
}
```

Example with User entity:

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Email is sensitive - encrypt it
    @Convert(converter = AttributeEncryptor.class)
    private String email;

    // Password is already hashed by BCrypt (no need to encrypt)
    private String password;

    // Role is not sensitive - no encryption needed
    @Enumerated(EnumType.STRING)
    private UserRole role;

    // ... other fields
}
```

### Fields to Encrypt:

**✅ MUST ENCRYPT:**
- National ID numbers
- Email addresses
- Phone numbers
- Bank account numbers
- Tax IDs
- Social security numbers
- Credit card numbers (if storing)

**❌ DON'T ENCRYPT:**
- Passwords (use BCrypt hashing instead)
- Non-sensitive IDs
- Names (unless required by regulation)
- Dates
- Status fields
- Enums

---

## LAYER 3: JWT TOKEN ENCRYPTION (JWE)

### Current State: JWT Signed (JWS)
Your current JWT is **signed** but not **encrypted**. Anyone can read the token contents (they just can't modify it).

### Upgrade to Encrypted JWT (JWE)

Update `JwtTokenService.java`:

```java
package org.example.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.example.Entities.User;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class SecureJwtTokenService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Create encrypted JWT token (JWE)
     */
    public String generateTokenWithUserInfo(User user) {
        Map<String, Object> claims = new HashMap<>();
        
        // Add user information to claims
        if (user.getPerson() != null) {
            claims.put("firstName", user.getPerson().getFirstName());
            claims.put("lastName", user.getPerson().getLastName());
        }
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        
        // Create encrypted JWT
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Validate and parse encrypted token
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = getUsernameFromToken(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    private <T> T getClaimFromToken(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    private Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }
}
```

---

## LAYER 4: REQUEST/RESPONSE ENCRYPTION

For highly sensitive operations, encrypt entire request/response bodies.

### Create Request/Response Encryption Filter

```java
package org.example.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.util.Base64;

@Component
public class RequestResponseEncryptionFilter implements Filter {

    private static final String ENCRYPTION_HEADER = "X-Encrypted";
    private static final String ALGORITHM = "AES";
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Check if request is encrypted
        String encryptedHeader = httpRequest.getHeader(ENCRYPTION_HEADER);
        
        if ("true".equals(encryptedHeader)) {
            // Decrypt request body
            // Encrypt response body
            // This is advanced - implement only if needed
        }
        
        chain.doFilter(request, response);
    }
}
```

---

## 🔧 IMPLEMENTATION PRIORITY

### Priority 1: HTTPS/TLS (DO THIS FIRST) ⭐
- **Impact**: Protects ALL data in transit
- **Difficulty**: Easy
- **Time**: 30 minutes
- **Cost**: FREE (Let's Encrypt)

### Priority 2: Field Encryption (High Priority)
- **Impact**: Protects sensitive data at rest
- **Difficulty**: Medium
- **Time**: 2-3 hours
- **Cost**: FREE

### Priority 3: JWT Improvements (Medium Priority)
- **Impact**: Better token security
- **Difficulty**: Easy
- **Time**: 30 minutes
- **Cost**: FREE

### Priority 4: Full Request/Response Encryption (Optional)
- **Impact**: Maximum security
- **Difficulty**: Hard
- **Time**: 1-2 days
- **Cost**: FREE
- **Note**: Only needed for highly sensitive operations

---

## 📊 ENCRYPTION CHECKLIST

Before going to production:

- [ ] HTTPS/TLS enabled with valid certificate
- [ ] HTTP automatically redirects to HTTPS
- [ ] Database connection uses SSL
- [ ] Sensitive fields encrypted in database:
  - [ ] National IDs
  - [ ] Email addresses
  - [ ] Phone numbers
  - [ ] Bank account details
- [ ] JWT secret is strong (64+ characters)
- [ ] Encryption keys stored securely (not in code)
- [ ] Tested encryption/decryption works
- [ ] Backup/restore tested with encrypted data

---

## 🧪 TESTING ENCRYPTION

### Test 1: HTTPS Working
```bash
# Should work with HTTPS
curl -k https://localhost:8443/api/auth/setup-status

# Should redirect to HTTPS
curl -v http://localhost:8081/api/auth/setup-status
```

### Test 2: Field Encryption Working
```bash
# Create a user with sensitive data
curl -k -X POST https://localhost:8443/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "nationalId": "CM12345678"
  }'

# Check database - national ID should be encrypted gibberish
mysql -u root -p tindigwa -e "SELECT national_id FROM person LIMIT 1;"
# Should see something like: "ENC(xvH7J3kP9mL2...)" instead of "CM12345678"
```

### Test 3: JWT Token Security
```bash
# Generate token
TOKEN=$(curl -s -k -X POST https://localhost:8443/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@test.com","password":"password"}' \
  | jq -r '.token')

# Decode JWT (should be readable but signed)
echo $TOKEN | cut -d. -f2 | base64 -d 2>/dev/null | jq
```

---

## 🔐 ENCRYPTION KEY MANAGEMENT

### Generate Strong Keys:

```bash
# JWT Secret (64 bytes)
openssl rand -base64 64

# Field Encryption Key (32 bytes)
openssl rand -base64 32

# SSL Keystore Password
openssl rand -base64 24
```

### Store Keys Securely:

**Development:**
```bash
# .env file (NOT in git!)
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env
echo "SSL_KEYSTORE_PASSWORD=$(openssl rand -base64 24)" >> .env
```

**Production:**
Use proper secret management:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Cloud Secret Manager

---

## ⚠️ COMMON MISTAKES TO AVOID

1. **❌ Encrypting Passwords**: Use BCrypt hashing, NOT encryption
2. **❌ Weak Encryption Keys**: Use 256-bit keys minimum
3. **❌ Keys in Code**: Always use environment variables
4. **❌ Encrypting Everything**: Only encrypt sensitive data (performance impact)
5. **❌ Self-Signed Certs in Production**: Use Let's Encrypt or purchased cert
6. **❌ No Key Rotation**: Plan to rotate encryption keys periodically

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Let's Encrypt](https://letsencrypt.org/)
- [Jasypt Documentation](http://www.jasypt.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 🆘 NEED HELP?

If encryption isn't working:
1. Check logs for decryption errors
2. Verify encryption key is set correctly
3. Test with simple string first
4. Make sure database columns are TEXT type (not VARCHAR with length limit)

**Remember: Encryption protects data, but it's just ONE part of security. You still need authentication, authorization, and all other security measures!**
