import { PuzzleCategory } from "@/types";

interface PuzzleCardProps {
  category: PuzzleCategory;
  onClick: () => void;
  className?: string;
}

export const PuzzleCard = ({ category, onClick, className }: PuzzleCardProps) => {
  const imageUrl = `/assets/images/categories/${category.icon}`;

  return (
    <div
      className={`puzzle-card ${className || ''} 
                  shadow-lg rounded-2x1 h-96 w-30 overflow-hidden
                  touch-manipulation active:opacity-90 active:scale-98 transition-all duration-200 ease-in-out
                  hover:shadow-xl hover:transform hover:-translate-y-1`}
      onClick={onClick}
      style={{ 
        backgroundColor: category.backgroundColor,
      }}
    >
      <img 
        src={imageUrl} 
        alt={category.name} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};
