import React, { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { MemoryGrid } from "./components/MemoryGrid";
import { MemoryGameControls } from "./components/MemoryGameControls";
import { getMemoryItems, formatTime } from "./utils/memoryUtils";
import { useGameTimer } from "@/hooks/useGameTimer";
import { TimeUpScreen } from "@/components/TimeUpScreen";

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
  // Use the original grid dimensions from level configuration
  const originalRows = parseInt(level.grid.split("×")[0]);
  const originalCols = parseInt(level.grid.split("×")[1]);
  const originalTotalCells = originalRows * originalCols;
  
  // Ensure we always have an even number of cells for proper pairing
  let rows = originalRows;
  let cols = originalCols;
  let totalCells = originalTotalCells;
  
  if (originalTotalCells % 2 !== 0) {
    // If odd, try to adjust dimensions to maintain rectangular shape
    // Prefer reducing the larger dimension by 1
    if (originalRows >= originalCols) {
      rows = originalRows - 1;
    } else {
      cols = originalCols - 1;
    }
    totalCells = rows * cols;
  }
  
  const gridDimensions = [cols, rows]; // [columns, rows] for CSS grid
  
  // Get category from localStorage for competitive mode, default to animals
  const selectedCategory = localStorage.getItem('selectedMemoryCategory') || "animals";
  const [gridItems, setGridItems] = useState<string[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  // Use the game timer hook
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, resetTimer } = useGameTimer({
    enabled: true
  });
  
  // Initialize the game immediately on component mount
  useEffect(() => {
    initializeGrid();
  }, []);

  // Initialize the grid with the correct number of items
  const initializeGrid = () => {
    const items = getMemoryItems(selectedCategory, totalCells);
    setGridItems(items.slice(0, totalCells));
  };

  // Check for game completion
  useEffect(() => {
    if (matchedPairs.length === gridItems.length && gridItems.length > 0) {
      // Game completed
      onComplete();
    }
  }, [matchedPairs, gridItems, onComplete]);

  // Handle card flip with turn management
  const handleCardClick = (index: number) => {
    // Don't allow clicking if already matched or currently flipped
    if (matchedPairs.includes(index) || flippedIndices.includes(index) || flippedIndices.length >= 2) {
      return;
    }
    
    // Start timer on first card flip
    startTimer();

    // Add card to flipped indices
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // If we have 2 cards flipped, check for match and handle turn change
    if (newFlippedIndices.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      if (gridItems[firstIndex] === gridItems[secondIndex]) {
        // We have a match - player continues their turn
        setMatchedPairs(prev => [...prev, firstIndex, secondIndex]);
        setFlippedIndices([]);
      } else {
        // No match, flip back after delay and change turn
        setTimeout(() => {
          setFlippedIndices([]);
          // Change to next player in the team
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
    resetTimer();
    setCurrentPlayerIndex(0);
    
    // Call the initialization function
    initializeGrid();
  };

  const currentPlayer = currentTeam?.players[currentPlayerIndex];

  return (
    <>
      {showTimeUpScreen && (
        <TimeUpScreen 
          onReset={handleResetGame}
        />
      )}
      
      <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
        <MemoryGameControls 
          timeLeft={timeLeft}
          moves={moves}
          maxMoves={level.moves}
          onReset={handleResetGame}
          onComplete={onComplete}
          formatTime={formatTime}
          hasStarted={hasStarted}
        />

        <MemoryGrid 
          gridItems={gridItems}
          flippedIndices={flippedIndices}
          matchedPairs={matchedPairs}
          gridDimensions={gridDimensions}
          onCardClick={handleCardClick}
        />
      </div>
    </>
  );
};
