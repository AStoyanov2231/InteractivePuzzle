export interface Theme {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Difficulty {
  id: string;
  name: string;
  color: string;
}

export interface Level {
  id: number;
}

export interface LevelDetails {
  moves: number;
  time: string;
  grid: string;
}

export interface PuzzleCategory {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  themes: Theme[];
  difficulties: Difficulty[];
  levels: Level[];
}

// Game implementation interfaces
export interface GameLevel {
  id: number;
  themeId: string;
  difficultyId: string;
  isLocked: boolean;
  title: string;
  description: string;
  timeLimit: number; // in seconds
  moves: number;
  grid: string;
  content?: any; // This will be specific to each game type
}

export interface GameData {
  categoryId: string;
  levels: GameLevel[];
}

// Memory game specific types
export interface MemoryGameItem {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Logic game specific types
export interface LogicPuzzleItem {
  value: string;
  solution: boolean;
}

// Math game specific types
export interface MathProblem {
  question: string;
  answer: number;
  options: number[];
}

// Word game specific types
export interface WordPuzzle {
  original: string;
  scrambled: string;
}

// Quiz game specific types
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Models game specific types
export interface ModelCell {
  filled: boolean;
  correct: boolean;
  selected: boolean;
}
