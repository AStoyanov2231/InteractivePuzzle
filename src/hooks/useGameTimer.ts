import { useState, useEffect, useCallback } from 'react';

interface UseGameTimerProps {
  initialTime: number;
  onTimeUp: () => void;
  enabled?: boolean;
}

export const useGameTimer = ({ initialTime, onTimeUp, enabled = true }: UseGameTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
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
    setTimeLeft(initialTime);
    setHasStarted(false);
    setShowTimeUpScreen(false);
  }, [initialTime]);

  // Timer effect
  useEffect(() => {
    if (!enabled || !hasStarted || timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowTimeUpScreen(true);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [enabled, hasStarted, timeLeft, onTimeUp]);

  return {
    timeLeft,
    hasStarted,
    showTimeUpScreen,
    startTimer,
    resetTimer
  };
}; 