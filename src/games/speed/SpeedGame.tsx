import React, { useState, useRef, useCallback, useEffect } from "react";
import { GameLevel } from "@/types";
import { ColorMatchGame } from "./components/ColorMatchGame";
import { SpeedGameResults } from "./components/SpeedGameResults";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gameStatsService } from "@/services/gameStatsService";
import { useIsMobile } from "@/hooks/use-mobile";

interface SpeedGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
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

export const SpeedGame: React.FC<SpeedGameProps> = ({ level, onComplete, onTimeUp }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // Changed from timeLeft to timeElapsed
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Game speed based on selected category
  const speed = selectedCategory === "slow" ? 2000 : 1000;

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

  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSelectedCategory(null);
    setGameStarted(false);
    setGameEnded(false);
    setTimeElapsed(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTotalAttempts(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start game when category is selected
  useEffect(() => {
    if (selectedCategory && !gameStarted && !gameEnded) {
      startGame();
    }
  }, [selectedCategory, gameStarted, gameEnded, startGame]);

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

  if (!selectedCategory) {
    return (
      <div className={`flex flex-col items-center justify-center w-full ${isMobile ? 'py-4 px-4' : 'max-w-4xl mx-auto py-12'}`}>
        <div className={`bg-white rounded-lg shadow-xl text-center w-full ${isMobile ? 'p-4' : 'p-8 max-w-2xl'}`}>
          <h2 className={`font-bold text-gray-800 mb-6 ${isMobile ? 'text-xl' : 'text-3xl'}`}>Изберете скорост</h2>
          
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            <button
              onClick={() => setSelectedCategory("slow")}
              className={`flex flex-col items-center rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 ${isMobile ? 'p-4' : 'p-6'}`}
            >
              <div className={`mb-4 p-3 rounded-lg ${isMobile ? 'text-3xl' : 'text-4xl'}`} style={{ backgroundColor: "#10B98120" }}>
                🐌
              </div>
              <span className={`font-semibold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>Бавно</span>
            </button>
            <button
              onClick={() => setSelectedCategory("fast")}
              className={`flex flex-col items-center rounded-xl border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 ${isMobile ? 'p-4' : 'p-6'}`}
            >
              <div className={`mb-4 p-3 rounded-lg ${isMobile ? 'text-3xl' : 'text-4xl'}`} style={{ backgroundColor: "#EF444420" }}>
                🚀
              </div>
              <span className={`font-semibold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>Бързо</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col w-full h-full">
        {/* MOBILE TOP STATS BAR */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-semibold text-green-600">{correctAnswers}</div>
                <div className="text-xs text-gray-500">Верни</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{wrongAnswers}</div>
                <div className="text-xs text-gray-500">Грешни</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{totalAttempts}</div>
                <div className="text-xs text-gray-500">Общо</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">
                {Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:
                {(timeElapsed % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-gray-500">
                {selectedCategory === "slow" ? "Бавно" : "Бързо"}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE GAME AREA */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-center h-full">
            <ColorMatchGame
              speed={speed}
              onCorrect={handleCorrectAnswer}
              onIncorrect={handleWrongAnswer}
              gameActive={!gameEnded}
              difficulty={selectedCategory === "slow" ? "easy" : "hard"}
            />
          </div>
        </div>

        {/* MOBILE BOTTOM CONTROLS */}
        <div className="bg-white rounded-lg shadow-md p-3 mt-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Отначало
            </Button>
            <Button 
              variant="outline"
              onClick={endGame}
              className="flex-1 bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Завърши
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-4 items-start -mx-4">
      {/* LEFT SIDEBAR */}
      <aside className="w-[220px] shrink-0 pl-4">
        <div className="sticky top-6">
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <Chronometer seconds={timeElapsed} hasStarted={gameStarted} />
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Верни</span>
                <span className="font-semibold">{correctAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Грешни</span>
                <span className="font-semibold">{wrongAnswers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Общо</span>
                <span className="font-semibold">{totalAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Скорост</span>
                <span className="font-semibold">{selectedCategory === "slow" ? "Бавно" : "Бързо"}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-3 space-y-2">
            <Button variant="outline" onClick={handleReset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Започни отначало
            </Button>
            <Button 
              variant="outline"
              onClick={endGame}
              className="w-full bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Завърши играта
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-md p-8 w-full">
          <div className="text-center mb-6">
          </div>
          
          <div className="flex justify-center">
            <ColorMatchGame
              speed={speed}
              onCorrect={handleCorrectAnswer}
              onIncorrect={handleWrongAnswer}
              gameActive={!gameEnded}
              difficulty={selectedCategory === "slow" ? "easy" : "hard"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
