import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameLevel } from "@/types";
import { Check, RefreshCw } from "lucide-react";

interface MathGameProps {
  level: GameLevel;
  onComplete: (points?: number) => void;
  onTimeUp: () => void;
}

// Generate math problems based on theme and difficulty
const generateMathProblems = (themeId: string, difficultyId: string, count: number) => {
  const problems: { question: string; answer: number; options: number[] }[] = [];
  
  for (let i = 0; i < count; i++) {
    let num1, num2, answer, question;
    
    // Adjust number range based on difficulty
    const maxNum = difficultyId === "easy" ? 10 : 
                  difficultyId === "medium" ? 20 : 50;
    
    if (themeId === "addition") {
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
    } else if (themeId === "subtraction") {
      num1 = Math.floor(Math.random() * maxNum) + maxNum/2;
      num2 = Math.floor(Math.random() * Math.min(num1, maxNum/2)) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
    } else if (themeId === "multiplication") {
      const factor = difficultyId === "easy" ? 5 : 
                    difficultyId === "medium" ? 10 : 20;
      num1 = Math.floor(Math.random() * factor) + 1;
      num2 = Math.floor(Math.random() * factor) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
    } else {
      // Default to addition
      num1 = Math.floor(Math.random() * maxNum) + 1;
      num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
    }
    
    // Generate answer options (including the correct one)
    const options = [answer];
    
    while (options.length < 4) {
      // Generate random wrong answers within a reasonable range
      const offset = Math.floor(Math.random() * 10) + 1;
      const wrongAnswer = Math.random() < 0.5 ? answer + offset : Math.max(1, answer - offset);
      
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    problems.push({
      question,
      answer,
      options: shuffledOptions
    });
  }
  
  return problems;
};

export const MathGame: React.FC<MathGameProps> = ({ level, onComplete, onTimeUp }) => {
  const [problems, setProblems] = useState<{ question: string; answer: number; options: number[] }[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  
  // Initialize the game immediately
  useEffect(() => {
    // Number of problems based on difficulty
    const problemCount = level.difficultyId === "easy" ? 5 : 
                        level.difficultyId === "medium" ? 8 : 10;
    
    const mathProblems = generateMathProblems(level.themeId, level.difficultyId, problemCount);
    setProblems(mathProblems);
  }, [level.themeId, level.difficultyId]);

  // Timer effect
  useEffect(() => {
    let timer: number | undefined;
    
    if (timeLeft > 0) {
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
  }, [timeLeft, onTimeUp]);

  // Calculate points based on performance
  const calculatePoints = () => {
    const totalProblems = problems.length;
    const timeElapsed = level.timeLimit - timeLeft;
    
    // Base points: 10 points per correct answer
    let points = correctAnswers * 10;
    
    // Time bonus: Up to 5 points per correct answer for speed
    const averageTimePerProblem = timeElapsed / Math.max(totalProblems, 1);
    if (averageTimePerProblem <= 15) {
      points += correctAnswers * 5; // Very fast
    } else if (averageTimePerProblem <= 30) {
      points += correctAnswers * 3; // Fast
    } else if (averageTimePerProblem <= 45) {
      points += correctAnswers * 2; // Medium
    } else if (averageTimePerProblem <= 60) {
      points += correctAnswers * 1; // Slow but acceptable
    }
    
    // Accuracy bonus
    const accuracy = correctAnswers / totalProblems;
    if (accuracy === 1) {
      points += 20; // Perfect score bonus
    } else if (accuracy >= 0.8) {
      points += 10; // High accuracy bonus
    } else if (accuracy >= 0.6) {
      points += 5; // Good accuracy bonus
    }
    
    // Completion bonus
    if (currentProblemIndex >= totalProblems) {
      points += 10; // Completion bonus
    }
    
    return Math.floor(Math.max(0, Math.min(points, 100))); // Cap at 100 points
  };

  // Check game completion
  useEffect(() => {
    if (problems.length > 0 && currentProblemIndex >= problems.length) {
      // Game completed - calculate and pass points
      const points = calculatePoints();
      onComplete(points);
    }
  }, [currentProblemIndex, problems.length, onComplete]);

  const handleAnswerSelect = (selectedValue: number) => {
    if (feedback !== null) return;
    
    setSelectedAnswer(selectedValue);
    
    const isCorrect = selectedValue === problems[currentProblemIndex].answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Move to next problem after a delay
    setTimeout(() => {
      setSelectedAnswer(null);
      setFeedback(null);
      setCurrentProblemIndex(prev => prev + 1);
    }, 1500);
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
      case "addition": return "Събиране";
      case "subtraction": return "Изваждане";
      case "multiplication": return "Умножение";
      default: return "Математика";
    }
  };

  // If problems are still loading
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-medium">Зареждане на играта...</h2>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex justify-between w-full mb-4">
        <div className="flex gap-4">
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Време: {formatTime(timeLeft)}
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Задача: {currentProblemIndex + 1}/{problems.length}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          setCurrentProblemIndex(0);
          setSelectedAnswer(null);
          setFeedback(null);
          setTimeLeft(level.timeLimit);
          
          // Regenerate problems
          const problemCount = level.difficultyId === "easy" ? 5 : 
                               level.difficultyId === "medium" ? 8 : 10;
          
          const mathProblems = generateMathProblems(level.themeId, level.difficultyId, problemCount);
          setProblems(mathProblems);
        }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Започни отначало
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg mb-6">
        <div className="text-3xl font-bold text-center mb-6">
          {currentProblem.question}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentProblem.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`p-4 text-xl rounded-lg transition-all duration-200 ${
                selectedAnswer === option
                  ? feedback === "correct"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              disabled={feedback !== null}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className={`mt-4 p-3 rounded-md text-white ${
          feedback === "correct" ? "bg-green-500" : "bg-red-500"
        }`}>
          {feedback === "correct" ? (
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-2" />
              Правилно!
            </div>
          ) : (
            <div>
              Грешно! Правилният отговор е {currentProblem.answer}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
