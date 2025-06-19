import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Puzzle } from "lucide-react";
import { PuzzleCategory, Theme, Difficulty, GameLevel } from "@/types";
import { getLevelsByCriteria } from "@/data/gamesData";
import { ThemeSelector } from "./puzzle-details/ThemeSelector";
import { DifficultySelector } from "./puzzle-details/DifficultySelector";
import { LevelSelector } from "./puzzle-details/LevelSelector";
// import { LevelDetails } from "./puzzle-details/LevelDetails";

interface PuzzleDetailsProps {
  category: PuzzleCategory;
  onClose: () => void;
}

export const PuzzleDetails = ({ category, onClose }: PuzzleDetailsProps) => {
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

        {/* Details board commented out as requested */}
        {/* <div className="flex flex-col space-y-6 lg:space-y-8 lg:w-2/5 xl:w-1/3 lg:justify-between">
          {currentLevelDetails ? (
            <LevelDetails level={currentLevelDetails} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-600 bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Puzzle className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};
