import React, { useState, useEffect } from "react";
import { GameLevel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CompetitiveGameProps {
  level: GameLevel;
  onComplete: () => void;
  onTimeUp: () => void;
}

interface TeamData {
  id: string;
  name: string;
  score: number;
  players: { name: string; id: string }[];
}

export const CompetitiveGame: React.FC<CompetitiveGameProps> = ({ 
  level, 
  onComplete, 
  onTimeUp 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentTeam, setCurrentTeam] = useState(1);
  const [teams, setTeams] = useState<TeamData[]>([]);
  
  // Get teams from localStorage if available
  useEffect(() => {
    const storedTeams = localStorage.getItem('puzzleGameTeams');
    if (storedTeams) {
      try {
        const parsedTeams = JSON.parse(storedTeams);
        // Initialize with scores
        const teamsWithScores = parsedTeams.map((team: any) => ({
          ...team,
          score: 0
        }));
        setTeams(teamsWithScores);
      } catch (e) {
        console.error('Error parsing teams from localStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    if (teams.length === 0) {
      toast({
        title: "Team Competition Mode",
        description: "Set up teams in the competitive mode to play together!"
      });
    } else {
      toast({
        title: "Teams Ready",
        description: `${teams.length} teams with ${teams.reduce((acc, team) => acc + team.players.length, 0)} players`
      });
    }
  }, [teams, toast]);

  const updateScore = (teamIndex: number, points: number) => {
    setTeams(prev => 
      prev.map((team, idx) => 
        idx === teamIndex - 1 ? { ...team, score: team.score + points } : team
      )
    );
  };

  const handleNextTeam = () => {
    if (currentTeam < teams.length) {
      setCurrentTeam(prev => prev + 1);
    } else {
      // End of round
      const maxScore = Math.max(...teams.map(team => team.score));
      const winningTeams = teams
        .filter(team => team.score === maxScore)
        .map(team => team.name);
      
      toast({
        title: winningTeams.length > 1 ? "It's a tie!" : `${winningTeams[0]} wins!`,
        description: `Final scores: ${teams.map(team => `${team.name}: ${team.score}`).join(', ')}`,
      });
      
      onComplete();
    }
  };

  const goToSetupTeams = () => {
    navigate("/");
    setTimeout(() => {
      document.querySelector<HTMLButtonElement>('[aria-label="Players"]')?.click();
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8 max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader className="bg-primary/10 pb-3">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Users className="h-6 w-6" />
            Multiplayer Competition
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {teams.length > 0 ? (
            <div className="text-center space-y-6">
              <h3 className="font-medium text-xl mb-3">Current Team: {teams[currentTeam - 1]?.name}</h3>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Players:</h4>
                <ul className="list-disc list-inside">
                  {teams[currentTeam - 1]?.players.map(player => (
                    <li key={player.id}>{player.name}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={() => updateScore(currentTeam, 10)}>
                  +10 Points
                </Button>
                <Button onClick={handleNextTeam}>
                  Next Team
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-lg">
                This is a competitive mode where teams compete against each other.
              </p>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">How to play:</h3>
                <ol className="text-left list-decimal list-inside space-y-2">
                  <li>First, set up your teams in the Players panel</li>
                  <li>Each team will have up to 4 players</li>
                  <li>You can drag and drop players between teams to organize as you want</li>
                  <li>Each team takes turns playing mini-games</li>
                  <li>Teams earn points based on their performance</li>
                  <li>The team with the most points at the end wins!</li>
                </ol>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button size="lg" onClick={goToSetupTeams} className="gap-2">
                  <Users className="h-5 w-5" />
                  Set Up Teams
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {teams.length > 0 ? (
          teams.map((team, i) => (
            <Card key={team.id} className={currentTeam === i+1 ? 'border-primary' : 'border-primary/20'}>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium">{team.name}</h3>
                <p className="text-2xl font-bold mt-2">{team.score}</p>
                <p className="text-xs text-muted-foreground mt-1">{team.players.length} players</p>
              </CardContent>
            </Card>
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="opacity-40">
              <CardContent className="p-4 text-center">
                <h3 className="font-medium">Team {i + 1}</h3>
                <p className="text-xs text-muted-foreground mt-1">No players</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
