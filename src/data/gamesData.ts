import { GameData, GameLevel } from "@/types";

// Helper function to generate levels for each theme and difficulty
const generateLevels = (
  categoryId: string,
  themeIds: string[],
  difficultyIds: string[]
): GameLevel[] => {
  const levels: GameLevel[] = [];
  let levelCounter = 1;

  themeIds.forEach(themeId => {
    difficultyIds.forEach(difficultyId => {
      // Generate 10 levels for each theme and difficulty combination
      for (let i = 1; i <= 10; i++) {
        const difficultyMultiplier = difficultyId === "easy" ? 1 : difficultyId === "medium" ? 1.5 : 2;
        
        levels.push({
          id: levelCounter,
          themeId,
          difficultyId,
          isLocked: false, // All levels are now unlocked
          title: `Ниво ${i}`,
          description: `${categoryId === "memory" ? "Игра на паметта" : 
                          categoryId === "logic" ? "Логическа игра" : 
                          categoryId === "math" ? "Математическа игра" : 
                          categoryId === "words" ? "Словесна игра" : 
                          categoryId === "quiz" ? "Викторина" : 
                          categoryId === "competitive" ? "Състезателна игра" :
                          categoryId === "speed" ? "Скоростна игра" :
                          "Състезателна игра"}`,
          timeLimit: Math.floor(60 * difficultyMultiplier),
          moves: Math.floor(10 * difficultyMultiplier),

          grid: `${Math.min(3 + Math.floor(i / 3), 6)}×${Math.min(3 + Math.floor(i / 3), 6)}`,
        });
        
        levelCounter++;
      }
    });
  });

  return levels;
};

// Generate special speed game level that doesn't require multiple levels
const generateSpeedLevels = (): GameLevel[] => {
  const levels: GameLevel[] = [];
  let levelCounter = 1;
  
  const themeIds = ["color-match"];
  const difficultyIds = ["easy", "hard"];
  
  themeIds.forEach(themeId => {
    difficultyIds.forEach(difficultyId => {
      levels.push({
        id: levelCounter,
        themeId,
        difficultyId,
        isLocked: false,
        title: difficultyId === "easy" ? "Нормална скорост" : "Висока скорост",
        description: "Скоростна игра с цветове",
        timeLimit: 60,
        moves: 30,
        grid: "2×1",
      });
      
      levelCounter++;
    });
  });
  
  return levels;
};

// Generate game data for all categories
export const gamesData: GameData[] = [
  {
    categoryId: "memory",
    levels: generateLevels(
      "memory",
      ["animals", "food", "sports"],
      ["easy", "medium", "hard"]
    ),
  },
  {
    categoryId: "logic",
    levels: generateLevels(
      "logic",
      ["patterns", "colors", "shapes"],
      ["easy", "medium", "hard"]
    ),
  },
  {
    categoryId: "math",
    levels: generateLevels(
      "math",
      ["addition", "subtraction", "multiplication"],
      ["easy", "medium", "hard"]
    ),
  },
  {
    categoryId: "words",
    levels: generateLevels(
      "words",
      ["sport", "food", "places"],
      ["easy", "medium", "hard"]
    ),
  },
  {
    categoryId: "quiz",
    levels: generateLevels(
      "quiz",
      ["history", "science", "geography"],
      ["easy", "medium", "hard"]
    ),
  },
  {
    categoryId: "competitive",
    levels: generateLevels(
      "competitive",
      ["memory"],
      ["medium"]
    ),
  },
  {
    categoryId: "speed",
    levels: generateSpeedLevels(),
  },
];

// Utility function to get levels by category, theme, and difficulty
export const getLevelsByCriteria = (
  categoryId: string,
  themeId?: string,
  difficultyId?: string
): GameLevel[] => {
  const categoryData = gamesData.find(data => data.categoryId === categoryId);
  
  if (!categoryData) return [];
  
  let filteredLevels = [...categoryData.levels];
  
  if (themeId) {
    filteredLevels = filteredLevels.filter(level => level.themeId === themeId);
  }
  
  if (difficultyId) {
    filteredLevels = filteredLevels.filter(level => level.difficultyId === difficultyId);
  }
  
  return filteredLevels.sort((a, b) => a.id - b.id);
};

// Function to get a specific level
export const getLevel = (categoryId: string, levelId: number): GameLevel | undefined => {
  const categoryData = gamesData.find(data => data.categoryId === categoryId);
  if (!categoryData) return undefined;
  
  return categoryData.levels.find(level => level.id === levelId);
};
