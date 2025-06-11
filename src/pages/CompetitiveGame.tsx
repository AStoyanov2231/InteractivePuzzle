import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemoryGame } from "@/games/memory/MemoryGame";
import { FullscreenButton } from "@/components/FullscreenButton";
import { useToast } from "@/hooks/use-toast";
import { GameLevel } from "@/types";

interface TeamData {
  id: string;
  name: string;
  players: { name: string; id: string }[];
}

const CompetitiveGame = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("");

  // Default game level for competitive memory game
  const gameLevel: GameLevel = {
    id: 1,
    themeId: "memory",
    difficultyId: "medium",
    isLocked: false,
    title: "Състезателна игра на паметта",
    description: "Игра на паметта с категории",
    timeLimit: 300, // 5 minutes
    moves: 50,
    grid: "4×4",
  };

  useEffect(() => {
    // Load teams from localStorage
    const storedTeams = localStorage.getItem('puzzleGameTeams');
    if (storedTeams) {
      try {
        const parsedTeams = JSON.parse(storedTeams);
        setTeams(parsedTeams);
        // Set initial player
        if (parsedTeams.length > 0 && parsedTeams[0].players.length > 0) {
          setCurrentPlayerId(parsedTeams[0].players[0].id);
        }
      } catch (e) {
        console.error('Error parsing teams from localStorage', e);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [categoryId, navigate]);

  const currentTeam = teams[currentTeamIndex];
  const totalGamesPlayed = currentTeamIndex;
  const totalGames = teams.length;

  const handleNextTeam = useCallback(() => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (currentTeamIndex < teams.length - 1) {
        // Move to next team
        const nextTeamIndex = currentTeamIndex + 1;
        setCurrentTeamIndex(nextTeamIndex);
        setGameKey(prev => prev + 1);
        
        // Set the first player of the next team as current
        if (teams[nextTeamIndex] && teams[nextTeamIndex].players.length > 0) {
          setCurrentPlayerId(teams[nextTeamIndex].players[0].id);
        }
        
        setIsTransitioning(false);
      } else {
        // All teams have played - end game
        setGameComplete(true);
        setIsTransitioning(false);
        
        toast({
          title: "Състезанието приключи!",
          description: "Всички отбори играха своите игри!",
        });
      }
    }, 1500); // Short transition delay
  }, [currentTeamIndex, teams.length, teams, toast]);

  const handleGameComplete = useCallback(() => {
    if (currentTeam) {
      toast({
        title: `${currentTeam.name} завърши!`,
        description: "Играта е завършена успешно!",
      });
    }

    // Move to next team after brief pause
    setTimeout(() => {
      handleNextTeam();
    }, 2000);
  }, [currentTeam, toast, handleNextTeam]);

  const handlePlayerTurn = useCallback((playerId: string) => {
    setCurrentPlayerId(playerId);
  }, []);

  const handleBack = () => {
    navigate("/?category=competitive");
  };

  const handleRestartGame = () => {
    setCurrentTeamIndex(0);
    setGameComplete(false);
    setGameKey(prev => prev + 1);
    setIsTransitioning(false);
    // Reset to first player of first team
    if (teams.length > 0 && teams[0].players.length > 0) {
      setCurrentPlayerId(teams[0].players[0].id);
    }
  };

  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Зареждане...</h2>
          <Button onClick={() => navigate('/')}>Назад към началото</Button>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 py-6 px-6">
        <FullscreenButton className="fixed top-4 right-4 z-50" />
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={handleBack} 
              variant="outline" 
              className="flex items-center gap-2 rounded-2xl shadow-lg bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/30"
            >
              <ArrowLeft size={18} />
              Назад
            </Button>
          </div>

          <div className="text-center space-y-6">
            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl text-white flex items-center justify-center gap-3">
                  <Trophy className="w-8 h-8" />
                  Състезанието приключи!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Участвали отбори:</h3>
                  <div className="grid gap-3">
                    {teams.map((team, index) => (
                      <div key={team.id} className="flex items-center justify-between bg-white/20 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-blue-500">
                            {index + 1}
                          </div>
                          <span className="font-medium">{team.name}</span>
                        </div>
                        <span className="text-sm">Завършен</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestartGame} size="lg" className="gap-2">
                <RotateCcw className="w-5 h-5" />
                Ново състезание
              </Button>
              <Button onClick={handleBack} variant="outline" size="lg">
                Назад към игрите
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentPlayer = () => {
    if (!currentTeam) return null;
    return currentTeam.players.find(player => player.id === currentPlayerId);
  };

  const currentPlayer = getCurrentPlayer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 flex">
      <FullscreenButton className="fixed top-4 right-4 z-50" />
      
      {/* Left Sidebar - Team Progress */}
      <div className="w-80 bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 shadow-2xl">
        <div className="p-6">
          <Button 
            onClick={handleBack} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 mb-6 bg-white/80 hover:bg-white border-orange-300"
          >
            <ArrowLeft size={18} />
            Назад
          </Button>

          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-center text-gray-800 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Състезание
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-sm text-gray-600 mb-4">
                  Отбор {currentTeamIndex + 1} от {teams.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentTeamIndex) / teams.length) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {currentTeam && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-800">Текущ отбор</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="font-medium text-blue-600">{currentTeam.name}</div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">Играчи:</div>
                      {currentTeam.players.map((player, idx) => (
                        <div 
                          key={idx} 
                          className={`text-sm rounded px-2 py-1 transition-all duration-300 ${
                            player.id === currentPlayerId 
                              ? 'bg-blue-500 text-white font-medium' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {player.name}
                          {player.id === currentPlayerId && ' (играе сега)'}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800">Всички отбори</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teams.map((team, index) => (
                    <div 
                      key={team.id} 
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        index === currentTeamIndex 
                          ? 'bg-blue-100 border-2 border-blue-300' 
                          : index < currentTeamIndex 
                            ? 'bg-green-100 border border-green-300' 
                            : 'bg-gray-100 border border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-sm">{team.name}</span>
                      <span className="text-xs">
                        {index < currentTeamIndex ? '✓' : index === currentTeamIndex ? '▶' : '○'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-6">
        <div className="h-full">
          {isTransitioning ? (
            <div className="h-full flex items-center justify-center">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl p-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-4">
                    {currentTeamIndex >= teams.length ? 'Състезанието приключи!' : 'Следващ отбор...'}
                  </div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-6 h-full">
              <div className="h-full flex flex-col">
                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 overflow-auto">
                  <MemoryGame 
                    key={gameKey}
                    level={gameLevel} 
                    onComplete={handleGameComplete} 
                    onTimeUp={handleGameComplete}
                    currentTeam={currentTeam}
                    onPlayerTurn={handlePlayerTurn}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitiveGame; 