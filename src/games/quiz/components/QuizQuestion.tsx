
import React from "react";

interface QuizQuestionProps {
  question: string;
  options: string[];
  selectedOption: number | null;
  feedback: "correct" | "incorrect" | null;
  onSelect: (optionIndex: number) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  selectedOption,
  feedback,
  onSelect
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mb-6">
      <div className="text-xl font-medium text-center mb-6">
        {question}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full p-4 text-left rounded-lg transition-all duration-200 ${
              selectedOption === index
                ? feedback === "correct"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            disabled={feedback !== null}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
