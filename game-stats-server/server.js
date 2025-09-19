const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON bodies

// Store received data (in-memory for testing)
const gameStats = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dummy game stats server is running',
    totalStatsReceived: gameStats.length 
  });
});

// Main endpoint to receive game stats
app.post('/api/game-stats', (req, res) => {
  try {
    const { username, time, timeSeconds, correct, wrong, gameType } = req.body;
    
    // Validate required fields
    if (!username || !time || typeof timeSeconds !== 'number' || typeof correct !== 'number' || typeof wrong !== 'number' || !gameType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: username, time, timeSeconds, correct, wrong, gameType'
      });
    }
    
    // Validate game type
    const validGameTypes = ['math', 'word', 'quiz', 'speed', 'memory', 'logic'];
    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid gameType. Must be one of: ${validGameTypes.join(', ')}`
      });
    }
    
    // Create game stats record
    const statsRecord = {
      id: gameStats.length + 1,
      username,
      time, // Formatted time in MM:SS
      timeSeconds, // Time in seconds for calculations
      correct,
      wrong,
      gameType,
      timestamp: new Date().toISOString(),
      totalAttempts: correct + wrong
    };
    
    // Store the data
    gameStats.push(statsRecord);
    
    // Log raw JSON received
    console.log('\n📨 RAW JSON RECEIVED:');
    console.log(JSON.stringify(req.body, null, 2));
    console.log('================================\n');
    
    // Return success response
    res.json({
      success: true,
      message: 'Game stats received successfully',
      data: {
        id: statsRecord.id,
        username: statsRecord.username,
        gameType: statsRecord.gameType,
        time: statsRecord.time,
        timeSeconds: statsRecord.timeSeconds,
        timestamp: statsRecord.timestamp
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing game stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all received stats (for debugging)
app.get('/api/game-stats', (req, res) => {
  res.json({
    success: true,
    total: gameStats.length,
    data: gameStats
  });
});

// Get stats by game type
app.get('/api/game-stats/:gameType', (req, res) => {
  const { gameType } = req.params;
  const filteredStats = gameStats.filter(stat => stat.gameType === gameType);
  
  res.json({
    success: true,
    gameType,
    total: filteredStats.length,
    data: filteredStats
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Dummy Game Stats Server Started!');
  console.log('=====================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Stats endpoint: POST http://localhost:${PORT}/api/game-stats`);
  console.log(`📋 View all stats: GET http://localhost:${PORT}/api/game-stats`);
  console.log('=====================================');
  console.log('🎮 Ready to receive game completion data!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down dummy server...');
  console.log(`📊 Total stats received during this session: ${gameStats.length}`);
  if (gameStats.length > 0) {
    console.log('📋 Game types received:');
    const gameTypeCounts = gameStats.reduce((acc, stat) => {
      acc[stat.gameType] = (acc[stat.gameType] || 0) + 1;
      return acc;
    }, {});
    Object.entries(gameTypeCounts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} sessions`);
    });
  }
  process.exit(0);
});
