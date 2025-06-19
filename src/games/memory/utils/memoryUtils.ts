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

// Memory game categories for selection
export const memoryCategories = [
  { 
    id: "animals", 
    name: "Животни", 
    icon: "🐶", 
    color: "#F59E0B",
    description: ""
  },
  { 
    id: "food", 
    name: "Храна", 
    icon: "🍎", 
    color: "#EF4444",
    description: ""
  },
  { 
    id: "sports", 
    name: "Спорт", 
    icon: "⚽", 
    color: "#3B82F6",
    description: ""
  }
];

// Format time as MM:SS
export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
