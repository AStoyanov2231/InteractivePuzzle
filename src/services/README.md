# Game Stats Service

## Overview
The `gameStatsService` automatically sends game completion data to `https://sports.ue-varna.bg/api.php` when single-player games are completed.

## When API Requests Are Triggered

### ✅ **"Complete Game" Button** (Завърши играта)
- **Math Game**: Triggers API when clicked
- **Word Game**: Triggers API when clicked  
- **Quiz Game**: Triggers API when clicked
- **Speed Game**: Triggers API when clicked

### ✅ **"Back to Home" Button** (Към началото)
- All games: Triggers API when clicked (if completion screen is shown)

### ✅ **Automatic Completion**
- When games naturally complete (all problems solved, etc.)

## JSON Data Sent

```json
{
  "username": "PlayerName",
  "time": 120,
  "correct": 8,
  "wrong": 2,
  "gameType": "math|word|quiz|speed"
}
```

## Console Messages

Look for these in browser console:
- `"Submitting game stats:"` - Shows data being sent
- `"Stats submitted via Complete Game button"` - Manual completion
- `"Game stats submitted successfully:"` - Success response
- `"Failed to submit game stats:"` - Error response

## Testing

1. Play a single-player game
2. Click "Завърши играта" button
3. Check browser console for success message
4. Check Network tab for POST request to `sports.ue-varna.bg`

## Notes

- Only works for single-player games (not competitive mode)
- Automatically gets username from localStorage
- Time is tracked in seconds (stopwatch format)
- Non-blocking: games work normally even if API fails 