import { useState, useEffect, useCallback } from 'react';

interface UseGameTimerProps {
  initialTime?: number; // Made optional since we're now using stopwatch
  onTimeUp?: () => void; // Made optional since there's no time limit
  enabled?: boolean;
}

export const useGameTimer = ({ initialTime = 0, onTimeUp, enabled = true }: UseGameTimerProps) => {
  const [timeElapsed, setTimeElapsed] = useState(0); // Changed from timeLeft to timeElapsed
  const [hasStarted, setHasStarted] = useState(false);
  const [showTimeUpScreen, setShowTimeUpScreen] = useState(false);

  // Start the timer when first move is made
  const startTimer = useCallback(() => {
    if (!hasStarted) {
      setHasStarted(true);
    }
  }, [hasStarted]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimeElapsed(0); // Reset to 0 for stopwatch
    setHasStarted(false);
    setShowTimeUpScreen(false);
  }, []);

  // Timer effect - now counts up instead of down
  useEffect(() => {
    if (!enabled || !hasStarted) return;

    const timer = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1); // Count up instead of down
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [enabled, hasStarted]);

  return {
    timeLeft: timeElapsed, // Return timeElapsed but keep the same name for compatibility
    timeElapsed, // Also provide timeElapsed for clarity
    hasStarted,
    showTimeUpScreen,
    startTimer,
    resetTimer
  };
}; 