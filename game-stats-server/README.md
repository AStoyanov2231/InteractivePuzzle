# Game Stats Dummy Server

A standalone Express.js server to receive and test game completion statistics from the Interactive Puzzle Game.

## Setup

### 1. Navigate to Server Directory
```bash
cd game-stats-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

The server will start on `http://localhost:3001`

### 4. Test the Server
```bash
# Test the API endpoints
npm test
# or
node test.js
```

Visit `http://localhost:3001/health` to check if the server is running.

## Running Separately from Main App

### Terminal 1 - Game Stats Server
```bash
cd game-stats-server
npm install
npm start
```

### Terminal 2 - Main React App
```bash
# In your main project directory
npm run dev
# or
npm start
```

Now both applications run independently:
- **React App**: `http://localhost:5173` (or your configured port)
- **Stats Server**: `http://localhost:3001`

## API Endpoints

### POST `/api/game-stats`
Receives game completion data in JSON format.

**Request Body:**
```json
{
  "username": "Player123",
  "time": 45,
  "correct": 8,
  "wrong": 2,
  "gameType": "math"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Game stats received successfully",
  "data": {
    "id": 1,
    "username": "Player123",
    "gameType": "math",
    "timestamp": "2023-12-07T10:30:00.000Z"
  }
}
```

### GET `/api/game-stats`
Returns all received game statistics.

### GET `/api/game-stats/:gameType`
Returns statistics filtered by game type (math, word, quiz, speed, memory, logic).

### GET `/health`
Health check endpoint.

## Supported Game Types
- `math` - Math crossword puzzles
- `word` - Word finding games
- `quiz` - Quiz questions
- `speed` - Speed/reaction games
- `memory` - Memory card games
- `logic` - Logic/Toggle Trails puzzles

## Data Fields

| Field | Type | Description |
|-------|------|-------------|
| username | string | Player's name |
| time | number | Time spent in seconds |
| correct | number | Number of correct answers |
| wrong | number | Number of wrong answers |
| gameType | string | Type of game played |

## Console Output

The server logs all received game completion data:

```
🎮 NEW GAME STATS RECEIVED:
================================
📊 ID: 1
👤 Username: TestPlayer
🎯 Game Type: MATH
⏱️  Time: 120 seconds (2:00)
✅ Correct: 5
❌ Wrong: 1
📈 Total Attempts: 6
📅 Timestamp: 2023-12-07T10:30:00.000Z
================================
```

## Files Structure
```
game-stats-server/
├── package.json       # Dependencies and scripts
├── server.js          # Main server file
├── test.js           # API testing script
└── README.md         # This file
```

## Stopping the Server

Press `Ctrl+C` to stop the server. It will show a summary of received data before shutting down.

## Integration

The main React app automatically sends data to this server when games are completed in single-player mode. No additional configuration needed - just make sure this server is running on port 3001.
