import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameLevel } from "@/types";
import { Check, RefreshCw, X, Trophy, Home } from "lucide-react";
import { useGameTimer } from "@/hooks/useGameTimer";
import { useNavigate } from "react-router-dom";
import { TimeUpScreen } from "@/components/TimeUpScreen";
import { gameStatsService } from "@/services/gameStatsService";
import { 
  generateMathProblems, 
  generateMathGridProblem,
  evaluateExpression,
  evaluateFourNumberExpression,
  type MathProblem, 
  type DragItem, 
  type TouchState 
} from "./mathGameLogic";

interface MathGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
  currentTeam?: any;
  onPlayerTurn?: (playerId: string) => void;
}



// Chronometer-style timer display (matches WordGame)
const Chronometer: React.FC<{ label?: string; seconds: number; hasStarted: boolean }>
  = ({ label = "", seconds, hasStarted }) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return (
    <div className="w-full">
      <div className="text-center text-sm text-gray-600 mb-2">{label}</div>
      <div className="relative mx-auto w-36 h-36">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-gray-300 rounded-t-xl shadow" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-50 to-slate-200 border-4 border-slate-300 shadow-xl" />
        <div className="absolute inset-2 rounded-full bg-white shadow-inner" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold tabular-nums tracking-wider">
            {hasStarted ? `${mins}:${secs}` : "00:00"}
          </div>
        </div>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 left-3 w-3 h-1 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 right-3 w-3 h-1 bg-slate-400 rounded" />
      </div>
    </div>
  );
};

export const MathGame: React.FC<MathGameProps> = ({ level, onComplete, onTimeUp, currentTeam, onPlayerTurn }) => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [droppedItems, setDroppedItems] = useState<{ [blankId: string]: string }>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
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
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, stopTimer, resetTimer } = useGameTimer({
    enabled: true
  });
  
  // Initialize the game
  useEffect(() => {
    // Extract selected operations from level.themeId (could be comma-separated)
    const selectedOperations = level.themeId.split(',').map(s => s.trim());
    
    // Generate 8 grid puzzles (crossword-style), each with different shapes
    const gridCount = 8;
    const gridProblems = Array.from({ length: gridCount }, () => generateMathGridProblem(selectedOperations, level.difficultyId));
    setProblems(gridProblems);
  }, [level.themeId, level.difficultyId]);

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
      
      // Stop the timer when game completes
      stopTimer();
      
      // In competitive mode, just call onComplete to switch teams
      if (currentTeam) {
        onComplete();
      } else {
        // In regular mode, show completion screen
        setShowCompletionScreen(true);
      }
    }
  }, [currentProblemIndex, problems.length, showCompletionScreen, currentTeam, onComplete, stopTimer]);

  // Removed countdown logic - user clicks button to return home

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
        dropZone.classList.remove('touch-hover', 'touch-hover-operator');
      }
    });
    
    if (elementBelow) {
      const dropZone = elementBelow.closest('[data-drop-zone]') as HTMLElement;
      if (dropZone) {
        const blankType = dropZone.getAttribute('data-blank-type');
        if (blankType === 'operator') {
          dropZone.classList.add('touch-hover-operator');
        } else {
          dropZone.classList.add('touch-hover');
        }
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
        dropZone.classList.remove('touch-hover', 'touch-hover-operator', 'drop-success');
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

    const convertOp = (op: string) => op === '×' ? '*' : op === '÷' ? '/' : op;

    if (currentProblem.mode === 'grid' && currentProblem.grid) {
      // Evaluate every 5-cell line centered on an '=' horizontally and vertically
      const nRows = currentProblem.grid.length;
      const nCols = currentProblem.grid[0]?.length || 0;
      const getCellValue = (r: number, c: number): { type: 'number' | 'operator' | 'equals'; value: string } | null => {
        const cell = currentProblem.grid![r][c];
        if (cell.kind === 'fixed') {
          return { type: (cell.type as any) || 'number', value: cell.value || '' };
        } else if (cell.kind === 'blank') {
          const v = droppedItems[cell.id];
          if (!v) return null;
          return { type: (cell.type as any) || 'number', value: v };
        }
        return null;
      };

      const checkLine = (cells: Array<{ r: number; c: number }>) => {
        // Expected pattern: [A, op, B, '=', R]
        const vals = cells.map(({ r, c }) => getCellValue(r, c));
        if (vals.some(v => v === null)) return false;
        const [aCell, opCell, bCell, eqCell, rCell] = vals as any[];
        if (eqCell.type !== 'equals') return false;
        const a = parseInt(aCell.value, 10);
        const b = parseInt(bCell.value, 10);
        const r = parseInt(rCell.value, 10);
        const op = convertOp(opCell.value);
        if ([a, b, r].some(x => Number.isNaN(x))) return false;
        switch (op) {
          case '+': return a + b === r;
          case '-': return a - b === r;
          case '*': return a * b === r;
          case '/': return b !== 0 && a / b === r;
          default: return false;
        }
      };

      outer: for (let r = 0; r < nRows; r++) {
        for (let c = 0; c < nCols; c++) {
          const cell = currentProblem.grid[r][c];
          if (cell.kind === 'fixed' && cell.type === 'equals') {
            // horizontal
            if (c - 3 >= 0 && c + 1 < nCols) {
              const hCells = [
                { r, c: c - 3 },
                { r, c: c - 2 },
                { r, c: c - 1 },
                { r, c },
                { r, c: c + 1 },
              ];
              const usable = hCells.every(({ r: rr, c: cc }) => currentProblem.grid![rr][cc].kind !== 'empty');
              if (usable && !checkLine(hCells)) { isCorrect = false; break outer; }
            }
            // vertical
            if (r - 3 >= 0 && r + 1 < nRows) {
              const vCells = [
                { r: r - 3, c },
                { r: r - 2, c },
                { r: r - 1, c },
                { r, c },
                { r: r + 1, c },
              ];
              const usable = vCells.every(({ r: rr, c: cc }) => currentProblem.grid![rr][cc].kind !== 'empty');
              if (usable && !checkLine(vCells)) { isCorrect = false; break outer; }
            }
          }
        }
      }
    } else {
      // Equation mode: parse tokens around '=' and evaluate with precedence
      const tmpl = currentProblem.equation || '';
      const tokens = tmpl.trim().split(/\s+/).map(tok => {
        const m = tok.match(/^BLANK_(\d+)$/);
        if (m) {
          const id = `blank_${m[1]}`;
          return droppedItems[id] || '';
        }
        return tok;
      });
      const eqIdx = tokens.indexOf('=');
      if (eqIdx === -1) {
        isCorrect = false;
      } else {
        const lhsTokens = tokens.slice(0, eqIdx);
        const rhsValue = parseInt(tokens[eqIdx + 1], 10);
        // Extract numbers/operators
        const nums: number[] = [];
        const ops: string[] = [];
        for (let i = 0; i < lhsTokens.length; i++) {
          if (i % 2 === 0) {
            const n = parseInt(lhsTokens[i], 10);
            if (Number.isNaN(n)) { isCorrect = false; break; }
            nums.push(n);
          } else {
            ops.push(lhsTokens[i]);
          }
        }
        if (isCorrect) {
          let value = 0;
          if (nums.length === 2) {
            value = evaluateExpression(nums[0], ops[0], nums[1]);
          } else if (nums.length === 3) {
            value = evaluateExpression(nums[0], ops[0], nums[1], ops[1], nums[2]);
          } else if (nums.length === 4) {
            value = evaluateFourNumberExpression(nums[0], ops[0], nums[1], ops[1], nums[2], ops[2], nums[3]);
          } else {
            isCorrect = false;
          }
          if (isCorrect) {
            isCorrect = value === rhsValue;
          }
        }
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
            data-blank-type={blank.type}
            className={`relative inline-flex items-center justify-center w-16 h-12 mx-1 border-2 border-dashed rounded-md transition-all touch-drop-zone align-middle ${
              droppedValue 
                ? feedback === "correct" 
                  ? "bg-green-100 border-green-400" 
                  : feedback === "incorrect"
                  ? "bg-red-100 border-red-400"
                  : blank.type === 'operator'
                  ? "bg-orange-100 border-orange-400 cursor-pointer"
                  : "bg-blue-100 border-blue-400 cursor-pointer"
                : blank.type === 'operator'
                ? "border-orange-400 bg-orange-50"
                : "border-gray-400 bg-gray-50"
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
              <>
                <span className="text-2xl font-semibold leading-none">{droppedValue}</span>
                {feedback === null && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                    ×
                  </div>
                )}
              </>
            )}
          </div>
        );
      }
    });
    
    return result;
  };

  const renderGrid = (grid: NonNullable<MathProblem['grid']>, blanks: MathProblem['blanks']) => {
    return (
      <div className="inline-block">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 3rem)` }}
        >
          {grid.flat().map(cell => {
            if (cell.kind === 'empty') {
              return <div key={cell.id} className="w-12 h-12" />;
            }
            if (cell.kind === 'fixed') {
              return (
                <div
                  key={cell.id}
                  className={`w-12 h-12 rounded-md border flex items-center justify-center text-xl font-semibold ${
                    cell.type === 'equals' ? 'bg-slate-100 border-slate-300' : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {cell.value}
                </div>
              );
            }
            // blank cell
            const droppedValue = droppedItems[cell.id];
            const isOperator = cell.type === 'operator';
            return (
              <div
                key={cell.id}
                ref={(el) => { dropZoneRefs.current[cell.id] = el; }}
                data-drop-zone={cell.id}
                data-blank-type={cell.type}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cell.id)}
                onClick={() => droppedValue && feedback === null && handleRemoveItem(cell.id)}
                className={`w-12 h-12 rounded-md border-2 border-dashed flex items-center justify-center transition-all touch-drop-zone ${
                  droppedValue
                    ? feedback === 'correct'
                      ? 'bg-green-100 border-green-400'
                      : feedback === 'incorrect'
                      ? 'bg-red-100 border-red-400'
                      : isOperator
                      ? 'bg-orange-100 border-orange-400 cursor-pointer'
                      : 'bg-blue-100 border-blue-400 cursor-pointer'
                    : isOperator
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-400 bg-gray-50'
                }`}
              >
                {droppedValue && (
                  <span className="text-2xl font-semibold leading-none">{droppedValue}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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
    setCurrentPlayerIndex(0);
    resetTimer();
    setCorrectAnswers(0);
    
    const selectedOperations = level.themeId.split(',').map(s => s.trim());
    const gridCount = 8;
    const gridProblems = Array.from({ length: gridCount }, () => generateMathGridProblem(selectedOperations, level.difficultyId));
    setProblems(gridProblems);
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
    const incorrectAnswers = problems.length - correctAnswers;
    const username = localStorage.getItem('currentPlayerName') || 'Играч';
    
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Браво, {username}!</h2>
            <p className="text-lg text-gray-700 mb-4">Завърши всички {problems.length} задачи!</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Време:</div>
                  <div className="text-xl font-bold text-blue-600">{formatTime(timeLeft)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Резултат:</div>
                  <div className="text-xl font-bold text-green-600">{correctAnswers}/{problems.length}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-green-600">Верни:</div>
                  <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
                </div>
                <div>
                  <div className="text-sm text-red-600">Грешни:</div>
                  <div className="text-lg font-bold text-red-600">{incorrectAnswers}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Към началото
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
      className="flex w-full gap-4 items-start -mx-4"
      style={{ touchAction: 'none' }}
    >
      <style>{`
        .touch-drop-zone.touch-hover {
          background-color: rgb(219 234 254) !important;
          border-color: rgb(59 130 246) !important;
          transform: scale(1.05);
        }
        
        .touch-drop-zone.touch-hover-operator {
          background-color: rgb(254 215 170) !important;
          border-color: rgb(251 146 60) !important;
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

      {/* LEFT SIDEBAR */}
      <aside className="w-[220px] shrink-0 pl-4">
        <div className="sticky top-6">
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <Chronometer seconds={timeLeft} hasStarted={hasStarted} />
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Задача</span>
                <span className="font-semibold">{currentProblemIndex + 1}/{problems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Верни</span>
                <span className="font-semibold">{correctAnswers}</span>
              </div>
              {currentTeam && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Играч</span>
                  <span className="font-semibold">{currentTeam.players[currentPlayerIndex]?.name || 'Играч'}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-3 space-y-2">
            {allBlanksSelected && feedback === null && (
              <Button onClick={checkAnswer} className="w-full flex items-center gap-2">
                <Check className="w-4 h-4" />
                Провери
              </Button>
            )}
            {/* <Button variant="outline" onClick={handleSolve} className="w-full">🧠 Реши</Button> */}
            <Button variant="outline" onClick={handleReset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Започни отначало
            </Button>
            {/* {!currentTeam && (
              <Button 
                variant="outline"
                onClick={async () => {
                  stopTimer();
                  if (gameStatsService.isSinglePlayerMode(currentTeam)) {
                    try {
                      await gameStatsService.submitMathGameStats({
                        correctAnswers,
                        totalProblems: problems.length,
                        timeElapsed: timeLeft,
                      });
                      console.log('Stats submitted via Complete Game button');
                    } catch (error) {
                      console.error('Failed to submit stats:', error);
                    }
                  }
                  setShowCompletionScreen(true);
                }}
                className="w-full bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Завърши играта
              </Button>
            )} */}
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-full mb-6">
        <div className="text-3xl font-bold text-center mb-8 leading-relaxed flex items-center justify-center">
          {currentProblem.mode === 'grid' && currentProblem.grid
            ? renderGrid(currentProblem.grid, currentProblem.blanks)
            : renderEquation(currentProblem.equation || '', currentProblem.blanks)}
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
                    : "bg-white border-gray-300 cursor-move active:scale-105"
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
                    : "bg-orange-50 border-orange-300 cursor-move active:scale-105"
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

        {/* Check button now in the left sidebar */}

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
                {currentProblem.mode === 'grid' ? 'Грешно! Попълнете правилно всички клетки.' : `Грешно! Правилният отговор е ${currentProblem.correctAnswer}.`}
              </div>
            )}
        </div>
      )}
    </div>
    </div>
    </div>
  );
};
