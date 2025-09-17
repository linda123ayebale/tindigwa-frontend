# Tindigwa Loan Management System - Frontend

This is the React frontend for the Tindigwa loan management system.

## Setup Instructions

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. **Enable PowerShell script execution (if needed):**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## Project Structure

```
tindigwa-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── Layout.jsx
│   ├── pages/
│   │   └── Auth/
│   │       ├── Setup.jsx      # Initial setup/registration screen
│   │       ├── Setup.css
│   │       ├── Login.jsx      # Login screen
│   │       └── Login.css
│   ├── App.js                 # Main app with routing
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Features Implemented

### 1. Setup Screen (Registration)
- Initial system setup with admin account creation
- Fields: Admin Name, Email, Password, Confirm Password
- Clean, modern UI matching the provided screenshots
- Form validation and loading states

### 2. Login Screen
- Simple login form with Email and Password
- "Forgot password?" link
- "Don't have an account? Sign up" option
- Clean, minimal design matching the screenshots

### 3. Routing System
- Protected routes based on authentication
- Setup flow: `/setup` → `/login` → `/dashboard`
- Automatic redirects based on completion status

## Authentication Flow

1. **First Visit**: User is redirected to `/setup` to create admin account
2. **Setup Complete**: User is redirected to `/login` for subsequent logins  
3. **Authenticated**: User can access the dashboard and protected routes

## Next Steps

The following screens need to be implemented based on your screenshots:
- Dashboard with summary cards
- Client management (list, add, edit, profile)
- Loan management (applications, disbursement, details)
- Payment management and tracking
- Reports (daily, monthly, loan reports)
- Operational expenses management
- Settings and staff management

## Technology Stack

- React 18
- React Router DOM 6
- CSS3 with modern flexbox/grid
- Lucide React (for icons)
- Axios (for API calls)
- Date-fns (for date handling)

## Design System

The application uses a consistent design system with:
- Primary color: #4285f4 (Google Blue)
- Background gradients: #f5f7fa to #c3cfe2
- Border radius: 12px for inputs and buttons, 20px for cards
- Typography: System fonts (-apple-system, BlinkMacSystemFont, etc.)
- Consistent spacing and hover effects
