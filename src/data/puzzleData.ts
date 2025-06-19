import { PuzzleCategory, Theme, Difficulty, LevelDetails } from "@/types";

export const themes: Record<string, Theme[]> = {
  memory: [
    { id: "animals", name: "Животни", color: "#F59E0B", icon: "🐶" },
    { id: "food", name: "Храна", color: "#EF4444", icon: "🍎" },
    { id: "sports", name: "Спорт", color: "#3B82F6", icon: "⚽" },
  ],
  logic: [
    { id: "patterns", name: "Свържи еднакви", color: "#8B5CF6", icon: "🔍" },
  ],
  math: [
    { id: "addition", name: "Събиране", color: "#8B5CF6", icon: "➕" },
    { id: "subtraction", name: "Изваждане", color: "#EC4899", icon: "➖" },
    { id: "multiplication", name: "Умножение", color: "#3B82F6", icon: "✖️" },
  ],
  words: [
    { id: "sport", name: "Спорт", color: "#8B5CF6", icon: "🏆" },
    { id: "food", name: "Храна", color: "#EC4899", icon: "🍔" },
    { id: "places", name: "Места", color: "#3B82F6", icon: "🏝️" },
  ],
  quiz: [
    { id: "history", name: "История", color: "#8B5CF6", icon: "📜" },
    { id: "science", name: "Наука", color: "#EC4899", icon: "🔬" },
    { id: "geography", name: "География", color: "#3B82F6", icon: "🌍" },
  ],
  competitive: [
    { id: "memory", name: "Памет", color: "#8B5CF6", icon: "🧠" },
  ],
  speed: [
    { id: "color-match", name: "Съвпадение на цветове", color: "#10B981", icon: "🎨" }
  ],
};

export const difficulties: Difficulty[] = [
  { id: "easy", name: "Лесно", color: "#8B5CF6" },
  { id: "medium", name: "Средно", color: "#F59E0B" },
  { id: "hard", name: "Сложно", color: "#EF4444" },
];

export const normalDifficulty: Difficulty[] = [
  { id: "medium", name: "Нормално", color: "#F59E0B" },
];

export const levelDetails: Record<string, LevelDetails> = {
  "1": {
    moves: 2,
    time: "1:00",
    grid: "2×2",
  },
  "2": {
    moves: 4,
    time: "1:30",
    grid: "3×3",
  },
  "3": {
    moves: 6,
    time: "2:00",
    grid: "4×4",
  },
  "4": {
    moves: 8,
    time: "2:30",
    grid: "4×5",
  },
  "5": {
    moves: 10,
    time: "3:00",
    grid: "5×5",
  },
};

export const puzzleCategories: PuzzleCategory[] = [
  {
    id: "memory",
    name: "Игра на паметта",
    icon: "brain.png",
    backgroundColor: "#F3E8FF",
    themes: themes.memory,
    difficulties: normalDifficulty,
    levels: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
    ],
  },
  {
    id: "logic",
    name: "Логически пъзели",
    icon: "puzzle.png",
    backgroundColor: "#E0F2FE",
    themes: themes.logic,
    difficulties: normalDifficulty,
    levels: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
    ],
  },
  {
    id: "math",
    name: "Математически предизвикателства",
    icon: "calculator.png",
    backgroundColor: "#FCE7F3",
    themes: themes.math,
    difficulties: difficulties,
    levels: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
    ],
  },
  {
    id: "words",
    name: "Словесни пъзели",
    icon: "text.png",
    backgroundColor: "#E0E7FF",
    themes: themes.words,
    difficulties: difficulties,
    levels: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
    ],
  },
  {
    id: "quiz",
    name: "Викторина",
    icon: "question.png",
    backgroundColor: "#FCE7F3",
    themes: themes.quiz,
    difficulties: difficulties,
    levels: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
    ],
  },
  {
    id: "competitive",
    name: "Състезателни игри",
    icon: "users.png",
    backgroundColor: "#DBEAFE",
    themes: themes.competitive,
    difficulties: difficulties,
    levels: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 7 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
    ],
  },
  {
    id: "speed",
    name: "Скоростна игра",
    icon: "timer.png",
    backgroundColor: "#FEF3C7",
    themes: themes.speed,
    difficulties: difficulties.filter(d => d.id === "easy"),
    levels: [
      { id: 1 },
      { id: 2 },
    ],
  },
];
