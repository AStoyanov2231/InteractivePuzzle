
import React from "react";
import { GameLevel } from "@/types";
import { useQuizGame } from "./hooks/useQuizGame";
import { QuizStartScreen } from "./components/QuizStartScreen";
import { QuizQuestion } from "./components/QuizQuestion";
import { QuizFeedback } from "./components/QuizFeedback";
import { QuizHud } from "./components/QuizHud";
import { LoadingScreen } from "./components/LoadingScreen";
import { TimeUpScreen } from "@/components/TimeUpScreen";

interface TeamData {
  id: string;
  name: string;
  players: { name: string; id: string }[];
  score: number;
}

interface QuizGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
  currentTeam?: TeamData;
  onPlayerTurn?: (playerId: string) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ 
  level, 
  onComplete, 
  onTimeUp, 
  currentTeam, 
  onPlayerTurn 
}) => {
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
    resetTimer,
    currentPlayerIndex,
    setCurrentPlayerIndex
  } = useQuizGame(level, onComplete, onTimeUp, currentTeam, onPlayerTurn);

  // Auto-start game in competitive mode
  React.useEffect(() => {
    if (currentTeam && !gameStarted) {
      handleStartGame();
    }
  }, [currentTeam, gameStarted, handleStartGame]);

  if (!gameStarted && !currentTeam) {
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

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return <LoadingScreen message="Подготвяне на въпроса..." />;
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
