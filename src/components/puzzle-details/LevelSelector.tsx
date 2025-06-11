import { Lock } from "lucide-react";
import { GameLevel } from "@/types";

interface LevelSelectorProps {
  levels: GameLevel[];
  selectedLevel: number | null;
  onSelectLevel: (levelId: number) => void;
}

export const LevelSelector = ({ levels, selectedLevel, onSelectLevel }: LevelSelectorProps) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg text-white font-bold bg-gradient-to-br from-purple-500 to-pink-500 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">3</span>
        <h4 className="text-2xl font-bold text-gray-800">Избери ниво</h4>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
        {levels.slice(0, 10).map((level) => {
          const displayNumber = level.id % 10 === 0 ? 10 : level.id % 10;
          
          return (
            <button
              key={level.id}
              onClick={() => !level.isLocked && onSelectLevel(level.id)}
              className={`
                flex items-center justify-center 
                w-16 h-16 sm:w-20 sm:h-20 rounded-2xl text-xl font-bold 
                transition-all duration-300 touch-manipulation border-2
                ${level.isLocked 
                  ? 'bg-gray-200/60 text-gray-400 cursor-not-allowed border-gray-300/50 backdrop-blur-sm' 
                  : 'bg-white/70 text-gray-800 border-white/50 hover:bg-white/90 hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm'}
              `}
              disabled={level.isLocked}
            >
              {level.isLocked ? (
                <Lock className="w-7 h-7 text-gray-400" />
              ) : (
                <span>
                  {displayNumber}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
