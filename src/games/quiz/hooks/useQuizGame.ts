
import { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { generateQuizQuestions } from "../utils/quizGenerator";

export const useQuizGame = (level: GameLevel, onComplete: () => void, onTimeUp: () => void) => {
  const [questions, setQuestions] = useState<{ 
    question: string; 
    options: string[];
    correctIndex: number;
  }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  
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

  // Timer effect
  useEffect(() => {
    let timer: number | undefined;
    
    if (gameStarted && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, timeLeft, onTimeUp]);

  // Check game completion
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      // Game completed
      onComplete();
    }
  }, [currentQuestionIndex, questions.length, onComplete]);

  const handleOptionSelect = (optionIndex: number) => {
    if (feedback !== null) return;
    
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
    score,
    gameStarted,
    feedback,
    currentQuestion: questions[currentQuestionIndex],
    isLoading: questions.length === 0,
    isCompleted: questions.length > 0 && currentQuestionIndex >= questions.length,
    handleOptionSelect,
    handleStartGame,
    formatTime,
    getThemeTitle
  };
};
