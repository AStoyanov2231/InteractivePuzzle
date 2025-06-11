import { PuzzleCategory } from "@/types";
import { Brain, Puzzle, Calculator, BarChart3, FileText, HelpCircle, Users } from "lucide-react";

interface CategoryHeaderProps {
  category: PuzzleCategory;
  onClose: () => void;
}

export const CategoryHeader = ({ category, onClose }: CategoryHeaderProps) => {
  return (
    <div className="flex items-center justify-center p-8 bg-white/40 backdrop-blur-sm border-b border-white/30 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm" 
             style={{ backgroundColor: `${category.backgroundColor}CC` }}>
          {category.id === "memory" && <Brain className="w-10 h-10 text-gray-800" />}
          {category.id === "logic" && <Puzzle className="w-10 h-10 text-gray-800" />}
          {category.id === "math" && <Calculator className="w-10 h-10 text-gray-800" />}
          {category.id === "models" && <BarChart3 className="w-10 h-10 text-gray-800" />}
          {category.id === "words" && <FileText className="w-10 h-10 text-gray-800" />}
          {category.id === "quiz" && <HelpCircle className="w-10 h-10 text-gray-800" />}
          {category.id === "competitive" && <Users className="w-10 h-10 text-gray-800" />}
          {category.id === "speed" && <Calculator className="w-10 h-10 text-gray-800" />}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">{category.name}</h2>
          <p className="text-gray-600 text-sm">Изберете настройки и започнете играта</p>
        </div>
      </div>
    </div>
  );
};
