import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameLevel } from "@/types";
import { LogicGameUI, GridCell } from "./LogicGameUI";

interface GridSquare {
  id: number;
  color: string;
  row: number;
  col: number;
}

interface PathPoint {
  row: number;
  col: number;
}

interface DrawnPath {
  id: string;
  points: PathPoint[];
  color: string;
}

interface Obstacle {
  row: number;
  col: number;
}

interface Switch {
  row: number;
  col: number;
  outputColor: string;
}

interface LevelConfig {
  gridSize: number;
  squares: GridSquare[];
  obstacles: Obstacle[];
  switches: Switch[];
  timeLimit: number;
  requiredConnections: number;
}

interface LogicGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
}
const findPath = (
  start: PathPoint,
  end: PathPoint,
  gridSize: number,
  obstacles: Obstacle[],
  blockedCells: Set<string>
): PathPoint[] | null => {
  const queue: { point: PathPoint; path: PathPoint[] }[] = [{ point: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.row},${start.col}`);

  const isBlocked = (row: number, col: number): boolean => {
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return true;
    if (obstacles.some(obs => obs.row === row && obs.col === col)) return true;
    if (blockedCells.has(`${row},${col}`)) return true;
    return false;
  };

  while (queue.length > 0) {
    const { point, path } = queue.shift()!;
    
    if (point.row === end.row && point.col === end.col) {
      return path;
    }

    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }   // right
    ];

    for (const dir of directions) {
      const newRow = point.row + dir.row;
      const newCol = point.col + dir.col;
      const newPoint = { row: newRow, col: newCol };
      const key = `${newRow},${newCol}`;

      if (!visited.has(key) && !isBlocked(newRow, newCol)) {
        visited.add(key);
        queue.push({
          point: newPoint,
          path: [...path, newPoint]
        });
      }
    }
  }

  return null;
};

const isLevelSolvable = (config: LevelConfig): boolean => {
  const colorGroups: { [color: string]: GridSquare[] } = {};
  
  config.squares.forEach(square => {
    if (!colorGroups[square.color]) {
      colorGroups[square.color] = [];
    }
    colorGroups[square.color].push(square);
  });

  for (const color in colorGroups) {
    if (colorGroups[color].length !== 2) {
      return false;
    }
  }

  const colorPairs = Object.values(colorGroups);
  const allPaths: PathPoint[][] = [];

  for (let i = 0; i < colorPairs.length; i++) {
    const [square1, square2] = colorPairs[i];
    const start = { row: square1.row, col: square1.col };
    const end = { row: square2.row, col: square2.col };
    
    const blockedCells = new Set<string>();
    allPaths.forEach(path => {
      path.forEach(point => {
        blockedCells.add(`${point.row},${point.col}`);
      });
    });

    const path = findPath(start, end, config.gridSize, config.obstacles, blockedCells);
    if (!path) {
      return false;
    }
    
    allPaths.push(path);
  }

  return true;
};

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    gridSize: 4,
    squares: [
      { id: 1, color: '#EF4444', row: 0, col: 0 },
      { id: 2, color: '#EF4444', row: 3, col: 3 }
    ],
    obstacles: [],
    switches: [],
    timeLimit: 180,
    requiredConnections: 1
  },
  {
    gridSize: 5,
    squares: [
      { id: 1, color: '#EF4444', row: 0, col: 0 },
      { id: 2, color: '#EF4444', row: 4, col: 4 },
      { id: 3, color: '#3B82F6', row: 0, col: 4 },
      { id: 4, color: '#3B82F6', row: 3, col: 1 }
    ],
    obstacles: [{ row: 2, col: 2 }], 
    switches: [],
    timeLimit: 180,
    requiredConnections: 2
  },
  {
    gridSize: 5,
    squares: [
      { id: 1, color: '#EF4444', row: 1, col: 1 },
      { id: 2, color: '#EF4444', row: 3, col: 3 },
      { id: 3, color: '#3B82F6', row: 1, col: 4 },
      { id: 4, color: '#3B82F6', row: 3, col: 1 }
    ],
    obstacles: [
      { row: 0, col: 2 },
      { row: 3, col: 2 },
      { row: 2, col: 4 }
    ],
    switches: [],
    timeLimit: 150,
    requiredConnections: 2
  },
  {
    gridSize: 6,
    squares: [
      { id: 1, color: '#EF4444', row: 0, col: 0 },
      { id: 2, color: '#EF4444', row: 5, col: 5 },
      { id: 3, color: '#3B82F6', row: 2, col: 3 },
      { id: 4, color: '#3B82F6', row: 5, col: 0 },
      { id: 5, color: '#10B981', row: 2, col: 1 },
      { id: 6, color: '#10B981', row: 3, col: 4 }
    ],
    obstacles: [
      { row: 0, col: 4 },
      { row: 4, col: 2 },
      { row: 2, col: 4 },
      { row: 3, col: 3 }
    ],
    switches: [],
    timeLimit: 120,
    requiredConnections: 3
  },
  {
    gridSize: 6,
    squares: [
      { id: 1, color: '#EF4444', row: 1, col: 0 },
      { id: 2, color: '#EF4444', row: 5, col: 4 },
      { id: 3, color: '#3B82F6', row: 0, col: 1 },
      { id: 4, color: '#3B82F6', row: 4, col: 5 },
      { id: 5, color: '#10B981', row: 2, col: 2 },
      { id: 6, color: '#10B981', row: 4, col: 1 },
      { id: 7, color: '#F59E0B', row: 1, col: 4 },
      { id: 8, color: '#F59E0B', row: 3, col: 3 }
    ],
    obstacles: [
      { row: 1, col: 2 },
      { row: 2, col: 1 },
      { row: 3, col: 4 },
      { row: 4, col: 3 },
      { row: 2, col: 4 }
    ],
    switches: [],
    timeLimit: 100,
    requiredConnections: 4
  },
  {
    gridSize: 7,
    squares: [
      { id: 1, color: '#EF4444', row: 1, col: 0 },
      { id: 2, color: '#EF4444', row: 0, col: 6 },
      { id: 3, color: '#3B82F6', row: 6, col: 6 },
      { id: 4, color: '#3B82F6', row: 6, col: 0 },
      { id: 5, color: '#10B981', row: 2, col: 2 },
      { id: 6, color: '#10B981', row: 4, col: 4 },
      { id: 7, color: '#F59E0B', row: 1, col: 3 },
      { id: 8, color: '#F59E0B', row: 5, col: 1 },
      { id: 9, color: '#8B5CF6', row: 3, col: 1 },
      { id: 10, color: '#8B5CF6', row: 3, col: 5 },
      { id: 12, color: '#EC4899', row: 5, col: 1 }
    ],
    obstacles: [
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 1, col: 4 },
      { row: 4, col: 3 },
      { row: 4, col: 5 }
    ],
    switches: [],
    timeLimit: 90,
    requiredConnections: 5
  },
  {
    gridSize: 7,
    squares: [
      { id: 1, color: '#EF4444', row: 1, col: 2 },
      { id: 2, color: '#EF4444', row: 3, col: 3 },
      { id: 3, color: '#3B82F6', row: 6, col: 3 },
      { id: 4, color: '#3B82F6', row: 5, col: 6 },
      { id: 5, color: '#10B981', row: 0, col: 5 },
      { id: 6, color: '#10B981', row: 5, col: 2 },
      { id: 7, color: '#F59E0B', row: 2, col: 3 },
      { id: 8, color: '#F59E0B', row: 4, col: 3 },
      { id: 9, color: '#8B5CF6', row: 3, col: 0 },
      { id: 10, color: '#8B5CF6', row: 6, col: 0 },
      { id: 11, color: '#EC4899', row: 1, col: 5 },
      { id: 12, color: '#EC4899', row: 5, col: 1 }
    ],
    obstacles: [
      { row: 4, col: 2 }
    ],
    switches: [],
    timeLimit: 80,
    requiredConnections: 6
  },
  {
    gridSize: 8,
    squares: [
      { id: 1, color: '#EF4444', row: 0, col: 1 },
      { id: 2, color: '#EF4444', row: 1, col: 7 },
      { id: 3, color: '#3B82F6', row: 1, col: 0 },
      { id: 4, color: '#3B82F6', row: 6, col: 1 },
      { id: 5, color: '#10B981', row: 1, col: 6 },
      { id: 6, color: '#10B981', row: 6, col: 7 },
      { id: 7, color: '#F59E0B', row: 2, col: 2 },
      { id: 8, color: '#F59E0B', row: 5, col: 5 },
      { id: 9, color: '#8B5CF6', row: 6, col: 6 },
      { id: 10, color: '#8B5CF6', row: 6, col: 0 },
      { id: 11, color: '#EC4899', row: 3, col: 1 },
      { id: 12, color: '#EC4899', row: 4, col: 6 }
    ],
    obstacles: [
      { row: 3, col: 2 },
      { row: 3, col: 5 },
      { row: 5, col: 4 },
      { row: 6, col: 2 },
      { row: 3, col: 6 },
      { row: 4, col: 1 }
    ],
    switches: [],
    timeLimit: 70,
    requiredConnections: 6
  },
  {
    gridSize: 8,
    squares: [
      { id: 1, color: '#EF4444', row: 0, col: 0 },
      { id: 2, color: '#EF4444', row: 6, col: 3 },
      { id: 3, color: '#3B82F6', row: 0, col: 7 },
      { id: 4, color: '#3B82F6', row: 7, col: 0 },
      { id: 5, color: '#10B981', row: 1, col: 4 },
      { id: 6, color: '#10B981', row: 7, col: 7 },
      { id: 7, color: '#F59E0B', row: 3, col: 1 },
      { id: 8, color: '#F59E0B', row: 4, col: 6 },
      { id: 9, color: '#8B5CF6', row: 2, col: 4 },
      { id: 10, color: '#EC4899', row: 5, col: 1 },
      { id: 11, color: '#8B5CF6', row: 1, col: 2 },
      { id: 12, color: '#EC4899', row: 6, col: 6 },
      { id: 13, color: '#F97316', row: 2, col: 6 },
      { id: 14, color: '#F97316', row: 4, col: 3 },
    ],
    obstacles: [
    ],
    switches: [
      { row: 5, col: 5, outputColor: '#EC4899' },
      { row: 4, col: 1, outputColor: '#EC4899' }
    ],
    timeLimit: 60,
    requiredConnections: 7
  },
  {
    gridSize: 9,
    squares: [
      { id: 1, color: '#EF4444', row: 0, col: 1 },
      { id: 2, color: '#EF4444', row: 8, col: 7 },
      { id: 3, color: '#3B82F6', row: 1, col: 0 },
      { id: 4, color: '#3B82F6', row: 7, col: 8 },
      { id: 5, color: '#10B981', row: 0, col: 7 },
      { id: 6, color: '#10B981', row: 8, col: 1 },
      { id: 7, color: '#F59E0B', row: 2, col: 3 },
      { id: 8, color: '#F59E0B', row: 6, col: 5 },
      { id: 9, color: '#8B5CF6', row: 3, col: 2 },
      { id: 10, color: '#8B5CF6', row: 5, col: 6 },
      { id: 11, color: '#EC4899', row: 1, col: 8 },
      { id: 12, color: '#EC4899', row: 7, col: 0 },
      { id: 13, color: '#F97316', row: 4, col: 1 },
      { id: 14, color: '#F97316', row: 4, col: 7 },
      { id: 15, color: '#06B6D4', row: 2, col: 6 },
      { id: 16, color: '#06B6D4', row: 6, col: 2 },
      { id: 17, color: '#84CC16', row: 3, col: 5 },
      { id: 18, color: '#84CC16', row: 5, col: 3 }
    ],
    obstacles: [
      { row: 1, col: 4 },
      { row: 2, col: 1 },
      { row: 2, col: 7 },
      { row: 3, col: 8 },
      { row: 4, col: 4 },
      { row: 5, col: 0 },
      { row: 6, col: 1 },
      { row: 6, col: 7 },
      { row: 7, col: 4 },
      { row: 1, col: 2 },
      { row: 7, col: 6 },
      { row: 3, col: 3 },
      { row: 5, col: 5 },
      { row: 0, col: 4 },
      { row: 8, col: 4 }
    ],
    switches: [],
    timeLimit: 50,
    requiredConnections: 9
  }
];

export const LogicGame: React.FC<LogicGameProps> = ({ level, onComplete, onTimeUp }) => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Calculate the correct level index based on the pattern that levels 1-10 are for each theme/difficulty combo
  // Since logic game only has 10 unique level configs, we need to map the level.id to 0-9
  const levelIndex = ((level.id - 1) % 10);
  
  console.log('LogicGame Debug:', {
    levelId: level.id,
    levelTitle: level.title,
    themeId: level.themeId,
    difficultyId: level.difficultyId,
    calculatedIndex: levelIndex
  });
  
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(LEVEL_CONFIGS[levelIndex] || LEVEL_CONFIGS[0]);
  const [drawnPaths, setDrawnPaths] = useState<DrawnPath[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingFrom, setDrawingFrom] = useState<{ row: number; col: number; color: string } | null>(null);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [cellSize, setCellSize] = useState(64);
  const [isPathBroken, setIsPathBroken] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    const newLevelIndex = ((level.id - 1) % 10);
    const newLevelConfig = LEVEL_CONFIGS[newLevelIndex] || LEVEL_CONFIGS[0];
    setLevelConfig(newLevelConfig);
    setDrawnPaths([]);
    setIsDrawing(false);
    setDrawingFrom(null);
    setCurrentPath([]);
    setTimeElapsed(0);
    setIsPathBroken(false);
    setIsCompleted(false);
    setCompletionProgress(0);
    setCanProceed(false);
  }, [level.id]);

  useEffect(() => {
    if (drawnPaths.length === levelConfig.requiredConnections && !isCompleted) {
      setIsCompleted(true);
      
      const startTime = Date.now();
      const duration = 1; // 3 seconds
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setCompletionProgress(progress);
        
        if (progress < 100) {
          requestAnimationFrame(updateProgress);
        } else {
          setCanProceed(true);
        }
      };
      
      requestAnimationFrame(updateProgress);
      
      onComplete();
    }
  }, [drawnPaths.length, levelConfig.requiredConnections, onComplete, isCompleted]);

  // Start the stopwatch timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const headerHeight = 80;
        const padding = 100;
        const sidebarWidth = 200;
        const sidebarGap = 24;
        const availableHeight = viewportHeight - headerHeight - padding;
        const availableWidth = Math.min(viewportWidth - padding - sidebarWidth - sidebarGap, 1000);
        
        const maxCellSizeByWidth = Math.floor(availableWidth / (levelConfig.gridSize + 1));
        const maxCellSizeByHeight = Math.floor(availableHeight / (levelConfig.gridSize + 1));
        
        let optimalCellSize = Math.min(maxCellSizeByWidth, maxCellSizeByHeight);
        
        if (levelConfig.gridSize <= 4) {
          optimalCellSize = Math.max(optimalCellSize, 100);
          optimalCellSize = Math.min(optimalCellSize, 140);
        } else if (levelConfig.gridSize <= 6) {
          optimalCellSize = Math.max(optimalCellSize, 80);
          optimalCellSize = Math.min(optimalCellSize, 110);
        } else if (levelConfig.gridSize <= 8) {
          optimalCellSize = Math.max(optimalCellSize, 60);
          optimalCellSize = Math.min(optimalCellSize, 85);
        } else {
          optimalCellSize = Math.max(optimalCellSize, 45);
          optimalCellSize = Math.min(optimalCellSize, 70);
        }
        
        setCellSize(optimalCellSize);
      }
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    
    return () => {
      window.removeEventListener('resize', updateCellSize);
    };
  }, [levelConfig.gridSize]);

  const areAdjacent = (point1: PathPoint, point2: PathPoint) => {
    const rowDiff = Math.abs(point1.row - point2.row);
    const colDiff = Math.abs(point1.col - point2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const isCellOccupiedByDifferentColor = (row: number, col: number, currentColor: string) => {
    return drawnPaths.some(path => 
      path.color !== currentColor && 
      path.points.some(point => point.row === row && point.col === col)
    );
  };

  const isObstacle = (row: number, col: number) => {
    return levelConfig.obstacles.some(obs => obs.row === row && obs.col === col);
  };

  const getSwitch = (row: number, col: number) => {
    return levelConfig.switches.find(sw => sw.row === row && sw.col === col);
  };

  const isSwitch = (row: number, col: number) => {
    return levelConfig.switches.some(sw => sw.row === row && sw.col === col);
  };

  const getCurrentPathColor = (path: PathPoint[], startColor: string) => {
    let currentColor = startColor;
    
    for (const point of path) {
      const switchAtPoint = getSwitch(point.row, point.col);
      if (switchAtPoint) {
        currentColor = switchAtPoint.outputColor;
      }
    }
    
    return currentColor;
  };

  const getOccupiedCells = (currentColor?: string) => {
    const occupiedCells = new Set<string>();
    drawnPaths.forEach(path => {
      if (!currentColor || path.color !== currentColor) {
        path.points.forEach(point => {
          occupiedCells.add(`${point.row},${point.col}`);
        });
      }
    });
    return occupiedCells;
  };

  const handleSquareMouseDown = (row: number, col: number) => {
    const square = levelConfig.squares.find(s => s.row === row && s.col === col);
    
    if (square && !isObstacle(row, col)) {
      setIsDrawing(true);
      setDrawingFrom({ row, col, color: square.color });
      setCurrentPath([{ row, col }]);
      
      document.body.style.userSelect = 'none';
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing && drawingFrom && currentPath.length > 0 && !isObstacle(row, col)) {
      const lastPoint = currentPath[currentPath.length - 1];
      const newPoint = { row, col };
      
      if (currentPath.length > 1) {
        const secondToLastPoint = currentPath[currentPath.length - 2];
        if (newPoint.row === secondToLastPoint.row && newPoint.col === secondToLastPoint.col) {
          setCurrentPath(prev => prev.slice(0, -1));
          setIsPathBroken(false);
          return;
        }
      }

      if (!(lastPoint.row === newPoint.row && lastPoint.col === newPoint.col)) {
        if (areAdjacent(lastPoint, newPoint)) {
          const currentColor = getCurrentPathColor(currentPath, drawingFrom.color);
          
          if (isCellOccupiedByDifferentColor(row, col, currentColor)) {
            setIsPathBroken(true);
            return;
          }
          
          const squareAtCell = levelConfig.squares.find(s => s.row === row && s.col === col);
          if (squareAtCell && squareAtCell.color !== currentColor) {
            if (!isSwitch(row, col)) {
              setIsPathBroken(true);
              return;
            }
          }
          
          setCurrentPath(prev => [...prev, newPoint]);
          setIsPathBroken(false);
        } else {
          setIsPathBroken(true);
        }
      }
    }
  };

  const handleMouseUp = (row: number, col: number) => {
    if (isDrawing && drawingFrom && currentPath.length > 1 && !isObstacle(row, col)) {
      const lastPathPoint = currentPath[currentPath.length - 1];
      if (lastPathPoint.row !== row || lastPathPoint.col !== col) {
        setIsDrawing(false);
        setDrawingFrom(null);
        setCurrentPath([]);
        document.body.style.userSelect = '';
        return;
      }
      
      const targetSquare = levelConfig.squares.find(s => s.row === row && s.col === col);
      const currentColor = getCurrentPathColor(currentPath, drawingFrom.color);
      
      if (targetSquare && 
          targetSquare.color === currentColor && 
          !(targetSquare.row === drawingFrom.row && targetSquare.col === drawingFrom.col)) {
        
        let isValidPath = true;
        let pathColor = drawingFrom.color;
        
        for (let i = 0; i < currentPath.length - 1; i++) {
          const current = currentPath[i];
          const next = currentPath[i + 1];
          
          const switchAtCurrent = getSwitch(current.row, current.col);
          if (switchAtCurrent) {
            pathColor = switchAtCurrent.outputColor;
          }
          
          if (!areAdjacent(current, next)) {
            isValidPath = false;
            break;
          }
          
          if (isCellOccupiedByDifferentColor(next.row, next.col, pathColor)) {
            isValidPath = false;
            break;
          }
        }
        
        if (isValidPath) {
          const newPath: DrawnPath = {
            id: `path-${Date.now()}`,
            points: [...currentPath],
            color: drawingFrom.color
          };
          
          setDrawnPaths(prev => [...prev, newPath]);
        }
      }
    }
    
    setIsDrawing(false);
    setDrawingFrom(null);
    setCurrentPath([]);
    
    document.body.style.userSelect = '';
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setDrawingFrom(null);
      setCurrentPath([]);
      setIsPathBroken(false);
      document.body.style.userSelect = '';
    }
  };

  const clearPaths = () => {
    setDrawnPaths([]);
    setIsDrawing(false);
    setDrawingFrom(null);
    setCurrentPath([]);
    setIsPathBroken(false);
  };

  const occupiedCells = getOccupiedCells(drawingFrom?.color);

  const gridCells = [];
  for (let row = 0; row < levelConfig.gridSize; row++) {
    for (let col = 0; col < levelConfig.gridSize; col++) {
      const square = levelConfig.squares.find(s => s.row === row && s.col === col);
      const switchObj = getSwitch(row, col);
      const isInPreviewPath = currentPath.some(point => point.row === row && point.col === col);
      const isOccupiedByOtherColor = occupiedCells.has(`${row},${col}`) && 
                                   !isInPreviewPath && 
                                   !square && !switchObj;
      const cellIsObstacle = isObstacle(row, col);
      
      gridCells.push(
        <GridCell
          key={`${row}-${col}`}
          row={row}
          col={col}
          square={square}
          switch={switchObj}
          isDrawing={isDrawing}
          onSquareMouseDown={handleSquareMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleMouseUp}
          isPreviewPath={isInPreviewPath}
          isOccupiedByOtherColor={isOccupiedByOtherColor}
          isObstacle={cellIsObstacle}
          cellSize={cellSize}
        />
      );
    }
  }

  const handleNextLevel = () => {
    if (canProceed) {
      // Get the next level within the same theme and difficulty
      const currentLevelNumber = parseInt(level.title.replace('Ниво ', ''));
      const nextLevelNumber = currentLevelNumber + 1;
      
      if (nextLevelNumber <= 10) {
        // Calculate the next level ID based on the current pattern
        // Each theme/difficulty combination has 10 levels
        const baseId = Math.floor((level.id - 1) / 10) * 10;
        const nextLevelId = baseId + nextLevelNumber;
        
        navigate(`/game/${categoryId}/${nextLevelId}`);
      } else {
        navigate(`/?category=${categoryId}`);
      }
    }
  };

  return (
    <LogicGameUI
      ref={gridRef}
      level={level}
      timeLeft={timeElapsed}
      drawnPaths={drawnPaths}
      requiredConnections={levelConfig.requiredConnections}
      gridSize={levelConfig.gridSize}
      gridCells={gridCells}
      cellSize={cellSize}
      isDrawing={isDrawing}
      currentPath={currentPath}
      drawingFrom={drawingFrom}
      switches={levelConfig.switches}
      onClearPaths={clearPaths}
      onMouseLeave={handleMouseLeave}
      isPathBroken={isPathBroken}
      isCompleted={isCompleted}
      completionProgress={completionProgress}
      onNextLevel={handleNextLevel}
    />
  );
};
