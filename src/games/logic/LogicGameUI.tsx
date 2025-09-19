import React, { forwardRef } from "react";
import { RotateCcw, CheckCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gameStatsService } from "@/services/gameStatsService";

interface LogicGameUIProps {
  level: { id: number };
  timeLeft: number;
  gridSize: number;
  cellSize: number;
  board: boolean[][];
  onCellPress: (row: number, col: number) => void;
  onRestart: () => void;
  onCompleteGame: () => void;
  isCompleted: boolean;
  completionProgress: number;
  movesUsed: number;
  solutionEstimate: number;
  showCompletionScreen?: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const LogicGameUI = forwardRef<HTMLDivElement, LogicGameUIProps>(({
  level,
  timeLeft,
  gridSize,
  cellSize,
  board,
  onCellPress,
  onRestart,
  onCompleteGame,
  isCompleted,
  completionProgress,
  movesUsed,
  solutionEstimate,
  showCompletionScreen = false
}, gridRef) => {
  const total = gridSize * gridSize;
  let onCount = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (board[r][c]) onCount++;
    }
  }
  const offCount = total - onCount;
  const progressPercentage = (offCount / total) * 100;
  
  return (
    <div className="flex w-full gap-4 items-start -mx-4">
      {/* LEFT SIDEBAR */}
      <aside className="w-[220px] shrink-0 pl-4">
        <div className="sticky top-6">
          <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
            <div className="w-full">
              <div className="text-center text-sm text-gray-600 mb-2"></div>
              <div className="relative mx-auto w-36 h-36">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-gray-300 rounded-t-xl shadow" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-50 to-slate-200 border-4 border-slate-300 shadow-xl" />
                <div className="absolute inset-2 rounded-full bg-white shadow-inner" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-bold tabular-nums tracking-wider">
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-slate-400 rounded" />
                <div className="absolute top-1/2 -translate-y-1/2 left-3 w-3 h-1 bg-slate-400 rounded" />
                <div className="absolute top-1/2 -translate-y-1/2 right-3 w-3 h-1 bg-slate-400 rounded" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <div className="space-y-4 text-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ходове</span>
                <span className="font-semibold">{movesUsed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ниво</span>
                <span className="font-semibold">{level.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Прогрес</span>
                <span className="font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-3 space-y-2">
            {!isCompleted && (
              <button
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl 
                         hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">Рестартирай</span>
              </button>
            )}

            {!isCompleted && (
              <Button 
                variant="outline"
                onClick={async () => {
                  if (gameStatsService.isSinglePlayerMode()) {
                    try {
                      await gameStatsService.submitLogicGameStats({
                        movesUsed,
                        timeElapsed: timeLeft,
                        completed: false,
                      });
                      console.log('Stats submitted via Complete Game button');
                    } catch (error) {
                      console.error('Failed to submit stats:', error);
                    }
                  }
                  onCompleteGame();
                }}
                className="w-full bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Завърши играта
              </Button>
            )}

            {isCompleted && !showCompletionScreen && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Ниво завършено!</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden border border-gray-300">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-100 ease-out rounded-full relative"
                    style={{ width: `${completionProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative bg-white rounded-2xl shadow-2xl p-4 lg:p-6" ref={gridRef}>
          <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl" />
          
          <div className="relative">
            <div 
              className="grid p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-inner border border-gray-200 relative"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                padding: '16px'
              }}
            >
              {board.map((row, rIdx) => (
                row.map((isOn, cIdx) => (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => onCellPress(rIdx, cIdx)}
                    className={`relative border-2 rounded-lg transition-all duration-150 ease-in-out m-1 ${
                      isOn
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-600 shadow-md hover:shadow-lg active:scale-[0.98]'
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  />
                ))
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LogicGameUI.displayName = "LogicGameUI";
 