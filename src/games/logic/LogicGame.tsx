import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GameLevel } from "@/types";
import { LogicGameUI } from "./LogicGameUI";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import { gameStatsService } from "@/services/gameStatsService";

type PatternType = "plus" | "diag" | "knight";

interface LogicGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
}

// Deterministic PRNG (mulberry32)
const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const stringToSeed = (str: string) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const coordsToIndex = (row: number, col: number, n: number) => row * n + col;
const indexToCoords = (idx: number, n: number) => ({ row: Math.floor(idx / n), col: idx % n });

const getNeighbors = (row: number, col: number, n: number, pattern: PatternType) => {
  const neighbors: { row: number; col: number }[] = [{ row, col }];
  if (pattern === "plus") {
    const deltas = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 },
    ];
    deltas.forEach(d => {
      const nr = row + d.r, nc = col + d.c;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) neighbors.push({ row: nr, col: nc });
    });
  } else if (pattern === "diag") {
    const deltas = [
      { r: -1, c: -1 },
      { r: -1, c: 1 },
      { r: 1, c: -1 },
      { r: 1, c: 1 },
    ];
    deltas.forEach(d => {
      const nr = row + d.r, nc = col + d.c;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) neighbors.push({ row: nr, col: nc });
    });
  } else if (pattern === "knight") {
    const deltas = [
      { r: -2, c: -1 }, { r: -2, c: 1 }, { r: -1, c: -2 }, { r: -1, c: 2 },
      { r: 1, c: -2 }, { r: 1, c: 2 }, { r: 2, c: -1 }, { r: 2, c: 1 },
    ];
    deltas.forEach(d => {
      const nr = row + d.r, nc = col + d.c;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) neighbors.push({ row: nr, col: nc });
    });
  }
  return neighbors;
};

const toggleAt = (board: boolean[][], row: number, col: number, pattern: PatternType) => {
  const n = board.length;
  const cells = getNeighbors(row, col, n, pattern);
  cells.forEach(({ row: r, col: c }) => {
    board[r][c] = !board[r][c];
  });
};

// Build coefficient matrix A (M x M) for Lights-Out given pattern
const buildMatrix = (n: number, pattern: PatternType) => {
  const m = n * n;
  const A: Uint8Array[] = Array.from({ length: m }, () => new Uint8Array(m));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const j = coordsToIndex(r, c, n);
      const affected = getNeighbors(r, c, n, pattern);
      affected.forEach(({ row, col }) => {
        const i = coordsToIndex(row, col, n);
        A[i][j] = 1; // cell i is toggled by press j
      });
    }
  }
  return A;
};

// Solve A x = b over GF(2) using Gaussian elimination. Returns one solution vector x (0/1) or null.
const solveGF2 = (Ain: Uint8Array[], bIn: Uint8Array) => {
  const n = Ain.length;
  // Augmented matrix [A | b]
  const A = Ain.map(row => Uint8Array.from(row));
  const b = Uint8Array.from(bIn);

  let row = 0;
  const colPivot: number[] = Array(n).fill(-1);

  for (let col = 0; col < n && row < n; col++) {
    // Find pivot
    let sel = row;
    for (let i = row; i < n; i++) {
      if (A[i][col] === 1) { sel = i; break; }
    }
    if (A[sel][col] === 0) continue; // No pivot in this column

    // Swap rows
    if (sel !== row) {
      const tmp = A[sel]; A[sel] = A[row]; A[row] = tmp;
      const tb = b[sel]; b[sel] = b[row]; b[row] = tb;
    }

    colPivot[row] = col;

    // Eliminate others
    for (let i = 0; i < n; i++) {
      if (i !== row && A[i][col] === 1) {
        for (let j = col; j < n; j++) A[i][j] ^= A[row][j];
        b[i] ^= b[row];
      }
    }
    row++;
  }

  // Check consistency
  for (let i = row; i < n; i++) {
    let allZero = true;
    for (let j = 0; j < n; j++) if (A[i][j] !== 0) { allZero = false; break; }
    if (allZero && b[i] === 1) return null; // inconsistent
  }

  // Back-substitution to one particular solution (free vars set to 0)
  const x = new Uint8Array(n);
  for (let i = row - 1; i >= 0; i--) {
    const col = colPivot[i];
    if (col === -1) continue;
    let sum = b[i];
    for (let j = col + 1; j < n; j++) {
      if (A[i][j] === 1) sum ^= x[j];
    }
    x[col] = sum; // since pivot is 1
  }
  return x;
};

const cloneBoard = (board: boolean[][]) => board.map(row => row.slice());

export const LogicGame: React.FC<LogicGameProps> = ({ level, onComplete }) => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [cellSize, setCellSize] = useState(64);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [movesUsed, setMovesUsed] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [gameSeed] = useState(() => searchParams.get("seed") || `${level.themeId}-${level.difficultyId}-${level.id}-${Date.now()}`);

  const seedParam = gameSeed;
  const patternParam = (searchParams.get("pattern") as PatternType) || "plus";

  // Difficulty gating determines grid size and target move ranges
  const levelIndex = (level.id - 1) % 10; // 0-9 tier index
  const gridSize = useMemo(() => {  
    const base = level.difficultyId === "easy" ? 3 : level.difficultyId === "medium" ? 4 : 5;
    return Math.min(base + Math.floor(levelIndex / 3), 6);
  }, [level.difficultyId, levelIndex]);

  // Generate solvable board using k random presses; select k attempting to meet difficulty band by solving
  const generation = useMemo(() => {
    const seedNum = stringToSeed(seedParam);
    const rng = mulberry32(seedNum);
    const n = gridSize;
    const pattern = patternParam;

    const A = buildMatrix(n, pattern);

    const difficultyBands = level.difficultyId === "easy"
      ? { min: 3, max: 7 }
      : level.difficultyId === "medium"
      ? { min: 8, max: 14 }
      : { min: 12, max: 22 };

    let best: { board: boolean[][]; solution: Uint8Array; k: number } | null = null;

    for (let attempt = 0; attempt < 30; attempt++) {
      // Start from all-off
      const board: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
      const presses: { row: number; col: number }[] = [];
      const kBase = difficultyBands.min + Math.floor(rng() * (difficultyBands.max - difficultyBands.min + 1));
      const k = Math.max(1, kBase);
      for (let i = 0; i < k; i++) {
        const r = Math.floor(rng() * n);
        const c = Math.floor(rng() * n);
        presses.push({ row: r, col: c });
        toggleAt(board, r, c, pattern);
      }

      // Build b vector from board (1 for ON)
      const b = new Uint8Array(n * n);
      for (let i = 0; i < n * n; i++) {
        const { row, col } = indexToCoords(i, n);
        b[i] = board[row][col] ? 1 : 0;
      }
      const sol = solveGF2(A, b);
      if (!sol) continue; // should not happen for this construction
      const weight = sol.reduce((acc, v) => acc + (v ? 1 : 0), 0);
      if (weight >= difficultyBands.min && weight <= difficultyBands.max) {
        best = { board, solution: sol, k };
        break;
      }
      // Keep the closest so far
      if (!best || Math.abs(weight - (difficultyBands.min + difficultyBands.max) / 2) < Math.abs(best.solution.reduce((a, v) => a + (v ? 1 : 0), 0) - (difficultyBands.min + difficultyBands.max) / 2)) {
        best = { board, solution: sol, k };
      }
    }

    if (!best) {
      // Fallback: trivial single press
      const board: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
      toggleAt(board, 0, 0, pattern);
      const b = new Uint8Array(n * n);
      b[0] = 1;
      const sol = solveGF2(A, b) || new Uint8Array(n * n);
      return { initialBoard: board, solution: sol, pattern };
    }

    return { initialBoard: best.board, solution: best.solution, pattern };
  }, [seedParam, gridSize, level.difficultyId, patternParam]);

  const [board, setBoard] = useState<boolean[][]>(generation.initialBoard);

  const solutionEstimate = useMemo(() => generation.solution.reduce((acc, v) => acc + (v ? 1 : 0), 0), [generation.solution]);

  // Reset on level or seed change
  useEffect(() => {
    setBoard(cloneBoard(generation.initialBoard));
    setMovesUsed(0);
    setIsCompleted(false);
    setCompletionProgress(0);
    setTimeElapsed(0);
  }, [generation.initialBoard]);

  // Timer
  useEffect(() => {
    if (isCompleted) return; // Stop timer when completed
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Responsive cell size
  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const headerHeight = 80;
        const padding = 100;
        const sidebarWidth = 200;
        const sidebarGap = 24;
        const availableHeight = viewportHeight - headerHeight - padding;
        const availableWidth = Math.min(viewportWidth - padding - sidebarWidth - sidebarGap, 1000);
        const maxCellSizeByWidth = Math.floor(availableWidth / (gridSize + 1));
        const maxCellSizeByHeight = Math.floor(availableHeight / (gridSize + 1));
        let optimalCellSize = Math.min(maxCellSizeByWidth, maxCellSizeByHeight);
        if (gridSize <= 4) {
          optimalCellSize = Math.max(optimalCellSize, 100);
          optimalCellSize = Math.min(optimalCellSize, 140);
        } else if (gridSize <= 6) {
          optimalCellSize = Math.max(optimalCellSize, 80);
          optimalCellSize = Math.min(optimalCellSize, 110);
        } else if (gridSize <= 8) {
          optimalCellSize = Math.max(optimalCellSize, 60);
          optimalCellSize = Math.min(optimalCellSize, 85);
        } else {
          optimalCellSize = Math.max(optimalCellSize, 45);
          optimalCellSize = Math.min(optimalCellSize, 70);
        }
        setCellSize(optimalCellSize);
      }
    };
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [gridSize]);

  const checkCompleted = (b: boolean[][]) => {
    for (let r = 0; r < b.length; r++) {
      for (let c = 0; c < b.length; c++) {
        if (b[r][c]) return false;
      }
    }
    return true;
  };

  const handleCellPress = (row: number, col: number) => {
    if (isCompleted) return;
    const next = cloneBoard(board);
    toggleAt(next, row, col, generation.pattern);
    setBoard(next);
    setMovesUsed(prev => prev + 1);
    if (checkCompleted(next)) {
      setIsCompleted(true);
      
      // Submit stats when game completes
      if (gameStatsService.isSinglePlayerMode()) {
        try {
          gameStatsService.submitLogicGameStats({
            movesUsed: movesUsed + 1, // +1 because we're about to increment movesUsed
            timeElapsed: timeElapsed,
            completed: true,
          }).then(() => {
            console.log('Stats submitted automatically after completing logic game');
          }).catch(error => {
            console.error('Failed to submit stats:', error);
          });
        } catch (error) {
          console.error('Failed to submit stats:', error);
        }
      }
      
      const startTime = Date.now();
      const duration = 800; // ms
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setCompletionProgress(progress);
        if (progress < 100) {
          requestAnimationFrame(animate);
        } else {
          // Show completion screen after animation finishes
          setTimeout(() => setShowCompletionScreen(true), 200);
        }
      };
      requestAnimationFrame(animate);
      onComplete();
    }
  };

  const handleRestart = () => {
    setBoard(cloneBoard(generation.initialBoard));
    setMovesUsed(0);
    setIsCompleted(false);
    setCompletionProgress(0);
    setShowCompletionScreen(false);
  };

  const handleCompleteGame = () => {
    setShowCompletionScreen(true);
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show completion screen
  if (showCompletionScreen) {
    const username = localStorage.getItem('currentPlayerName') || 'Играч';
    
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12" data-testid="completion-screen">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Браво, {username}!</h2>
            <p className="text-lg text-gray-700 mb-4">Завърши логическото ниво!</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Време:</div>
                  <div className="text-xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Ходове:</div>
                  <div className="text-xl font-bold text-green-600">{movesUsed}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleRestart} 
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200"
            >
              Започни отново
            </Button>
            
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full border-2 border-blue-300 hover:border-blue-400 text-blue-700 font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Начало
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LogicGameUI
      ref={gridRef}
      level={level}
      timeLeft={timeElapsed}
      gridSize={gridSize}
      cellSize={cellSize}
      board={board}
      onCellPress={handleCellPress}
      onRestart={handleRestart}
      onCompleteGame={handleCompleteGame}
      isCompleted={isCompleted}
      completionProgress={completionProgress}
      movesUsed={movesUsed}
      solutionEstimate={solutionEstimate}
      showCompletionScreen={showCompletionScreen}
    />
  );
};
