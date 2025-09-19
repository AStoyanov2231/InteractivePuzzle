import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Puzzle, Play } from "lucide-react";
import { PuzzleCategory, Theme, Difficulty, GameLevel } from "@/types";
import { getLevelsByCriteria } from "@/data/gamesData";
import { ThemeSelector } from "./puzzle-details/ThemeSelector";
import { DifficultySelector, MathOperationSelector } from "./puzzle-details/DifficultySelector";
import { LevelSelector } from "./puzzle-details/LevelSelector";
import { Button } from "./ui/button";

interface PuzzleDetailsProps {
  category: PuzzleCategory;
  onClose: () => void;
}

interface MathSelectionProps {
  category: PuzzleCategory;
  onClose: () => void;
}

// Specialized Math Selection Component
const MathSelection = ({ category, onClose }: MathSelectionProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-start game immediately with all operations
    const allOperations = ['addition', 'subtraction', 'multiplication', 'division'];
    
    const gameLevel: GameLevel = {
      id: 1,
      themeId: allOperations.join(','), // All operations
      difficultyId: "hard", // Use hard for long equations
      isLocked: false,
      title: "Математическа игра",
      description: "Всички операции: Събиране, Изваждане, Умножение, Деление",
      timeLimit: 300, // 5 minutes
      moves: 8,
      grid: "hard"
    };

    // Navigate to game immediately
    navigate(`/game/${category.id}/1`, { state: { customLevel: gameLevel } });
  }, [category.id, navigate]);

  return (
    <div className="bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Стартиране на играта...</div>
        </div>
      </div>
    </div>
  );
};

// Specialized Memory Selection Component
const MemorySelection = ({ category, onClose }: MathSelectionProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-start memory game with default settings
    const gameLevel: GameLevel = {
      id: 1,
      themeId: "animals", // Default category
      difficultyId: "medium", // Not used in new version
      isLocked: false,
      title: "Игра на паметта",
      description: "4x4 картички с 3 рунда",
      timeLimit: 600, // 10 minutes
      moves: 999, // No limit
      grid: "4×4"
    };

    // Navigate to game immediately
    navigate(`/game/${category.id}/1`, { state: { customLevel: gameLevel } });
  }, [category.id, navigate]);

  return (
    <div className="bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Стартиране на играта...</div>
        </div>
      </div>
    </div>
  );
};

// Specialized Words Selection Component
const WordsSelection = ({ category, onClose }: MathSelectionProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-start word game with category selection (like memory game)
    const gameLevel: GameLevel = {
      id: 1,
      themeId: "sport", // Default category, will be overridden in game
      difficultyId: "all",
      isLocked: false,
      title: "Словесна игра",
      description: "Избери категория и реши думите",
      timeLimit: 300,
      moves: 15,
      grid: "words"
    };

    // Navigate to game immediately
    navigate(`/game/${category.id}/1`, { state: { customLevel: gameLevel } });
  }, [category.id, navigate]);

  return (
    <div className="bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Стартиране на играта...</div>
        </div>
      </div>
    </div>
  );
};

// Specialized Logic Selection Component (auto-start, no choices)
const LogicSelection = ({ category, onClose }: MathSelectionProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-start logic game with default settings
    const gameLevel: GameLevel = {
      id: 1,
      themeId: "patterns", // Default theme
      difficultyId: "medium", // Default difficulty
      isLocked: false,
      title: "Логическа игра",
      description: "Свържи еднакви елементи",
      timeLimit: 300,
      moves: 15,
      grid: "logic"
    };

    // Navigate to game immediately
    navigate(`/game/${category.id}/1`, { state: { customLevel: gameLevel } });
  }, [category.id, navigate]);

  return (
    <div className="bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Стартиране на играта...</div>
        </div>
      </div>
    </div>
  );
};

// Specialized Quiz Selection Component (auto-start, no level/difficulty choices)
const QuizSelection = ({ category, onClose }: MathSelectionProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-start quiz game with default settings
    const gameLevel: GameLevel = {
      id: 1,
      themeId: "history", // Default theme, will be overridden by category selection in game
      difficultyId: "medium", // Not used in new version
      isLocked: false,
      title: "Викторина",
      description: "Избери категория и отговори на въпросите",
      timeLimit: 600, // 10 minutes
      moves: 10, // 10 questions
      grid: "quiz"
    };

    // Navigate to game immediately
    navigate(`/game/${category.id}/1`, { state: { customLevel: gameLevel } });
  }, [category.id, navigate]);

  return (
    <div className="bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Стартиране на викторината...</div>
        </div>
      </div>
    </div>
  );
};

// Specialized Speed Selection Component (auto-start, no choices)
const SpeedSelection = ({ category, onClose }: MathSelectionProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-start speed game with default settings
    const gameLevel: GameLevel = {
      id: 1,
      themeId: "color-match", // Default theme
      difficultyId: "easy", // Default difficulty, can be changed in game
      isLocked: false,
      title: "Скоростна игра",
      description: "Съвпадение на цветове",
      timeLimit: 300, // 5 minutes
      moves: 50, // Max attempts
      grid: "speed"
    };

    // Navigate to game immediately
    navigate(`/game/${category.id}/1`, { state: { customLevel: gameLevel } });
  }, [category.id, navigate]);

  return (
    <div className="bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Стартиране на скоростната игра...</div>
        </div>
      </div>
    </div>
  );
};

// Regular PuzzleDetails component for other categories
export const PuzzleDetails = ({ category, onClose }: PuzzleDetailsProps) => {
  // If it's math category, use the specialized math selection
  if (category.id === "math") {
    return <MathSelection category={category} onClose={onClose} />;
  }

  // If it's memory category, use the specialized memory selection
  if (category.id === "memory") {
    return <MemorySelection category={category} onClose={onClose} />;
  }

  // If it's words category, use the specialized words selection
  if (category.id === "words") {
    return <WordsSelection category={category} onClose={onClose} />;
  }

  // If it's logic category, use the specialized logic selection (procedural levels)
  if (category.id === "logic") {
    return <LogicSelection category={category} onClose={onClose} />;
  }

  // If it's quiz category, use the specialized quiz selection (no level/difficulty choices)
  if (category.id === "quiz") {
    return <QuizSelection category={category} onClose={onClose} />;
  }

  // If it's speed category, use the specialized speed selection (auto-start)
  if (category.id === "speed") {
    return <SpeedSelection category={category} onClose={onClose} />;
  }

  // Regular component for other categories
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(category.themes[0] || null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(category.difficulties[0] || null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [currentLevelDetails, setCurrentLevelDetails] = useState<GameLevel | null>(null);
  const [availableLevels, setAvailableLevels] = useState<GameLevel[]>([]);

  useEffect(() => {
    if (selectedTheme && selectedDifficulty) {
      const levels = getLevelsByCriteria(
        category.id,
        selectedTheme.id,
        selectedDifficulty.id
      );
      setAvailableLevels(levels);
      
      if (levels.length > 0) {
        const firstUnlockedLevel = levels.find(l => !l.isLocked) || levels[0];
        setSelectedLevel(firstUnlockedLevel.id);
        setCurrentLevelDetails(firstUnlockedLevel);
      } else {
        setSelectedLevel(null);
        setCurrentLevelDetails(null);
      }
    }
  }, [selectedTheme, selectedDifficulty, category.id]);

  useEffect(() => {
    if (selectedLevel !== null) {
      const level = availableLevels.find(l => l.id === selectedLevel);
      if (level) {
        setCurrentLevelDetails(level);
      }
    }
  }, [selectedLevel, availableLevels]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleStartGame = () => {
    if (currentLevelDetails && selectedLevel) {
      navigate(`/game/${category.id}/${selectedLevel}`);
    }
  };

  return (
    <div 
      className={`bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col transition-all duration-300 ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}
    >
      <div className="flex-1 flex flex-col lg:flex-row p-6 sm:p-8 gap-6 sm:gap-8 overflow-y-auto">
        <div className="flex flex-col space-y-6 lg:space-y-8 w-full">
          
          <ThemeSelector 
            themes={category.themes} 
            selectedTheme={selectedTheme} 
            onSelectTheme={setSelectedTheme} 
          />

          <DifficultySelector 
            difficulties={category.difficulties}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
          />

          <LevelSelector 
            levels={availableLevels}
            selectedLevel={selectedLevel}
            onSelectLevel={(levelId) => {
              setSelectedLevel(levelId);
              const level = availableLevels.find(l => l.id === levelId);
              if (level && !level.isLocked) {
                navigate(`/game/${category.id}/${levelId}`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
