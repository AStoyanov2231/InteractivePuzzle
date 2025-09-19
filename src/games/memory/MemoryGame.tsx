import React, { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { MemoryGrid } from "./components/MemoryGrid";
import { getMemoryItems, formatTime, memoryCategories } from "./utils/memoryUtils";
import { useGameTimer } from "@/hooks/useGameTimer";
import { TimeUpScreen } from "@/components/TimeUpScreen";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { gameStatsService } from "@/services/gameStatsService";

// Chronometer-style timer display (matches other games)
const Chronometer: React.FC<{ label?: string; seconds: number; hasStarted: boolean }>
  = ({ label = "", seconds, hasStarted }) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return (
    <div className="w-full">
      <div className="text-center text-sm text-gray-600 mb-2">{label}</div>
      <div className="relative mx-auto w-36 h-36">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-gray-300 rounded-t-xl shadow" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-50 to-slate-200 border-4 border-slate-300 shadow-xl" />
        <div className="absolute inset-2 rounded-full bg-white shadow-inner" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold tabular-nums tracking-wider">
            {hasStarted ? `${mins}:${secs}` : "00:00"}
          </div>
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 left-3 w-3 h-1 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 right-3 w-3 h-1 bg-slate-400 rounded" />
      </div>
    </div>
  );
};

interface MemoryGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
  currentTeam?: any;
  onPlayerTurn?: (playerId: string) => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ 
  level, 
  onComplete, 
  onTimeUp, 
  currentTeam,
  onPlayerTurn 
}) => {
  const navigate = useNavigate();
  
  // Fixed 4x4 grid (16 cards total = 8 pairs)
  const rows = 4;
  const cols = 4;
  const totalCells = 16; // 8 pairs = 16 cards
  const gridDimensions = [cols, rows]; // [columns, rows] for CSS grid
  
  // Always start without category selected to force category picker
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Game state
  const [gridItems, setGridItems] = useState<string[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  // Use the game timer hook
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, stopTimer, resetTimer } = useGameTimer({
    enabled: true
  });
  
  // Initialize the game when category is selected
  useEffect(() => {
    if (selectedCategory) {
      initializeGrid();
    }
  }, [selectedCategory]);

  // Initialize the grid with 16 cards (8 pairs) for 4x4 grid
  const initializeGrid = () => {
    if (!selectedCategory) return;
    const items = getMemoryItems(selectedCategory, totalCells);
    // Fill 4x4 grid with all 16 cards (8 pairs)
    setGridItems(items.slice(0, totalCells));
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Don't save to localStorage so it always asks for category next time
  };

  // Check for round completion (only 1 round now)
  useEffect(() => {
    if (matchedPairs.length === totalCells && gridItems.length > 0) {
      // Game completed after 1 round
      stopTimer();
      
      // Submit stats when game completes automatically
      if (gameStatsService.isSinglePlayerMode(currentTeam)) {
        try {
          gameStatsService.submitMemoryGameStats({
            movesUsed: moves,
            maxMoves: 999, // No limit in new version
            timeElapsed: timeLeft, // timeLeft is actually timeElapsed (counting up)
            completed: true,
          }).then(() => {
            console.log('Stats submitted automatically after completing memory game');
          }).catch(error => {
            console.error('Failed to submit stats:', error);
          });
        } catch (error) {
          console.error('Failed to submit stats:', error);
        }
      }
      
      setShowCompletionScreen(true);
    }
  }, [matchedPairs, gridItems, stopTimer, timeLeft, moves, currentTeam]);

  // Handle card flip
  const handleCardClick = (index: number) => {
    // Don't allow clicking if already matched or currently flipped
    if (matchedPairs.includes(index) || flippedIndices.includes(index) || 
        flippedIndices.length >= 2) {
      return;
    }
    
    // Start timer on first card flip
    startTimer();

    // Add card to flipped indices
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // If we have 2 cards flipped, check for match
    if (newFlippedIndices.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      if (gridItems[firstIndex] === gridItems[secondIndex]) {
        // We have a match
        setMatchedPairs(prev => [...prev, firstIndex, secondIndex]);
        setFlippedIndices([]);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setFlippedIndices([]);
          // Change to next player in competitive mode
          if (currentTeam && currentTeam.players.length > 1) {
            const nextPlayerIndex = (currentPlayerIndex + 1) % currentTeam.players.length;
            setCurrentPlayerIndex(nextPlayerIndex);
            if (onPlayerTurn) {
              onPlayerTurn(currentTeam.players[nextPlayerIndex].id);
            }
          }
        }, 1000);
      }
    }
  };

  const handleResetGame = () => {
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setShowCompletionScreen(false);
    resetTimer();
    setCurrentPlayerIndex(0);
    setSelectedCategory(null);
  };

  // Handle manual game completion
  const handleCompleteGame = async () => {
    stopTimer();
    
    // Submit stats when completing game manually
    if (gameStatsService.isSinglePlayerMode(currentTeam)) {
      try {
        await gameStatsService.submitMemoryGameStats({
          movesUsed: moves,
          maxMoves: 999, // No limit in new version
          timeElapsed: timeLeft, // timeLeft is actually timeElapsed (counting up)
          completed: true,
        });
        console.log('Stats submitted via Complete Game button');
      } catch (error) {
        console.error('Failed to submit stats:', error);
      }
    }
    
    setShowCompletionScreen(true);
  };

  // Show category selection if no category selected
  if (!selectedCategory) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Изберете категория</h2>
          <p className="text-lg text-gray-600 mb-8">Изберете тема за картичките в играта на паметта</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {memoryCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <div className="text-4xl mb-4 p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                  {category.icon}
                </div>
                <span className="text-xl font-semibold text-gray-800">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show completion screen
  if (showCompletionScreen) {
    const username = localStorage.getItem('currentPlayerName') || 'Играч';
    
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Браво, {username}!</h2>
            <p className="text-lg text-gray-700 mb-4">Завърши играта на паметта!</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Време:</div>
                  <div className="text-xl font-bold text-blue-600">{formatTime(timeLeft)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Ходове:</div>
                  <div className="text-xl font-bold text-green-600">{moves}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Съвпадения:</div>
                  <div className="text-lg font-bold text-purple-600">8/8</div>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="w-full"
          >
            Към началото
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showTimeUpScreen && (
        <TimeUpScreen onReset={handleResetGame} />
      )}
      
      <div className="flex w-full gap-4 items-start -mx-4">
        {/* LEFT SIDEBAR */}
        <aside className="w-[220px] shrink-0 pl-4">
          <div className="sticky top-6">
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
              <Chronometer seconds={timeLeft} hasStarted={hasStarted} />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ходове</span>
                  <span className="font-semibold">{moves}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Съвпадения</span>
                  <span className="font-semibold">{matchedPairs.length / 2}/8</span>
                </div>
                {currentTeam && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Играч</span>
                    <span className="font-semibold">{currentTeam.players[currentPlayerIndex]?.name || 'Играч'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-3 space-y-2">
              <Button variant="outline" onClick={handleResetGame} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Започни отначало
              </Button>
              {!currentTeam && (
                <Button 
                  variant="outline"
                  onClick={handleCompleteGame}
                  className="w-full bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Завърши играта
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col items-center">
          <div className="bg-white rounded-lg shadow-md p-8 w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Игра на паметта
              </h3>
              <p className="text-gray-600">
                Намери всички 8 двойки карти! Категория: {memoryCategories.find(c => c.id === selectedCategory)?.name}
              </p>
            </div>
            
            <MemoryGrid 
              gridItems={gridItems}
              flippedIndices={flippedIndices}
              matchedPairs={matchedPairs}
              gridDimensions={gridDimensions}
              onCardClick={handleCardClick}
            />
          </div>
        </div>
      </div>
    </>
  );
};
