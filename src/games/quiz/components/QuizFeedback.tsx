
import React from "react";
import { Check, X } from "lucide-react";

interface QuizFeedbackProps {
  feedback: "correct" | "incorrect" | null;
  correctAnswer?: string;
}

export const QuizFeedback: React.FC<QuizFeedbackProps> = ({ feedback, correctAnswer }) => {
  if (!feedback) {
    return null;
  }

  return (
    <div className={`mt-4 p-3 rounded-md text-white ${
      feedback === "correct" ? "bg-green-500" : "bg-red-500"
    }`}>
      {feedback === "correct" ? (
        <div className="flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Правилно!
        </div>
      ) : (
        <div className="flex items-center">
          <X className="w-5 h-5 mr-2" />
          Грешно! Правилният отговор е {correctAnswer}.
        </div>
      )}
    </div>
  );
};
