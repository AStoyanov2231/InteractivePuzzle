import React, { useMemo } from "react";

interface MemoryCardProps {
  item: string;
  index: number;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: (index: number) => void;
  cardSize: number;
}

export const MemoryCard = React.memo<MemoryCardProps>(({
  item,
  index,
  isFlipped,
  isMatched,
  onClick,
  cardSize
}) => {
  // Memoize font size calculation
  const fontSize = useMemo(() => {
    return Math.max(16, Math.floor(cardSize * 0.4));
  }, [cardSize]);

  // Memoize card style to avoid recalculation
  const cardStyle = useMemo(() => ({
    width: `${cardSize}px`,
    height: `${cardSize}px`,
    fontSize: `${fontSize}px`,
    perspective: "1000px",
    transformStyle: "preserve-3d" as const,
    backfaceVisibility: "hidden" as const
  }), [cardSize, fontSize]);

  // Memoize CSS classes
  const cardClasses = useMemo(() => {
    return `
      flex items-center justify-center 
      rounded-lg 
      transition-all duration-300 
      transform-gpu
      overflow-hidden
      ${isFlipped || isMatched
        ? "bg-white shadow-lg rotate-0 scale-100"
        : "bg-primary text-transparent shadow-md rotate-y-180 scale-95 hover:scale-100 hover:shadow-lg"
      }
    `;
  }, [isFlipped, isMatched]);

  const handleClick = useMemo(() => {
    return () => onClick(index);
  }, [onClick, index]);

  const renderCardContent = () => {
    if (!(isFlipped || isMatched)) {
      return "?";
    }
    
    return item;
  };

  return (
    <button
      onClick={handleClick}
      className={cardClasses}
      disabled={isMatched}
      style={cardStyle}
    >
      {renderCardContent()}
    </button>
  );
});

MemoryCard.displayName = 'MemoryCard';
