import React, { ReactNode, useEffect, useState } from 'react';
import { useTouchDrag } from './TouchDragProvider';

interface TouchDropTargetProps {
  children: ReactNode;
  onDrop?: (draggedItem: any, targetData: any) => void;
  targetData?: any;
  className?: string;
  style?: React.CSSProperties;
  activeClassName?: string;
}

export function TouchDropTarget({ 
  children, 
  onDrop, 
  targetData,
  className = '',
  style,
  activeClassName = ''
}: TouchDropTargetProps) {
  const { isDragging, draggedItem, dragPosition, endDrag } = useTouchDrag();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isDragging || !dragPosition) {
      setIsHovered(false);
      return;
    }

    // Check if the drag position is over this element
    const checkIfHovered = () => {
      const elementBelow = document.elementFromPoint(dragPosition.x, dragPosition.y);
      const dropTarget = elementBelow?.closest('[data-drop-target]');
      
      if (dropTarget && dropTarget.getAttribute('data-drop-target') === targetData?.id) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    checkIfHovered();
  }, [isDragging, dragPosition, targetData]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !draggedItem || !isHovered) return;

    e.preventDefault();
    e.stopPropagation();

    if (onDrop) {
      onDrop(draggedItem, targetData);
    }

    endDrag();
  };

  return (
    <div
      className={`${className} ${isHovered && isDragging ? activeClassName : ''}`}
      style={style}
      data-drop-target={targetData?.id}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
} 