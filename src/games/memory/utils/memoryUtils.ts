// Helper function to get memory items based on theme
export const getMemoryItems = (themeId: string, gridSize: number) => {
  const items: string[] = [];
  const pairsCount = Math.floor(gridSize / 2);

  const getThemeItems = () => {
    if (themeId === "animals") {
      return ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐯", "🐮", "🐷", "🐸", "🐵"];
    } else if (themeId === "food") {
      return ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅"];
    } else if (themeId === "sports") {
      return ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🏒", "🏑", "🏏", "⛳", "🎳", "🎯", "🥊"];
    }
    // Default fallback
    return ["🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🎪", "🎰", "🎳", "🎼", "🎵", "🎹", "🎸", "🎺", "🎻"];
  };

  const themeItems = getThemeItems();
  
  // Create pairs of items
  for (let i = 0; i < pairsCount; i++) {
    const item = themeItems[i % themeItems.length];
    items.push(item, item); // Add each item twice to create pairs
  }

  // Fisher-Yates shuffle algorithm
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Helper function to format time display
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Memory categories for competitive mode
export const memoryCategories = [
  {
    id: "animals",
    name: "Животни",
    description: "Различни животни",
    icon: "🐶",
    color: "#10B981"
  },
  {
    id: "food",
    name: "Храна",
    description: "Плодове и храни",
    icon: "🍎",
    color: "#F59E0B"
  },
  {
    id: "sports",
    name: "Спорт",
    description: "Спортни предмети",
    icon: "⚽",
    color: "#3B82F6"
  }
];

// Points calculation utility function for testing
export const calculateMemoryPoints = (
  completedPairs: number,
  totalPairs: number,
  timeElapsed: number,
  wrongMoves: number,
  isGameComplete: boolean = false
): number => {
  // Base points: 10 points per matched pair
  let points = completedPairs * 10;
  
  // Time bonus: Up to 5 bonus points per pair based on speed
  // Faster completion = more bonus (max 5 points per pair)
  const averageTimePerPair = timeElapsed / Math.max(completedPairs, 1);
  const timeBonus = Math.max(0, Math.min(5, Math.floor((60 - averageTimePerPair) / 10))); // Bonus for being faster than 60 seconds per pair
  points += completedPairs * timeBonus;
  
  // Efficiency bonus: Small bonus for fewer wrong moves
  // Max 1 point per pair for perfect efficiency (no wrong moves)
  const efficiencyBonus = Math.max(0, completedPairs - wrongMoves * 0.5);
  points += Math.floor(efficiencyBonus);
  
  // Completion bonus: Extra points for completing the entire game
  if (isGameComplete && completedPairs === totalPairs) {
    points += 10; // 10 point completion bonus
  }
  
  return Math.floor(Math.max(0, points)); // Ensure non-negative integer
};
