
import React from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";

interface MemoryGameControlsProps {
  timeLeft: number;
  moves: number;
  maxMoves: number;
  onReset: () => void;
  formatTime: (seconds: number) => string;
  hasStarted?: boolean;
}

export const MemoryGameControls: React.FC<MemoryGameControlsProps> = ({
  timeLeft,
  moves,
  maxMoves,
  onReset,
  formatTime,
  hasStarted = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-6 gap-4">
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 text-base font-semibold text-gray-800">
          Време: {hasStarted ? formatTime(timeLeft) : formatTime(timeLeft) + " (чакам първи ход)"}
        </div>
        <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 text-base font-semibold text-gray-800">
          Ходове: {moves}/{maxMoves}
        </div>
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
