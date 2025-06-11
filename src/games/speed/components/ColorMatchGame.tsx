import { useState, useEffect, useCallback, useRef } from "react";

interface ColorMatchGameProps {
  speed: number; // This should be 1000ms (1 second)
  onCorrect: () => void;
  onIncorrect: () => void;
  gameActive: boolean;
}

type ColorOption = "green" | "blue";

export const ColorMatchGame: React.FC<ColorMatchGameProps> = ({
  speed,
  onCorrect,
  onIncorrect,
  gameActive
}) => {
  const [targetColor, setTargetColor] = useState<ColorOption>("green");
  const [leftColor, setLeftColor] = useState<ColorOption>("green");
  const [rightColor, setRightColor] = useState<ColorOption>("blue");
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Use useRef for timer ID

  const colors = {
    green: "#22c55e", // Tailwind green-500
    blue: "#3b82f6",  // Tailwind blue-500
  };

  // Generates and sets new colors for the target and options
  const generateAndSetNewColors = useCallback(() => {
    const newTargetColor = Math.random() < 0.5 ? "green" : "blue";
    const isGreenOnLeft = Math.random() < 0.5;
    
    setTargetColor(newTargetColor);
    setLeftColor(isGreenOnLeft ? "green" : "blue");
    setRightColor(isGreenOnLeft ? "blue" : "green");
  }, []); // Empty dependency array: this function doesn't change

  // Function to start the automatic color change timer
  const startAutomaticColorChange = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      if (gameActive) { // Check if game is still active before changing
        generateAndSetNewColors();
        startAutomaticColorChange(); // Schedule the next automatic change
      }
    }, speed); // Use the speed prop (should be 1000ms)
  }, [speed, gameActive, generateAndSetNewColors]); // Dependencies

  // Effect to manage the game state and timers
  useEffect(() => {
    if (gameActive) {
      generateAndSetNewColors(); // Initial color setup
      startAutomaticColorChange(); // Start the timer
    } else {
      // Clear timer if game becomes inactive
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup function to clear timer when component unmounts or gameActive changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameActive, speed, generateAndSetNewColors, startAutomaticColorChange]); // Added startAutomaticColorChange

  const handleColorClick = useCallback((selectedColor: ColorOption) => {
    if (!gameActive) return; // Do nothing if game is not active

    // Clear the existing automatic timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (selectedColor === targetColor) {
      onCorrect();
    } else {
      onIncorrect();
    }
    
    // Generate new colors immediately after player's choice
    generateAndSetNewColors();
    
    // Restart the automatic timer for the next color change
    // This ensures the next change is 'speed' ms from this click
    startAutomaticColorChange(); 

  }, [gameActive, targetColor, onCorrect, onIncorrect, generateAndSetNewColors, startAutomaticColorChange]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl">
      <div className="w-full p-8 mb-8 bg-white rounded-2xl shadow-lg flex items-center justify-center">
        <div 
          className="w-40 h-40 rounded-2xl flex items-center justify-center text-white text-2xl font-bold transition-all"
          style={{ 
            backgroundColor: colors[targetColor],
            boxShadow: `0 10px 15px -3px ${colors[targetColor]}40`
          }}
        >
          {targetColor === "green" ? "Зелено" : "Синьо"}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 w-full">
        <button
          onClick={() => handleColorClick(leftColor)}
          className="aspect-square rounded-3xl shadow-lg transform transition-all hover:scale-105 active:scale-95 focus:outline-none"
          style={{ 
            backgroundColor: colors[leftColor],
            boxShadow: `0 10px 15px -3px ${colors[leftColor]}40`
          }}
          disabled={!gameActive}
        />
        <button
          onClick={() => handleColorClick(rightColor)}
          className="aspect-square rounded-3xl shadow-lg transform transition-all hover:scale-105 active:scale-95 focus:outline-none"
          style={{ 
            backgroundColor: colors[rightColor],
            boxShadow: `0 10px 15px -3px ${colors[rightColor]}40`
          }}
          disabled={!gameActive}
        />
      </div>
    </div>
  );
};
