
import React, { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { useQuizGame } from "./hooks/useQuizGame";
import { QuizQuestion } from "./components/QuizQuestion";
import { QuizFeedback } from "./components/QuizFeedback";
import { LoadingScreen } from "./components/LoadingScreen";
import { TimeUpScreen } from "@/components/TimeUpScreen";
import { QuizCategorySelector, quizCategories } from "./components/QuizCategorySelector";
import { Button } from "@/components/ui/button";
import { Trophy, Home, Check, RefreshCw } from "lucide-react";
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

// Chronometer-style timer display (matches other games)
const Chronometer: React.FC<{ label?: string; seconds: number; hasStarted: boolean }>
  = ({ label = "", seconds, hasStarted }) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return (
    <div className="w-full">
      <div className="text-center text-sm text-gray-600 mb-2">{label}</div>
      <div className="relative mx-auto w-36 h-36">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-gray-300 rounded-t-xl shadow" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-50 to-slate-200 border-4 border-slate-300 shadow-xl" />
        <div className="absolute inset-2 rounded-full bg-white shadow-inner" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold tabular-nums tracking-wider">
            {hasStarted ? `${mins}:${secs}` : "00:00"}
          </div>
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 left-3 w-3 h-1 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 right-3 w-3 h-1 bg-slate-400 rounded" />
      </div>
    </div>
  );
};

export const QuizGame: React.FC<QuizGameProps> = ({ 
  level, 
  onComplete, 
  onTimeUp, 
  currentTeam, 
  onPlayerTurn 
}) => {
  const navigate = useNavigate();
  
  // Always start without category selected to force category picker (like other games)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Update level with selected category
  const updatedLevel = selectedCategory ? { ...level, themeId: selectedCategory } : level;
  
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
    stopTimer,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    completeGame,
    totalAttempts,
    showCompletionScreen
  } = useQuizGame(updatedLevel, onComplete, onTimeUp, currentTeam, onPlayerTurn);

  // Custom handler for Complete Game button
  const handleCompleteGame = async () => {
    // Stop timer first
    stopTimer();
    
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

  // Handle category selection and auto-start game
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Auto-start game when category is selected
  useEffect(() => {
    if (selectedCategory && !gameStarted && !currentTeam) {
      // Automatically start the game once category is selected
      handleStartGame();
    }
  }, [selectedCategory, gameStarted, handleStartGame, currentTeam]);

  // Handle game reset
  const handleReset = () => {
    setSelectedCategory(null);
    // Reset the quiz state
    window.location.reload(); // Simple reset for quiz game
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

  // Show category selection if no category selected
  if (!selectedCategory && !currentTeam) {
    return <QuizCategorySelector onCategorySelect={handleCategorySelect} />;
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

  return (
    <>
      {showTimeUpScreen && (
        <TimeUpScreen 
          onReset={handleReset}
        />
      )}
      
      <div className="flex w-full gap-4 items-start -mx-4">
        {/* LEFT SIDEBAR */}
        <aside className="w-[220px] shrink-0 pl-4">
          <div className="sticky top-6">
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
              <Chronometer seconds={timeLeft} hasStarted={hasStarted} />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Въпрос</span>
                  <span className="font-semibold">{currentQuestionIndex + 1}/{questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Верни</span>
                  <span className="font-semibold">{score}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Категория</span>
                  <span className="font-semibold">{quizCategories.find(c => c.id === selectedCategory)?.name}</span>
                </div>
                {currentTeam && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Играч</span>
                    <span className="font-semibold">{currentTeam.players[currentPlayerIndex]?.name || 'Играч'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-3 space-y-2">
              <Button variant="outline" onClick={handleReset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Започни отначало
              </Button>
              {!currentTeam && (
                <Button 
                  variant="outline"
                  onClick={handleCompleteGame}
                  className="w-full bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Завърши играта
                </Button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col items-center">
          <div className="bg-white rounded-lg shadow-md p-8 w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Викторина - {quizCategories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-gray-600">
                Отговорете на въпроса по-долу
              </p>
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
        </div>
      </div>
    </>
  );
};
