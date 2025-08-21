import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlayerForm } from "./player-dialog/PlayerForm";
import { PlayerList } from "./player-dialog/PlayerList";
import { TeamDisplay } from "./player-dialog/TeamDisplay";
import { PlayerDialogProps, Team } from "./player-dialog/types";
import { Users, Trophy, Gamepad2, X } from "lucide-react";

export function PlayerDialog({ open, onOpenChange, onGameStart, initialTab = "players" }: PlayerDialogProps) {
  const [players, setPlayers] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<{teamId: string, playerId: string} | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();

  // Load existing teams and players from localStorage when dialog opens
  useEffect(() => {
    if (open) {
      const storedTeams = localStorage.getItem('puzzleGameTeams');
      if (storedTeams) {
        try {
          const parsedTeams = JSON.parse(storedTeams);
          if (parsedTeams && parsedTeams.length > 0) {
            setTeams(parsedTeams);
            
            // Extract all players from teams and add them to players list
            const allPlayers: string[] = [];
            parsedTeams.forEach((team: Team) => {
              team.players.forEach(player => {
                if (!allPlayers.includes(player.name)) {
                  allPlayers.push(player.name);
                }
              });
            });
            setPlayers(allPlayers);
            
            // Use initialTab prop or default to teams if teams exist
            if (initialTab) {
              setActiveTab(initialTab);
            } else if (parsedTeams.length > 0) {
              setActiveTab("teams");
            }
          } else {
            // No teams exist, use initialTab or default to players
            setActiveTab(initialTab);
          }
        } catch (e) {
          console.error('Error parsing teams from localStorage', e);
          setActiveTab(initialTab);
        }
      } else {
        // No stored teams, use initialTab
        setActiveTab(initialTab);
      }
    }
  }, [open, initialTab]);

  const addPlayer = (playerName: string) => {
    setPlayers([...players, playerName]);
  };

  const removePlayer = (index: number) => {
    const playerToRemove = players[index];
    setPlayers(players.filter((_, i) => i !== index));
    
    // Remove player from their team if they are in one
    if (teams.length > 0) {
      const newTeams = teams.map(team => ({
        ...team,
        players: team.players.filter(p => p.name !== playerToRemove)
      }));
      setTeams(newTeams);
      localStorage.setItem('puzzleGameTeams', JSON.stringify(newTeams));
    }
  };

  const generateDummyNames = () => {
    const dummyNames = [
      "Player1", "Player2", "Player3", "Player4", 
      "Player5", "Player6", "Player7", "Player8",
      "Player9", "Player10", "Player11", "Player12",
      "Player13", "Player14", "Player15", "Player16"
    ];
    
    setPlayers(dummyNames);
    toast({
      title: "Dummy players added",
      description: "16 dummy players have been added for testing"
    });
  };

  const createTeams = () => {
    if (players.length < 2) {
      toast({
        title: "Not enough players",
        description: "You need at least 2 players to create teams",
        variant: "destructive"
      });
      return;
    }

    // Always create 4 teams for multiplayer
    const numTeams = 4;
    
    // Create empty teams
    const newTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
      id: `team-${i+1}`,
      name: `Team ${i+1}`,
      players: [],
    }));
    
    // Create a copy of the player list and shuffle it
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Distribute players evenly across teams
    shuffledPlayers.forEach((player, index) => {
      const teamIndex = Math.floor(index / 4); // This ensures 4 players per team
      if (teamIndex < numTeams) { // Only add if we haven't filled all teams
        newTeams[teamIndex].players.push({
          name: player,
          id: `player-${Math.random().toString(36).substring(2, 10)}`
        });
      }
    });
    
    setTeams(newTeams);
    
    // Save teams to localStorage for the CompetitiveGame to access
    localStorage.setItem('puzzleGameTeams', JSON.stringify(newTeams));
    
    toast({
      title: "Teams created",
      description: `Created ${numTeams} teams with ${Math.min(players.length, 16)} players`,
    });
    
    // Automatically switch to teams tab after creating teams
    setActiveTab("teams");
  };

  const resetTeams = () => {
    if (teams.length > 0) {
      createTeams();
    }
  };

  const startGame = () => {
    if (teams.length === 0) {
      toast({
        title: "Няма създадени отбори",
        description: "Моля създайте отбори първо",
        variant: "destructive"
      });
      return;
    }

    // Check if teams have at least some players
    const totalPlayers = teams.reduce((acc, team) => acc + team.players.length, 0);
    if (totalPlayers < 2) {
      toast({
        title: "Недостатъчно играчи в отборите",
        description: "Трябва да има поне 2 играча разпределени в отборите",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Започване на мултиплейър игра",
      description: `${teams.length} отбора ще се състезават`,
    });
    
    // Save the final teams to localStorage before starting the game
    localStorage.setItem('puzzleGameTeams', JSON.stringify(teams));
    
    onOpenChange(false);
    
    // Call the callback to navigate to competitive menu
    if (onGameStart) {
      onGameStart();
    }
  };

  const handleDragStart = (teamId: string, playerId: string) => {
    setDraggedPlayer({ teamId, playerId });
  };

  const handleDrop = (targetTeamId: string, targetPlayerSlot?: string) => {
    if (!draggedPlayer) return;

    const sourceTeam = teams.find(t => t.id === draggedPlayer.teamId);
    if (!sourceTeam) return;

    const sourcePlayerIndex = sourceTeam.players.findIndex(p => p.id === draggedPlayer.playerId);
    if (sourcePlayerIndex === -1) return;
    
    const sourcePlayer = sourceTeam.players[sourcePlayerIndex];
    
    const targetTeam = teams.find(t => t.id === targetTeamId);
    if (!targetTeam) return;

    if (targetPlayerSlot) {
      const targetPlayerIndex = targetTeam.players.findIndex(p => p.id === targetPlayerSlot);
      
      if (targetPlayerIndex !== -1) {
        const targetPlayer = targetTeam.players[targetPlayerIndex];
        
        // Create new teams array with swapped players
        const newTeams = teams.map(team => {
          if (team.id === sourceTeam.id) {
            const newPlayers = [...team.players];
            newPlayers[sourcePlayerIndex] = targetPlayer;
            return { ...team, players: newPlayers };
          } 
          if (team.id === targetTeam.id) {
            const newPlayers = [...team.players];
            newPlayers[targetPlayerIndex] = sourcePlayer;
            return { ...team, players: newPlayers };
          }
          return team;
        });
        
        setTeams(newTeams);
        localStorage.setItem('puzzleGameTeams', JSON.stringify(newTeams));
      }
    } else {
      // Handle dropping into an empty team slot
      if (targetTeam.players.length < 4) {
        const newTeams = teams.map(team => {
          if (team.id === sourceTeam.id) {
            return { 
              ...team,
              players: team.players.filter(p => p.id !== sourcePlayer.id)
            };
          } 
          if (team.id === targetTeam.id) {
            return { 
              ...team, 
              players: [...team.players, sourcePlayer]
            };
          }
          return team;
        });
        
        setTeams(newTeams);
        localStorage.setItem('puzzleGameTeams', JSON.stringify(newTeams));
      }
    }
    
    setDraggedPlayer(null);
  };

  const handleTabChange = (value: string) => {
    if (value === "players" || value === "teams") {
      setActiveTab(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`dialog-content ${activeTab === "teams" ? "sm:max-w-7xl" : "sm:max-w-4xl"} max-h-[95vh] overflow-hidden border-0 p-0 bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 shadow-2xl [&>button]:hidden`}>
        
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <Tabs value={activeTab} className="w-full h-full flex flex-col" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 mb-6 bg-white/90 border border-white/50 shadow-sm">
              <TabsTrigger 
                value="players" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                <Gamepad2 className="w-4 h-4" />
                Играчи
              </TabsTrigger>
              <TabsTrigger 
                value="teams" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
              >
                <Trophy className="w-4 h-4" />
                Отбори
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-auto">
              <TabsContent value="players" className="mt-0 space-y-6">
                <div className="bg-white/85 rounded-2xl p-6 shadow-lg border border-white/50">
                  <PlayerForm 
                    onAddPlayer={addPlayer} 
                    generateDummyNames={generateDummyNames} 
                    playerCount={players.length}
                  />
                </div>
                
                <div className="bg-white/85 rounded-2xl p-6 shadow-lg border border-white/50">
                  <PlayerList 
                    players={players} 
                    onRemovePlayer={removePlayer} 
                    onCreateTeams={createTeams}
                    generateDummyNames={generateDummyNames}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="teams" className="mt-0">
                <div className="bg-white/85 rounded-2xl p-6 shadow-lg border border-white/50">
                  <TeamDisplay 
                    teams={teams}
                    onResetTeams={resetTeams}
                    onCreateTeams={createTeams}
                    draggedPlayer={draggedPlayer}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {/* Custom Footer */}
        <div className="bg-white/30 border-t border-white/50 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700 font-medium">
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="bg-white/80 border-white/70 hover:bg-white/90"
              >
                Затвори
              </Button>
              <Button 
                onClick={startGame} 
                disabled={teams.length === 0 || teams.reduce((acc, team) => acc + team.players.length, 0) < 2} 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Започни игра
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
