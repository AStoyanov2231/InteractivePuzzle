import React from "react";
import { useTouchPath } from "./TouchPathProvider";

interface GridSquare {
  id: number;
  color: string;
  row: number;
  col: number;
}

interface Switch {
  row: number;
  col: number;
  outputColor: string;
}

interface TouchGridCellProps {
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
  getSwitchImageSrc: (outputColor: string) => string;
}

export const TouchGridCell: React.FC<TouchGridCellProps> = ({ 
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
  cellSize,
  getSwitchImageSrc
}) => {
  const { 
    isDrawingPath, 
    startPathDrawing, 
    addPointToPath, 
    finishPathDrawing, 
    cancelPathDrawing,
    currentPath,
    pathStartPoint
  } = useTouchPath();

  const isInCurrentPath = currentPath.some(point => point.row === row && point.col === col);
  const isPathStart = pathStartPoint && pathStartPoint.row === row && pathStartPoint.col === col;

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
    cellClasses += isPreviewPath || isInCurrentPath
      ? " bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 shadow-md"
      : isOccupiedByOtherColor
      ? " bg-gradient-to-br from-red-50 to-red-100 border-red-300"
      : " bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm";
  }

  // Add ring effect for current path
  if (isInCurrentPath) {
    cellClasses += " ring-2 ring-blue-400 ring-opacity-50";
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isObstacle) return;
    
    e.preventDefault();
    
    if (square && !isDrawingPath) {
      // Start drawing from a colored square
      startPathDrawing({ row, col }, square.color);
      onSquareMouseDown(row, col);
    }
  };

  return (
    <div
      className={cellClasses}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`
      }}
      data-grid-cell
      data-row={row}
      data-col={col}
      onMouseDown={() => onSquareMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp(row, col)}
      onTouchStart={handleTouchStart}
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