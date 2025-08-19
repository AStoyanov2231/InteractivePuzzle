import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameLevel } from "@/types";
import { Check, RefreshCw, Lightbulb, Trophy, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGameTimer } from "@/hooks/useGameTimer";
import { gameStatsService } from "@/services/gameStatsService";
import { TimeUpScreen } from "@/components/TimeUpScreen";
import { wordBanks } from "@/games/words/wordBanks";

interface WordGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
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

interface WordPuzzle {
  original: string;
  scrambled: string;
  description: string;
}

// Helper function to ensure word is always scrambled and never matches original
const guaranteedScramble = (word: string): string => {
  if (word.length <= 1) return word;
  
  let scrambled = word;
  let attempts = 0;
  const maxAttempts = 100;
  
  while (scrambled === word && attempts < maxAttempts) {
    const letters = word.split('');
    
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    scrambled = letters.join('');
    attempts++;
  }
  
  if (scrambled === word && word.length > 1) {
    const letters = word.split('');
    for (let i = 0; i < letters.length - 1; i++) {
      if (letters[i] !== letters[i + 1]) {
        [letters[i], letters[i + 1]] = [letters[i + 1], letters[i]];
        break;
      }
    }
    scrambled = letters.join('');
  }
  
  return scrambled;
};

const generateWordPuzzle = (themeId: string, difficultyId: string) => {
  const themeBanks = wordBanks[themeId] || wordBanks.sport;
  const difficultyKey = difficultyId === "easy" ? "easy" : difficultyId === "medium" ? "medium" : "hard";
  const wordBank = themeBanks[difficultyKey];

  const shuffledWords = [...wordBank].sort(() => Math.random() - 0.5);
  const numWords = 10;
  const selectedWords = shuffledWords.slice(0, numWords);

  const scrambledWords = selectedWords.map(wordObj => {
    const words = wordObj.word.split(' ');
    
    if (words.length > 1) {
      const scrambledPhrase = words.map(word => 
        guaranteedScramble(word)
      ).join(' ');
      
      return {
        original: wordObj.word,
        scrambled: scrambledPhrase,
        description: wordObj.description
      };
    } else {
      return {
        original: wordObj.word,
        scrambled: guaranteedScramble(wordObj.word),
        description: wordObj.description
      };
    }
  });

  return {
    words: selectedWords.map(wordObj => wordObj.word),
    puzzles: scrambledWords
  };
};

export const WordGame: React.FC<WordGameProps> = ({ level, onComplete, onTimeUp }) => {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<{ 
    words: string[]; 
    puzzles: WordPuzzle[] 
  } | null>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [droppedItems, setDroppedItems] = useState<{ [position: number]: string }>({});
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedPositions, setRevealedPositions] = useState<Set<number>>(new Set());
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<{ word: string; description: string }[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [touchState, setTouchState] = useState<TouchState>({
    isDragging: false,
    draggedItemId: null,
    startPosition: null,
    currentPosition: null,
    draggedElement: null
  });
  
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const dropZoneRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const { timeLeft, hasStarted, showTimeUpScreen, startTimer, resetTimer } = useGameTimer({
    enabled: true
  });
  
  // Initialize the game
  useEffect(() => {
    const wordPuzzle = generateWordPuzzle(level.themeId, level.difficultyId);
    setPuzzle(wordPuzzle);
  }, [level.themeId, level.difficultyId]);

  // Set up drag items when word changes
  useEffect(() => {
    if (puzzle && wordIndex < puzzle.puzzles.length) {
      const currentPuzzle = puzzle.puzzles[wordIndex];
      const scrambledWord = currentPuzzle.scrambled;
      
      // Create drag items for each character (excluding spaces)
      const items: DragItem[] = [];
      let charIndex = 0;
      
      for (let i = 0; i < scrambledWord.length; i++) {
        const char = scrambledWord[i];
        if (char !== ' ') {
          items.push({
            id: `char_${charIndex}`,
            value: char,
            isUsed: false
          });
          charIndex++;
        }
      }
      
      setDragItems(items);
      setDroppedItems({});
      setFeedback(null);
      setRevealedPositions(new Set());
    }
  }, [puzzle, wordIndex]);

  // Check game completion
  useEffect(() => {
    if (puzzle && wordIndex >= puzzle.puzzles.length && !showCompletionScreen) {
      setShowCompletionScreen(true);
    }
  }, [wordIndex, puzzle, showCompletionScreen]);

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

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    const draggedItemData = dragItems.find(item => item.id === itemId);
    
    if (draggedItemData && !draggedItemData.isUsed) {
      // If there's already an item in this position, return it to available items
      const existingValue = droppedItems[position];
      if (existingValue) {
        setDragItems(prev => prev.map(item => 
          item.value === existingValue ? { ...item, isUsed: false } : item
        ));
      }
      
      setDroppedItems(prev => ({ ...prev, [position]: draggedItemData.value }));
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
      const position = parseInt(dropZone.getAttribute('data-drop-zone') || '0');
      const draggedItemData = dragItems.find(item => item.id === touchState.draggedItemId);
      
      if (draggedItemData && !draggedItemData.isUsed) {
        // If there's already an item in this position, return it to available items
        const existingValue = droppedItems[position];
        if (existingValue) {
          setDragItems(prev => prev.map(item => 
            item.value === existingValue ? { ...item, isUsed: false } : item
          ));
        }
        
        setDroppedItems(prev => ({ ...prev, [position]: draggedItemData.value }));
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

  const handleRemoveItem = (position: number) => {
    const removedValue = droppedItems[position];
    if (removedValue) {
      setDragItems(prev => prev.map(item => 
        item.value === removedValue ? { ...item, isUsed: false } : item
      ));
      
      setDroppedItems(prev => {
        const newDroppedItems = { ...prev };
        delete newDroppedItems[position];
        return newDroppedItems;
      });
    }
  };

  const getCurrentWord = () => {
    if (!puzzle || wordIndex >= puzzle.puzzles.length) return null;
    return puzzle.puzzles[wordIndex];
  };

  const checkAnswer = () => {
    const currentWord = getCurrentWord();
    if (!currentWord) return;
    
    // Build the guessed word from dropped items
    const originalWord = currentWord.original;
    let guessedWord = '';
    let charIndex = 0;
    
    for (let i = 0; i < originalWord.length; i++) {
      if (originalWord[i] === ' ') {
        guessedWord += ' ';
      } else {
        const droppedChar = droppedItems[charIndex];
        if (droppedChar) {
          guessedWord += droppedChar;
        } else {
          guessedWord += '_';
        }
        charIndex++;
      }
    }
    
    const isCorrect = guessedWord.toLowerCase() === originalWord.toLowerCase();
    setFeedback(isCorrect ? "correct" : "incorrect");
    setTotalAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setGuesses(prev => [...prev, { word: originalWord, description: currentWord.description }]);
      setCorrectAnswers(prev => prev + 1);
    }
    
    setTimeout(() => {
      setFeedback(null);
      if (isCorrect) {
        setWordIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const handleHint = () => {
    const currentWord = getCurrentWord();
    if (!currentWord) return;
    
    const originalWord = currentWord.original;
    const availablePositions = [];
    let charIndex = 0;
    
    for (let i = 0; i < originalWord.length; i++) {
      if (originalWord[i] !== ' ' && !revealedPositions.has(charIndex) && !droppedItems[charIndex]) {
        availablePositions.push(charIndex);
      }
      if (originalWord[i] !== ' ') {
        charIndex++;
      }
    }
    
    if (availablePositions.length > 0) {
      const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
      const correctChar = originalWord.replace(/ /g, '')[randomPosition];
      
      // Auto-place the correct character
      setDroppedItems(prev => ({ ...prev, [randomPosition]: correctChar }));
      setRevealedPositions(prev => new Set([...prev, randomPosition]));
      
      // Mark the character as used
      const matchingItem = dragItems.find(item => item.value === correctChar && !item.isUsed);
      if (matchingItem) {
        setDragItems(prev => prev.map(item => 
          item.id === matchingItem.id ? { ...item, isUsed: true } : item
        ));
      }
      
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleSolve = () => {
    const currentWord = getCurrentWord();
    if (!currentWord) return;
    
    const originalWord = currentWord.original;
    const newDroppedItems: { [position: number]: string } = {};
    let charIndex = 0;
    
    for (let i = 0; i < originalWord.length; i++) {
      if (originalWord[i] !== ' ') {
        newDroppedItems[charIndex] = originalWord[i];
        charIndex++;
      }
    }
    
    setDroppedItems(newDroppedItems);
    setDragItems(prev => prev.map(item => ({ ...item, isUsed: true })));
    
    if (!hasStarted) {
      startTimer();
    }
  };

  const handleResetGame = () => {
    setWordIndex(0);
    setDragItems([]);
    setDroppedItems({});
    setFeedback(null);
    resetTimer();
    setHintsUsed(0);
    setRevealedPositions(new Set());
    setShowCompletionScreen(false);
    setGuesses([]);
    setCorrectAnswers(0);
    setTotalAttempts(0);
    
    const wordPuzzle = generateWordPuzzle(level.themeId, level.difficultyId);
    setPuzzle(wordPuzzle);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-medium">Зареждане на играта...</h2>
      </div>
    );
  }

  if (showCompletionScreen) {
    const incorrectAnswers = totalAttempts - correctAnswers;
    const username = localStorage.getItem('currentPlayerName') || 'Играч';
    
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-600 mb-2">Браво, {username}!</h2>
            <p className="text-lg text-gray-700 mb-4">Завърши всички {puzzle?.puzzles.length || 0} думи!</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Време:</div>
                  <div className="text-xl font-bold text-blue-600">{formatTime(timeLeft)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Резултат:</div>
                  <div className="text-xl font-bold text-green-600">{correctAnswers}/{puzzle?.puzzles.length || 0}</div>
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

  const currentWord = getCurrentWord();
  if (!currentWord) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-medium">Изчисляване на резултата...</h2>
      </div>
    );
  }

  const originalWord = currentWord.original;
  const wordLength = originalWord.replace(/ /g, '').length;
  const allPositionsFilled = Array.from({ length: wordLength }, (_, i) => droppedItems[i] !== undefined).every(Boolean);

  return (
    <>
      {showTimeUpScreen && (
        <TimeUpScreen onReset={handleResetGame} />
      )}
      
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
              Време: {hasStarted ? formatTime(timeLeft) : "00:00 (чакам първо движение)"}
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Дума: {wordIndex + 1}/{puzzle.puzzles.length}
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-md text-sm">
            Подсказки: {hintsUsed}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={async () => {
            // Submit stats when completing game
            if (gameStatsService.isSinglePlayerMode()) {
              try {
                await gameStatsService.submitWordGameStats({
                  correctAnswers,
                  totalAttempts,
                  timeElapsed: timeLeft,
                });
                console.log('Stats submitted via Complete Game button');
              } catch (error) {
                console.error('Failed to submit stats:', error);
              }
            }
            
            setShowCompletionScreen(true);
          }} className="bg-green-100 hover:bg-green-200 border-green-300 text-green-700">
            <Check className="w-4 h-4 mr-2" />
            Завърши играта
          </Button>
          <Button variant="outline" size="sm" onClick={handleSolve}>
            🧠 Реши
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetGame}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Започни отначало
          </Button>
        </div>
      </div>

        {/* Scrambled Letters */}
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mb-6">
        <div className="text-center mb-6">
            <p className="text-gray-500 mb-4">
              Разбъркани букви:
              {originalWord.includes(' ') && (
              <span className="text-sm ml-2">
                  ({originalWord.split(' ').length} думи)
              </span>
            )}
          </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {dragItems.map((item) => (
                <div
                  key={item.id}
                  draggable={!item.isUsed}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-lg border-2 transition-all select-none drag-item-touch ${
                    item.isUsed
                      ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                      : touchState.draggedItemId === item.id
                      ? "bg-blue-200 border-blue-400 shadow-xl"
                      : "bg-white border-gray-300 cursor-move hover:bg-gray-50 active:scale-105"
                  }`}
                  style={{ touchAction: 'none' }}
                >
                  {item.value.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          
          {/* Word Assembly Area */}
          <div className="text-center mb-6">
            <p className="text-gray-500 mb-4">Съставете думата:</p>
            <div className="flex flex-wrap justify-center gap-2 min-h-[4rem] items-center">
              {Array.from({ length: originalWord.length }, (_, i) => {
                if (originalWord[i] === ' ') {
                  return (
                    <div key={`space_${i}`} className="w-8 flex items-center justify-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                  );
                }
                
                // Calculate position index for non-space characters
                const position = originalWord.slice(0, i).replace(/ /g, '').length;
                const droppedValue = droppedItems[position];
                const isRevealed = revealedPositions.has(position);
                
                return (
                  <div
                    key={`drop_${position}`}
                    ref={(el) => { dropZoneRefs.current[position] = el; }}
                    data-drop-zone={position}
                    className={`w-14 h-14 flex items-center justify-center border-2 border-dashed rounded-lg transition-all touch-drop-zone ${
                      droppedValue 
                        ? feedback === "correct" 
                          ? "bg-green-100 border-green-400" 
                          : feedback === "incorrect"
                          ? "bg-red-100 border-red-400"
                          : isRevealed
                          ? "bg-yellow-100 border-yellow-400 cursor-pointer"
                          : "bg-blue-100 border-blue-400 cursor-pointer"
                        : "border-gray-400 bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, position)}
                    onClick={() => droppedValue && feedback === null && !isRevealed && handleRemoveItem(position)}
                  >
                    {droppedValue && (
                      <div className="relative flex items-center justify-center">
                        <span className="text-2xl font-bold">{droppedValue.toUpperCase()}</span>
                        {feedback === null && !isRevealed && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-70 hover:opacity-100 transition-opacity">
                            ×
              </div>
                        )}
            </div>
          )}
        </div>
                );
              })}
            </div>
        </div>
        
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-4">
          <Button 
            variant="outline" 
            onClick={handleHint}
              disabled={revealedPositions.size >= wordLength}
            className="flex items-center gap-2"
          >
            <Lightbulb className="w-4 h-4" />
              Подсказка ({revealedPositions.size}/{wordLength})
            </Button>
            
            {allPositionsFilled && feedback === null && (
              <Button onClick={checkAnswer} className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Провери
          </Button>
            )}
        </div>

          {/* Feedback */}
        {feedback && (
            <div className={`p-3 rounded-md text-white text-center ${
            feedback === "correct" ? "bg-green-500" : "bg-red-500"
          }`}>
            {feedback === "correct" ? (
                <div className="flex items-center justify-center">
                <Check className="w-5 h-5 mr-2" />
                Правилно!
              </div>
            ) : (
                <div>Опитайте отново!</div>
            )}
          </div>
        )}
      </div>

        {/* Progress */}
      <div className="w-full">
        <h3 className="text-lg font-medium mb-4">Познати думи: {guesses.length}</h3>
        <div className="grid gap-3 max-h-60 overflow-y-auto">
          {guesses.map(({ word, description }, index) => (
            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium min-w-fit">
                  {word}
                </div>
                <div className="text-gray-700 text-sm leading-relaxed flex-1">
                  {description || "Няма налично описание"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};
