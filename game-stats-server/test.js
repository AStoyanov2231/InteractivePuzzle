// Simple test script to verify the dummy server API
const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Test data for each game type
const testData = [
  { username: "TestPlayer1", time: 120, correct: 8, wrong: 2, gameType: "math" },
  { username: "TestPlayer2", time: 45, correct: 15, wrong: 0, gameType: "word" },
  { username: "TestPlayer3", time: 180, correct: 7, wrong: 3, gameType: "quiz" },
  { username: "TestPlayer4", time: 90, correct: 25, wrong: 5, gameType: "speed" },
  { username: "TestPlayer5", time: 240, correct: 1, wrong: 0, gameType: "memory" },
  { username: "TestPlayer6", time: 65, correct: 1, wrong: 0, gameType: "logic" }
];

async function testAPI() {
  console.log('🧪 Testing Game Stats API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);
    console.log();

    // Test sending game stats
    console.log('2. Sending test game stats...');
    for (const data of testData) {
      try {
        const response = await axios.post(`${API_URL}/api/game-stats`, data);
        console.log(`✅ Sent ${data.gameType} game stats for ${data.username}`);
        console.log(`   Response: ${response.data.message}`);
      } catch (error) {
        console.log(`❌ Failed to send ${data.gameType} stats:`, error.response?.data || error.message);
      }
    }
    console.log();

    // Test retrieving all stats
    console.log('3. Retrieving all stats...');
    const allStatsResponse = await axios.get(`${API_URL}/api/game-stats`);
    console.log(`✅ Retrieved ${allStatsResponse.data.total} total stats`);
    console.log();

    // Test retrieving stats by game type
    console.log('4. Testing stats by game type...');
    const gameTypes = ['math', 'word', 'quiz', 'speed', 'memory', 'logic'];
    for (const gameType of gameTypes) {
      try {
        const response = await axios.get(`${API_URL}/api/game-stats/${gameType}`);
        console.log(`✅ ${gameType}: ${response.data.total} entries`);
      } catch (error) {
        console.log(`❌ Failed to get ${gameType} stats:`, error.response?.data || error.message);
      }
    }
    console.log();

    // Test invalid data
    console.log('5. Testing validation with invalid data...');
    try {
      await axios.post(`${API_URL}/api/game-stats`, {
        username: "BadData",
        time: "not-a-number",
        correct: 5,
        wrong: 1,
        gameType: "invalid-game"
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working - rejected invalid data');
        console.log(`   Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log();

    console.log('🎉 API testing completed successfully!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure the dummy server is running on localhost:3001');
    console.log('   Run: npm start');
  }
}

// Run the test
testAPI();
