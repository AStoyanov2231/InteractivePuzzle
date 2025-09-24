import React from "react";
import { GameLevel } from "@/types";
import { MemoryGame } from "./memory/MemoryGame";
import { LogicGame } from "./logic/LogicGame";
import { MathGame } from "./math/MathGame";
import { WordGame } from "./words/WordGame";
import { QuizGame } from "./quiz/QuizGame";
import { CompetitiveGame } from "./competitive/CompetitiveGame";
import { SpeedGame } from "./speed/SpeedGame";
import { isMobilePWALandscape } from "@/utils/pwaUtils";

interface GameManagerProps {
  categoryId: string;
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
  onBackToSelection?: () => void;
  onGameStateChange?: (isInCategorySelection: boolean) => void;
}

export const GameManager: React.FC<GameManagerProps> = ({ 
  categoryId, 
  level, 
  onComplete, 
  onTimeUp,
  onBackToSelection,
  onGameStateChange
}) => {
  // Ensure we have a valid category ID
  const safeCategory = categoryId?.toLowerCase() || "";
  
  // Check if we're in landscape mode for PWA
  const isLandscapeMode = isMobilePWALandscape();
  
  // Render the appropriate game component based on the category
  switch (safeCategory) {
    case "memory":
      return <MemoryGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} isLandscapeMode={isLandscapeMode} />;
    
    case "logic":
      return <LogicGame key={level.id} level={level} onComplete={onComplete} onTimeUp={onTimeUp} isLandscapeMode={isLandscapeMode} />;
    
    case "math":
      return <MathGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} isLandscapeMode={isLandscapeMode} />;
    
    case "words":
      return <WordGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} isLandscapeMode={isLandscapeMode} />;
    
    case "quiz":
      return <QuizGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} isLandscapeMode={isLandscapeMode} />;
    
    case "competitive":
      return <CompetitiveGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} isLandscapeMode={isLandscapeMode} />;
    
    case "speed":
      return <SpeedGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} onBackToSelection={onBackToSelection} onGameStateChange={onGameStateChange} isLandscapeMode={isLandscapeMode} />;
    
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-medium mb-4">Неподдържана категория игра</h2>
          <p>Категорията "{categoryId}" в момента не е имплементирана.</p>
        </div>
      );
  }
};
