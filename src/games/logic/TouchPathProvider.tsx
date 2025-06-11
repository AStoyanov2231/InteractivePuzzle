import React, { useState, createContext, useContext, ReactNode, useCallback, useEffect } from 'react';

interface PathPoint {
  row: number;
  col: number;
}

interface TouchPathContextType {
  isDrawingPath: boolean;
  currentPath: PathPoint[];
  pathStartPoint: PathPoint | null;
  startPathDrawing: (startPoint: PathPoint, color: string) => void;
  addPointToPath: (point: PathPoint) => void;
  finishPathDrawing: (endPoint: PathPoint) => void;
  cancelPathDrawing: () => void;
  currentPathColor: string;
}

const TouchPathContext = createContext<TouchPathContextType | null>(null);

interface TouchPathProviderProps {
  children: ReactNode;
  onPathComplete?: (path: PathPoint[], color: string) => void;
  onPathUpdate?: (path: PathPoint[]) => void;
}

export function TouchPathProvider({ children, onPathComplete, onPathUpdate }: TouchPathProviderProps) {
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [currentPath, setCurrentPath] = useState<PathPoint[]>([]);
  const [pathStartPoint, setPathStartPoint] = useState<PathPoint | null>(null);
  const [currentPathColor, setCurrentPathColor] = useState<string>('');

  const startPathDrawing = useCallback((startPoint: PathPoint, color: string) => {
    setIsDrawingPath(true);
    setPathStartPoint(startPoint);
    setCurrentPath([startPoint]);
    setCurrentPathColor(color);
    
    if (onPathUpdate) {
      onPathUpdate([startPoint]);
    }
  }, [onPathUpdate]);

  const addPointToPath = useCallback((point: PathPoint) => {
    if (!isDrawingPath) return;

    setCurrentPath(prevPath => {
      // Check if this point is already the last point (avoid duplicates)
      const lastPoint = prevPath[prevPath.length - 1];
      if (lastPoint && lastPoint.row === point.row && lastPoint.col === point.col) {
        return prevPath;
      }

      // Check if this is the second-to-last point (backtracking)
      if (prevPath.length > 1) {
        const secondToLastPoint = prevPath[prevPath.length - 2];
        if (secondToLastPoint.row === point.row && secondToLastPoint.col === point.col) {
          // Remove the last point (backtrack)
          const newPath = prevPath.slice(0, -1);
          if (onPathUpdate) {
            onPathUpdate(newPath);
          }
          return newPath;
        }
      }

      // Add new point to path
      const newPath = [...prevPath, point];
      if (onPathUpdate) {
        onPathUpdate(newPath);
      }
      return newPath;
    });
  }, [isDrawingPath, onPathUpdate]);

  const finishPathDrawing = useCallback((endPoint: PathPoint) => {
    if (!isDrawingPath || currentPath.length === 0) return;

    // Ensure the end point is included in the path
    let finalPath = currentPath;
    const lastPoint = currentPath[currentPath.length - 1];
    
    if (!lastPoint || lastPoint.row !== endPoint.row || lastPoint.col !== endPoint.col) {
      finalPath = [...currentPath, endPoint];
    }

    if (onPathComplete && finalPath.length > 1) {
      onPathComplete(finalPath, currentPathColor);
    }

    // Reset state
    setIsDrawingPath(false);
    setCurrentPath([]);
    setPathStartPoint(null);
    setCurrentPathColor('');
  }, [isDrawingPath, currentPath, currentPathColor, onPathComplete]);

  const cancelPathDrawing = useCallback(() => {
    setIsDrawingPath(false);
    setCurrentPath([]);
    setPathStartPoint(null);
    setCurrentPathColor('');
  }, []);

  // Global touch event handlers to properly handle touch interactions across the grid
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDrawingPath) return;
      
      e.preventDefault();
      
      const touch = e.touches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const gridCell = elementBelow?.closest('[data-grid-cell]');
      
      if (gridCell) {
        const cellRow = parseInt(gridCell.getAttribute('data-row') || '0');
        const cellCol = parseInt(gridCell.getAttribute('data-col') || '0');
        
        // Check if this is an adjacent cell to continue the path
        const lastPoint = currentPath[currentPath.length - 1];
        const isAdjacent = lastPoint && 
          Math.abs(lastPoint.row - cellRow) + Math.abs(lastPoint.col - cellCol) === 1;
        
        if (isAdjacent) {
          addPointToPath({ row: cellRow, col: cellCol });
        }
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (!isDrawingPath) return;
      
      e.preventDefault();
      
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const gridCell = elementBelow?.closest('[data-grid-cell]');
      
      if (gridCell) {
        const endRow = parseInt(gridCell.getAttribute('data-row') || '0');
        const endCol = parseInt(gridCell.getAttribute('data-col') || '0');
        
        finishPathDrawing({ row: endRow, col: endCol });
      } else {
        cancelPathDrawing();
      }
    };

    if (isDrawingPath) {
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDrawingPath, currentPath, addPointToPath, finishPathDrawing, cancelPathDrawing]);

  const value: TouchPathContextType = {
    isDrawingPath,
    currentPath,
    pathStartPoint,
    startPathDrawing,
    addPointToPath,
    finishPathDrawing,
    cancelPathDrawing,
    currentPathColor,
  };

  return (
    <TouchPathContext.Provider value={value}>
      {children}
    </TouchPathContext.Provider>
  );
}

export function useTouchPath() {
  const context = useContext(TouchPathContext);
  if (!context) {
    throw new Error('useTouchPath must be used within a TouchPathProvider');
  }
  return context;
} 