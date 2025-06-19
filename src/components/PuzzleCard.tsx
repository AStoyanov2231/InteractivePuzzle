import { PuzzleCategory } from "@/types";

interface PuzzleCardProps {
  category: PuzzleCategory;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export const PuzzleCard = ({ category, onClick, className, disabled = false }: PuzzleCardProps) => {
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
      <img 
        src={imageUrl} 
        alt={category.name} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};
