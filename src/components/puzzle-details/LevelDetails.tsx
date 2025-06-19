import { Clock, Grid, Gamepad2 } from "lucide-react";
import { GameLevel } from "@/types";

interface LevelDetailsProps {
  level: GameLevel;
}

export const LevelDetails = ({
  level
}: LevelDetailsProps) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/30 space-y-6">
      <h4 className="text-2xl font-bold mb-6 text-gray-800">Детайли за нивото</h4>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/20">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Време</p>
            <p className="text-xl font-bold text-gray-800">{level.timeLimit}s</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/20">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Ходове</p>
            <p className="text-xl font-bold text-gray-800">{level.moves}</p>
          </div>
        </div>
        

        
        <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/20">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Grid className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Мрежа</p>
            <p className="text-xl font-bold text-gray-800">{level.grid}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-6 bg-white/70 rounded-2xl border border-white/30 backdrop-blur-sm">
        <h5 className="font-bold mb-3 text-lg text-gray-800">{level.title}</h5>
        <p className="text-gray-700 text-base leading-relaxed">{level.description}</p>
      </div>
    </div>
  );
};