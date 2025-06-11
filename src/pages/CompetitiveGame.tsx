import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemoryGame } from "@/games/memory/MemoryGame";
import { MathGame } from "@/games/math/MathGame";
import { WordGame } from "@/games/words/WordGame";
import { QuizGame } from "@/games/quiz/QuizGame";
import { FullscreenButton } from "@/components/FullscreenButton";
import { useToast } from "@/hooks/use-toast";
import { GameLevel } from "@/types";

interface TeamData {
  id: string;
  name: string;
  players: { name: string; id: string }[];
  points?: number; // Add points field for competitive scoring
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

  // Get game configuration based on category
  const getGameConfig = (category: string): { level: GameLevel; title: string } => {
    switch (category) {
      case 'memory':
        return {
          level: {
            id: 1,
            themeId: "memory",
            difficultyId: "medium",
            isLocked: false,
            title: "Състезателна игра на паметта",
            description: "Игра на паметта с категории",
            timeLimit: 300, // 5 minutes
            moves: 50,
            grid: "4×4",
          },
          title: "Битка на паметта"
        };
      case 'math':
        return {
          level: {
            id: 1,
            themeId: "math",
            difficultyId: "medium",
            isLocked: false,
            title: "Математически маратон",
            description: "Бързи математически изчисления",
            timeLimit: 180, // 3 minutes
            moves: 20,
            grid: "3×3",
          },
          title: "Математически маратон"
        };
      case 'words':
        return {
          level: {
            id: 1,
            themeId: "words",
            difficultyId: "medium",
            isLocked: false,
            title: "Словесни състезания",
            description: "Отгатване на разбъркани думи",
            timeLimit: 240, // 4 minutes
            moves: 15,
            grid: "4×3",
          },
          title: "Словесни състезания"
        };
      case 'quiz':
        return {
          level: {
            id: 1,
            themeId: "quiz",
            difficultyId: "medium",
            isLocked: false,
            title: "Блицвикторина",
            description: "Бързи въпроси от различни области",
            timeLimit: 300, // 5 minutes
            moves: 10,
            grid: "2×5",
          },
          title: "Блицвикторина"
        };
      default:
        return {
          level: {
            id: 1,
            themeId: "memory",
            difficultyId: "medium",
            isLocked: false,
            title: "Състезателна игра на паметта",
            description: "Игра на паметта с категории",
            timeLimit: 300,
            moves: 50,
            grid: "4×4",
          },
          title: "Битка на паметта"
        };
    }
  };

  const gameConfig = getGameConfig(categoryId || 'memory');
  const gameLevel = gameConfig.level;
  const gameTitle = gameConfig.title;

  useEffect(() => {
    // Load teams from localStorage
    const storedTeams = localStorage.getItem('puzzleGameTeams');
    if (storedTeams) {
      try {
        const parsedTeams = JSON.parse(storedTeams);
        console.log('Loaded teams from localStorage:', parsedTeams);
        
        // Reset points to 0 for fresh competition (prevents accumulated points issue)
        const teamsWithResetPoints = parsedTeams.map((team: TeamData) => ({
          ...team,
          points: 0 // Always start with 0 points for a fresh competition
        }));
        setTeams(teamsWithResetPoints);
        
        // Save the reset teams back to localStorage
        localStorage.setItem('puzzleGameTeams', JSON.stringify(teamsWithResetPoints));
        
        // Set initial player
        if (teamsWithResetPoints.length > 0 && teamsWithResetPoints[0].players.length > 0) {
          setCurrentPlayerId(teamsWithResetPoints[0].players[0].id);
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

  const handleGameComplete = useCallback((points?: number) => {
    console.log('Game completed with points:', points, 'for team:', currentTeam?.name);
    
    if (currentTeam && points !== undefined) {
      // Update team points
      const updatedTeams = teams.map((team, index) => 
        index === currentTeamIndex 
          ? { ...team, points: (team.points || 0) + points }
          : team
      );
      setTeams(updatedTeams);
      
      // Save updated teams to localStorage
      localStorage.setItem('puzzleGameTeams', JSON.stringify(updatedTeams));
      
      console.log('Updated teams:', updatedTeams);
      
      toast({
        title: `${currentTeam.name} завърши!`,
        description: `Спечелихте ${points} точки! Общо: ${(currentTeam.points || 0) + points} точки`,
      });
    } else if (currentTeam) {
      toast({
        title: `${currentTeam.name} завърши!`,
        description: "Играта е завършена!",
      });
    }

    // Move to next team after brief pause
    setTimeout(() => {
      handleNextTeam();
    }, 2000);
  }, [currentTeam, toast, handleNextTeam, teams, currentTeamIndex]);

  const handlePlayerTurn = useCallback((playerId: string) => {
    setCurrentPlayerId(playerId);
  }, []);

  const handleBack = () => {
    navigate("/?category=competitive");
  };

  const handleRestartGame = () => {
    // Reset all team points to 0 for a fresh competition
    const resetTeams = teams.map(team => ({ ...team, points: 0 }));
    setTeams(resetTeams);
    localStorage.setItem('puzzleGameTeams', JSON.stringify(resetTeams));
    
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
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 py-6 px-6 relative overflow-hidden">
        <FullscreenButton className="fixed top-4 right-4 z-50" />
        
        {/* Confetti Effects */}
        <div className="fixed inset-0 pointer-events-none z-30">
          {/* Left side confetti */}
          <div className="absolute left-0 top-0 w-20 h-full">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`left-${i}`}
                className="absolute w-2 h-2 rounded-full animate-bounce opacity-80"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 5],
                  left: `${Math.random() * 80}px`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          {/* Right side confetti */}
          <div className="absolute right-0 top-0 w-20 h-full">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`right-${i}`}
                className="absolute w-2 h-2 rounded-full animate-bounce opacity-80"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][i % 5],
                  left: `${Math.random() * 80}px`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`float-${i}`}
                className="absolute text-2xl opacity-60 animate-pulse"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                {['🎉', '🏆', '⭐', '🎊', '🥇'][i % 5]}
              </div>
            ))}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-40">
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
            {/* Enhanced Leaderboard Card */}
            <Card className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 border-0 shadow-2xl relative overflow-hidden">
              <CardHeader className="pb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                <CardTitle className="text-4xl text-white flex items-center justify-center gap-3 relative z-10">
                  <Trophy className="w-10 h-10 animate-bounce" />
                  Финална класация
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white pb-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    {teams
                      .sort((a, b) => (b.points || 0) - (a.points || 0)) // Sort by points descending
                      .map((team, index) => {
                        const isWinner = index === 0;
                        const medalColor = index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-orange-400' : 'bg-blue-400';
                        const medalIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                        
                        return (
                                                     <div 
                             key={team.id} 
                             className={`flex items-center justify-between rounded-xl p-4 transition-all duration-300 ${
                               isWinner 
                                 ? 'bg-gradient-to-r from-yellow-300/40 to-orange-400/40 border-2 border-yellow-200 shadow-lg' 
                                 : 'bg-white/30 border border-white/40'
                             }`}
                           >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${medalColor} ${isWinner ? 'animate-pulse' : ''}`}>
                                {medalIcon}
                              </div>
                                                             <div className="text-left">
                                 <span className={`font-bold text-lg ${isWinner ? 'text-gray-900 drop-shadow-sm' : 'text-gray-900'}`}>
                                   {team.name}
                                 </span>
                                 <div className={`text-sm ${isWinner ? 'text-gray-800' : 'text-gray-700'}`}>
                                   {team.players.length} играч{team.players.length !== 1 ? 'а' : ''}
                                 </div>
                               </div>
                            </div>
                                                         <div className="text-right">
                               <div className={`text-2xl font-bold ${isWinner ? 'text-gray-900 drop-shadow-sm' : 'text-gray-900'}`}>
                                 {team.points || 0} т.
                               </div>
                               <div className={`text-sm ${isWinner ? 'text-gray-800' : 'text-gray-700'}`}>
                                 #{index + 1} място
                               </div>
                             </div>
                          </div>
                        );
                      })}
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

  // Render the appropriate game component based on category
  const renderGameComponent = () => {
    const handleTimeUp = () => {
      // For time up, we don't pass points
      handleGameComplete();
    };

    const commonProps = {
      key: gameKey,
      level: gameLevel,
      onComplete: handleGameComplete,
      onTimeUp: handleTimeUp,
    };

    switch (categoryId) {
      case 'memory':
        return (
          <MemoryGame 
            {...commonProps}
            currentTeam={currentTeam}
            onPlayerTurn={handlePlayerTurn}
          />
        );
      case 'math':
        return (
          <MathGame 
            {...commonProps}
          />
        );
      case 'words':
        return (
          <WordGame 
            {...commonProps}
          />
        );
      case 'quiz':
        return (
          <QuizGame 
            {...commonProps}
          />
        );
      default:
        return (
          <MemoryGame 
            {...commonProps}
            currentTeam={currentTeam}
            onPlayerTurn={handlePlayerTurn}
          />
        );
    }
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
                  {gameTitle}
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
                  <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                    Текущ отбор
                    <div className="text-2xl font-bold text-green-600">
                      {currentTeam.points || 0} т.
                    </div>
                  </CardTitle>
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
                <div className="space-y-2 max-h-74 overflow-y-auto">
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
                      <div className="flex-1">
                        <span className="font-medium text-sm">{team.name}</span>
                        <div className="text-xs text-gray-600">
                          {team.points || 0} точки
                        </div>
                      </div>
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
                  {renderGameComponent()}
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