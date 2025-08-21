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

// Specialized Words Selection Component
const WordsSelection = ({ category, onClose }: MathSelectionProps) => {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(category.themes[0] || null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleStartGame = () => {
    if (selectedTheme) {
      const gameLevel: GameLevel = {
        id: 1,
        themeId: selectedTheme.id,
        difficultyId: "all",
        isLocked: false,
        title: "Словесна игра",
        description: `${selectedTheme.name}`,
        timeLimit: 300,
        moves: 15,
        grid: "words"
      };

      navigate(`/game/${category.id}/1`, { state: { customLevel: gameLevel } });
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

          {/* Difficulty is not used for words anymore */}

          {/* Start Button instead of Level Selector */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-800">Започни игра</h3>
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={handleStartGame}
                  disabled={!selectedTheme}
                  size="lg"
                  className="w-full max-w-md bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Започни игра с 15 думи
                </Button>
              </div>
            </div>
          </div>
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

  // If it's words category, use the specialized words selection
  if (category.id === "words") {
    return <WordsSelection category={category} onClose={onClose} />;
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
