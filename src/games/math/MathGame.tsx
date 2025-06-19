import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GameLevel } from "@/types";
import { Check, RefreshCw } from "lucide-react";
import { useGameTimer } from "@/hooks/useGameTimer";
import { TimeUpScreen } from "@/components/TimeUpScreen";

interface MathGameProps {
  level: GameLevel;
  onComplete: (score?: number) => void;
  onTimeUp: () => void;
}

// Generate math problems based on theme and difficulty
const generateMathProblems = (themeId: string, difficultyId: string, count: number) => {
  const problems: { question: string; answer: number; options: number[] }[] = [];
  
  // Helper function to evaluate expressions with parentheses
  const evaluateExpression = (expr: string): number => {
    // Remove spaces for easier parsing
    expr = expr.replace(/\s/g, '');
    
    // Handle parentheses recursively
    while (expr.includes('(')) {
      expr = expr.replace(/\([^()]+\)/g, (match) => {
        const innerExpr = match.slice(1, -1);
        return evaluateExpression(innerExpr).toString();
      });
    }
    
    // Split by + and - while keeping the operators
    const tokens = expr.split(/([+-])/).filter(t => t);
    
    let result = parseInt(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i];
      const value = parseInt(tokens[i + 1]);
      
      if (operator === '+') {
        result += value;
      } else if (operator === '-') {
        result -= value;
      }
    }
    
    return result;
  };
  
  for (let i = 0; i < count; i++) {
    let answer, question;
    
    // Adjust number range based on difficulty
    const maxNum = difficultyId === "easy" ? 10 : 
                  difficultyId === "medium" ? 20 : 50;
    
    if (themeId === "addition") {
      if (difficultyId === "easy") {
        // Easy: 2-3 numbers, no parentheses
        const numCount = Math.random() < 0.5 ? 2 : 3;
        const numbers = Array(numCount).fill(0).map(() => Math.floor(Math.random() * maxNum) + 1);
        question = numbers.join(' + ') + ' = ?';
        answer = numbers.reduce((a, b) => a + b, 0);
      } else if (difficultyId === "medium") {
        // Medium: 3-4 numbers, sometimes with parentheses
        const numCount = Math.random() < 0.5 ? 3 : 4;
        const numbers = Array(numCount).fill(0).map(() => Math.floor(Math.random() * maxNum) + 1);
        
        if (Math.random() < 0.5 && numCount >= 3) {
          // Add parentheses around first two or last two numbers
          if (Math.random() < 0.5) {
            question = `(${numbers[0]} + ${numbers[1]}) + ${numbers.slice(2).join(' + ')} = ?`;
          } else {
            const lastTwo = numbers.slice(-2);
            const rest = numbers.slice(0, -2);
            question = `${rest.join(' + ')} + (${lastTwo.join(' + ')}) = ?`;
          }
        } else {
          question = numbers.join(' + ') + ' = ?';
        }
        answer = numbers.reduce((a, b) => a + b, 0);
      } else {
        // Hard: 4-5 numbers with nested parentheses
        const numCount = Math.random() < 0.3 ? 4 : 5;
        const numbers = Array(numCount).fill(0).map(() => Math.floor(Math.random() * maxNum) + 1);
        
        // Create more complex patterns
        const patterns = [
          () => `((${numbers[0]} + ${numbers[1]}) + ${numbers[2]}) + ${numbers.slice(3).join(' + ')}`,
          () => `(${numbers[0]} + ${numbers[1]}) + (${numbers[2]} + ${numbers[3]})${numbers[4] ? ' + ' + numbers[4] : ''}`,
          () => `${numbers[0]} + ((${numbers[1]} + ${numbers[2]}) + ${numbers[3]})${numbers[4] ? ' + ' + numbers[4] : ''}`,
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        question = pattern() + ' = ?';
        answer = numbers.reduce((a, b) => a + b, 0);
      }
    } else if (themeId === "subtraction") {
      if (difficultyId === "easy") {
        // Easy: 2-3 numbers, ensure positive result
        const num1 = Math.floor(Math.random() * maxNum) + maxNum;
        const num2 = Math.floor(Math.random() * (maxNum/2)) + 1;
        
        if (Math.random() < 0.7) {
          // Simple subtraction
          answer = num1 - num2;
          question = `${num1} - ${num2} = ?`;
        } else {
          // Three numbers
          const num3 = Math.floor(Math.random() * (maxNum/3)) + 1;
          answer = num1 - num2 - num3;
          question = `${num1} - ${num2} - ${num3} = ?`;
        }
      } else if (difficultyId === "medium") {
        // Medium: Mixed operations with parentheses
        const num1 = Math.floor(Math.random() * maxNum) + maxNum * 2;
        const num2 = Math.floor(Math.random() * maxNum) + 1;
        const num3 = Math.floor(Math.random() * maxNum) + 1;
        
        const patterns = [
          () => {
            const expr = `${num1} - (${num2} + ${num3})`;
            return { expr, ans: num1 - (num2 + num3) };
          },
          () => {
            const expr = `(${num1} - ${num2}) - ${num3}`;
            return { expr, ans: (num1 - num2) - num3 };
          },
          () => {
            const num4 = Math.floor(Math.random() * (maxNum/2)) + 1;
            const expr = `${num1} - ${num2} - ${num3} + ${num4}`;
            return { expr, ans: num1 - num2 - num3 + num4 };
          }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)]();
        question = pattern.expr + ' = ?';
        answer = pattern.ans;
      } else {
        // Hard: Complex mixed operations
        const baseNum = Math.floor(Math.random() * maxNum) + maxNum * 3;
        const nums = Array(4).fill(0).map(() => Math.floor(Math.random() * maxNum) + 1);
        
        const patterns = [
          () => {
            const expr = `${baseNum} - ((${nums[0]} + ${nums[1]}) - ${nums[2]})`;
            return { expr, ans: evaluateExpression(expr) };
          },
          () => {
            const expr = `(${baseNum} - ${nums[0]}) - (${nums[1]} + ${nums[2]})`;
            return { expr, ans: evaluateExpression(expr) };
          },
          () => {
            const expr = `${baseNum} - ${nums[0]} - (${nums[1]} - ${nums[2]}) + ${nums[3]}`;
            return { expr, ans: evaluateExpression(expr) };
          }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)]();
        question = pattern.expr + ' = ?';
        answer = pattern.ans;
      }
    } else if (themeId === "multiplication") {
      const factor = difficultyId === "easy" ? 5 : 
                    difficultyId === "medium" ? 10 : 20;
      const num1 = Math.floor(Math.random() * factor) + 1;
      const num2 = Math.floor(Math.random() * factor) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
    } else {
      // Default to addition
      const num1 = Math.floor(Math.random() * maxNum) + 1;
      const num2 = Math.floor(Math.random() * maxNum) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
    }
    
    // Generate answer options (including the correct one)
    const options = [answer];
    
    // Generate more realistic wrong answers based on common mistakes
    const generateWrongAnswers = () => {
      const wrongAnswers: number[] = [];
      
      // Common mistakes for complex expressions
      if (question.includes('(')) {
        // Mistake: ignoring parentheses
        const noParenExpr = question.replace(/[()]/g, '').replace(' = ?', '');
        const wrongAnswer1 = evaluateExpression(noParenExpr);
        if (wrongAnswer1 !== answer && !options.includes(wrongAnswer1)) {
          wrongAnswers.push(wrongAnswer1);
        }
      }
      
      // Close values
      for (let offset of [-1, 1, -2, 2, -5, 5, -10, 10]) {
        const wrongAnswer = answer + offset;
        if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          wrongAnswers.push(wrongAnswer);
        }
      }
      
      // Common calculation errors
      if (themeId === "addition") {
        wrongAnswers.push(answer - 1, answer + 1, answer - 10, answer + 10);
      } else if (themeId === "subtraction") {
        wrongAnswers.push(Math.abs(answer - 1), Math.abs(answer + 1));
      }
      
      return wrongAnswers.filter(w => w > 0 && w !== answer && !options.includes(w));
    };
    
    const wrongAnswers = generateWrongAnswers();
    
    // Add wrong answers to options
    while (options.length < 4 && wrongAnswers.length > 0) {
      const randomIndex = Math.floor(Math.random() * wrongAnswers.length);
      const wrongAnswer = wrongAnswers.splice(randomIndex, 1)[0];
      
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // If still need more options, generate random ones
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 20) + 1;
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
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  
  // Use the game timer hook
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, resetTimer } = useGameTimer({
    initialTime: level.timeLimit,
    onTimeUp
  });
  
  // Initialize the game immediately
  useEffect(() => {
    // Number of problems based on difficulty
    const problemCount = level.difficultyId === "easy" ? 5 : 
                        level.difficultyId === "medium" ? 8 : 10;
    
    const mathProblems = generateMathProblems(level.themeId, level.difficultyId, problemCount);
    setProblems(mathProblems);
  }, [level.themeId, level.difficultyId]);

  // Timer is handled by the useGameTimer hook

  // Check game completion
  useEffect(() => {
    if (problems.length > 0 && currentProblemIndex >= problems.length) {
      // Game completed - calculate score
      const baseScore = 100;
      const accuracyBonus = Math.round((correctAnswers / problems.length) * 200); // Up to 200 points for 100% accuracy
      const timeBonus = Math.max(0, timeLeft * 3); // 3 points per second remaining
      
      const totalScore = baseScore + accuracyBonus + timeBonus;
      
      onComplete(totalScore);
    }
  }, [currentProblemIndex, problems.length, onComplete, correctAnswers, timeLeft]);

  const handleAnswerSelect = (selectedValue: number) => {
    if (feedback !== null) return;
    
    // Start timer on first answer
    startTimer();
    
    setSelectedAnswer(selectedValue);
    
    const isCorrect = selectedValue === problems[currentProblemIndex].answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      // Correct answer
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

  const handleReset = () => {
    setCurrentProblemIndex(0);
    setSelectedAnswer(null);
    setFeedback(null);
    resetTimer();
    setCorrectAnswers(0);
    
    // Regenerate problems
    const problemCount = level.difficultyId === "easy" ? 5 : 
                         level.difficultyId === "medium" ? 8 : 10;
    
    const mathProblems = generateMathProblems(level.themeId, level.difficultyId, problemCount);
    setProblems(mathProblems);
  };

  return (
    <>
      {showTimeUpScreen && (
        <TimeUpScreen 
          onReset={handleReset}
        />
      )}
      
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex justify-between w-full mb-4">
        <div className="flex gap-4">
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Време: {hasStarted ? formatTime(timeLeft) : formatTime(timeLeft) + " (чакам първи отговор)"}
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Задача: {currentProblemIndex + 1}/{problems.length}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Започни отначало
        </Button>
        
        {/* Test button for development */}
        <Button
          onClick={() => {
            const testScore = 350 + Math.floor(Math.random() * 150);
            onComplete(testScore);
          }}
          className="bg-purple-500 hover:bg-purple-600 text-white ml-2"
          size="sm"
        >
          🧪 Test: Complete (~450)
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
    </>
  );
};
