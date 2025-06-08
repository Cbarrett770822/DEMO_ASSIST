@echo off
echo Setting environment variables for WMS Tutorial Application...

REM Set MongoDB connection string environment variable
set MONGODB_URI=mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test

REM Set debug flag for MongoDB connection
set DEBUG_DB_CONNECTION=true

REM Disable development fallbacks to ensure we use the real MongoDB
set DISABLE_DEV_FALLBACK=true

REM Set JWT secret for authentication
set JWT_SECRET=wms-tutorial-app-secret-key

echo Environment variables set successfully:
echo MONGODB_URI: %MONGODB_URI%
echo DEBUG_DB_CONNECTION: %DEBUG_DB_CONNECTION%
echo DISABLE_DEV_FALLBACK: %DISABLE_DEV_FALLBACK%
echo JWT_SECRET: %JWT_SECRET%

echo.
echo You can now run the application with these environment variables.
echo To use these variables in the current terminal session, run this script with:
echo call set-env-vars.bat
