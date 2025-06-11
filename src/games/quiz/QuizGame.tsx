
import React from "react";
import { GameLevel } from "@/types";
import { useQuizGame } from "./hooks/useQuizGame";
import { QuizStartScreen } from "./components/QuizStartScreen";
import { QuizQuestion } from "./components/QuizQuestion";
import { QuizFeedback } from "./components/QuizFeedback";
import { QuizHud } from "./components/QuizHud";
import { LoadingScreen } from "./components/LoadingScreen";

interface QuizGameProps {
  level: GameLevel;
  onComplete: (points?: number) => void;
  onTimeUp: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ level, onComplete, onTimeUp }) => {
  const {
    questions,
    currentQuestionIndex,
    selectedOption,
    timeLeft,
    score,
    gameStarted,
    feedback,
    currentQuestion,
    isLoading,
    isCompleted,
    handleOptionSelect,
    handleStartGame,
    formatTime,
    getThemeTitle
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

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <QuizHud 
        timeLeft={timeLeft}
        currentQuestion={currentQuestionIndex}
        totalQuestions={questions.length}
        formatTime={formatTime}
      />

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
  );
};
