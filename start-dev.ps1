# Tindigwa Development Startup Script
# This script helps you start both frontend and backend servers

Write-Host "🚀 Tindigwa Development Server Startup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Check if backend is running
function Test-BackendConnection {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/clients" -Method GET -TimeoutSec 5
        return $true
    }
    catch {
        return $false
    }
}

# Function to start backend (you'll need to run this manually)
function Show-BackendInstructions {
    Write-Host "" -ForegroundColor Yellow
    Write-Host "📋 Backend Setup Instructions:" -ForegroundColor Yellow
    Write-Host "1. Open a new terminal/command prompt" -ForegroundColor White
    Write-Host "2. Navigate to: cd backend" -ForegroundColor White
    Write-Host "3. Run: mvn spring-boot:run" -ForegroundColor White
    Write-Host "4. Wait for 'Started Tindigwa in X seconds'" -ForegroundColor White
    Write-Host "5. Backend will be available at: http://localhost:8080" -ForegroundColor White
    Write-Host ""
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Cyan
    Set-Location "frontend"
    
    # Check if node_modules exists
    if (!(Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "✅ Starting React development server on http://localhost:3000" -ForegroundColor Green
    npm start
}

# Main execution
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Cyan

if (Test-BackendConnection) {
    Write-Host "✅ Backend is running on http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is not running on http://localhost:8080" -ForegroundColor Red
    Show-BackendInstructions
    
    $continue = Read-Host "Do you want to start the frontend anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "👋 Startup cancelled. Please start the backend first." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "🎯 Configuration:" -ForegroundColor Magenta
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "   API URL:  http://localhost:8080/api" -ForegroundColor White
Write-Host ""

Start-Frontend
