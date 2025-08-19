
import React from "react";
import { GameLevel } from "@/types";
import { useQuizGame } from "./hooks/useQuizGame";
import { QuizStartScreen } from "./components/QuizStartScreen";
import { QuizQuestion } from "./components/QuizQuestion";
import { QuizFeedback } from "./components/QuizFeedback";
import { QuizHud } from "./components/QuizHud";
import { LoadingScreen } from "./components/LoadingScreen";
import { TimeUpScreen } from "@/components/TimeUpScreen";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { gameStatsService } from "@/services/gameStatsService";

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
  const navigate = useNavigate();
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
    setCurrentPlayerIndex,
    completeGame,
    totalAttempts,
    showCompletionScreen
  } = useQuizGame(level, onComplete, onTimeUp, currentTeam, onPlayerTurn);

  // Custom handler for Complete Game button
  const handleCompleteGame = async () => {
    // Submit stats when completing game manually
    if (gameStatsService.isSinglePlayerMode(currentTeam)) {
      try {
        await gameStatsService.submitQuizGameStats({
          score,
          totalAttempts,
          timeElapsed: timeLeft,
        });
        console.log('Stats submitted via Complete Game button');
      } catch (error) {
        console.error('Failed to submit stats:', error);
      }
    }
    
    completeGame();
  };

  // Auto-start game in competitive mode
  React.useEffect(() => {
    if (currentTeam && !gameStarted) {
      handleStartGame();
    }
  }, [currentTeam, gameStarted, handleStartGame]);

  // Show completion screen
  if (showCompletionScreen) {
    const incorrectAnswers = totalAttempts - score;
    const username = localStorage.getItem('currentPlayerName') || 'Играч';
    
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Браво, {username}!</h2>
            <p className="text-lg text-gray-700 mb-4">Завърши всички {questions.length} въпроса!</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Време:</div>
                  <div className="text-xl font-bold text-blue-600">{formatTime(timeLeft)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Резултат:</div>
                  <div className="text-xl font-bold text-green-600">{score}/{questions.length}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-green-600">Верни:</div>
                  <div className="text-lg font-bold text-green-600">{score}</div>
                </div>
                <div>
                  <div className="text-sm text-red-600">Грешни:</div>
                  <div className="text-lg font-bold text-red-600">{incorrectAnswers}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Към началото
          </Button>
        </div>
      </div>
    );
  }

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
          onComplete={handleCompleteGame}
          isCompetitive={!!currentTeam}
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
