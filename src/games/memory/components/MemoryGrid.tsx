import React, { useState, useEffect } from "react";
import { MemoryCard } from "./MemoryCard";

interface MemoryGridProps {
  gridItems: string[];
  flippedIndices: number[];
  matchedPairs: number[];
  gridDimensions: number[]; // [columns, rows]
  onCardClick: (index: number) => void;
}

export const MemoryGrid: React.FC<MemoryGridProps> = ({
  gridItems,
  flippedIndices,
  matchedPairs,
  gridDimensions,
  onCardClick
}) => {
  // Get columns and rows from dimensions
  const [columns, rows] = gridDimensions;
  const [cardSize, setCardSize] = useState(120);

  // Calculate dynamic card size based on viewport and grid dimensions
  useEffect(() => {
    const updateCardSize = () => {
      // Get available viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calculate available space for the game (considering header, controls, padding)
      const headerHeight = 80; // Header height
      const controlsHeight = 120; // Controls height
      const padding = 80; // Total padding around the game
      const availableHeight = viewportHeight - headerHeight - controlsHeight - padding;
      const availableWidth = Math.min(viewportWidth - padding, 800); // Max width constraint
      
      // Calculate the optimal card size based on grid dimensions and available space
      const maxCardSizeByWidth = Math.floor((availableWidth - (columns - 1) * 12) / columns); // 12px gap between cards
      const maxCardSizeByHeight = Math.floor((availableHeight - (rows - 1) * 12) / rows);
      
      // Use the smaller dimension to ensure the grid fits
      let optimalCardSize = Math.min(maxCardSizeByWidth, maxCardSizeByHeight);
      
      // Dynamic scaling based on grid size
      const totalCells = columns * rows;
      if (totalCells <= 8) {
        // Small grids: make them bigger (minimum 120px for small grids)
        optimalCardSize = Math.max(optimalCardSize, 120);
        optimalCardSize = Math.min(optimalCardSize, 180); // Cap at 180px
      } else if (totalCells <= 16) {
        // Medium grids: balanced size (minimum 100px)
        optimalCardSize = Math.max(optimalCardSize, 100);
        optimalCardSize = Math.min(optimalCardSize, 140); // Cap at 140px
      } else {
        // Large grids: make them smaller to fit (minimum 80px)
        optimalCardSize = Math.max(optimalCardSize, 80);
        optimalCardSize = Math.min(optimalCardSize, 120); // Cap at 120px
      }
      
      setCardSize(optimalCardSize);
    };

    updateCardSize();
    window.addEventListener('resize', updateCardSize);
    
    return () => {
      window.removeEventListener('resize', updateCardSize);
    };
  }, [columns, rows]);
  
  // Calculate grid template based on dimensions
  const gridTemplateColumns = `repeat(${columns}, ${cardSize}px)`;

  return (
    <div 
      className="grid gap-3 mx-auto justify-center" 
      style={{ 
        gridTemplateColumns,
        width: 'fit-content'
      }}
    >
      {gridItems.map((item, index) => (
        <MemoryCard
          key={`memory-card-${index}-${item}`}
          item={item}
          index={index}
          isFlipped={flippedIndices.includes(index)}
          isMatched={matchedPairs.includes(index)}
          onClick={onCardClick}
          cardSize={cardSize}
        />
      ))}
    </div>
  );
};
