
import { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { generateQuizQuestions } from "../utils/quizGenerator";
import { useGameTimer } from "@/hooks/useGameTimer";

interface TeamData {
  id: string;
  name: string;
  players: { name: string; id: string }[];
  score: number;
}

export const useQuizGame = (
  level: GameLevel, 
  onComplete: () => void, 
  onTimeUp: () => void,
  currentTeam?: TeamData,
  onPlayerTurn?: (playerId: string) => void
) => {
  const [questions, setQuestions] = useState<{ 
    question: string; 
    options: string[];
    correctIndex: number;
  }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  
  // Use the game timer hook
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, resetTimer } = useGameTimer({
    enabled: gameStarted
  });
  
  // Initialize the game
  useEffect(() => {
    if (gameStarted) {
      // Number of questions based on difficulty  
      const questionCount = currentTeam ? 6 : // Competitive mode: shorter rounds
                           level.difficultyId === "easy" ? 5 : 
                           level.difficultyId === "medium" ? 8 : 10;
      
      // For competitive mode, generate random questions from all themes
      let themeId = level.themeId;
      if (currentTeam) {
        const themes = ["history", "science", "geography"];
        themeId = themes[Math.floor(Math.random() * themes.length)];
        console.log(`Competitive quiz: Selected theme ${themeId} for team ${currentTeam.name}`);
      }
      
      console.log(`Generating quiz questions: theme=${themeId}, difficulty=${level.difficultyId}, count=${questionCount}`);
      const quizQuestions = generateQuizQuestions(themeId, level.difficultyId, questionCount);
      console.log(`Generated ${quizQuestions.length} questions:`, quizQuestions);
      setQuestions(quizQuestions);
    }
  }, [gameStarted, level.themeId, level.difficultyId, currentTeam]);

  // Check game completion
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      // Game completed
      onComplete();
    }
  }, [currentQuestionIndex, questions.length, onComplete]);

  const handleOptionSelect = (optionIndex: number) => {
    if (feedback !== null) return;
    
    // Start timer on first answer
    startTimer();
    
    setSelectedOption(optionIndex);
    
    const isCorrect = optionIndex === questions[currentQuestionIndex].correctIndex;
    setFeedback(isCorrect ? "correct" : "incorrect");
    setTotalAttempts(prev => prev + 1);
    
    if (isCorrect) {
      // Track correct answer
      setScore(prev => prev + 1);
    }
    
    // Move to next question after a delay
    setTimeout(() => {
      setSelectedOption(null);
      setFeedback(null);
      setCurrentQuestionIndex(prev => prev + 1);
      
      // In competitive mode, switch to next player after each question
      if (currentTeam && onPlayerTurn && isCorrect) {
        const nextPlayerIndex = (currentPlayerIndex + 1) % currentTeam.players.length;
        setCurrentPlayerIndex(nextPlayerIndex);
        onPlayerTurn(currentTeam.players[nextPlayerIndex].id);
      }
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

  // Get theme title - for competitive mode, show mixed themes
  const getThemeTitle = () => {
    if (currentTeam) {
      return "Блицвикторина - Смесени въпроси";
    }
    
    switch (level.themeId) {
      case "history": return "История";
      case "science": return "Наука";
      case "geography": return "География";
      default: return "Общи знания";
    }
  };

  // Complete game immediately for testing
  const completeGame = () => {
    if (currentTeam) {
      setCurrentQuestionIndex(questions.length);
      onComplete();
    } else {
      setShowCompletionScreen(true);
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
    resetTimer,
    currentPlayerIndex,
    setCurrentPlayerIndex,
    completeGame,
    totalAttempts,
    showCompletionScreen
  };
};
