# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Tindigwa is a loan management system frontend built with React 18. This is a comprehensive loan management application for financial institutions with features for client management, loan processing, payment tracking, and financial reporting.

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm start

# Build for production
npm build

# Run tests
npm test

# Run single test file
npm test -- --testNamePattern="ComponentName"
```

### PowerShell Setup (Windows)
If you encounter execution policy issues on Windows:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Architecture Overview

### Application Structure
- **Single Page Application (SPA)** with React Router DOM 6
- **Component-based architecture** with reusable UI components
- **Page-based routing** with protected routes and authentication flow
- **Local storage authentication** with mock JWT implementation
- **Centralized state management** using React hooks (useState, useEffect)

### Key Architectural Patterns
1. **Authentication Flow**: Setup → Login → Dashboard with automatic redirects
2. **Layout System**: Shared sidebar navigation with consistent header/content structure
3. **Page Components**: Each major feature (Clients, Loans, Finances) has dedicated page components
4. **Form Handling**: Controlled components with validation and loading states
5. **Mock Data Layer**: Sample data structures ready for API integration

### Folder Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar, Layout)
│   └── AddClientForm.js # Form components
├── pages/              # Page-level components
│   ├── Auth/          # Authentication pages (Setup, Login, ForgotPassword)
│   ├── Dashboard/     # Main dashboard
│   ├── Clients/       # Client management
│   ├── Loans/         # Loan management
│   └── Finances/      # Financial tracking
└── utils/             # Utility functions (empty currently)
```

## Technology Stack

### Core Dependencies
- **React 18.2.0**: Main framework
- **React Router DOM 6.3.0**: Client-side routing
- **Lucide React 0.263.1**: Icon library
- **Axios 1.11.0**: HTTP client (ready for API integration)
- **date-fns 2.29.3**: Date manipulation

### Development
- **Create React App 5.0.1**: Build tooling and development server
- **React Testing Library**: Testing framework (configured but no tests written)

## Key Features Implemented

### Authentication System
- **Setup Flow**: Initial admin account creation (`/setup`)
- **Login System**: Email/password authentication (`/login`)
- **Session Management**: localStorage-based token storage
- **Route Protection**: Conditional rendering based on auth state

### Dashboard
- **Summary Cards**: Client count, active loans, outstanding balance
- **Quick Actions**: Add client, disburse loan buttons
- **System Setup**: Management links for users, loan products, payment methods
- **Navigation**: Integrated sidebar with all major sections

### Client Management
- **Client List**: Searchable and filterable client database
- **Add Client Form**: Comprehensive client registration
- **Client Types**: Support for individual and business clients
- **Status Management**: Active, inactive, prospect status tracking

### Loan Management
- **Loan Registration**: New loan application processing
- **Disbursed Loans**: Tracking of active loans
- **Loan Products**: Framework for different loan types

### Financial Management
- **Expense Tracking**: Operational expense management
- **Financial Dashboard**: Overview of financial metrics

## Design System

### Color Scheme
- **Primary**: #4285f4 (Google Blue)
- **Backgrounds**: Linear gradients from #f5f7fa to #c3cfe2
- **Cards**: White backgrounds with subtle shadows

### Component Standards
- **Border Radius**: 12px for inputs/buttons, 20px for cards
- **Typography**: System font stack (-apple-system, BlinkMacSystemFont)
- **Spacing**: Consistent 16px/20px grid system
- **Interactions**: Hover effects and loading states

## Development Guidelines

### Component Patterns
- Use functional components with hooks
- Implement loading states for async operations
- Include error handling for form submissions
- Use controlled components for all form inputs

### State Management
- Component-level state with useState for UI state
- localStorage for persistence (auth tokens, user data, setup status)
- Props drilling for sharing state between components
- Ready for Redux integration if needed

### API Integration
- Axios is configured but currently using mock data
- API endpoints should replace mock functions in components
- Error handling patterns established in login/form components

### Testing
- React Testing Library configured
- Jest setup included with Create React App
- Test files should follow `ComponentName.test.js` pattern

## Authentication Implementation Notes

### Current State
- **Mock Authentication**: Login accepts any email/password combination
- **Token Storage**: Uses localStorage with key `tindigwa_token`
- **User Data**: Stored in localStorage with key `tindigwa_user`
- **Setup Flag**: Uses `tindigwa_setup_complete` to track initial setup

### For Production
- Replace mock authentication with actual API calls
- Implement proper JWT token validation
- Add refresh token mechanism
- Implement proper logout functionality

## Common Development Patterns

### Adding New Pages
1. Create component in appropriate `src/pages/` subdirectory
2. Add route to `App.js` Routes section
3. Add navigation item to sidebar in relevant components
4. Follow existing CSS naming conventions

### Form Components
- Use controlled components pattern
- Implement loading/error states
- Include form validation
- Clear forms after successful submission

### API Integration
- Replace mock data with actual API calls
- Use Axios for HTTP requests
- Handle loading states and errors consistently
- Update localStorage management for real authentication
