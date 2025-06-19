import React, { useState, useRef, useCallback, useEffect } from "react";
import { GameLevel } from "@/types";
import { SpeedGameResults } from "./components/SpeedGameResults";
import { ColorMatchGame } from "./components/ColorMatchGame";
import { useToast } from "@/hooks/use-toast";

interface SpeedGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
}

export const SpeedGame: React.FC<SpeedGameProps> = ({ level, onComplete, onTimeUp }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Game speed based on difficulty
  const speed = 1000; // Always 1 second

  const startGame = useCallback(() => {
    setGameStarted(true);
    setTimeLeft(level.timeLimit);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTotalAttempts(0);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [level.timeLimit]);

  const endGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setGameEnded(true);
    onComplete();
  }, [onComplete]);

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
        timeSpent={level.timeLimit - timeLeft}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="text-lg font-semibold">
            Време: {timeLeft}с
          </div>
          <div className="text-lg font-semibold">
            Правилни: {correctAnswers}
          </div>
        </div>
        
        <ColorMatchGame
          speed={speed}
          onCorrect={handleCorrectAnswer}
          onIncorrect={handleWrongAnswer}
          gameActive={!gameEnded}
        />
      </div>
    </div>
  );
};
