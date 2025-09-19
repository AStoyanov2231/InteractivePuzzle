import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PuzzleCard } from "@/components/PuzzleCard";
import { PuzzleDetails } from "@/components/PuzzleDetails";
import { PuzzleCategory } from "@/types";
import { puzzleCategories } from "@/data/puzzleData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft, Trophy, Settings } from "lucide-react";
import { PlayerDialog } from "@/components/PlayerDialog";
import { Toaster } from "@/components/ui/toaster";
import { FullscreenButton } from "@/components/FullscreenButton";
import { RequireNameToggle } from "@/components/RequireNameToggle";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  players: { name: string; id: string }[];
}

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCompetitiveGameActive, setIsCompetitiveGameActive] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [dialogInitialTab, setDialogInitialTab] = useState<"players" | "teams">("players");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if competitive game is active and load teams on component mount
  useEffect(() => {
    const storedTeams = localStorage.getItem('puzzleGameTeams');
    if (storedTeams) {
      try {
        const parsedTeams = JSON.parse(storedTeams);
        setTeams(parsedTeams);
        const hasActivePlayers = parsedTeams.some((team: any) => team.players && team.players.length > 0);
        setIsCompetitiveGameActive(hasActivePlayers);
      } catch (e) {
        console.error('Error parsing teams from localStorage', e);
      }
    }
  }, [showPlayerDialog]);

  // Handle URL parameters for category selection (ignore competitive picker)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const category = puzzleCategories.find(cat => cat.id === categoryParam);
      if (category) {
        if (category.id !== "competitive") {
          setSelectedCategory(category);
          setShowDetails(true);
        }
        setIsClosing(false);
      }
    }
  }, [searchParams, isCompetitiveGameActive]);

  // Multiplayer supported categories
  const multiplayerCategories = new Set(["memory", "math", "words", "quiz"]);

  const handleCategoryClick = (category: PuzzleCategory) => {
    // If teams exist and game supports multiplayer, start competitive mode directly
    if (teams.length > 0) {
      if (multiplayerCategories.has(category.id)) {
        const validTeams = teams.filter(team => team.players.length > 0);
        if (validTeams.length < 2) {
          toast({
            title: "Недостатъчно активни отбори",
            description: "Нужни са поне 2 отбора с играчи, за да започнете мултиплейър.",
            variant: "destructive"
          });
          return;
        }
        localStorage.setItem('currentGameCategory', category.id);
        navigate(`/competitive-game/${category.id}`);
        return;
      }
      toast({
        title: "Играта няма мултиплейър режим",
        description: "Изберете игра с мултиплейър: Памет, Математика, Думи, Викторина.",
        variant: "destructive"
      });
      return;
    }

    // Solo flow
    setSelectedCategory(category);
    setShowDetails(true);
    setIsClosing(false);
    setSearchParams({ category: category.id });
  };

  const handleCloseDetails = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDetails(false);
      setSelectedCategory(null);
      setIsClosing(false);
      // Clear URL parameters
      setSearchParams({});
    }, 300);
  };

  const handleBackClick = () => {
    // Trigger the same sliding animation as the PuzzleDetails component
    handleCloseDetails();
  };

  const handleEndCompetition = () => {
    localStorage.removeItem('puzzleGameTeams');
    setIsCompetitiveGameActive(false);
    setTeams([]);
    toast({
      title: "Състезанието приключи",
      description: "Всички отбори са премахнати. Сега можете да играете индивидуални игри.",
    });
  };

  // Competitive picker flow removed

  const handleOpenTeamCreation = () => {
    setDialogInitialTab("players");
    setShowPlayerDialog(true);
  };

  const handleOpenTeamManagement = () => {
    setDialogInitialTab("teams");
    setShowPlayerDialog(true);
  };

  const handleClearTeams = () => {
    setTeams([]);
    localStorage.removeItem('puzzleGameTeams');
    toast({
      title: "Отборите са изчистени",
      description: "Сега можете да играете индивидуални игри",
    });
  };

  // Filter out competitive category from displayed cards
  const gameCategories = puzzleCategories.filter(cat => cat.id !== "competitive");
  const displayedCategories = gameCategories.filter(category => category.id !== "competitive");
  
  // Determine disabled state per category when teams exist

  if ((showDetails && selectedCategory)) {
    return (
      <div className={`fixed inset-0 bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 z-50 flex flex-col transition-all duration-300 ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
        {/* Controls in top right corner */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <RequireNameToggle />
          <FullscreenButton />
        </div>
        
        {/* Back button integrated into the orange panel with animation trigger */}
        <div className="p-6">
          <Button 
            onClick={handleBackClick} 
            variant="outline" 
            className="flex items-center gap-2 rounded-2xl shadow-lg bg-white/60 backdrop-blur-sm border border-white/30 transition-all duration-200"
            aria-label="Назад към категориите"
          >
            <ArrowLeft size={18} />
            Назад
          </Button>
        </div>
        
        <Toaster />
        <main className="flex-1 flex flex-col overflow-y-auto px-6 pb-6">
          {selectedCategory && (
            <PuzzleDetails
              category={selectedCategory}
              onClose={handleCloseDetails}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-200 py-4 px-6 flex flex-col relative">
      {/* Controls in top right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <RequireNameToggle />
        <FullscreenButton />
      </div>
      
      <Header />
      <Toaster />
      
      <main className="flex-1 flex flex-row items-start justify-center mt-4 w-full px-4 gap-6">
        {/* Team Control Panel */}
        <div className="flex flex-col w-80 space-y-4 h-full">
          <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-black/10 flex-1 rounded-3xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-b from-white/10 to-transparent border-b border-white/20">
              <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2 font-semibold">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-400/80 to-purple-500/80 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-4 h-4 text-white drop-shadow-sm" />
                </div>
                Състезания
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col p-6">
              {teams.length === 0 ? (
                <div className="text-center py-6 flex-1 flex flex-col justify-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-200/60 to-gray-300/40 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
                    <Settings className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-700 mb-2 font-medium">Няма създадени отбори</p>
                  <Button 
                    onClick={handleOpenTeamCreation}
                    className="flex items-center gap-2 w-full rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 text-gray-800 font-medium shadow-lg transition-all duration-300"
                    variant="ghost"
                  >
                    <Settings size={16} />
                    <span>Създай отбори</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  
                  {/* Teams validation status */}
                  {(() => {
                    const validTeams = teams.filter(team => team.players.length > 0);
                    const isValid = validTeams.length >= 2;
                    
                    return (
                      <div className={`text-xs p-3 rounded-xl backdrop-blur-sm border shadow-sm ${
                        isValid 
                          ? 'bg-green-200/40 text-green-800 border-green-300/50' 
                          : 'bg-red-200/40 text-red-800 border-red-300/50'
                      }`}>
                        {isValid 
                          ? `✓ Готови за състезание (${validTeams.length} отбора с играчи)`
                          : `⚠ Необходими поне 2 отбора с играчи за състезание (сега: ${validTeams.length})`
                        }
                      </div>
                    );
                  })()}
                  
                  {/* Teams List */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {teams.map((team, index) => (
                      <div key={team.id} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 backdrop-blur-sm border shadow-sm ${
                        team.players.length > 0 
                          ? 'bg-green-100/40 border-green-200/50' 
                          : 'bg-gray-100/40 border-gray-200/50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl text-white text-sm flex items-center justify-center font-bold shadow-lg backdrop-blur-sm ${
                            team.players.length > 0 
                              ? 'bg-gradient-to-br from-green-400 to-green-600' 
                              : 'bg-gradient-to-br from-gray-400 to-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-semibold text-gray-800">{team.name}</span>
                        </div>
                        <span className={`text-sm font-medium px-3 py-1 rounded-lg backdrop-blur-sm ${
                          team.players.length > 0 
                            ? 'text-green-800 bg-green-200/50' 
                            : 'text-gray-600 bg-gray-200/50'
                        }`}>
                          {team.players.length} играча
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-white/30">
                    <Button 
                      onClick={handleOpenTeamManagement}
                      className="flex items-center gap-2 w-full bg-white/30 backdrop-blur-sm border border-white/40 text-gray-800 font-medium shadow-lg transition-all duration-300 rounded-xl"
                      variant="ghost"
                    >
                      <Settings size={16} />
                      <span>Управление на отбори</span>
                    </Button>
                    

            
                    {isCompetitiveGameActive && (
              <Button 
                onClick={handleEndCompetition}
                        className="flex items-center gap-2 w-full bg-gradient-to-r from-red-400/80 to-red-500/80 text-white font-semibold shadow-lg transition-all duration-300 backdrop-blur-sm border border-white/20 rounded-xl"
              >
                        <Trophy size={16} />
                        <span>Приключи състезанието</span>
              </Button>
            )}
          </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col px-8">
          <div className="w-full max-w-6xl mx-auto">
            <div className="py-4">
              <div className="grid grid-cols-3 gap-6 min-h-[120px]">
              {displayedCategories.map((category) => {
                const isDisabled = teams.length > 0 && !multiplayerCategories.has(category.id);

                return (
                  <PuzzleCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category)}
                    disabled={isDisabled}
                    className={`transition-all duration-200 ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  />
                );
              })}
              
              {/* 3 External Games */}
              {[
                { 
                  id: 1, 
                  icon: "brain.png", 
                  backgroundColor: "#E0F2FE", 
                  url: "https://sports.ue-varna.bg/game/colours.php",
                  title: "Игра с цветове"
                },
                { 
                  id: 2, 
                  icon: "calculator.png", 
                  backgroundColor: "#FCE7F3", 
                  url: "https://sports.ue-varna.bg/game/words.php",
                  title: "Игра с думи"
                },
                { 
                  id: 3, 
                  icon: "puzzle.png", 
                  backgroundColor: "#F0FDF4", 
                  url: "https://sports.ue-varna.bg/game/tiles.php",
                  title: "Игра с плочки"
                }
              ].map((item) => {
                const imageUrl = `https://astoyanov2231.github.io/InteractivePuzzle-Assets/images/categories/${item.icon}`;
                
                return (
                  <div
                    key={`external-game-${item.id}`}
                    className="puzzle-card shadow-lg rounded-2xl h-96 w-30 overflow-hidden touch-manipulation transition-all duration-200 ease-in-out cursor-pointer"
                    onClick={() => {
                      // Open external game in new tab
                      window.open(item.url, '_blank', 'noopener,noreferrer');
                    }}
                    style={{ backgroundColor: item.backgroundColor }}
                    title={item.title}
                  >
                    <img 
                      src={imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={(e) => {
                        // Fallback to gray placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                              <div class="text-center">
                                <div class="w-16 h-16 bg-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                                  <span class="text-gray-500 text-sm font-medium">EXT</span>
                                </div>
                                <p class="text-gray-500 text-sm opacity-75">${item.title}</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                );
               })}
              </div>
              
              {/* Show message when some games are disabled due to teams */}
              {teams.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-orange-700 text-sm font-medium bg-orange-100/60 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-3 inline-block shadow-sm">
                    Част от игрите без мултиплейър са недостъпни при създадени отбори. Изберете игра с мултиплейър (Памет, Математика, Думи, Викторина) или премахнете отборите.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <PlayerDialog 
        open={showPlayerDialog} 
        onOpenChange={setShowPlayerDialog}
        initialTab={dialogInitialTab}
      />
    </div>
  );
};

export default Index;