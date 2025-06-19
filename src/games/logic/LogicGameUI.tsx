import React, { forwardRef } from "react";
import { Timer, Link2, RotateCcw, Trophy, CheckCircle, ArrowRight } from "lucide-react";

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

interface Switch {
  row: number;
  col: number;
  outputColor: string;
}

interface GridCellProps {
  row: number;
  col: number;
  square?: GridSquare;
  switch?: Switch;
  isDrawing: boolean;
  onSquareMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: (row: number, col: number) => void;
  isPreviewPath: boolean;
  isOccupiedByOtherColor: boolean;
  isObstacle: boolean;
  cellSize: number;
}

interface IncrementalLineProps {
  pathPoints: PathPoint[];
  color: string;
  cellSize: number;
  switches?: Switch[];
  opacity?: number;
}

interface LogicGameUIProps {
  level: { id: number };
  timeLeft: number;
  drawnPaths: DrawnPath[];
  requiredConnections: number;
  gridSize: number;
  gridCells: React.ReactNode[];
  cellSize: number;
  isDrawing: boolean;
  currentPath: PathPoint[];
  drawingFrom: { row: number; col: number; color: string } | null;
  switches: Switch[];
  onClearPaths: () => void;
  onMouseLeave: () => void;
  isPathBroken: boolean;
  isCompleted: boolean;
  completionProgress: number;
  onNextLevel: () => void;
}

const colorToImage: { [key: string]: string } = {
  "#10B981": "switch-green.png",
  "#EF4444": "switch-red.png",
  "#3B82F6": "switch-blue.png",
  "#F59E0B": "switch-yellow.png",
  "#F97316": "switch-orange.png",
  "#EC4899": "switch-pink.png"
};

function getSwitchImageSrc(outputColor: string) {
  return `https://astoyanov2231.github.io/InteractivePuzzle-Assets/assets/images/categories/${colorToImage[outputColor] || "switch-default.png"}`;
}

const GridCell: React.FC<GridCellProps> = ({ 
  row, 
  col, 
  square, 
  switch: switchObj,
  isDrawing, 
  onSquareMouseDown, 
  onMouseEnter,
  onMouseUp,
  isPreviewPath,
  isOccupiedByOtherColor,
  isObstacle,
  cellSize
}) => {
  const baseClasses = "relative border-2 rounded-lg transition-all duration-200 ease-in-out m-1";
  
  let cellClasses = baseClasses;
  
  if (isObstacle) {
    cellClasses += " bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-inner";
  } else if (square) {
    cellClasses += ` border-gray-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer`;
    cellClasses += ` bg-gradient-to-br from-white to-gray-50`;
  } else if (switchObj) {
    cellClasses += ` border-amber-600 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer`;
    cellClasses += ` bg-gradient-to-br from-amber-50 to-amber-100`;
  } else {
    cellClasses += isPreviewPath 
      ? " bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-md"
      : isOccupiedByOtherColor
      ? " bg-gradient-to-br from-red-50 to-red-100 border-red-300"
      : " bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm";
  }

  return (
    <div
      className={cellClasses}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`
      }}
      onMouseDown={() => onSquareMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp(row, col)}
    >
      {square && (
        <div 
          className="absolute inset-2 rounded-md shadow-inner border-2 border-white/30"
          style={{ backgroundColor: square.color }}
        />
      )}
      {switchObj && (
        <img 
          src={getSwitchImageSrc(switchObj.outputColor)} 
          alt="Switch" 
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
        />
      )}
      {isObstacle && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-slate-400 rounded-full opacity-60" />
        </div>
      )}
    </div>
  );
};

const IncrementalLine: React.FC<IncrementalLineProps> = ({ pathPoints, color, cellSize, switches = [], opacity = 1 }) => {
  if (pathPoints.length < 2) return null;

  const getSwitchAtPoint = (point: PathPoint) => {
    return switches.find(sw => sw.row === point.row && sw.col === point.col);
  };

  const createPathSegments = () => {
    const segments: { points: PathPoint[]; color: string }[] = [];
    let currentColor = color;
    let currentSegment: PathPoint[] = [pathPoints[0]];

    for (let i = 1; i < pathPoints.length; i++) {
      const currentPoint = pathPoints[i];
      const switchAtPoint = getSwitchAtPoint(currentPoint);

      if (switchAtPoint) {
        currentSegment.push(currentPoint);
        
        segments.push({ points: [...currentSegment], color: currentColor });
        
        currentColor = switchAtPoint.outputColor;
        currentSegment = [currentPoint];
      } else {
        currentSegment.push(currentPoint);
      }
    }

    if (currentSegment.length > 1) {
      segments.push({ points: currentSegment, color: currentColor });
    }

    return segments;
  };

  const segments = createPathSegments();

  const createPathString = (points: PathPoint[]) => {
    return points.reduce((acc, point, index) => {
      const cellWithMargin = cellSize + 8;
      const x = point.col * cellWithMargin + cellSize / 2 + 24;
      const y = point.row * cellWithMargin + cellSize / 2 + 24;
      
      if (index === 0) {
        return `M ${x} ${y}`;
      } else {
        return `${acc} L ${x} ${y}`;
      }
    }, '');
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    >
      {segments.map((segment, index) => (
        <path
          key={index}
          d={createPathString(segment.points)}
          stroke={segment.color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={opacity}
          className="drop-shadow-sm"
        />
      ))}
    </svg>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const LogicGameUI = forwardRef<HTMLDivElement, LogicGameUIProps>(({
  level,
  timeLeft,
  drawnPaths,
  requiredConnections,
  gridSize,
  gridCells,
  cellSize,
  isDrawing,
  currentPath,
  drawingFrom,
  switches,
  onClearPaths,
  onMouseLeave,
  isPathBroken,
  isCompleted,
  completionProgress,
  onNextLevel
}, gridRef) => {
  const progressPercentage = (drawnPaths.length / requiredConnections) * 100;
  const isLowTime = timeLeft <= 30;
  const canProceed = completionProgress >= 100;
  
  return (
    <div className="flex flex-col lg:flex-row w-full h-full p-2 sm:p-4 gap-4 lg:gap-6">
      <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 lg:min-w-[200px] lg:w-[200px] overflow-x-auto lg:overflow-x-visible">
        <div className="flex flex-row lg:flex-col gap-3 min-w-max lg:min-w-full">
          <div className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl shadow-sm border transition-all duration-300 min-w-[120px] lg:min-w-full ${
            isLowTime 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <Timer className={`w-4 lg:w-5 h-4 lg:h-5 ${isLowTime ? 'animate-pulse' : ''}`} />
            <div className="flex flex-col">
              <span className="text-xs font-medium opacity-75">Време</span>
              <span className="font-bold text-sm lg:text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm min-w-[120px] lg:min-w-full">
            <Link2 className="w-4 lg:w-5 h-4 lg:h-5" />
            <div className="flex flex-col">
              <span className="text-xs font-medium opacity-75">Прогрес</span>
              <span className="font-bold text-sm lg:text-lg">{drawnPaths.length}/{requiredConnections}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl shadow-sm min-w-[100px] lg:min-w-full">
            <Trophy className="w-4 lg:w-5 h-4 lg:h-5" />
            <div className="flex flex-col">
              <span className="text-xs font-medium opacity-75">Ниво</span>
              <span className="font-bold text-sm lg:text-lg">{level.id}</span>
            </div>
          </div>

          {isDrawing && !isCompleted && (
            <div className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 rounded-xl shadow-sm border transition-all duration-300 min-w-[140px] lg:min-w-full ${
              isPathBroken 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isPathBroken ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <div className="flex flex-col">
                <span className="font-bold text-xs lg:text-sm">
                  {isPathBroken ? 'Неправилен път' : 'Рисуване...'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {!isCompleted && (
          <button
            onClick={onClearPaths}
            className="flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl 
                     hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[140px] lg:w-full"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium text-sm lg:text-base">Изчисти</span>
          </button>
        )}

        {isCompleted && (
          <div className="flex flex-col gap-3 lg:gap-4 min-w-[200px] lg:min-w-full">
            <div className="flex items-center gap-2 px-3 lg:px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex flex-col">
                <span className="font-bold text-sm lg:text-base">Ниво завършено!</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-100 ease-out rounded-full relative"
                style={{ width: `${completionProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>

            <button
              onClick={onNextLevel}
              disabled={!canProceed}
              className={`flex items-center justify-center gap-2 px-3 lg:px-4 py-3 rounded-xl font-medium text-sm lg:text-base transition-all duration-200 shadow-lg min-w-[140px] lg:w-full ${
                canProceed
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:scale-95 hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>Следващо ниво</span>
            </button>
          </div>
        )}
      </div>

      <div className="lg:hidden w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative bg-white rounded-2xl shadow-2xl p-4 lg:p-6" ref={gridRef} onMouseLeave={onMouseLeave}>
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl" />
          
          <div className="relative">
            <div 
              className="grid p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner border border-gray-200 relative"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                padding: '16px'
              }}
            >
              {gridCells}
            </div>
            
            {drawnPaths.map(path => (
              <IncrementalLine 
                key={path.id}
                pathPoints={path.points}
                color={path.color}
                cellSize={cellSize}
                switches={switches}
              />
            ))}
            
            {isDrawing && currentPath.length > 1 && drawingFrom && (
              <IncrementalLine 
                pathPoints={currentPath}
                color={isPathBroken ? '#EF4444' : drawingFrom.color}
                cellSize={cellSize}
                switches={switches}
                opacity={isPathBroken ? 1 : 0.7}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

LogicGameUI.displayName = "LogicGameUI";

export { GridCell, IncrementalLine }; 