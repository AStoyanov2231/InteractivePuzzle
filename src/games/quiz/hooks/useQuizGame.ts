
import { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { generateQuizQuestions } from "../utils/quizGenerator";
import { useGameTimer } from "@/hooks/useGameTimer";

export const useQuizGame = (level: GameLevel, onComplete: (score?: number) => void, onTimeUp: () => void) => {
  const [questions, setQuestions] = useState<{ 
    question: string; 
    options: string[];
    correctIndex: number;
  }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  
  // Use the game timer hook
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, resetTimer } = useGameTimer({
    initialTime: level.timeLimit,
    onTimeUp,
    enabled: gameStarted
  });
  
  // Initialize the game
  useEffect(() => {
    if (gameStarted) {
      // Number of questions based on difficulty
      const questionCount = level.difficultyId === "easy" ? 5 : 
                           level.difficultyId === "medium" ? 8 : 10;
      
      const quizQuestions = generateQuizQuestions(level.themeId, level.difficultyId, questionCount);
      setQuestions(quizQuestions);
    }
  }, [gameStarted, level.themeId, level.difficultyId]);

  // Timer is handled by the useGameTimer hook

  // Check game completion
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      // Game completed - calculate final score
      const baseScore = score; // Score already calculated per correct answer
      const timeBonus = Math.max(0, timeLeft * 2); // 2 points per second remaining
      
      const totalScore = baseScore + timeBonus;
      
      onComplete(totalScore);
    }
  }, [currentQuestionIndex, questions.length, onComplete, score, timeLeft]);

  const handleOptionSelect = (optionIndex: number) => {
    if (feedback !== null) return;
    
    // Start timer on first answer
    startTimer();
    
    setSelectedOption(optionIndex);
    
    const isCorrect = optionIndex === questions[currentQuestionIndex].correctIndex;
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      // Add points based on difficulty
      const pointsPerQuestion = level.difficultyId === "easy" ? 10 : 
                               level.difficultyId === "medium" ? 15 : 20;
      setScore(prev => prev + pointsPerQuestion);
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      setSelectedOption(null);
      setFeedback(null);
      setCurrentQuestionIndex(prev => prev + 1);
    }, 2000);
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get theme title
  const getThemeTitle = () => {
    switch (level.themeId) {
      case "history": return "История";
      case "science": return "Наука";
      case "geography": return "География";
      default: return "Общи знания";
    }
  };

  return {
    questions,
    currentQuestionIndex,
    selectedOption,
    timeLeft,
    hasStarted,
    showTimeUpScreen,
    score,
    gameStarted,
    feedback,
    currentQuestion: questions[currentQuestionIndex],
    isLoading: questions.length === 0,
    isCompleted: questions.length > 0 && currentQuestionIndex >= questions.length,
    handleOptionSelect,
    handleStartGame,
    formatTime,
    getThemeTitle,
    resetTimer
  };
};
