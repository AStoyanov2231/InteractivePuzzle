
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface QuizHudProps {
  timeLeft: number;
  currentQuestion: number;
  totalQuestions: number;
  formatTime: (seconds: number) => string;
  hasStarted?: boolean;
  onComplete?: () => void;
  isCompetitive?: boolean;
}

export const QuizHud: React.FC<QuizHudProps> = ({
  timeLeft,
  currentQuestion,
  totalQuestions,
  formatTime,
  hasStarted = false,
  onComplete,
  isCompetitive = false
}) => {
  return (
    <div className="flex justify-between w-full mb-4">
      <div className="flex gap-4">
        <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
          Време: {hasStarted ? formatTime(timeLeft) : formatTime(timeLeft)}
        </div>
        <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
          Въпрос: {currentQuestion + 1}/{totalQuestions}
        </div>
      </div>
      
      {onComplete && !isCompetitive && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onComplete} className="bg-green-100 hover:bg-green-200 border-green-300 text-green-700">
            <Check className="w-4 h-4 mr-2" />
            Завърши играта
          </Button>
        </div>
      )}
    </div>
  );
};
