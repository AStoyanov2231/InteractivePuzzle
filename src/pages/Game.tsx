import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getLevel } from "@/data/gamesData";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { puzzleCategories } from "@/data/puzzleData";
import { GameManager } from "@/games/GameManager";
import { FullscreenButton } from "@/components/FullscreenButton";
import { GameLevel } from "@/types";

const Game = () => {
  const { categoryId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const numericLevelId = levelId ? parseInt(levelId) : 0;
  
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId && numericLevelId) {
      try {
        // Check if we have a custom level passed through navigation state (for math operations)
        const customLevel = location.state?.customLevel as GameLevel;
        
        let level;
        if (customLevel) {
          // Use the custom level for math games with selected operations
          level = customLevel;
        } else {
          // Use the regular level lookup for other games
          level = getLevel(categoryId, numericLevelId);
        }
        
        if (level) {
          setGameData({
            level,
            category: puzzleCategories.find(cat => cat.id === categoryId),
          });
          setErrorMessage(null);
        } else {
          // Handle invalid level
          setErrorMessage(`Нивото ${numericLevelId} в категория ${categoryId} не беше намерено`);
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading game level:", error);
        setErrorMessage("Възникна грешка при зареждане на нивото");
      }
    }
    
    setLoading(false);
  }, [categoryId, numericLevelId, navigate, location.state]);

  const handleBack = () => {
    // Navigate back to home screen
    navigate("/");
  };

  const handleGameComplete = () => {
    // Game completed
  };

  const handleTimeUp = () => {
    // Time is up
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Зареждане...</div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex flex-col items-center justify-center relative">
        <FullscreenButton className="fixed top-4 right-4 z-50" />
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Грешка</h1>
          <p className="text-red-600 mb-6">{errorMessage}</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Обратно към меню
          </Button>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex flex-col items-center justify-center relative">
        <FullscreenButton className="fixed top-4 right-4 z-50" />
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Нивото не беше намерено</h1>
          <Button 
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Обратно към меню
          </Button>
        </div>
      </div>
    );
  }

  const { level, category } = gameData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 p-4 relative overflow-hidden">
      {/* Fullscreen button in top right corner */}
      <FullscreenButton className="fixed top-4 right-4 z-50" />
      
      {/* Game Header - Fixed height for single viewport */}
      <div className="flex justify-between items-center mb-4 h-16">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="rounded-full bg-white/20 hover:bg-white/30 text-gray-700 backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
            <h1 className="text-lg font-bold text-gray-800">{category?.name}</h1>
          </div>
        </div>
      </div>

      {/* Game Content Container - Calculated height for single viewport */}
      <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-6 overflow-hidden" 
           style={{ height: 'calc(100vh - 7rem)' }}>
        <div className="h-full flex flex-col">
          {/* Game Container - Independent scrollable area if needed */}
          <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 overflow-auto">
            <GameManager 
              categoryId={categoryId || ""} 
              level={level} 
              onComplete={handleGameComplete} 
              onTimeUp={handleTimeUp} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
