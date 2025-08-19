import React, { useState, useRef, useCallback, useEffect } from "react";
import { GameLevel } from "@/types";
import { ColorMatchGame } from "./components/ColorMatchGame";
import { SpeedGameResults } from "./components/SpeedGameResults";
import { useToast } from "@/hooks/use-toast";
import { gameStatsService } from "@/services/gameStatsService";

interface SpeedGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
}

export const SpeedGame: React.FC<SpeedGameProps> = ({ level, onComplete, onTimeUp }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // Changed from timeLeft to timeElapsed
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Game speed based on difficulty
  const speed = level.difficultyId === "easy" ? 2000 : 1000; // 2 seconds for easy, 1 second for others

  const startGame = useCallback(() => {
    setGameStarted(true);
    setTimeElapsed(0); // Start from 0 for stopwatch
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTotalAttempts(0);

    // Start stopwatch that counts up
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1); // Count up instead of down
    }, 1000);
  }, []);

  const endGame = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setGameEnded(true);
    
    // Submit stats for single-player games
    if (gameStatsService.isSinglePlayerMode()) {
      try {
        await gameStatsService.submitSpeedGameStats({
          correctAnswers,
          wrongAnswers,
          timeElapsed,
        });
        console.log('Stats submitted via Complete Game button');
      } catch (error) {
        console.error('Failed to submit stats:', error);
      }
    }
    
    onComplete();
  }, [onComplete, correctAnswers, wrongAnswers, timeElapsed]);

  const handleCorrectAnswer = useCallback(() => {
    setCorrectAnswers(prev => prev + 1);
    setTotalAttempts(prev => prev + 1);
    
    toast({
      title: "Правилен отговор!",
      description: "Браво!",
      duration: 1000,
    });
  }, [toast]);

  const handleWrongAnswer = useCallback(() => {
    setWrongAnswers(prev => prev + 1);
    setTotalAttempts(prev => prev + 1);
    
    toast({
      title: "Грешен отговор!",
      description: "Опитай отново!",
      variant: "destructive",
      duration: 1000,
    });
  }, [toast]);

  const handlePlayAgain = useCallback(() => {
    setGameEnded(false);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start game immediately without intro
  useEffect(() => {
    if (!gameStarted && !gameEnded) {
      startGame();
    }
  }, [gameStarted, gameEnded, startGame]);

  if (gameEnded) {
    return (
      <SpeedGameResults
        correctAnswers={correctAnswers}
        wrongAnswers={wrongAnswers}
        totalAttempts={totalAttempts}
        timeSpent={timeElapsed} // Use timeElapsed instead of calculating from timeLeft
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex gap-4">
            <div className="text-lg font-semibold">
              Време: {timeElapsed}с
            </div>
            <div className="text-lg font-semibold">
              Правилни: {correctAnswers}
            </div>
          </div>
          <button
            onClick={endGame}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            Завърши играта
          </button>
        </div>
        
        <ColorMatchGame
          speed={speed}
          onCorrect={handleCorrectAnswer}
          onIncorrect={handleWrongAnswer}
          gameActive={!gameEnded}
          difficulty={level.difficultyId}
        />
      </div>
    </div>
  );
};
