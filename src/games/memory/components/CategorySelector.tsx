import React from "react";
import { memoryCategories } from "../utils/memoryUtils";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
        Избери категория
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {memoryCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
              ${selectedCategory === category.id
                ? 'border-white bg-white/80 shadow-lg scale-105'
                : 'border-white/30 bg-white/40 hover:bg-white/60 hover:border-white/50'
              }
            `}
            style={{
              borderColor: selectedCategory === category.id ? category.color : undefined
            }}
          >
            <div 
              className="text-2xl mb-2 p-2 rounded-lg"
              style={{
                backgroundColor: selectedCategory === category.id ? `${category.color}20` : 'transparent'
              }}
            >
              {category.icon}
            </div>
            <span className="text-sm font-medium text-gray-800 text-center">
              {category.name}
            </span>
            <span className="text-xs text-gray-600 text-center mt-1">
              {category.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}; 