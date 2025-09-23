import React from "react";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface QuizCategorySelectorProps {
  onCategorySelect: (categoryId: string) => void;
}

// Quiz categories matching the themes in puzzleData.ts
const quizCategories: Category[] = [
  { 
    id: "history", 
    name: "Спорт", 
    icon: "📜", 
    color: "#8B5CF6"
  },
  { 
    id: "science", 
    name: "Наука", 
    icon: "🔬", 
    color: "#EC4899"
  },
  { 
    id: "geography", 
    name: "География", 
    icon: "🌍", 
    color: "#3B82F6"
  }
];

export const QuizCategorySelector: React.FC<QuizCategorySelectorProps> = ({ onCategorySelect }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Изберете категория</h2>
        <p className="text-lg text-gray-600 mb-8">Изберете тема за въпросите във викторината</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="flex flex-col items-center p-6 rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-4xl mb-4 p-3 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                {category.icon}
              </div>
              <span className="text-xl font-semibold text-gray-800">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { quizCategories };
