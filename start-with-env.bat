@echo off
echo Starting WMS Tutorial Application with proper environment variables...

REM Set MongoDB connection string environment variable
set MONGODB_URI=mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test

REM Set debug flag for MongoDB connection
set DEBUG_DB_CONNECTION=true

REM Enable development fallbacks to ensure authentication works
set DISABLE_DEV_FALLBACK=false

REM Set JWT secret for authentication
set JWT_SECRET=wms-tutorial-app-secret-key

echo Environment variables set successfully:
echo MONGODB_URI: %MONGODB_URI%
echo DEBUG_DB_CONNECTION: %DEBUG_DB_CONNECTION%
echo DISABLE_DEV_FALLBACK: %DISABLE_DEV_FALLBACK%
echo JWT_SECRET: %JWT_SECRET%

echo.
echo Starting backend (Netlify Functions) on port 8889...
start cmd /k "set MONGODB_URI=mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test && set DEBUG_DB_CONNECTION=true && set DISABLE_DEV_FALLBACK=false && set JWT_SECRET=wms-tutorial-app-secret-key && npx netlify dev --port 8889"

echo Waiting for backend to start...
timeout /t 5

echo Starting frontend (React) on port 3000...
start cmd /k "npm start"

echo.
echo Application started! You can access:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8889
echo.
echo Use the following credentials to login:
echo - Username: admin
echo - Password: password
