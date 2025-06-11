import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameLevel } from "@/types";
import { RefreshCw } from "lucide-react";
import { LoadingScreen } from "../quiz/components/LoadingScreen";

interface ModelsGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
}

// Generate structure patterns based on theme and difficulty
const generateStructure = (themeId: string, difficultyId: string, gridSize: number) => {
  const dimensions = Math.sqrt(gridSize);
  const structure: { filled: boolean; correct: boolean; selected: boolean }[][] = [];
  
  // Create empty grid
  for (let i = 0; i < dimensions; i++) {
    const row: { filled: boolean; correct: boolean; selected: boolean }[] = [];
    for (let j = 0; j < dimensions; j++) {
      row.push({ filled: false, correct: false, selected: false });
    }
    structure.push(row);
  }
  
  // Fill with pattern based on theme
  if (themeId === "blocks") {
    // Simple block patterns
    const patternSize = difficultyId === "easy" ? 3 : 
                       difficultyId === "medium" ? 4 : 5;
    
    // Fill random cells as the correct pattern
    for (let i = 0; i < patternSize; i++) {
      const x = Math.floor(Math.random() * dimensions);
      const y = Math.floor(Math.random() * dimensions);
      
      structure[x][y].filled = true;
      structure[x][y].correct = true;
    }
  } else if (themeId === "structures") {
    // Connected structures
    const startX = Math.floor(Math.random() * dimensions);
    const startY = Math.floor(Math.random() * dimensions);
    
    structure[startX][startY].filled = true;
    structure[startX][startY].correct = true;
    
    // Add connected blocks
    const connectionCount = difficultyId === "easy" ? 2 : 
                           difficultyId === "medium" ? 4 : 6;
    
    let currentX = startX;
    let currentY = startY;
    
    for (let i = 0; i < connectionCount; i++) {
      // Try to add a connected block
      const directions = [
        { dx: 0, dy: 1 }, // right
        { dx: 1, dy: 0 }, // down
        { dx: 0, dy: -1 }, // left
        { dx: -1, dy: 0 }, // up
      ];
      
      // Shuffle directions
      directions.sort(() => Math.random() - 0.5);
      
      let added = false;
      for (const dir of directions) {
        const newX = currentX + dir.dx;
        const newY = currentY + dir.dy;
        
        if (
          newX >= 0 && newX < dimensions && 
          newY >= 0 && newY < dimensions && 
          !structure[newX][newY].filled
        ) {
          structure[newX][newY].filled = true;
          structure[newX][newY].correct = true;
          currentX = newX;
          currentY = newY;
          added = true;
          break;
        }
      }
      
      if (!added) break;
    }
  } else if (themeId === "buildings") {
    // Building-like structures (more vertical)
    const buildingWidth = difficultyId === "easy" ? 2 : 3;
    const buildingHeight = difficultyId === "easy" ? 3 : 
                          difficultyId === "medium" ? 4 : 5;
    
    // Ensure the building fits in the grid
    const startX = Math.floor(Math.random() * (dimensions - buildingWidth + 1));
    const startY = Math.floor(Math.random() * (dimensions - buildingHeight + 1));
    
    // Create a base for the building
    for (let i = 0; i < buildingWidth; i++) {
      structure[startX + i][startY + buildingHeight - 1].filled = true;
      structure[startX + i][startY + buildingHeight - 1].correct = true;
    }
    
    // Create walls
    for (let j = 0; j < buildingHeight; j++) {
      structure[startX][startY + j].filled = true;
      structure[startX][startY + j].correct = true;
      
      structure[startX + buildingWidth - 1][startY + j].filled = true;
      structure[startX + buildingWidth - 1][startY + j].correct = true;
    }
    
    // Add some random elements based on difficulty
    if (difficultyId !== "easy") {
      const extras = difficultyId === "medium" ? 2 : 4;
      for (let k = 0; k < extras; k++) {
        const x = startX + Math.floor(Math.random() * buildingWidth);
        const y = startY + Math.floor(Math.random() * buildingHeight);
        
        if (!structure[x][y].filled) {
          structure[x][y].filled = true;
          structure[x][y].correct = true;
        }
      }
    }
  }
  
  return structure;
};

export const ModelsGame: React.FC<ModelsGameProps> = ({ level, onComplete, onTimeUp }) => {
  // Parse grid dimensions from level configuration
  const gridSizeStr = level.grid || "4×4";
  const [rows, cols] = gridSizeStr.split("×").map(n => parseInt(n));
  const gridDimensions = [cols, rows]; // [columns, rows] for CSS grid
  
  const [structure, setStructure] = useState<{ filled: boolean; correct: boolean; selected: boolean }[][]>([]);
  const [gamePhase, setGamePhase] = useState<"memorize" | "build">("memorize");
  const [moves, setMoves] = useState(0);
  const [correctCells, setCorrectCells] = useState(0);
  const [totalCorrectCells, setTotalCorrectCells] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [isInitialized, setIsInitialized] = useState(false);
  const [cellSize, setCellSize] = useState(60);

  // Calculate dynamic cell size based on viewport and grid dimensions
  useEffect(() => {
    const updateCellSize = () => {
      // Get available viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate available space for the game (considering header, controls, padding)
      const headerHeight = 80; // Header height
      const controlsHeight = 120; // Controls height
      const padding = 80; // Total padding around the game
      const availableHeight = viewportHeight - headerHeight - controlsHeight - padding;
      const availableWidth = Math.min(viewportWidth - padding, 600); // Max width constraint
      
      // Calculate the optimal cell size based on grid dimensions and available space
      const maxCellSizeByWidth = Math.floor((availableWidth - (cols - 1) * 4) / cols); // 4px gap between cells
      const maxCellSizeByHeight = Math.floor((availableHeight - (rows - 1) * 4) / rows);
      
      // Use the smaller dimension to ensure the grid fits
      let optimalCellSize = Math.min(maxCellSizeByWidth, maxCellSizeByHeight);
      
      // Dynamic scaling based on grid size
      const totalCells = cols * rows;
      if (totalCells <= 16) {
        // Small grids: make them bigger (minimum 60px for small grids)
        optimalCellSize = Math.max(optimalCellSize, 60);
        optimalCellSize = Math.min(optimalCellSize, 100); // Cap at 100px
      } else if (totalCells <= 36) {
        // Medium grids: balanced size (minimum 45px)
        optimalCellSize = Math.max(optimalCellSize, 45);
        optimalCellSize = Math.min(optimalCellSize, 70); // Cap at 70px
      } else {
        // Large grids: make them smaller to fit (minimum 30px)
        optimalCellSize = Math.max(optimalCellSize, 30);
        optimalCellSize = Math.min(optimalCellSize, 50); // Cap at 50px
      }
      
      setCellSize(optimalCellSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    
    return () => {
      window.removeEventListener('resize', updateCellSize);
    };
  }, [cols, rows]);

  // Initialize the game immediately
  useEffect(() => {
    if (!isInitialized) {
      const totalCells = gridDimensions[0] * gridDimensions[1];
      const generatedStructure = generateStructure(
        level.themeId, 
        level.difficultyId, 
        totalCells
      );
      
      // Count correct cells
      let correctCount = 0;
      for (const row of generatedStructure) {
        for (const cell of row) {
          if (cell.correct) correctCount++;
        }
      }
      
      setTotalCorrectCells(correctCount);
      setStructure(generatedStructure);
      setIsInitialized(true);
      
      // Start with memorization phase
      setGamePhase("memorize");
      
      // After a delay based on difficulty, switch to build phase
      const memorizeTime = level.difficultyId === "easy" ? 5000 : 
                          level.difficultyId === "medium" ? 4000 : 3000;
      
      const timerId = setTimeout(() => {
        // Clear filled status but keep correct marking
        setStructure(prevStructure => {
          return prevStructure.map(row => 
            row.map(cell => ({
              ...cell,
              filled: false,
              selected: false
            }))
          );
        });
        
        setGamePhase("build");
      }, memorizeTime);
      
      // Cleanup timer
      return () => clearTimeout(timerId);
    }
  }, [isInitialized, level.themeId, level.difficultyId, gridDimensions]);

  // Timer effect
  useEffect(() => {
    let timer: number | undefined;
    
    if (gamePhase === "build" && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gamePhase, timeLeft, onTimeUp]);

  // Check for game completion
  useEffect(() => {
    if (gamePhase === "build" && correctCells === totalCorrectCells && totalCorrectCells > 0) {
      // All correct cells have been selected
      const moveBonus = Math.max(0, level.moves - moves) * 5;
      const timeBonus = timeLeft * 2;
      const baseScore = level.points / 2;
      const totalScore = Math.min(level.points, baseScore + moveBonus + timeBonus);
      
      onComplete();
    }
  }, [correctCells, totalCorrectCells, gamePhase, level.points, level.moves, moves, timeLeft, onComplete]);

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (gamePhase !== "build" || moves >= level.moves) return;
    
    setStructure(prevStructure => {
      const newStructure = [...prevStructure];
      const cell = newStructure[rowIndex][colIndex];
      
      // Toggle cell selection
      cell.selected = !cell.selected;
      
      // Update correct cells count
      if (cell.selected && cell.correct) {
        setCorrectCells(prev => prev + 1);
      } else if (!cell.selected && cell.correct) {
        setCorrectCells(prev => prev - 1);
      }
      
      return newStructure;
    });
    
    setMoves(prev => prev + 1);
  };

  const handleResetGame = () => {
    // Reset game state
    setGamePhase("memorize");
    setMoves(0);
    setCorrectCells(0);
    setTimeLeft(level.timeLimit);
    setIsInitialized(false);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get theme title
  const getThemeTitle = () => {
    switch (level.themeId) {
      case "blocks": return "Блокове";
      case "structures": return "Структури";
      case "buildings": return "Сгради";
      default: return "Модели";
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-6 gap-4">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {gamePhase === "memorize" ? (
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-semibold">
              Запомнете модела...
            </div>
          ) : (
            <>
              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 text-sm font-semibold text-gray-800">
                Време: {formatTime(timeLeft)}
              </div>
              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 text-sm font-semibold text-gray-800">
                Ходове: {moves}/{level.moves}
              </div>
              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 text-sm font-semibold text-gray-800">
                Прогрес: {correctCells}/{totalCorrectCells}
              </div>
            </>
          )}
        </div>
        {gamePhase === "build" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetGame}
            className="bg-white/60 hover:bg-white/80 border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Започни отначало
          </Button>
        )}
      </div>

      <div 
        className="grid mx-auto bg-white/40 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/30" 
        style={{ 
          gridTemplateColumns: `repeat(${gridDimensions[0]}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridDimensions[1]}, ${cellSize}px)`,
          gap: '4px',
          width: 'fit-content'
        }}
      >
        {structure.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`rounded-lg transition-all duration-200 ${
                gamePhase === "memorize"
                  ? cell.filled
                    ? "bg-purple-500 shadow-md"
                    : "bg-gray-100"
                  : cell.selected
                    ? "bg-purple-500 shadow-md transform scale-95"
                    : "bg-gray-100 hover:bg-gray-200 hover:shadow-sm"
              }`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`
              }}
              disabled={gamePhase === "memorize" || moves >= level.moves}
            />
          ))
        ))}
      </div>

      {gamePhase === "build" && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Пресъздайте модела, който видяхте. Кликнете върху клетките, за да ги маркирате.
          </p>
        </div>
      )}
    </div>
  );
};
