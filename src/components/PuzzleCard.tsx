import React, { useState, useCallback } from "react";
import { PuzzleCategory } from "@/types";

interface PuzzleCardProps {
  category: PuzzleCategory;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const PuzzleCard = React.memo(({ category, onClick, className, disabled = false }: PuzzleCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    // Try fallback to external image
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('github.io')) {
      img.src = `https://astoyanov2231.github.io/InteractivePuzzle-Assets/images/categories/${category.icon}`;
    }
  }, [category.icon]);

  // Use local images first, fallback to external automatically on error
  const imageUrl = `/assets/images/categories/${category.icon}`;

  return (
    <div
      className={`puzzle-card ${className || ''} 
                  shadow-lg rounded-2xl h-96 w-30 overflow-hidden
                  touch-manipulation transition-all duration-200 ease-in-out
                  hover:shadow-xl hover:transform hover:-translate-y-1
                  ${disabled ? 'cursor-not-allowed' : 'active:opacity-90 active:scale-98'}`}
      onClick={disabled ? undefined : onClick}
      style={{ 
        backgroundColor: category.backgroundColor,
      }}
    >
      {/* Simple loading placeholder */}
      {!imageLoaded && !imageError && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="animate-pulse bg-gray-300 rounded w-16 h-16"></div>
        </div>
      )}
      
      <img 
        src={imageUrl}
        alt={category.name} 
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="eager"
        style={{
          position: imageLoaded ? 'static' : 'absolute',
          top: 0,
          left: 0
        }}
      />
    </div>
  );
});
