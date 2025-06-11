import React, { ReactNode } from 'react';
import { useTouchDrag } from './TouchDragProvider';

interface TouchDraggableProps {
  children: ReactNode;
  dragData: {
    id: string;
    data: any;
    displayName: string;
  };
  onDragStart?: (dragData: any) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function TouchDraggable({ 
  children, 
  dragData, 
  onDragStart, 
  className = '',
  style,
  disabled = false 
}: TouchDraggableProps) {
  const { startDrag, updateDragPosition, endDrag, isDragging, draggedItem } = useTouchDrag();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    startDrag(dragData, { x: touch.clientX, y: touch.clientY });
    
    if (onDragStart) {
      onDragStart(dragData);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging || draggedItem?.id !== dragData.id) return;
    
    const touch = e.touches[0];
    updateDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (disabled || !isDragging || draggedItem?.id !== dragData.id) return;
    
    endDrag();
  };

  const isCurrentlyDragged = isDragging && draggedItem?.id === dragData.id;

  return (
    <div
      className={`${className} ${isCurrentlyDragged ? 'opacity-50' : ''}`}
      style={style}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
} 