import React from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Star } from "lucide-react";

interface MemoryGameControlsProps {
  timeLeft: number;
  moves: number;
  maxMoves: number;
  onReset: () => void;
  formatTime: (seconds: number) => string;
  currentPoints?: number;
  showPoints?: boolean;
}

export const MemoryGameControls: React.FC<MemoryGameControlsProps> = ({
  timeLeft,
  moves,
  maxMoves,
  onReset,
  formatTime,
  currentPoints,
  showPoints = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-6 gap-4">
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 text-base font-semibold text-gray-800">
          Време: {formatTime(timeLeft)}
        </div>
        <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 text-base font-semibold text-gray-800">
          Ходове: {moves}/{maxMoves}
        </div>
        {showPoints && (
          <div className="bg-gradient-to-r from-yellow-400/80 to-orange-400/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-yellow-300/50 text-base font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4" />
            Точки: {currentPoints || 0}
          </div>
        )}
      </div>
      <Button 
        variant="outline" 
        size="lg" 
        onClick={onReset}
        className="bg-white/60 hover:bg-white/80 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold backdrop-blur-sm"
      >
        <Shuffle className="w-5 h-5 mr-2" />
        Разбъркай
      </Button>
    </div>
  );
};
