import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameLevel } from "@/types";
import { Check, RefreshCw, X, Trophy, Home } from "lucide-react";
import { useGameTimer } from "@/hooks/useGameTimer";
import { TimeUpScreen } from "@/components/TimeUpScreen";

interface MathGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
  currentTeam?: any;
  onPlayerTurn?: (playerId: string) => void;
}

interface MathProblem {
  equation: string;
  blanks: { id: string; position: number; correctValue: string; type: 'number' | 'operator' }[];
  options: string[];
  correctAnswer: number;
}

interface DragItem {
  id: string;
  value: string;
  isUsed: boolean;
}

interface TouchState {
  isDragging: boolean;
  draggedItemId: string | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  draggedElement: HTMLElement | null;
}

// Generate math problems based on selected operations
const generateMathProblems = (selectedOperations: string[], count: number, difficultyId: string = "medium"): MathProblem[] => {
  const problems: MathProblem[] = [];
  
  // Map theme IDs to operation symbols
  const operationMap: { [key: string]: string } = {
    addition: "+",
    subtraction: "-", 
    multiplication: "×",
    division: "÷"
  };
  
  // Get available operations
  const availableOps = selectedOperations.map(op => operationMap[op]).filter(Boolean);
  
  // If no operations selected, default to addition
  if (availableOps.length === 0) {
    availableOps.push("+");
  }
  
  for (let i = 0; i < count; i++) {
    let equation = "";
    let blanks: { id: string; position: number; correctValue: string; type: 'number' | 'operator' }[] = [];
    let options: string[] = [];
    let correctAnswer = 0;
    
    // Choose complexity level for this problem (2-3 operations in equation)
    const complexityLevel = difficultyId === "hard" ? 
      (Math.random() < 0.3 ? 3 : 4) : // Hard: 3-4 operations for long equations
      (Math.random() < 0.6 ? 2 : 3); // Other: 2-3 operations
    const problemType = Math.floor(Math.random() * 4); // 4 different problem types
    
    if (complexityLevel === 2) {
      // Two-operation problems - Always include multiple blanks
      if (problemType === 0) {
        // Type: __ + __ = 12 (missing both numbers)
        const op = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, result] = generateTwoNumberOperation(op);
        
        equation = `BLANK_0 ${op} BLANK_1 = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 2, correctValue: num2.toString(), type: 'number' }
        ];
        options = [num1.toString(), num2.toString()];
        correctAnswer = result;
        
      } else if (problemType === 1) {
        // Type: __ __ 3 = 5 (missing number and operator)
        const op = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, result] = generateTwoNumberOperation(op);
        
        equation = `BLANK_0 BLANK_1 ${num2} = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 1, correctValue: op, type: 'operator' }
        ];
        options = [num1.toString(), op];
        correctAnswer = result;
        
      } else if (problemType === 2) {
        // Type: 7 __ __ = 15 (missing operator and second number)
        const op = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, result] = generateTwoNumberOperation(op);
        
        equation = `${num1} BLANK_0 BLANK_1 = ${result}`;
        blanks = [
          { id: "blank_0", position: 1, correctValue: op, type: 'operator' },
          { id: "blank_1", position: 2, correctValue: num2.toString(), type: 'number' }
        ];
        options = [op, num2.toString()];
        correctAnswer = result;
        
      } else {
        // Type: __ __ __ = __ (missing everything except result)
        const op = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, result] = generateTwoNumberOperation(op);
        
        equation = `BLANK_0 BLANK_1 BLANK_2 = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 1, correctValue: op, type: 'operator' },
          { id: "blank_2", position: 2, correctValue: num2.toString(), type: 'number' }
        ];
        options = [num1.toString(), op, num2.toString()];
        correctAnswer = result;
      }
    } else if (complexityLevel === 3) {
      // Three-operation problems - Always multiple blanks
      if (problemType === 0) {
        // Type: __ __ 5 __ 2 = 8 (missing first number, first operator, second operator)
        const op1 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const op2 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, num3, result] = generateThreeNumberOperation(op1, op2);
        
        equation = `BLANK_0 BLANK_1 ${num2} BLANK_2 ${num3} = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 1, correctValue: op1, type: 'operator' },
          { id: "blank_2", position: 3, correctValue: op2, type: 'operator' }
        ];
        options = [num1.toString(), op1, op2];
        correctAnswer = result;
        
      } else if (problemType === 1) {
        // Type: __ + __ __ 2 = 9 (missing first number, second number, second operator)
        const op1 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const op2 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, num3, result] = generateThreeNumberOperation(op1, op2);
        
        equation = `BLANK_0 ${op1} BLANK_1 BLANK_2 ${num3} = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 2, correctValue: num2.toString(), type: 'number' },
          { id: "blank_2", position: 3, correctValue: op2, type: 'operator' }
        ];
        options = [num1.toString(), num2.toString(), op2];
        correctAnswer = result;
        
      } else if (problemType === 2) {
        // Type: 12 __ __ __ 5 = 10 (missing both operators and middle number)
        const op1 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const op2 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, num3, result] = generateThreeNumberOperation(op1, op2);
        
        equation = `${num1} BLANK_0 BLANK_1 BLANK_2 ${num3} = ${result}`;
        blanks = [
          { id: "blank_0", position: 1, correctValue: op1, type: 'operator' },
          { id: "blank_1", position: 2, correctValue: num2.toString(), type: 'number' },
          { id: "blank_2", position: 3, correctValue: op2, type: 'operator' }
        ];
        options = [op1, num2.toString(), op2];
        correctAnswer = result;
        
      } else {
        // Type: __ __ __ __ __ = __ (almost everything missing)
        const op1 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const op2 = availableOps[Math.floor(Math.random() * availableOps.length)];
        const [num1, num2, num3, result] = generateThreeNumberOperation(op1, op2);
        
        equation = `BLANK_0 BLANK_1 BLANK_2 BLANK_3 ${num3} = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 1, correctValue: op1, type: 'operator' },
          { id: "blank_2", position: 2, correctValue: num2.toString(), type: 'number' },
          { id: "blank_3", position: 3, correctValue: op2, type: 'operator' }
        ];
        options = [num1.toString(), op1, num2.toString(), op2];
        correctAnswer = result;
      }
    } else {
      // Four-operation problems - Maximum blanks for very long equations
      const op1 = availableOps[Math.floor(Math.random() * availableOps.length)];
      const op2 = availableOps[Math.floor(Math.random() * availableOps.length)];
      const op3 = availableOps[Math.floor(Math.random() * availableOps.length)];
      const [num1, num2, num3, num4, result] = generateFourNumberOperation(op1, op2, op3);
      
      if (problemType === 0) {
        // Type: __ __ 5 __ 2 __ 3 = 18 (missing numbers and operators)
        equation = `BLANK_0 BLANK_1 ${num2} BLANK_2 ${num3} BLANK_3 ${num4} = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 1, correctValue: op1, type: 'operator' },
          { id: "blank_2", position: 3, correctValue: op2, type: 'operator' },
          { id: "blank_3", position: 5, correctValue: op3, type: 'operator' }
        ];
        options = [num1.toString(), op1, op2, op3];
        correctAnswer = result;
      } else if (problemType === 1) {
        // Type: __ + __ __ __ × __ = 36 (missing most numbers and one operator)
        equation = `BLANK_0 ${op1} BLANK_1 BLANK_2 BLANK_3 ${op3} ${num4} = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 2, correctValue: num2.toString(), type: 'number' },
          { id: "blank_2", position: 3, correctValue: op2, type: 'operator' },
          { id: "blank_3", position: 4, correctValue: num3.toString(), type: 'number' }
        ];
        options = [num1.toString(), num2.toString(), op2, num3.toString()];
        correctAnswer = result;
      } else if (problemType === 2) {
        // Type: Maximum blanks - almost entire equation missing
        equation = `BLANK_0 BLANK_1 BLANK_2 BLANK_3 BLANK_4 BLANK_5 ${num4} = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 1, correctValue: op1, type: 'operator' },
          { id: "blank_2", position: 2, correctValue: num2.toString(), type: 'number' },
          { id: "blank_3", position: 3, correctValue: op2, type: 'operator' },
          { id: "blank_4", position: 4, correctValue: num3.toString(), type: 'number' },
          { id: "blank_5", position: 5, correctValue: op3, type: 'operator' }
        ];
        options = [num1.toString(), op1, num2.toString(), op2, num3.toString(), op3];
        correctAnswer = result;
      } else {
        // Type: Strategic blanks - some numbers and operators missing
        equation = `BLANK_0 ${op1} BLANK_1 BLANK_2 BLANK_3 ${op3} BLANK_4 = ${result}`;
        blanks = [
          { id: "blank_0", position: 0, correctValue: num1.toString(), type: 'number' },
          { id: "blank_1", position: 2, correctValue: num2.toString(), type: 'number' },
          { id: "blank_2", position: 3, correctValue: op2, type: 'operator' },
          { id: "blank_3", position: 4, correctValue: num3.toString(), type: 'number' },
          { id: "blank_4", position: 6, correctValue: num4.toString(), type: 'number' }
        ];
        options = [num1.toString(), num2.toString(), op2, num3.toString(), num4.toString()];
        correctAnswer = result;
      }
    }
    
    // Generate additional wrong options to make it challenging
    const wrongNumbers: string[] = [];
    const wrongOperators: string[] = [];
    
    blanks.forEach(blank => {
      if (blank.type === 'number') {
        const correctNum = parseInt(blank.correctValue);
        // Add some wrong numbers
        for (let offset of [-1, 1, -2, 2, -3, 3, -5, 5]) {
          const wrongNum = correctNum + offset;
          if (wrongNum > 0 && wrongNum !== correctNum && !options.includes(wrongNum.toString())) {
            wrongNumbers.push(wrongNum.toString());
          }
        }
      } else if (blank.type === 'operator') {
        // Add wrong operators from available operations
        availableOps.forEach(op => {
          if (op !== blank.correctValue && !options.includes(op)) {
            wrongOperators.push(op);
          }
        });
      }
    });
    
    // Add wrong number options (2-4 additional)
    const numWrongNumbers = Math.min(4, wrongNumbers.length);
    for (let j = 0; j < numWrongNumbers; j++) {
      if (wrongNumbers.length > 0) {
        const randomIndex = Math.floor(Math.random() * wrongNumbers.length);
        const wrongOption = wrongNumbers.splice(randomIndex, 1)[0];
        options.push(wrongOption);
      }
    }
    
    // Always add available operators as options
    availableOps.forEach(op => {
      if (!options.includes(op)) {
        options.push(op);
      }
    });
    
    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    
    problems.push({
      equation,
      blanks,
      options,
      correctAnswer
    });
  }
  
  return problems;
};

// Helper function to generate valid two-number operations
const generateTwoNumberOperation = (operation: string): [number, number, number] => {
  let num1: number, num2: number, result: number;
  
  switch (operation) {
    case "+":
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      result = num1 + num2;
      break;
      
    case "-":
      result = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * result) + 1;
      num1 = result + num2;
      break;
      
    case "×":
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      result = num1 * num2;
      break;
      
    case "÷":
      num2 = Math.floor(Math.random() * 10) + 2; // divisor 2-11
      result = Math.floor(Math.random() * 15) + 1; // result 1-15
      num1 = num2 * result; // ensure clean division
      break;
      
    default:
      num1 = 5;
      num2 = 3;
      result = 8;
  }
  
  return [num1, num2, result];
};

// Helper function to evaluate expression following order of operations
const evaluateExpression = (num1: number, op1: string, num2: number, op2?: string, num3?: number): number => {
  // Convert symbols to operators for calculation
  const convertOp = (op: string) => {
    switch (op) {
      case "×": return "*";
      case "÷": return "/";
      default: return op;
    }
  };
  
  if (op2 === undefined || num3 === undefined) {
    // Simple two-number operation
    const operator = convertOp(op1);
    switch (operator) {
      case "+": return num1 + num2;
      case "-": return num1 - num2;
      case "*": return num1 * num2;
      case "/": return num1 / num2;
      default: return 0;
    }
  }
  
  // Three-number operation with proper order of operations
  const firstOp = convertOp(op1);
  const secondOp = convertOp(op2);
  
  // Check if we need to prioritize multiplication/division
  if ((secondOp === "*" || secondOp === "/") && (firstOp === "+" || firstOp === "-")) {
    // Do the multiplication/division first
    let rightResult: number;
    switch (secondOp) {
      case "*": rightResult = num2 * num3; break;
      case "/": rightResult = num2 / num3; break;
      default: rightResult = num2;
    }
    
    // Then apply the left operation
    switch (firstOp) {
      case "+": return num1 + rightResult;
      case "-": return num1 - rightResult;
      default: return 0;
    }
  } else {
    // Left to right evaluation (same precedence or left has higher precedence)
    let leftResult: number;
    switch (firstOp) {
      case "+": leftResult = num1 + num2; break;
      case "-": leftResult = num1 - num2; break;
      case "*": leftResult = num1 * num2; break;
      case "/": leftResult = num1 / num2; break;
      default: leftResult = num1;
    }
    
    switch (secondOp) {
      case "+": return leftResult + num3;
      case "-": return leftResult - num3;
      case "*": return leftResult * num3;
      case "/": return leftResult / num3;
      default: return leftResult;
    }
  }
};

// Helper function to generate valid three-number operations
const generateThreeNumberOperation = (op1: string, op2: string): [number, number, number, number] => {
  let num1: number, num2: number, num3: number, result: number;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    // Generate base numbers
    num1 = Math.floor(Math.random() * 15) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    num3 = Math.floor(Math.random() * 10) + 1;
    
    // Special handling for division to ensure clean results
    if (op1 === "÷") {
      result = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * result;
    }
    if (op2 === "÷") {
      // Make sure num2 divides evenly
      const divisors = [2, 3, 4, 5, 6];
      num3 = divisors[Math.floor(Math.random() * divisors.length)];
      num2 = num3 * (Math.floor(Math.random() * 8) + 1);
    }
    
    result = evaluateExpression(num1, op1, num2, op2, num3);
    attempts++;
  } while ((result <= 0 || result !== Math.round(result) || result > 100) && attempts < maxAttempts);
  
  // Fallback to ensure we always return valid numbers
  if (result <= 0 || result !== Math.round(result) || result > 100) {
    num1 = 10;
    num2 = 2;
    num3 = 3;
    result = evaluateExpression(num1, op1, num2, op2, num3);
  }
  
  return [num1, num2, num3, Math.round(result)];
};

// Helper function to evaluate four-number expression following order of operations
const evaluateFourNumberExpression = (num1: number, op1: string, num2: number, op2: string, num3: number, op3: string, num4: number): number => {
  // Convert symbols to operators for calculation
  const convertOp = (op: string) => {
    switch (op) {
      case "×": return "*";
      case "÷": return "/";
      default: return op;
    }
  };
  
  const ops = [convertOp(op1), convertOp(op2), convertOp(op3)];
  const nums = [num1, num2, num3, num4];
  
  // Create a copy to work with
  let values = [...nums];
  let operators = [...ops];
  
  // First pass: handle multiplication and division (left to right)
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === "*" || operators[i] === "/") {
      let result: number;
      if (operators[i] === "*") {
        result = values[i] * values[i + 1];
      } else {
        result = values[i] / values[i + 1];
      }
      
      // Replace the two numbers with the result
      values.splice(i, 2, result);
      operators.splice(i, 1);
      i--; // Adjust index since we removed elements
    }
  }
  
  // Second pass: handle addition and subtraction (left to right)
  for (let i = 0; i < operators.length; i++) {
    let result: number;
    if (operators[i] === "+") {
      result = values[i] + values[i + 1];
    } else {
      result = values[i] - values[i + 1];
    }
    
    // Replace the two numbers with the result
    values.splice(i, 2, result);
    operators.splice(i, 1);
    i--; // Adjust index since we removed elements
  }
  
  return values[0];
};

// Helper function to generate valid four-number operations
const generateFourNumberOperation = (op1: string, op2: string, op3: string): [number, number, number, number, number] => {
  let num1: number, num2: number, num3: number, num4: number, result: number;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    // Generate base numbers
    num1 = Math.floor(Math.random() * 12) + 1;
    num2 = Math.floor(Math.random() * 8) + 1;
    num3 = Math.floor(Math.random() * 8) + 1;
    num4 = Math.floor(Math.random() * 8) + 1;
    
    // Special handling for division to ensure clean results
    if (op1 === "÷") {
      result = Math.floor(Math.random() * 8) + 1;
      num1 = num2 * result;
    }
    if (op2 === "÷") {
      const divisors = [2, 3, 4, 5];
      num3 = divisors[Math.floor(Math.random() * divisors.length)];
      num2 = num3 * (Math.floor(Math.random() * 6) + 1);
    }
    if (op3 === "÷") {
      const divisors = [2, 3, 4, 5];
      num4 = divisors[Math.floor(Math.random() * divisors.length)];
      num3 = num4 * (Math.floor(Math.random() * 6) + 1);
    }
    
    result = evaluateFourNumberExpression(num1, op1, num2, op2, num3, op3, num4);
    attempts++;
  } while ((result <= 0 || result !== Math.round(result) || result > 100) && attempts < maxAttempts);
  
  // Fallback to ensure we always return valid numbers
  if (result <= 0 || result !== Math.round(result) || result > 100) {
    num1 = 12;
    num2 = 3;
    num3 = 2;
    num4 = 1;
    result = evaluateFourNumberExpression(num1, op1, num2, op2, num3, op3, num4);
  }
  
  return [num1, num2, num3, num4, Math.round(result)];
};

export const MathGame: React.FC<MathGameProps> = ({ level, onComplete, onTimeUp, currentTeam, onPlayerTurn }) => {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [droppedItems, setDroppedItems] = useState<{ [blankId: string]: string }>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    draggedItemId: null,
    startPosition: null,
    currentPosition: null,
    draggedElement: null
  });
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const dropZoneRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Use the game timer hook
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, resetTimer } = useGameTimer({
    initialTime: level.timeLimit,
    onTimeUp
  });
  
  // Initialize the game
  useEffect(() => {
    // Extract selected operations from level.themeId (could be comma-separated)
    const selectedOperations = level.themeId.split(',').map(s => s.trim());
    
    // Generate 8 problems (medium complexity)
    const problemCount = 8;
    const mathProblems = generateMathProblems(selectedOperations, problemCount, level.difficultyId);
    setProblems(mathProblems);
  }, [level.themeId]);

  // Set up drag items when problem changes
  useEffect(() => {
    if (problems.length > 0 && currentProblemIndex < problems.length) {
      const currentProblem = problems[currentProblemIndex];
      const items: DragItem[] = currentProblem.options.map((option, index) => ({
        id: `option_${index}`,
        value: option,
        isUsed: false
      }));
      setDragItems(items);
      setDroppedItems({});
      setFeedback(null);
    }
  }, [problems, currentProblemIndex]);

  // Check game completion
  useEffect(() => {
    if (problems.length > 0 && currentProblemIndex >= problems.length && !showCompletionScreen) {
      console.log("Game completed! Current index:", currentProblemIndex, "Problems length:", problems.length);
      
      // In competitive mode, just call onComplete to switch teams
      if (currentTeam) {
        onComplete();
      } else {
        // In regular mode, show completion screen
        setShowCompletionScreen(true);
        setCountdown(3);
      }
    }
  }, [currentProblemIndex, problems.length, showCompletionScreen, currentTeam, onComplete]);

  // Handle countdown and navigation after completion
  useEffect(() => {
    if (showCompletionScreen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (showCompletionScreen && countdown === 0) {
      // Navigate to home screen
      window.location.href = '/';
    }
  }, [showCompletionScreen, countdown]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.setData('text/plain', itemId);
    
    if (!hasStarted) {
      startTimer();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, blankId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    const draggedItemData = dragItems.find(item => item.id === itemId);
    
    if (draggedItemData && !draggedItemData.isUsed) {
      // If there's already an item in this blank, return it to available items
      const existingValue = droppedItems[blankId];
      if (existingValue) {
        setDragItems(prev => prev.map(item => 
          item.value === existingValue ? { ...item, isUsed: false } : item
        ));
      }
      
      setDroppedItems(prev => ({ ...prev, [blankId]: draggedItemData.value }));
      setDragItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isUsed: true } : item
      ));
    }
    
    setDraggedItem(null);
  };

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = e.currentTarget as HTMLElement;
    
    setTouchState({
      isDragging: true,
      draggedItemId: itemId,
      startPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY },
      draggedElement: element
    });
    
    setDraggedItem(itemId);
    
    if (!hasStarted) {
    startTimer();
    }
    
    element.style.transform = 'scale(1.1)';
    element.style.zIndex = '1000';
    element.style.pointerEvents = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!touchState.isDragging || !touchState.draggedElement) return;
    
    const touch = e.touches[0];
    const newPosition = { x: touch.clientX, y: touch.clientY };
    
    setTouchState(prev => ({
      ...prev,
      currentPosition: newPosition
    }));
    
    if (touchState.startPosition) {
      const deltaX = newPosition.x - touchState.startPosition.x;
      const deltaY = newPosition.y - touchState.startPosition.y;
      
      touchState.draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
    }
    
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    Object.values(dropZoneRefs.current).forEach(dropZone => {
      if (dropZone) {
        dropZone.classList.remove('touch-hover');
      }
    });
    
    if (elementBelow) {
      const dropZone = elementBelow.closest('[data-drop-zone]') as HTMLElement;
      if (dropZone) {
        dropZone.classList.add('touch-hover');
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (!touchState.isDragging || !touchState.currentPosition || !touchState.draggedElement) {
      resetTouchState();
      return;
    }
    
    const elementBelow = document.elementFromPoint(
      touchState.currentPosition.x, 
      touchState.currentPosition.y
    );
    
    const dropZone = elementBelow?.closest('[data-drop-zone]') as HTMLElement;
    
          if (dropZone && touchState.draggedItemId) {
        const blankId = dropZone.getAttribute('data-drop-zone');
        const draggedItemData = dragItems.find(item => item.id === touchState.draggedItemId);
        
        if (draggedItemData && !draggedItemData.isUsed && blankId) {
          // If there's already an item in this blank, return it to available items
          const existingValue = droppedItems[blankId];
          if (existingValue) {
            setDragItems(prev => prev.map(item => 
              item.value === existingValue ? { ...item, isUsed: false } : item
            ));
          }
          
          setDroppedItems(prev => ({ ...prev, [blankId]: draggedItemData.value }));
          setDragItems(prev => prev.map(item => 
            item.id === touchState.draggedItemId ? { ...item, isUsed: true } : item
          ));
          
          dropZone.classList.add('drop-success');
          setTimeout(() => {
            dropZone.classList.remove('drop-success');
          }, 300);
        }
      }
    
    resetTouchState();
  };

  const resetTouchState = () => {
    if (touchState.draggedElement) {
      touchState.draggedElement.style.transform = '';
      touchState.draggedElement.style.zIndex = '';
      touchState.draggedElement.style.pointerEvents = '';
    }
    
    Object.values(dropZoneRefs.current).forEach(dropZone => {
      if (dropZone) {
        dropZone.classList.remove('touch-hover', 'drop-success');
      }
    });
    
    setTouchState({
      isDragging: false,
      draggedItemId: null,
      startPosition: null,
      currentPosition: null,
      draggedElement: null
    });
    
    setDraggedItem(null);
  };

  const handleRemoveItem = (blankId: string) => {
    const removedValue = droppedItems[blankId];
    if (removedValue) {
      // Return the item to available items
      setDragItems(prev => prev.map(item => 
        item.value === removedValue ? { ...item, isUsed: false } : item
      ));
      
      // Remove from dropped items
      setDroppedItems(prev => {
        const newDroppedItems = { ...prev };
        delete newDroppedItems[blankId];
        return newDroppedItems;
      });
    }
  };

  const checkAnswer = () => {
    if (problems.length === 0 || currentProblemIndex >= problems.length) return;
    
    const currentProblem = problems[currentProblemIndex];
    let isCorrect = true;
    
    for (const blank of currentProblem.blanks) {
      if (droppedItems[blank.id] !== blank.correctValue) {
        isCorrect = false;
        break;
      }
    }
    
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    setTimeout(() => {
      setCurrentProblemIndex(prev => prev + 1);
      
      // In competitive mode, switch to next player after each correct equation
      if (currentTeam && onPlayerTurn && isCorrect) {
        const nextPlayerIndex = (currentPlayerIndex + 1) % currentTeam.players.length;
        setCurrentPlayerIndex(nextPlayerIndex);
        onPlayerTurn(currentTeam.players[nextPlayerIndex].id);
      }
    }, 1500);
  };

  const renderEquation = (equation: string, blanks: MathProblem['blanks']) => {
    let parts = equation.split(/BLANK_\d+/);
    let result: React.ReactNode[] = [];
    
    parts.forEach((part, index) => {
      result.push(<span key={`part_${index}`}>{part}</span>);
      
      if (index < blanks.length) {
        const blank = blanks[index];
        const droppedValue = droppedItems[blank.id];
        
        result.push(
          <div
            key={blank.id}
            ref={(el) => { dropZoneRefs.current[blank.id] = el; }}
            data-drop-zone={blank.id}
            className={`inline-flex items-center justify-center w-16 h-12 mx-1 border-2 border-dashed rounded-md transition-all touch-drop-zone align-middle ${
              droppedValue 
                ? feedback === "correct" 
                  ? "bg-green-100 border-green-400" 
                  : feedback === "incorrect"
                  ? "bg-red-100 border-red-400"
                  : "bg-blue-100 border-blue-400 cursor-pointer hover:bg-blue-200"
                : "border-gray-400 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
            }`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, blank.id)}
            onClick={() => droppedValue && feedback === null && handleRemoveItem(blank.id)}
            style={{ 
              minHeight: '3rem', 
              minWidth: '4rem',
              verticalAlign: 'middle',
              display: 'inline-flex'
            }}
          >
            {droppedValue && (
              <div className="relative flex items-center justify-center">
                <span className="text-2xl font-semibold leading-none">{droppedValue}</span>
                {feedback === null && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-70 hover:opacity-100 transition-opacity">
                    ×
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    });
    
    return result;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setCurrentProblemIndex(0);
    setDragItems([]);
    setDroppedItems({});
    setFeedback(null);
    setShowCompletionScreen(false);
    setCountdown(3);
    setCurrentPlayerIndex(0);
    resetTimer();
    setCorrectAnswers(0);
    
    const selectedOperations = level.themeId.split(',').map(s => s.trim());
    const mathProblems = generateMathProblems(selectedOperations, 8, level.difficultyId);
    setProblems(mathProblems);
  };

  const handleSolve = () => {
    if (problems.length === 0 || currentProblemIndex >= problems.length) return;
    
    const currentProblem = problems[currentProblemIndex];
    const newDroppedItems: { [blankId: string]: string } = {};
    
    // Auto-fill all blanks with correct answers
    currentProblem.blanks.forEach(blank => {
      newDroppedItems[blank.id] = blank.correctValue;
    });
    
    // Mark all required items as used
    setDragItems(prev => prev.map(item => {
      const isNeeded = currentProblem.blanks.some(blank => blank.correctValue === item.value);
      return { ...item, isUsed: isNeeded };
    }));
    
    setDroppedItems(newDroppedItems);
    
    if (!hasStarted) {
      startTimer();
    }
  };

  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-medium">Зареждане на играта...</h2>
      </div>
    );
  }

  if (showTimeUpScreen) {
    return <TimeUpScreen onReset={handleReset} />;
  }

  if (showCompletionScreen) {
    console.log("Rendering completion screen, correct answers:", correctAnswers);
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Браво!</h2>
            <p className="text-lg text-gray-700 mb-4">Завърши всички 8 задачи!</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
              <div className="text-sm text-gray-600 mb-2">Резултат:</div>
              <div className="text-4xl font-bold text-blue-600">{correctAnswers}/{problems.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                Верни отговори
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-gray-600">
            <Home className="w-5 h-5" />
            <span>Връщане към началото след {countdown} сек...</span>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline" 
            className="mt-4 w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Към началото сега
          </Button>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];
  
  // Safety check: if currentProblem doesn't exist, it means we've completed all problems
  if (!currentProblem) {
    console.log("No current problem found, index:", currentProblemIndex, "problems length:", problems.length);
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-medium">Зареждане резултата...</h2>
      </div>
    );
  }
  
  const allBlanksSelected = currentProblem.blanks.every(blank => droppedItems[blank.id]);

  return (
    <div 
      ref={gameContainerRef}
      className="flex flex-col items-center w-full max-w-4xl mx-auto"
      style={{ touchAction: 'none' }}
    >
      <style>{`
        .touch-drop-zone.touch-hover {
          background-color: rgb(219 234 254) !important;
          border-color: rgb(59 130 246) !important;
          transform: scale(1.05);
        }
        
        .touch-drop-zone.drop-success {
          background-color: rgb(187 247 208) !important;
          border-color: rgb(34 197 94) !important;
          animation: pulse 0.3s ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .drag-item-touch {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      <div className="flex justify-between w-full mb-4">
        <div className="flex gap-4">
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Време: {formatTime(timeLeft)}
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Задача: {currentProblemIndex + 1}/{problems.length}
          </div>
          {currentTeam && (
            <div className="bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium">
              🎯 {currentTeam.players[currentPlayerIndex]?.name || 'Играч'}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSolve}>
            🧠 Реши
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Започни отначало
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl mb-6">
        <div className="text-3xl font-bold text-center mb-8 leading-relaxed flex items-center justify-center">
          {renderEquation(currentProblem.equation, currentProblem.blanks)}
        </div>

        {/* Numbers Row */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2 text-center font-medium">Числа:</div>
          <div className="flex flex-wrap justify-center gap-4">
            {dragItems.filter(item => !isNaN(Number(item.value))).map((item) => (
              <div
                key={item.id}
                draggable={!item.isUsed}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`px-6 py-4 text-2xl font-semibold rounded-lg border-2 transition-all select-none drag-item-touch ${
                  item.isUsed
                    ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                    : touchState.draggedItemId === item.id
                    ? "bg-blue-200 border-blue-400 shadow-xl"
                    : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md cursor-move active:scale-105"
                }`}
                style={{ 
                  minHeight: '4rem', 
                  minWidth: '4rem',
                  touchAction: 'none'
                }}
              >
                {item.value}
              </div>
          ))}
        </div>
      </div>

        {/* Operators Row */}
        <div className="mb-8">
          <div className="text-sm text-gray-600 mb-2 text-center font-medium">Операции:</div>
          <div className="flex flex-wrap justify-center gap-4">
            {dragItems.filter(item => isNaN(Number(item.value))).map((item) => (
              <div
                key={item.id}
                draggable={!item.isUsed}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onTouchStart={(e) => handleTouchStart(e, item.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`px-6 py-4 text-2xl font-semibold rounded-lg border-2 transition-all select-none drag-item-touch ${
                  item.isUsed
                    ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                    : touchState.draggedItemId === item.id
                    ? "bg-orange-200 border-orange-400 shadow-xl"
                    : "bg-orange-50 border-orange-300 hover:border-orange-400 hover:shadow-md cursor-move active:scale-105"
                }`}
                style={{ 
                  minHeight: '4rem', 
                  minWidth: '4rem',
                  touchAction: 'none'
                }}
              >
                {item.value}
              </div>
            ))}
          </div>
        </div>

        {allBlanksSelected && feedback === null && (
          <div className="text-center">
            <Button onClick={checkAnswer} size="lg" className="px-8 py-4 text-lg">
              Провери отговора
            </Button>
          </div>
        )}

      {feedback && (
          <div className={`mt-6 p-4 rounded-md text-white text-center ${
          feedback === "correct" ? "bg-green-500" : "bg-red-500"
        }`}>
          {feedback === "correct" ? (
              <div className="flex items-center justify-center">
                <Check className="w-6 h-6 mr-2" />
              Правилно!
            </div>
          ) : (
              <div className="flex items-center justify-center">
                <X className="w-6 h-6 mr-2" />
                Грешно! Правилният отговор е {currentProblem.correctAnswer}.
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
};
