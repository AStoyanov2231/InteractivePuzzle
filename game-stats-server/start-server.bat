@echo off
echo Starting Game Stats Server...
echo =============================

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting server on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.

npm start
