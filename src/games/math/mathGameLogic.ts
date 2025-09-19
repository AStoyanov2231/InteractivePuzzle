export interface MathProblem {
  // mode indicates if this is a simple equation or a crossword-style grid
  mode?: 'equation' | 'grid';
  equation?: string;
  grid?: GridCell[][];
  blanks: { id: string; position: number; correctValue: string; type: 'number' | 'operator' }[];
  options: string[];
  correctAnswer: number;
}

export interface GridCell {
  id: string;
  row: number;
  col: number;
  kind: 'fixed' | 'blank' | 'empty';
  type?: 'number' | 'operator' | 'equals';
  value?: string; // For fixed or equals cells
  correctValue?: string; // For blank cells
}

export interface DragItem {
  id: string;
  value: string;
  isUsed: boolean;
}

export interface TouchState {
  isDragging: boolean;
  draggedItemId: string | null;
  startPosition: { x: number; y: number } | null;
  currentPosition: { x: number; y: number } | null;
  draggedElement: HTMLElement | null;
}

// Helper function to convert symbols to operators for calculation
const convertOp = (op: string) => {
  switch (op) {
    case "×": return "*";
    case "÷": return "/";
    default: return op;
  }
};

// Helper function to evaluate expression following order of operations
export const evaluateExpression = (num1: number, op1: string, num2: number, op2?: string, num3?: number): number => {
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

// Helper function to evaluate four-number expression following order of operations
export const evaluateFourNumberExpression = (num1: number, op1: string, num2: number, op2: string, num3: number, op3: string, num4: number): number => {
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

// Helper function to generate valid two-number operations
export const generateTwoNumberOperation = (operation: string): [number, number, number] => {
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

// Helper function to generate valid three-number operations
export const generateThreeNumberOperation = (op1: string, op2: string): [number, number, number, number] => {
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

// Helper function to generate valid four-number operations
export const generateFourNumberOperation = (op1: string, op2: string, op3: string): [number, number, number, number, number] => {
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

// Generate math problems based on selected operations
export const generateMathProblems = (selectedOperations: string[], count: number, difficultyId: string = "medium"): MathProblem[] => {
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
      mode: 'equation',
      equation,
      blanks,
      options,
      correctAnswer
    });
  }
  
  return problems;
}; 

// ---------------- GRID (CROSSWORD) GENERATION ----------------

// Helper: ensure op symbols used in UI, not JS
const pickAvailableOps = (selectedOperations: string[]): string[] => {
  const operationMap: { [key: string]: string } = {
    addition: "+",
    subtraction: "-", 
    multiplication: "×",
    division: "÷"
  };
  const ops = selectedOperations.map(op => operationMap[op]).filter(Boolean);
  return ops.length > 0 ? ops : ["+"];
};

// Generate a single-digit equation A op B = R, optionally fixing A
const generateSingleDigitEquation = (op: string, fixedFirst?: number): [number, number, number] => {
  let a = fixedFirst ?? (Math.floor(Math.random() * 9) + 1);
  let b = 1;
  let r = 0;
  let attempts = 0;

  while (attempts < 100) {
    if (fixedFirst === undefined) {
      a = Math.floor(Math.random() * 9) + 1; // 1..9
    }
    switch (op) {
      case '+': {
        // a + b <= 9
        b = Math.floor(Math.random() * (9 - a)) + 1; // 1..(9-a)
        r = a + b;
        break;
      }
      case '-': {
        // a - b >= 1
        if (a <= 1) { a = 2; }
        b = Math.floor(Math.random() * (a - 1)) + 1; // 1..a-1
        r = a - b;
        break;
      }
      case '×': {
        // a * b <= 9
        const candidates: [number, number][] = [];
        for (let x = 1; x <= 9; x++) {
          for (let y = 1; y <= 9; y++) {
            if ((fixedFirst ? x === a : true) && x * y <= 9) {
              candidates.push([x, y]);
            }
          }
        }
        if (candidates.length === 0) { a = 1; }
        const pick = candidates[Math.floor(Math.random() * candidates.length)] || [1, 1];
        a = pick[0];
        b = pick[1];
        r = a * b;
        break;
      }
      case '÷': {
        // a / b is integer in 1..9 and a <= 9
        // So pick b in 2..9, r in 1..Math.floor(9/b), then a = b*r
        const divisors: number[] = [];
        for (let d = 2; d <= 9; d++) {
          if (!fixedFirst || (fixedFirst % d === 0 && fixedFirst / d <= 9)) {
            divisors.push(d);
          }
        }
        if (divisors.length === 0) { a = 6; b = 3; r = 2; break; }
        b = divisors[Math.floor(Math.random() * divisors.length)];
        const maxR = Math.floor(9 / b) || 1;
        r = Math.max(1, Math.floor(Math.random() * maxR) + 1);
        a = fixedFirst ?? (b * r);
        r = Math.floor(a / b);
        break;
      }
      default: {
        b = 1; r = a + b; break;
      }
    }
    if (r >= 0 && r <= 9) break;
    attempts++;
  }
  return [a, b, r];
};

// Enumerate all valid single-digit (1..9) triples (A, B, R) for op within 0..9 result
const enumerateTriples = (op: string): Array<{ A: number; B: number; R: number }> => {
  const triples: Array<{ A: number; B: number; R: number }> = [];
  for (let A = 1; A <= 9; A++) {
    for (let B = 1; B <= 9; B++) {
      let R = 0;
      switch (op) {
        case '+': R = A + B; break;
        case '-': R = A - B; break;
        case '×': R = A * B; break;
        case '÷': if (B !== 0 && A % B === 0) R = A / B; else R = -1; break;
        default: R = A + B;
      }
      if (R >= 0 && R <= 9 && Number.isInteger(R)) {
        // keep within 1..9 for A,B and 0..9 for R
        if (op !== '÷' || (B >= 2 && R >= 1)) {
          triples.push({ A, B, R });
        }
      }
    }
  }
  return triples;
};

type Constraint = Partial<{ A: number; B: number; R: number; op: string }>;

const chooseTripleWithConstraints = (ops: string[], constraint: Constraint): { A: number; B: number; R: number; op: string } | null => {
  const opsToTry = constraint.op ? [constraint.op] : ops.slice().sort(() => Math.random() - 0.5);
  for (const op of opsToTry) {
    const candidates = enumerateTriples(op).filter(t =>
      (constraint.A === undefined || t.A === constraint.A) &&
      (constraint.B === undefined || t.B === constraint.B) &&
      (constraint.R === undefined || t.R === constraint.R)
    );
    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      return { ...pick, op };
    }
  }
  return null;
};

type LineSpec = { r: number; c: number; dir: 'h' | 'v' };
type ShapeSpec = { size: number; lines: LineSpec[] };

const SHAPES: ShapeSpec[] = [
  // Cross
  { size: 5, lines: [ { r:0,c:0,dir:'h' }, { r:2,c:0,dir:'h' }, { r:4,c:0,dir:'h' }, { r:0,c:0,dir:'v' } ] },
  // T shape
  { size: 5, lines: [ { r:0,c:0,dir:'h' }, { r:0,c:2,dir:'v' }, { r:2,c:0,dir:'h' } ] },
  // L shape
  { size: 5, lines: [ { r:0,c:0,dir:'h' }, { r:0,c:0,dir:'v' }, { r:4,c:0,dir:'h' } ] },
  // Z-like
  { size: 5, lines: [ { r:0,c:0,dir:'h' }, { r:4,c:0,dir:'h' }, { r:0,c:4,dir:'v' } ] },
  // Staggered
  { size: 5, lines: [ { r:1,c:0,dir:'h' }, { r:3,c:0,dir:'h' }, { r:0,c:2,dir:'v' } ] },
];

const lineCells = (line: LineSpec): Array<{ r: number; c: number; kind: 'number' | 'operator' | 'equals'; idx: number }> => {
  const cells: Array<{ r: number; c: number; kind: 'number' | 'operator' | 'equals'; idx: number }> = [];
  for (let i = 0; i < 5; i++) {
    const r = line.dir === 'h' ? line.r : line.r + i;
    const c = line.dir === 'h' ? line.c + i : line.c;
    const kind: 'number' | 'operator' | 'equals' = (i === 1) ? 'operator' : (i === 3) ? 'equals' : 'number';
    cells.push({ r, c, kind, idx: i });
  }
  return cells;
};

export const generateMathGridProblem = (selectedOperations: string[], difficultyId: string = 'medium'): MathProblem => {
  const ops = pickAvailableOps(selectedOperations);
  // pick a shape randomly
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const size = shape.size;
  const grid: GridCell[][] = Array.from({ length: size }, (_, r) => (
    Array.from({ length: size }, (_, c) => ({
      id: `cell_${r}_${c}`,
      row: r,
      col: c,
      kind: 'empty' as const,
    }))
  ));

  // We'll store assigned values per cell
  type Assigned = { type: 'number' | 'operator' | 'equals'; value: string };
  const assigned: Record<string, Assigned> = {};

  const setFixed = (r: number, c: number, value: string, type: 'number' | 'operator' | 'equals') => {
    grid[r][c] = { id: `cell_${r}_${c}`, row: r, col: c, kind: 'fixed', type, value };
    assigned[`${r},${c}`] = { type, value };
  };
  const setBlank = (r: number, c: number, correctValue: string, type: 'number' | 'operator') => {
    grid[r][c] = { id: `cell_${r}_${c}`, row: r, col: c, kind: 'blank', type, correctValue };
    assigned[`${r},${c}`] = { type, value: correctValue };
  };

  // Fill lines with constraints from overlaps
  const tryFill = (): boolean => {
    // Reset grid/assigned
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        grid[r][c] = { id: `cell_${r}_${c}`, row: r, col: c, kind: 'empty' };
      }
    }
    for (const k in assigned) delete assigned[k];

    for (const line of shape.lines) {
      const cells = lineCells(line);
      // Build constraint
      const constraint: Constraint = {};
      // operator constraint if cell 1 occupied with operator
      const opCell = cells[1];
      const opAssigned = assigned[`${opCell.r},${opCell.c}`];
      if (opAssigned && opAssigned.type === 'operator') constraint.op = opAssigned.value;
      const aCell = cells[0];
      const aAssigned = assigned[`${aCell.r},${aCell.c}`];
      if (aAssigned && aAssigned.type === 'number') constraint.A = parseInt(aAssigned.value);
      const bCell = cells[2];
      const bAssigned = assigned[`${bCell.r},${bCell.c}`];
      if (bAssigned && bAssigned.type === 'number') constraint.B = parseInt(bAssigned.value);
      const rCell = cells[4];
      const rAssigned = assigned[`${rCell.r},${rCell.c}`];
      if (rAssigned && rAssigned.type === 'number') constraint.R = parseInt(rAssigned.value);

      const choice = chooseTripleWithConstraints(ops, constraint);
      if (!choice) return false;

      // Place values: A op B = R
      const vals: Array<{ type: 'number' | 'operator' | 'equals'; value: string }> = [
        { type: 'number', value: String(choice.A) },
        { type: 'operator', value: choice.op },
        { type: 'number', value: String(choice.B) },
        { type: 'equals', value: '=' },
        { type: 'number', value: String(choice.R) },
      ];

      for (let i = 0; i < 5; i++) {
        const { r, c, kind } = cells[i];
        const v = vals[i];
        const prev = assigned[`${r},${c}`];
        if (prev) {
          if (prev.type !== v.type || prev.value !== v.value) return false; // conflict
          // else keep
          continue;
        }
        if (kind === 'equals') {
          setFixed(r, c, v.value, 'equals');
        } else {
          setBlank(r, c, v.value, v.type as 'number' | 'operator');
        }
      }
    }
    return true;
  };

  let attempts = 0;
  while (attempts < 50) {
    if (tryFill()) break;
    attempts++;
  }

  // Reveal hints: ensure each equation line has at least one number fixed
  // Convert one of A/B/R cells from blank to fixed for each line
  for (const line of shape.lines) {
    const cells = lineCells(line);
    const candidateIdx = [0, 2, 4];
    // Prefer a blank cell among these to reveal
    const revealable = candidateIdx.filter(i => {
      const cell = grid[cells[i].r][cells[i].c];
      return cell.kind === 'blank' && cell.correctValue && cells[i].kind === 'number';
    });
    if (revealable.length > 0) {
      const pickIndex = revealable[Math.floor(Math.random() * revealable.length)];
      const target = cells[pickIndex];
      const origin = grid[target.r][target.c];
      grid[target.r][target.c] = {
        id: origin.id,
        row: target.r,
        col: target.c,
        kind: 'fixed',
        type: 'number',
        value: origin.correctValue,
      };
    }
  }

  // Collect blanks and build required option multiplicities
  const blanks: { id: string; position: number; correctValue: string; type: 'number' | 'operator' }[] = [];
  const requiredCounts = new Map<string, number>();
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = grid[r][c];
      if (cell.kind === 'blank' && cell.correctValue && cell.type) {
        blanks.push({ id: cell.id, position: 0, correctValue: cell.correctValue, type: cell.type });
        const curr = requiredCounts.get(cell.correctValue) || 0;
        requiredCounts.set(cell.correctValue, curr + 1);
      }
    }
  }
  // Start options with exact multiplicities for all required values
  const options: string[] = [];
  requiredCounts.forEach((count, value) => {
    for (let i = 0; i < count; i++) options.push(value);
  });

  // Add decoy numbers close to required ones (unique decoys only once)
  const decoySet = new Set<string>();
  const addDecoyNumber = (n: number) => {
    const candidates = [n - 1, n + 1, n - 2, n + 2];
    candidates.forEach(x => { if (x >= 1 && x <= 9) decoySet.add(String(x)); });
  };
  blanks.forEach(b => {
    if (b.type === 'number') addDecoyNumber(parseInt(b.correctValue));
  });
  decoySet.forEach(v => {
    // Avoid flooding with duplicates of existing values; add only if not already required in sufficient quantity
    if (!requiredCounts.has(v)) options.push(v);
  });

  // Add each available operator once as decoy (in addition to required counts)
  ops.forEach(op => options.push(op));

  // Shuffle
  options.sort(() => Math.random() - 0.5);

  const problem: MathProblem = {
    mode: 'grid',
    grid,
    blanks,
    options,
    correctAnswer: 0,
  };
  return problem;
};