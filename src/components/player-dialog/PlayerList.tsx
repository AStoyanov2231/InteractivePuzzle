import { Users, UserPlus, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlayerListProps {
  players: string[];
  onRemovePlayer: (index: number) => void;
  onCreateTeams: () => void;
  generateDummyNames: () => void;
}

export function PlayerList({ players, onRemovePlayer, onCreateTeams, generateDummyNames }: PlayerListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Списък с играчи ({players.length}/16)</h3>
          </div>
        </div>
        
        <div className="flex gap-2">
          {players.length >= 2 && (
            <Button 
              onClick={onCreateTeams}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl shadow-md"
            >
              <Crown className="mr-2 w-4 h-4" />
              Създай отбори
            </Button>
          )}
        </div>
      </div>
      
      {players.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-2">Все още няма добавени играчи</p>
        </div>
      ) : (
        <div className="bg-white/50 rounded-xl p-4 border border-white/60">
          <ScrollArea className="h-[280px] pr-4">
            <div className="grid grid-cols-2 gap-3">
              {players.map((player, index) => (
                <div 
                  key={index} 
                  className="group flex items-center justify-between bg-white/95 p-3 rounded-xl border border-white/70 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-800 font-medium truncate max-w-[120px]" title={player}>
                      {player}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onRemovePlayer(index)} 
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}