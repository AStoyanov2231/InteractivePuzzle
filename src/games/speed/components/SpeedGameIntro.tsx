
import { GameLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface SpeedGameIntroProps {
  level: GameLevel;
  onStart: () => void;
}

export const SpeedGameIntro: React.FC<SpeedGameIntroProps> = ({ level, onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center px-4">
      <div className="bg-gradient-to-br from-green-400 to-blue-500 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <Zap className="w-12 h-12 text-white" />
      </div>
      
      <h1 className="text-3xl font-bold mb-3 text-gray-800">Скоростна игра с цветове</h1>
      
      <div className="mb-8">
        <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full font-medium">
          {level.difficultyId === "easy" ? "Нормална скорост" : "Висока скорост"}
        </span>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Правила на играта</h2>
        
        <ul className="space-y-3 text-left text-gray-600">
          <li className="flex items-start">
            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">1</span>
            <span>В горната част на екрана ще виждате цвят (зелено или синьо)</span>
          </li>
          <li className="flex items-start">
            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">2</span>
            <span>В долната част има два квадрата - един със зелен и един със син цвят</span>
          </li>
          <li className="flex items-start">
            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">3</span>
            <span>Трябва да натиснете квадрата със същия цвят, който е показан отгоре</span>
          </li>
          <li className="flex items-start">
            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">4</span>
            <span>Позицията на цветовете в долните квадрати се променя на случаен принцип</span>
          </li>
          <li className="flex items-start">
            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-0.5">5</span>
            <span>Цветът ще се сменя автоматично на всеки {level.difficultyId === "easy" ? "2 секунди" : "1 секунда"}</span>
          </li>
        </ul>
      </div>
      
      <Button 
        onClick={onStart} 
        className="px-8 py-6 text-lg font-semibold"
        size="lg"
      >
        Започни играта
      </Button>
    </div>
  );
};
