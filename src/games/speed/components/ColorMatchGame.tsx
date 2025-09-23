import { useState, useEffect, useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ColorMatchGameProps {
  speed: number; // This should be 1000ms (1 second)
  onCorrect: () => void;
  onIncorrect: () => void;
  gameActive: boolean;
  difficulty: string; // Add difficulty prop
}

type ColorOption = "green" | "blue" | "red";

export const ColorMatchGame: React.FC<ColorMatchGameProps> = ({
  speed,
  onCorrect,
  onIncorrect,
  gameActive,
  difficulty
}) => {
  const [targetColor, setTargetColor] = useState<ColorOption>("green");
  const [squareColors, setSquareColors] = useState<ColorOption[]>(["green", "blue"]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const colors = {
    green: "#22c55e", // Tailwind green-500
    blue: "#3b82f6",  // Tailwind blue-500
    red: "#ef4444",   // Tailwind red-500
  };

  const colorNames = {
    green: "Зелено",
    blue: "Синьо", 
    red: "Червено"
  };

  // Get available colors based on difficulty
  const getAvailableColors = (): ColorOption[] => {
    if (difficulty === "hard") {
      return ["green", "blue", "red"];
    }
    return ["green", "blue"];
  };

  // Generates and sets new colors for the target and options
  const generateAndSetNewColors = useCallback(() => {
    const availableColors = getAvailableColors();
    
    // Pick random target color
    const newTargetColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    // Shuffle available colors for squares
    const shuffledColors = [...availableColors].sort(() => Math.random() - 0.5);
    
    setTargetColor(newTargetColor);
    setSquareColors(shuffledColors);
  }, [difficulty]);

  // Function to start the automatic color change timer
  const startAutomaticColorChange = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      if (gameActive) {
        generateAndSetNewColors();
        startAutomaticColorChange();
      }
    }, speed);
  }, [speed, gameActive, generateAndSetNewColors]);

  // Effect to manage the game state and timers
  useEffect(() => {
    if (gameActive) {
      generateAndSetNewColors();
      startAutomaticColorChange();
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameActive, speed, generateAndSetNewColors, startAutomaticColorChange]);

  const handleColorClick = useCallback((selectedColor: ColorOption) => {
    if (!gameActive) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (selectedColor === targetColor) {
      onCorrect();
    } else {
      onIncorrect();
    }
    
    generateAndSetNewColors();
    startAutomaticColorChange();
  }, [gameActive, targetColor, onCorrect, onIncorrect, generateAndSetNewColors, startAutomaticColorChange]);

  const isHard = difficulty === "hard";
  const gridCols = isHard ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className={`flex flex-col items-center w-full ${isMobile ? 'max-w-sm' : 'max-w-2xl'}`}>
      <div className={`w-full bg-white rounded-2xl shadow-lg flex items-center justify-center ${isMobile ? 'p-4 mb-4' : 'p-8 mb-8'}`}>
        <div 
          className={`rounded-2xl flex items-center justify-center text-white font-bold transition-all ${isMobile ? 'w-32 h-32 text-lg' : 'w-40 h-40 text-2xl'}`}
          style={{ 
            backgroundColor: colors[targetColor],
            boxShadow: `0 10px 15px -3px ${colors[targetColor]}40`
          }}
        >
          {colorNames[targetColor]}
        </div>
      </div>
      
      <div className={`grid ${gridCols} w-full ${isMobile ? 'gap-4' : 'gap-8'}`}>
        {squareColors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorClick(color)}
            className={`aspect-square rounded-3xl shadow-lg transform transition-all hover:scale-105 active:scale-95 focus:outline-none ${isMobile ? 'touch-manipulation' : ''}`}
            style={{ 
              backgroundColor: colors[color],
              boxShadow: `0 10px 15px -3px ${colors[color]}40`
            }}
            disabled={!gameActive}
          />
        ))}
      </div>
    </div>
  );
};
