# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Tindigwa is a Spring Boot 3.1.0 backend application for a microfinance management system. It provides REST APIs for managing loan operations, client profiles, branches, and user authentication with JWT-based security. This is part of a full-stack application with a React frontend located in the parent directory.

## Development Commands

### Build & Run
```bash
# Build the project
mvn clean compile

# Run tests
mvn test

# Package the application
mvn clean package

# Run the application (default port 8080)
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Database Management
```bash
# Run Liquibase migrations
mvn liquibase:update

# Generate Liquibase changelog (if needed)
mvn liquibase:generateChangeLog

# Rollback database changes
mvn liquibase:rollback -Dliquibase.rollbackCount=1
```

### Development Tools
```bash
# Run with debug mode (connects on port 5005)
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"

# Clean and rebuild
mvn clean install

# Run specific test class
mvn test -Dtest=AuthControllerTest

# Skip tests during build
mvn clean package -DskipTests

# Check if MySQL is running (required dependency)
sc query mysql80
```

## Architecture Overview

### Package Structure
The codebase follows Spring Boot conventions under `org.example` with clear separation:
- **`Entities/`** - JPA entity classes with Lombok annotations
- **`Repositories/`** - Spring Data JPA repositories
- **`Services/`** - Business logic layer with constructor injection
- **`Controllers/`** - REST API endpoints
- **`config/`** - Security configuration and JWT handling
- **`auth/`** - Authentication DTOs and request/response models
- **`DTO/`** - Data transfer objects
- **`utils/`** - Utility classes

### Core Components

**Entity Layer**: JPA entities representing the domain model:
- `User` - System users with role-based access (ADMIN, LOAN_OFFICER, CLIENT), linked to `Person` entity
- `ClientsProfile` - Detailed client information including guarantor details
- `LoanDetails` - Loan information with automatic interest calculation (20% fixed rate)
- `Branches` - Branch management with location and loan officer assignment
- `Person`, `NextOfKin`, `Guarantor` - Supporting entities for user relationships
- `LoanPayments`, `OperationalExpenses`, `DailyReports`, `MonthlyReports` - Additional business entities

**Repository Layer**: Spring Data JPA repositories for data access:
- All repositories extend standard JPA interfaces (`JpaRepository`, `CrudRepository`)
- Custom queries implemented for business-specific operations (e.g., `findByLendingBranch`, `countByIsSetupUser`)
- Repository naming follows entity conventions (e.g., `UserRepository`, `LoanDetailsRepository`)

**Service Layer**: Business logic implementation with constructor injection:
- `LoanDetailsService` - Handles loan calculations with tiered processing fees
- `CustomUserDetailsService` - Spring Security user authentication implementing `UserDetailsService`
- `UserService`, `BranchesService`, `ClientProfileService` - Domain-specific business logic
- All services use constructor-based dependency injection

**Controller Layer**: REST API endpoints:
- `AuthController` - JWT authentication and initial system setup (`/api/auth/*`)
- Domain-specific controllers for CRUD operations (Loans, Branches, Clients, etc.)
- Controllers follow RESTful conventions with appropriate HTTP methods
- CORS configured for frontend integration (localhost:3000)

### Security Architecture

**JWT Implementation**:
- JWT-based authentication with configurable expiration (1 hour default, set in `jwt.expiration`)
- `JwtTokenService` handles token generation, validation, and username extraction
- `JwtAuthenticationFilter` extends `OncePerRequestFilter` for request-level authentication
- Tokens must be sent as `Authorization: Bearer <token>` header

**Role-based Access**:
- Three primary roles: ADMIN, LOAN_OFFICER, CLIENT
- User entity has direct role field (string-based, not enum)
- `CustomUserDetailsService` implements Spring Security's `UserDetailsService`
- Constructor injection used throughout security components

**System Initialization**:
- `/api/auth/setup` endpoint for one-time admin user creation
- `countByIsSetupUser(true)` prevents multiple setup users
- Setup validates password confirmation, email uniqueness, and required fields
- BCrypt password encoding via Spring Security's `PasswordEncoder`

**Configuration Notes**:
- CORS configured for React frontend integration (localhost:3000)
- Security debug mode can be toggled via `spring.security.debug`

### Business Logic Patterns

**Loan Processing**:
- Fixed 20% interest rate across all loans
- Tiered processing fee structure based on loan amount:
  - 50K-100K: 10K processing fee
  - 100K-300K: 15K processing fee
  - 300K-500K: 20K processing fee
  - (Additional tiers up to 2M+)
- Automatic calculation of total payable amount
- Date-based loan duration management

**User Management**:
- Single setup user per system (prevents multiple admin creation)
- Person entity relationships for detailed user profiles
- Branch-based user organization

## Database Configuration

**MySQL Setup**:
- Database: `tindigwa` on `localhost:3306`
- MySQL Connector/J version 8.3.0
- Ensure MySQL service is running: `sc query mysql80` (Windows)
- Connection configured in `application.properties` with username `root`

**JPA/Hibernate Configuration**:
- `spring.jpa.hibernate.ddl-auto=update` for development (auto-creates/updates schema)
- `spring.jpa.show-sql=true` for SQL query debugging
- Entities use standard JPA annotations with Lombok for boilerplate reduction

**Liquibase Integration**:
- Migration files located in `src/main/resources/db/changelog/`
- Master changelog: `db.changelog-master.yaml`
- Current implementation has minimal changelog structure
- Use Liquibase for production-ready schema versioning

**Troubleshooting Database Issues**:
```bash
# Check MySQL service status
sc query mysql80

# Start MySQL if stopped
net start mysql80

# Test connection (replace password)
mysql -u root -p -h localhost -P 3306 -e "SHOW DATABASES;"
```

## API Endpoints Structure

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/setup` - Initial system setup (admin user creation)

### Core Resources
- `/api/branches/*` - Branch management operations
- `/api/loans/*` - Loan creation, updates, and queries
- `/api/clients` - Client profile management
- `/api/loan-officers` - Loan officer operations

### Security Notes
- Most endpoints require JWT authentication
- Setup and login endpoints are publicly accessible
- Token must be included in Authorization header: `Bearer <token>`

## Development Considerations

### Code Organization & Patterns
- Package structure follows Spring Boot conventions under `org.example`
- Entities use Lombok annotations (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- Constructor injection used throughout for dependency management (no `@Autowired` on fields)
- Controllers use `@RequestMapping` and method-level mappings (`@PostMapping`, etc.)
- Entity relationships managed via JPA annotations (`@OneToOne`, `@JoinColumn`)

### Key Dependencies & Versions
- **Spring Boot**: 3.1.0 with Java 17 (but Maven compiler targets Java 8 - potential inconsistency)
- **Spring Security**: JWT support via jjwt 0.11.5 (api, impl, jackson)
- **Spring Data JPA**: With MySQL Connector/J 8.3.0
- **Liquibase**: 4.27.0 for database versioning
- **Lombok**: 1.18.30 for code generation (provided scope)

### Common Development Issues

**Java Version Mismatch**:
- `pom.xml` declares Java 17 in properties but compiler plugin targets Java 8
- Update Maven compiler plugin configuration if using Java 17 features

**Entity Issues**:
- User entity has potential mapping issues (setPerson called twice in AuthController setup)
- Ensure entity relationships are properly configured and cascaded
- `@PrePersist` methods set defaults for createdAt, branch, and role

**Security Configuration**:
- JWT filter requires both `JwtTokenService` and `CustomUserDetailsService`
- Ensure security configuration beans are properly defined
- Authentication manager and password encoder must be configured

### Database Schema Notes
- Users table links to Person entity via `@OneToOne` relationship
- Setup user prevention via `isSetupUser` boolean flag
- Loan details include calculated fields (interest, processing fees, totals)
- Branch structure with loan officer assignments
- Guarantor and next-of-kin relationships for clients

**Important**: When making entity changes, update Liquibase changelogs to maintain database consistency across environments.

## Frontend Integration

**Full-Stack Architecture**:
- React frontend located in parent directory (`../`)
- Backend serves API on port 8080, frontend on port 3000
- CORS configured for `localhost:3000` development

**Authentication Flow**:
1. Setup flow: Frontend `/setup` → Backend `/api/auth/setup` → JWT token
2. Login flow: Frontend `/login` → Backend `/api/auth/login` → JWT token
3. Protected requests: Include `Authorization: Bearer <token>` header

**API Integration Notes**:
- All protected endpoints require JWT authentication
- Setup and login endpoints are publicly accessible
- Response formats use DTOs (AuthResponse, SetupResponse, etc.)
- Error handling returns appropriate HTTP status codes with messages

## Troubleshooting Common Issues

**Application Won't Start**:
```bash
# Check if port 8080 is available
netstat -an | findstr :8080

# Verify MySQL connection
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.org.springframework.jdbc=DEBUG"
```

**JWT Authentication Issues**:
- Verify JWT secret is set in `application.properties`
- Check token expiration (default 1 hour)
- Ensure Authorization header format: `Bearer <token>`

**Database Connection Issues**:
- Confirm MySQL service is running: `sc query mysql80`
- Verify database `tindigwa` exists
- Check credentials in `application.properties`

**Setup Flow Issues**:
- Only one setup user allowed per system
- Password must be at least 6 characters
- Email must be unique and properly formatted
