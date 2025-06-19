
import React from "react";
import { Button } from "@/components/ui/button";

interface QuizStartScreenProps {
  title: string;
  timeLimit: number;
  onStart: () => void;
  formatTime: (seconds: number) => string;
}

export const QuizStartScreen: React.FC<QuizStartScreenProps> = ({ 
  title, 
  timeLimit, 
  onStart, 
  formatTime 
}) => {
  // Automatically start the game when this component renders
  React.useEffect(() => {
    onStart();
  }, [onStart]);

  // Return empty fragment since this is just a transitional component now
  return null;
};
