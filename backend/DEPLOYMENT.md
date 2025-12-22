# Backend Deployment Guide

## Build Information
- **Application**: Tindigwa Loan Management System Backend
- **Version**: 1.0.0
- **Built JAR**: `target/tindigwa-1.0.0.jar` (61MB)
- **Framework**: Spring Boot 3.1.0
- **Java Version**: 17
- **Build Date**: 2025-12-19

## Deployment Options

### Option 1: Traditional Server Deployment (VPS/Dedicated Server)

#### Prerequisites
- Java 17 installed on server
- MySQL 8.x database
- Minimum 512MB RAM (1GB+ recommended)
- Port 8081 available (or configure custom port)

#### Deployment Steps

1. **Transfer the JAR file to server**:
   ```bash
   scp target/tindigwa-1.0.0.jar user@cashtankfinance.com:/opt/tindigwa/
   ```

2. **Set up environment variables** (create `/opt/tindigwa/.env`):
   ```bash
   # Database
   export DB_PASSWORD="your_secure_db_password"
   export DB_USERNAME="root"
   export DATABASE_URL="jdbc:mysql://localhost:3306/tindigwa"
   
   # JWT Security
   export JWT_SECRET="your_generated_jwt_secret_key_here"
   
   # Email Configuration
   export SMTP_HOST="smtp.gmail.com"
   export SMTP_PORT="587"
   export SMTP_USERNAME="your_email@gmail.com"
   export SMTP_PASSWORD="your_app_password"
   export SMTP_FROM_EMAIL="noreply@cashtankfinance.com"
   export SMTP_FROM_NAME="CashTank Finance"
   
   # File Storage
   export FILE_UPLOAD_DIR="/opt/tindigwa/uploads"
   
   # Logging
   export LOG_FILE="/opt/tindigwa/logs/tindigwa.log"
   
   # Server Port (optional)
   export PORT="8081"
   ```

3. **Create directories**:
   ```bash
   mkdir -p /opt/tindigwa/uploads/{client-photos,loan-officer-photos,documents,signatures}
   mkdir -p /opt/tindigwa/logs
   ```

4. **Run the application**:
   ```bash
   cd /opt/tindigwa
   source .env
   java -jar tindigwa-1.0.0.jar --spring.profiles.active=production
   ```

#### Running as a Service (systemd)

Create `/etc/systemd/system/tindigwa.service`:

```ini
[Unit]
Description=Tindigwa Loan Management Backend
After=mysql.service

[Service]
Type=simple
User=tindigwa
WorkingDirectory=/opt/tindigwa
EnvironmentFile=/opt/tindigwa/.env
ExecStart=/usr/bin/java -jar /opt/tindigwa/tindigwa-1.0.0.jar --spring.profiles.active=production
Restart=on-failure
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tindigwa
sudo systemctl start tindigwa
sudo systemctl status tindigwa
```

### Option 2: Docker Deployment

Create `Dockerfile` in backend directory:

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/tindigwa-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=production"]
```

Build and run:
```bash
docker build -t tindigwa-backend .
docker run -d \
  --name tindigwa-backend \
  -p 8081:8081 \
  -e DB_PASSWORD="password" \
  -e JWT_SECRET="secret" \
  -e SMTP_USERNAME="email" \
  -e SMTP_PASSWORD="password" \
  tindigwa-backend
```

### Option 3: Cloud Platform Deployment

#### AWS Elastic Beanstalk
```bash
eb init -p java-17 tindigwa-backend
eb create tindigwa-production
eb deploy
```

#### Heroku
```bash
heroku create tindigwa-backend
heroku config:set DB_PASSWORD="password"
heroku config:set JWT_SECRET="secret"
git push heroku main
```

#### DigitalOcean App Platform
- Upload JAR via dashboard
- Set environment variables in settings
- Configure MySQL database addon

## Production Configuration

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | MySQL database password | `SecurePass123!` |
| `JWT_SECRET` | JWT signing secret (64+ chars) | Generate: `openssl rand -base64 64` |
| `SMTP_USERNAME` | Email service username | `noreply@cashtankfinance.com` |
| `SMTP_PASSWORD` | Email service password | App-specific password |
| `DATABASE_URL` | Database connection URL | `jdbc:mysql://localhost:3306/tindigwa` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8081` | Server port |
| `DB_USERNAME` | `root` | Database username |
| `FILE_UPLOAD_DIR` | `./uploads` | File storage location |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |

## Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/cashtankfinance.com`:

```nginx
server {
    listen 80;
    server_name cashtankfinance.com www.cashtankfinance.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cashtankfinance.com www.cashtankfinance.com;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/cashtankfinance.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cashtankfinance.com/privkey.pem;
    
    # Frontend (React build)
    location / {
        root /var/www/cashtankfinance/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8081/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/cashtankfinance.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d cashtankfinance.com -d www.cashtankfinance.com
```

## Database Setup

```sql
-- Create database
CREATE DATABASE tindigwa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'tindigwa_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tindigwa.* TO 'tindigwa_user'@'localhost';
FLUSH PRIVILEGES;
```

## Testing Deployment

```bash
# Check if backend is running
curl http://localhost:8081/api/auth/setup-status

# Expected response:
# {"setupCompleted":false,"hasAdminUsers":false}

# Check via public domain
curl https://cashtankfinance.com/api/auth/setup-status
```

## Monitoring & Logs

```bash
# View systemd logs
sudo journalctl -u tindigwa -f

# View application logs
tail -f /opt/tindigwa/logs/tindigwa.log

# Check service status
sudo systemctl status tindigwa
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8081
sudo lsof -i :8081
# Kill process
sudo kill -9 <PID>
```

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u root -p -e "SHOW DATABASES;"
```

### JAR Won't Start
```bash
# Check Java version
java -version  # Must be Java 17+

# Run with verbose logging
java -jar tindigwa-1.0.0.jar --spring.profiles.active=production --debug
```

## Security Checklist

- [ ] Change default database password
- [ ] Generate strong JWT secret (64+ characters)
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Enable fail2ban for SSH
- [ ] Set proper file permissions (chmod 600 for .env)
- [ ] Configure SMTP with app-specific passwords
- [ ] Regular security updates

## Performance Tuning

### JVM Options (for production)
```bash
java -Xms512m -Xmx1024m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar tindigwa-1.0.0.jar \
     --spring.profiles.active=production
```

### Database Connection Pool
Add to `application-production.properties`:
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

## Backup Strategy

### Database Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p$DB_PASSWORD tindigwa > /backups/tindigwa_$DATE.sql
# Keep only last 7 days
find /backups -name "tindigwa_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /opt/tindigwa/backup.sh
```

## Deployment Checklist

- [ ] Build JAR file: `mvn clean package -DskipTests`
- [ ] Upload JAR to server
- [ ] Set up MySQL database
- [ ] Configure environment variables
- [ ] Create systemd service
- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL certificate
- [ ] Test API endpoints
- [ ] Deploy frontend build
- [ ] Configure monitoring
- [ ] Set up backups
- [ ] Document credentials securely
