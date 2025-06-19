
import React from "react";
import { GameLevel } from "@/types";
import { useQuizGame } from "./hooks/useQuizGame";
import { QuizStartScreen } from "./components/QuizStartScreen";
import { QuizQuestion } from "./components/QuizQuestion";
import { QuizFeedback } from "./components/QuizFeedback";
import { QuizHud } from "./components/QuizHud";
import { LoadingScreen } from "./components/LoadingScreen";
import { TimeUpScreen } from "@/components/TimeUpScreen";

interface QuizGameProps {
  level: GameLevel;
  onComplete: (score?: number) => void;
  onTimeUp: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ level, onComplete, onTimeUp }) => {
  const {
    questions,
    currentQuestionIndex,
    selectedOption,
    timeLeft,
    hasStarted,
    showTimeUpScreen,
    score,
    gameStarted,
    feedback,
    currentQuestion,
    isLoading,
    isCompleted,
    handleOptionSelect,
    handleStartGame,
    formatTime,
    getThemeTitle,
    resetTimer
  } = useQuizGame(level, onComplete, onTimeUp);

  if (!gameStarted) {
    return (
      <QuizStartScreen 
        title={getThemeTitle()} 
        timeLimit={level.timeLimit} 
        onStart={handleStartGame} 
        formatTime={formatTime} 
      />
    );
  }

  // If questions are still loading or quiz is completed
  if (isLoading) {
    return <LoadingScreen message="Зареждане на въпросите..." />;
  }

  if (isCompleted) {
    return <LoadingScreen message="Изчисляване на резултата..." />;
  }

  const handleReset = () => {
    // Reset the quiz state
    window.location.reload(); // Simple reset for quiz game
  };

  return (
    <>
      {showTimeUpScreen && (
        <TimeUpScreen 
          onReset={handleReset}
        />
      )}
      
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
        <QuizHud 
          timeLeft={timeLeft}
          currentQuestion={currentQuestionIndex}
          totalQuestions={questions.length}
          formatTime={formatTime}
          hasStarted={hasStarted}
        />
      
      {/* Test button for development */}
      <div className="mb-4 text-center">
        <button
          onClick={() => {
            const testScore = 320 + Math.floor(Math.random() * 130);
            onComplete(testScore);
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
        >
          🧪 Test: Complete Round (Score: ~400)
        </button>
      </div>

      <QuizQuestion 
        question={currentQuestion.question}
        options={currentQuestion.options}
        selectedOption={selectedOption}
        feedback={feedback}
        onSelect={handleOptionSelect}
      />

      <QuizFeedback 
        feedback={feedback} 
        correctAnswer={feedback === "incorrect" ? currentQuestion.options[currentQuestion.correctIndex] : undefined} 
      />
    </div>
    </>
  );
};
