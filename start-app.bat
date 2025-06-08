@echo on
echo ===== Starting WMS Tutorial Application =====
echo.

REM Set MongoDB connection string environment variable
set MONGODB_URI=mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test
echo MongoDB URI set to: %MONGODB_URI%

REM Set debug flag for MongoDB connection
set DEBUG_DB_CONNECTION=true
echo Debug DB connection: Enabled

REM Disable development fallbacks to ensure we use the real MongoDB
set DISABLE_DEV_FALLBACK=true
echo Development fallbacks: Disabled

echo.
echo ===== Checking if ports are already in use =====
netstat -ano | findstr :3000
netstat -ano | findstr :8889
echo.

echo ===== Starting frontend (port 3000) and backend (port 8889) =====
echo.

REM Run the application with both frontend and backend
cd /d %~dp0
npm run start:all

if %ERRORLEVEL% NEQ 0 (
    echo ===== ERROR: Failed to start application =====
    pause
    exit /b %ERRORLEVEL%
)

pause
