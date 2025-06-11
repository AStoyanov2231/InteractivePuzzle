import { ArrowRight, Shuffle, Users, UserPlus, Trophy, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TouchDragProvider } from "@/components/ui/TouchDragProvider";
import { TouchDraggable } from "@/components/ui/TouchDraggable";
import { TouchDropTarget } from "@/components/ui/TouchDropTarget";
import { useState } from "react";

interface TeamPlayer {
  name: string;
  id: string;
}

interface Team {
  id: string;
  name: string;
  players: TeamPlayer[];
}

interface TeamDisplayProps {
  teams: Team[];
  onResetTeams: () => void;
  onCreateTeams: () => void;
  draggedPlayer: { teamId: string; playerId: string } | null;
  onDragStart: (teamId: string, playerId: string) => void;
  onDrop: (targetTeamId: string, targetPlayerSlot?: string) => void;
}

export function TeamDisplay({ 
  teams, 
  onResetTeams, 
  onCreateTeams, 
  draggedPlayer, 
  onDragStart, 
  onDrop 
}: TeamDisplayProps) {
  const [dragOverTarget, setDragOverTarget] = useState<{ teamId: string; playerId?: string } | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTouchDrop = (draggedItem: any, targetData: any) => {
    onDrop(targetData.teamId, targetData.playerId);
  };

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
          <Trophy className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Все още няма създадени отбори</h3>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          Добавете играчи и създайте отбори, за да започнете.
        </p>
        <Button 
          onClick={onCreateTeams}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
        >
          <Crown className="mr-2 w-5 h-5" />
          Създай отбори
        </Button>
      </div>
    );
  }

  const teamColors = [
    { from: 'from-red-400', to: 'to-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { from: 'from-blue-400', to: 'to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { from: 'from-green-400', to: 'to-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { from: 'from-purple-400', to: 'to-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
  ];

  return (
    <TouchDragProvider onDrop={handleTouchDrop}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Отбори ({teams.length})</h3>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={onResetTeams}
            className="bg-white/60 backdrop-blur-sm border-white/50 hover:bg-white/70 text-gray-700 rounded-xl"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Разбъркай
          </Button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ touchAction: 'none' }}>
        {teams.map((team, teamIndex) => {
          const colors = teamColors[teamIndex] || teamColors[0];
          
          return (
            <Card 
              key={team.id} 
              data-team-id={team.id}
              className={`border-2 ${team.players.length > 0 ? colors.border : 'border-dashed border-gray-300'} shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden ${
                dragOverTarget?.teamId === team.id ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={() => onDrop(team.id)}
            >
              <CardContent className="p-0">
                {/* Team Header */}
                <div className={`bg-gradient-to-r ${colors.from} ${colors.to} p-4 text-center`}>
                  <h4 className="font-bold text-white text-lg flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5" />
                    {team.name}
                  </h4>
                  <p className="text-white/80 text-sm font-medium">
                    {team.players.length}/4 играча
                  </p>
                </div>
                
                {/* Players */}
                <div className="p-4 space-y-3 min-h-[200px]">
                  {team.players.map((player, playerIndex) => (
                    <TouchDropTarget
                      key={player.id}
                      targetData={{ teamId: team.id, playerId: player.id }}
                      onDrop={handleTouchDrop}
                      activeClassName="ring-2 ring-blue-400 ring-opacity-50"
                    >
                      <TouchDraggable
                        dragData={{
                          id: player.id,
                          data: { teamId: team.id, playerId: player.id },
                          displayName: player.name
                        }}
                        onDragStart={() => onDragStart(team.id, player.id)}
                        className={`group flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-grab select-none ${
                          draggedPlayer?.playerId === player.id
                            ? 'opacity-50 bg-gray-100 border-2 border-dashed border-gray-400 scale-105' 
                            : `${colors.bg} hover:bg-opacity-80 border-2 ${colors.border} hover:shadow-md`
                        }`}
                      >
                        <div 
                          data-player-id={player.id}
                          draggable
                          onDragStart={() => onDragStart(team.id, player.id)}
                          onDrop={(e) => {
                            e.stopPropagation();
                            onDrop(team.id, player.id);
                          }}
                          onDragOver={handleDragOver}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${colors.from} ${colors.to} flex items-center justify-center text-white text-sm font-bold`}>
                              {playerIndex + 1}
                            </div>
                            <span className="font-medium text-gray-800 truncate max-w-[100px]" title={player.name}>
                              {player.name}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </TouchDraggable>
                    </TouchDropTarget>
                  ))}
                  
                  {/* Empty Slots */}
                  {Array.from({ length: 4 - team.players.length }).map((_, i) => (
                    <TouchDropTarget
                      key={`empty-${i}`}
                      targetData={{ teamId: team.id, playerId: undefined }}
                      onDrop={handleTouchDrop}
                      activeClassName="ring-2 ring-blue-400 ring-opacity-50 bg-blue-50"
                      className="flex items-center justify-center p-3 text-gray-400 bg-gray-50/80 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100/80 transition-all duration-200 min-h-[48px]"
                    >
                      <div 
                        data-empty-slot={`${team.id}-${i}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          e.stopPropagation();
                          onDrop(team.id);
                        }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Празно място</span>
                      </div>
                    </TouchDropTarget>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </TouchDragProvider>
  );
}
