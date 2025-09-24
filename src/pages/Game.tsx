import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getLevel } from "@/data/gamesData";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { puzzleCategories } from "@/data/puzzleData";
import { GameManager } from "@/games/GameManager";
import { FullscreenButton } from "@/components/FullscreenButton";
import { RequireNameToggle } from "@/components/RequireNameToggle";
import { UsernameDialog } from "@/components/UsernameDialog";
import { GameLevel } from "@/types";
import { isPWAMode } from "@/utils/pwaUtils";

const Game = () => {
  const { categoryId, levelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const numericLevelId = levelId ? parseInt(levelId) : 0;
  
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUsernameDialog, setShowUsernameDialog] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [requireUsername, setRequireUsername] = useState<boolean>(() => {
    const stored = localStorage.getItem('requireUsernameForSolo');
    return stored === null ? true : stored === 'true';
  });
  const [isInCategorySelection, setIsInCategorySelection] = useState(false);

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

  const handleUsernameSubmit = (enteredUsername: string) => {
    setUsername(enteredUsername);
    setShowUsernameDialog(false);
    
    // Store username in localStorage for the session
    localStorage.setItem('currentPlayerName', enteredUsername);
  };

  const handleBack = () => {
    // Clear username when going back
    localStorage.removeItem('currentPlayerName');
    // In PWA mode, for speed game, go back to category selection instead of main page
    if (isPWAMode() && categoryId === 'speed') {
      // Reset to category selection by clearing the level
      navigate(`/game/speed/1`, { replace: true });
      window.location.reload(); // Force reload to show category selection
    } else {
      navigate("/");
    }
  };

  const handleGameComplete = () => {
    // Game completed
  };

  const handleTimeUp = () => {
    // Time is up
  };

  const handleBackToSelection = () => {
    // This function can be used to reset game state and go back to category selection
    // For speed game in PWA mode, this allows going back to speed selection
    if (isPWAMode() && categoryId === 'speed') {
      // Just force a refresh to reset the game state
      window.location.reload();
    }
  };

  const handleGameStateChange = (inCategorySelection: boolean) => {
    setIsInCategorySelection(inCategorySelection);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg text-center max-w-md">
          <div className="text-xl font-semibold text-red-600 mb-4">Грешка</div>
          <div className="text-gray-700 mb-6">{errorMessage}</div>
          <Button onClick={handleBack} variant="outline">
            Назад към началото
          </Button>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
          <div className="text-xl font-semibold text-gray-700">Зареждане...</div>
        </div>
      </div>
    );
  }

  const { level, category } = gameData;

  // Show username dialog if required and not provided (but skip in PWA mode)
  if ((requireUsername && (showUsernameDialog || !username) && !isPWAMode())) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex items-center justify-center">
          <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg text-center max-w-md">
            <div className="text-xl font-semibold text-gray-700">Подготвяне на играта...</div>
          </div>
        </div>
        
        <UsernameDialog 
          open={showUsernameDialog}
          onSubmit={handleUsernameSubmit}
          categoryName={category?.name || "игра"}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 p-4 relative overflow-hidden">
      {/* Controls in top right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <RequireNameToggle />
        <FullscreenButton />
      </div>
      
        {/* Game Header - Fixed height for single viewport */}
      <div className="flex justify-between items-center mb-4 h-16">
        <div className="flex items-center gap-3">
          {/* Hide back button in PWA mode for speed game category selection, but show during gameplay */}
          {!(isPWAMode() && categoryId === 'speed' && isInCategorySelection) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="rounded-full bg-white/20 hover:bg-white/30 text-gray-700 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
            <h1 className="text-lg font-bold text-gray-800">{category?.name}</h1>
          </div>
        </div>
      </div>

      {/* Game Content Container - Calculated height for single viewport */}
      <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden" 
           style={{ height: 'calc(100vh - 7rem)' }}>
        <div className="h-full flex flex-col">
          {/* Game Container - Independent scrollable area if needed */}
          <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 overflow-auto">
            <GameManager 
              categoryId={categoryId || ""} 
              level={level} 
              onComplete={handleGameComplete} 
              onTimeUp={handleTimeUp}
              onBackToSelection={handleBackToSelection}
              onGameStateChange={handleGameStateChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
