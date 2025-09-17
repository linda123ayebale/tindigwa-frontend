# Tindigwa Project

This repository contains both the frontend and backend components of the Tindigwa loan management system.

## Project Structure

```
tindigwa-frontend/
├── backend/                 # Spring Boot Backend Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── org/example/
│   │   │   │       ├── Controllers/      # REST API Controllers
│   │   │   │       ├── Entities/         # JPA Entity Classes
│   │   │   │       ├── Repositories/     # Data Access Layer
│   │   │   │       ├── Services/         # Business Logic Layer
│   │   │   │       ├── config/           # Security & JWT Configuration
│   │   │   │       ├── auth/             # Authentication DTOs
│   │   │   │       └── utils/            # Utility Classes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/changelog/         # Liquibase Database Migrations
│   │   └── pom.xml                       # Maven Dependencies
│   └── README.md                         # Backend Documentation
└── frontend/                            # Frontend Application (To be added)
```

## Backend Features

- **Authentication & Authorization**: JWT-based authentication system
- **Loan Management**: Complete loan lifecycle management
- **Client Management**: Customer profile and information handling
- **Branch Management**: Multi-branch support
- **Payment Tracking**: Loan payment processing and history
- **Reporting**: Daily and monthly reports generation
- **Operational Expenses**: Expense tracking and management

## Technologies Used

### Backend
- **Java** - Programming language
- **Spring Boot** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence
- **MySQL** - Database
- **Liquibase** - Database migrations
- **JWT** - Token-based authentication
- **Maven** - Build and dependency management

## Getting Started

### Prerequisites
- Java 11 or higher
- MySQL 8.0+
- Maven 3.6+

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/linda123ayebale/tindigwa-frontend.git
   cd tindigwa-frontend/backend
   ```

2. Configure the database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tindigwa_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend API will be available at `http://localhost:8080`

## API Endpoints

- **Authentication**: `/api/auth/login`
- **Branches**: `/api/branches`
- **Clients**: `/api/clients`
- **Loans**: `/api/loans`
- **Payments**: `/api/payments`
- **Reports**: `/api/reports`
- **Expenses**: `/api/expenses`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
