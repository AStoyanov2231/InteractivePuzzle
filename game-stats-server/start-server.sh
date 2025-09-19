#!/bin/bash

echo "Starting Game Stats Server..."
echo "============================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

echo "Starting server on http://localhost:3001"
echo "Press Ctrl+C to stop the server"
echo

npm start
