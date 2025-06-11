import React from "react";

interface MemoryCardProps {
  item: string;
  index: number;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: (index: number) => void;
  cardSize: number;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  item,
  index,
  isFlipped,
  isMatched,
  onClick,
  cardSize
}) => {
  // Calculate font size based on card size
  const fontSize = Math.max(16, Math.floor(cardSize * 0.4));

  const renderCardContent = () => {
    if (!(isFlipped || isMatched)) {
      return "?";
    }
    
    return item;
  };

  return (
    <button
      onClick={() => onClick(index)}
      className={`
        flex items-center justify-center 
        rounded-lg 
        transition-all duration-300 
        transform-gpu
        overflow-hidden
        ${isFlipped || isMatched
          ? "bg-white shadow-lg rotate-0 scale-100"
          : "bg-primary text-transparent shadow-md rotate-y-180 scale-95 hover:scale-100 hover:shadow-lg"
        }
      `}
      disabled={isMatched}
      style={{
        width: `${cardSize}px`,
        height: `${cardSize}px`,
        fontSize: `${fontSize}px`,
        perspective: "1000px",
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden"
      }}
    >
      {renderCardContent()}
    </button>
  );
};
