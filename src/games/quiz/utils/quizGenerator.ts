
import { quizBanks } from '../quizBanks';

// Generate quiz questions based on theme
export const generateQuizQuestions = (themeId: string, count: number = 10) => {
  console.log(`generateQuizQuestions called with: themeId=${themeId}, count=${count}`);
  
  let themeQuestions = [];
  
  if (themeId === "history") {
    themeQuestions = quizBanks.history;
  } else if (themeId === "science") {
    themeQuestions = quizBanks.science;
  } else if (themeId === "geography") {
    themeQuestions = quizBanks.geography;
  } else if (themeId === "mixed" || !themeId) {
    // Mixed theme for competitive mode - combine all question types
    themeQuestions = [...quizBanks.history, ...quizBanks.science, ...quizBanks.geography];
    console.log(`Using mixed theme with ${themeQuestions.length} total questions`);
  } else {
    // Fallback for any other theme - use a random theme
    const allThemes = [quizBanks.history, quizBanks.science, quizBanks.geography];
    themeQuestions = allThemes[Math.floor(Math.random() * allThemes.length)];
    console.log(`Using fallback random theme with ${themeQuestions.length} questions`);
  }
  
  console.log(`Selected ${themeQuestions.length} questions for theme processing`);
  
  // Shuffle and select requested number of questions
  const shuffledQuestions = [...themeQuestions].sort(() => Math.random() - 0.5);
  
  // Make sure we have enough questions
  const numQuestions = Math.min(count, shuffledQuestions.length);
  console.log(`Selecting ${numQuestions} questions from ${shuffledQuestions.length} available`);
  
  const questions = shuffledQuestions.slice(0, numQuestions);
  
  console.log(`Final result: ${questions.length} questions generated`);
  return questions;
};
