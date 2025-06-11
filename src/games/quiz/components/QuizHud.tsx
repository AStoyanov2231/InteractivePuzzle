
import React from "react";

interface QuizHudProps {
  timeLeft: number;
  currentQuestion: number;
  totalQuestions: number;
  formatTime: (seconds: number) => string;
}

export const QuizHud: React.FC<QuizHudProps> = ({
  timeLeft,
  currentQuestion,
  totalQuestions,
  formatTime
}) => {
  return (
    <div className="flex justify-between w-full mb-4">
      <div className="flex gap-4">
        <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
          Време: {formatTime(timeLeft)}
        </div>
        <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
          Въпрос: {currentQuestion + 1}/{totalQuestions}
        </div>

      </div>
    </div>
  );
};
