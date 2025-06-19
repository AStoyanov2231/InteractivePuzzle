import React from "react";
import { GameLevel } from "@/types";
import { MemoryGame } from "./memory/MemoryGame";
import { LogicGame } from "./logic/LogicGame";
import { MathGame } from "./math/MathGame";
import { WordGame } from "./words/WordGame";
import { QuizGame } from "./quiz/QuizGame";
import { CompetitiveGame } from "./competitive/CompetitiveGame";
import { SpeedGame } from "./speed/SpeedGame";

interface GameManagerProps {
  categoryId: string;
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
}

export const GameManager: React.FC<GameManagerProps> = ({ 
  categoryId, 
  level, 
  onComplete, 
  onTimeUp 
}) => {
  // Ensure we have a valid category ID
  const safeCategory = categoryId?.toLowerCase() || "";
  
  // Render the appropriate game component based on the category
  switch (safeCategory) {
    case "memory":
      return <MemoryGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} />;
    
    case "logic":
      return <LogicGame key={level.id} level={level} onComplete={onComplete} onTimeUp={onTimeUp} />;
    
    case "math":
      return <MathGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} />;
    
    case "words":
      return <WordGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} />;
    
    case "quiz":
      return <QuizGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} />;
    
    case "competitive":
      return <CompetitiveGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} />;
    
    case "speed":
      return <SpeedGame level={level} onComplete={onComplete} onTimeUp={onTimeUp} />;
    
    default:
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-medium mb-4">Неподдържана категория игра</h2>
          <p>Категорията "{categoryId}" в момента не е имплементирана.</p>
        </div>
      );
  }
};
