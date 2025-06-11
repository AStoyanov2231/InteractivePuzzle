import React, { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { MemoryGrid } from "./components/MemoryGrid";
import { MemoryGameControls } from "./components/MemoryGameControls";
import { getMemoryItems, formatTime } from "./utils/memoryUtils";

interface MemoryGameProps {
  level: GameLevel;
  onComplete: (points?: number) => void;
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
  
  // Use level.themeId for the card category, with localStorage as fallback for competitive mode
  const selectedCategory = level.themeId || localStorage.getItem('selectedMemoryCategory') || "animals";
  const [gridItems, setGridItems] = useState<string[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [matchTimes, setMatchTimes] = useState<number[]>([]); // Track time for each match
  const [gameStartTime] = useState(Date.now()); // Track game start time
  
  // Calculate points based on game performance
  const calculatePoints = (forLiveDisplay = false) => {
    const totalPairs = gridItems.length / 2;
    const completedPairs = matchedPairs.length / 2;
    const timeElapsed = level.timeLimit - timeLeft;
    const wrongMoves = Math.max(0, moves - completedPairs);
    
    // Debug: prevent issues with very large time values
    if (timeElapsed < 0 || timeElapsed > level.timeLimit) {
      console.warn('Invalid time elapsed:', timeElapsed, 'timeLeft:', timeLeft, 'timeLimit:', level.timeLimit);
    }
    
    // Base points: 8 points per matched pair (reduced from 10)
    let points = completedPairs * 8;
    
    // Time bonus: Up to 3 bonus points per pair based on reasonable speed
    // Give bonus if pairs are matched in reasonable time (less than 30 seconds per pair)
    if (completedPairs > 0) {
      const averageTimePerPair = Math.min(timeElapsed / completedPairs, 60); // Cap at 60 seconds per pair
      if (averageTimePerPair <= 15) {
        points += completedPairs * 3; // Fast (under 15 sec per pair)
      } else if (averageTimePerPair <= 30) {
        points += completedPairs * 2; // Medium speed (15-30 sec per pair)
      } else if (averageTimePerPair <= 45) {
        points += completedPairs * 1; // Slow but acceptable (30-45 sec per pair)
      }
      // No bonus for very slow (45+ sec per pair)
    }
    
    // Efficiency bonus: Small bonus for accuracy
    if (completedPairs > 0 && wrongMoves === 0) {
      points += completedPairs * 2; // Perfect accuracy bonus
    } else if (wrongMoves <= completedPairs) {
      points += Math.floor(completedPairs * 1); // Good accuracy bonus
    }
    
    // Completion bonus: Extra points for finishing the entire game
    if (!forLiveDisplay && completedPairs === totalPairs && totalPairs > 0) {
      points += 15; // Completion bonus
    }
    
    // Ensure reasonable range (typically 30-80 points for 4x4 grid)
    return Math.floor(Math.max(0, Math.min(points, 100))); // Cap at 100 points max
  };
  
  // Calculate current points for live display
  const currentPoints = calculatePoints(true);

  // Initialize the game immediately on component mount
  useEffect(() => {
    initializeGrid();
    // Start the timer immediately
    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedCategory]);

  // Initialize the grid with the correct number of items
  const initializeGrid = () => {
    const items = getMemoryItems(selectedCategory, totalCells);
    setGridItems(items.slice(0, totalCells));
  };

  // Check for game completion
  useEffect(() => {
    const totalPairs = gridItems.length / 2;
    if (matchedPairs.length === gridItems.length && gridItems.length > 0) {
      // Game completed - calculate and pass points
      const points = calculatePoints();
      onComplete(points);
    }
  }, [matchedPairs, gridItems, onComplete]);

  // Handle card flip with turn management
  const handleCardClick = (index: number) => {
    // Don't allow clicking if already matched or currently flipped
    if (matchedPairs.includes(index) || flippedIndices.includes(index) || flippedIndices.length >= 2) {
      return;
    }

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
        // Record the time for this match
        setMatchTimes(prev => [...prev, Date.now() - gameStartTime]);
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
    setTimeLeft(level.timeLimit);
    setCurrentPlayerIndex(0);
    setMatchTimes([]);
    
    // Call the initialization function
    initializeGrid();
  };

  const currentPlayer = currentTeam?.players[currentPlayerIndex];
  const isCompetitiveMode = !!currentTeam; // Check if we're in competitive mode

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
      <MemoryGameControls 
        timeLeft={timeLeft}
        moves={moves}
        maxMoves={level.moves}
        onReset={handleResetGame}
        formatTime={formatTime}
        currentPoints={currentPoints}
        showPoints={isCompetitiveMode}
      />

      <MemoryGrid 
        gridItems={gridItems}
        flippedIndices={flippedIndices}
        matchedPairs={matchedPairs}
        gridDimensions={gridDimensions}
        onCardClick={handleCardClick}
      />
    </div>
  );
};
