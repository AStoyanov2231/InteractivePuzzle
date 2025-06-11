import React, { useState, createContext, useContext, ReactNode } from 'react';

interface DragItem {
  id: string;
  data: any;
  displayName: string;
}

interface DragPosition {
  x: number;
  y: number;
}

interface TouchDragContextType {
  isDragging: boolean;
  draggedItem: DragItem | null;
  dragPosition: DragPosition | null;
  startDrag: (item: DragItem, position: DragPosition) => void;
  updateDragPosition: (position: DragPosition) => void;
  endDrag: () => void;
  onDrop?: (item: DragItem, target: any) => void;
}

const TouchDragContext = createContext<TouchDragContextType | null>(null);

interface TouchDragProviderProps {
  children: ReactNode;
  onDrop?: (item: DragItem, target: any) => void;
}

export function TouchDragProvider({ children, onDrop }: TouchDragProviderProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);

  const startDrag = (item: DragItem, position: DragPosition) => {
    setDraggedItem(item);
    setDragPosition(position);
  };

  const updateDragPosition = (position: DragPosition) => {
    setDragPosition(position);
  };

  const endDrag = () => {
    setDraggedItem(null);
    setDragPosition(null);
  };

  const value: TouchDragContextType = {
    isDragging: !!draggedItem,
    draggedItem,
    dragPosition,
    startDrag,
    updateDragPosition,
    endDrag,
    onDrop,
  };

  return (
    <TouchDragContext.Provider value={value}>
      {children}
      {/* Floating drag element */}
      {draggedItem && dragPosition && (
        <div 
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPosition.x - 60,
            top: dragPosition.y - 25,
            transform: 'rotate(-5deg)',
          }}
        >
          <div className="bg-white shadow-lg border-2 border-blue-400 rounded-lg p-2 opacity-90">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                📦
              </div>
              <span className="text-sm font-medium text-gray-800 max-w-[80px] truncate">
                {draggedItem.displayName}
              </span>
            </div>
          </div>
        </div>
      )}
    </TouchDragContext.Provider>
  );
}

export function useTouchDrag() {
  const context = useContext(TouchDragContext);
  if (!context) {
    throw new Error('useTouchDrag must be used within a TouchDragProvider');
  }
  return context;
} 