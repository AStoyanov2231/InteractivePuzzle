
import { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { generateQuizQuestions } from "../utils/quizGenerator";

export const useQuizGame = (level: GameLevel, onComplete: (points?: number) => void, onTimeUp: () => void) => {
  const [questions, setQuestions] = useState<{ 
    question: string; 
    options: string[];
    correctIndex: number;
  }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
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

  // Calculate points based on performance
  const calculatePoints = () => {
    const totalQuestions = questions.length;
    const timeElapsed = level.timeLimit - timeLeft;
    
    // Base points: 15 points per correct answer
    let points = correctAnswers * 15;
    
    // Time bonus: Up to 5 points per correct answer for speed
    const averageTimePerQuestion = timeElapsed / Math.max(totalQuestions, 1);
    if (averageTimePerQuestion <= 20) {
      points += correctAnswers * 5; // Very fast
    } else if (averageTimePerQuestion <= 35) {
      points += correctAnswers * 3; // Fast
    } else if (averageTimePerQuestion <= 50) {
      points += correctAnswers * 2; // Medium
    } else if (averageTimePerQuestion <= 70) {
      points += correctAnswers * 1; // Slow but acceptable
    }
    
    // Accuracy bonus
    const accuracy = correctAnswers / totalQuestions;
    if (accuracy === 1) {
      points += 20; // Perfect score bonus
    } else if (accuracy >= 0.8) {
      points += 15; // High accuracy bonus
    } else if (accuracy >= 0.6) {
      points += 10; // Good accuracy bonus
    }
    
    // Completion bonus
    if (currentQuestionIndex >= totalQuestions) {
      points += 10; // Completion bonus
    }
    
    return Math.floor(Math.max(0, Math.min(points, 100))); // Cap at 100 points
  };

  // Check game completion
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      // Game completed - calculate and pass points
      const points = calculatePoints();
      onComplete(points);
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
      setCorrectAnswers(prev => prev + 1);
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
