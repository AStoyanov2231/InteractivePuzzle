import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { PuzzleCard } from "@/components/PuzzleCard";
import { PuzzleDetails } from "@/components/PuzzleDetails";
import { CompetitiveDetails } from "@/components/CompetitiveDetails";
import { PuzzleCategory } from "@/types";
import { puzzleCategories } from "@/data/puzzleData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft, Trophy, Play, Settings, X } from "lucide-react";
import { PlayerDialog } from "@/components/PlayerDialog";
import { Toaster } from "@/components/ui/toaster";
import { FullscreenButton } from "@/components/FullscreenButton";
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
  const [showCompetitiveDetails, setShowCompetitiveDetails] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [dialogInitialTab, setDialogInitialTab] = useState<"players" | "teams">("players");
  const { toast } = useToast();

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

  // Handle URL parameters for category selection
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const category = puzzleCategories.find(cat => cat.id === categoryParam);
      if (category) {
        if (category.id === "competitive" && isCompetitiveGameActive) {
          setShowCompetitiveDetails(true);
        } else {
          setSelectedCategory(category);
          setShowDetails(true);
        }
        setIsClosing(false);
      }
    }
  }, [searchParams, isCompetitiveGameActive]);

  const handleCategoryClick = (category: PuzzleCategory) => {
    // If teams exist, individual games should not be playable
    if (teams.length > 0) {
      toast({
        title: "Индивидуални игри недостъпни",
        description: "Изчистете отборите за да играете индивидуални игри или използвайте състезателния режим.",
        variant: "destructive"
      });
      return;
    }

    // If competitive game is active, only allow competitive category
    if (isCompetitiveGameActive && category.id !== "competitive") {
      return;
    }

    setSelectedCategory(category);
    setShowDetails(true);
    setIsClosing(false);
    // Update URL to reflect selected category
    setSearchParams({ category: category.id });
  };

  const handleCloseDetails = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDetails(false);
      setShowCompetitiveDetails(false);
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

  const handleGameStart = () => {
    // When teams are created and game is started, 
    // activate competitive mode and show competitive details
    setIsCompetitiveGameActive(true);
    setShowCompetitiveDetails(true);
    setSearchParams({ category: 'competitive' });
  };

  const handleStartCompetitive = () => {
    if (teams.length > 0) {
      setShowCompetitiveDetails(true);
      setSearchParams({ category: 'competitive' });
    }
  };

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
  
  // Check if we can start competitive games (need at least 2 teams with players)
  const validTeams = teams.filter(team => team.players.length > 0);
  const canStartCompetitive = validTeams.length >= 2;
  
  // Individual games are only available when no teams are created
  const canPlayIndividualGames = teams.length === 0;

  if ((showDetails && selectedCategory) || showCompetitiveDetails) {
    return (
      <div className={`fixed inset-0 bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 z-50 flex flex-col transition-all duration-300 ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
        {/* Fullscreen button in top right corner */}
        <FullscreenButton className="fixed top-4 right-4 z-50" />
        
        {/* Back button integrated into the orange panel with animation trigger */}
        <div className="p-6">
          <Button 
            onClick={handleBackClick} 
            variant="outline" 
            className="flex items-center gap-2 rounded-2xl shadow-lg bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/30 transition-all duration-200"
            aria-label="Назад към категориите"
          >
            <ArrowLeft size={18} />
            Назад
          </Button>
        </div>
        
        <Toaster />
        <main className="flex-1 flex flex-col overflow-y-auto px-6 pb-6">
          {showCompetitiveDetails ? (
            <CompetitiveDetails onClose={handleCloseDetails} />
          ) : (
            selectedCategory && (
              <PuzzleDetails
                category={selectedCategory}
                onClose={handleCloseDetails}
              />
            )
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-orange-200 py-4 px-6 flex flex-col overflow-hidden relative">
      {/* Fullscreen button in top right corner */}
      <FullscreenButton className="fixed top-4 right-4 z-50" />
      
      <Header />
      <Toaster />
      
      <main className="flex-1 flex flex-row items-stretch justify-center mt-4 w-full px-4 gap-6">
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
                    className="flex items-center gap-2 w-full rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-white/50 text-gray-800 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
                      <div key={team.id} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 backdrop-blur-sm border shadow-sm hover:shadow-md hover:scale-[1.01] ${
                        team.players.length > 0 
                          ? 'bg-green-100/40 border-green-200/50 hover:bg-green-100/50' 
                          : 'bg-gray-100/40 border-gray-200/50 hover:bg-gray-100/50'
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
                      onClick={handleStartCompetitive}
                      disabled={!canStartCompetitive}
                      className="flex items-center gap-3 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 text-white font-bold shadow-xl disabled:from-gray-400/60 disabled:to-gray-500/60 disabled:cursor-not-allowed backdrop-blur-sm border-2 border-white/30 rounded-2xl py-3 active:scale-95 transition-transform duration-150"
                    >
                      <Play size={18} className="drop-shadow-sm" />
                      <span className="drop-shadow-sm">Започни състезание</span>
                    </Button>
                    
                    <Button 
                      onClick={handleOpenTeamManagement}
                      className="flex items-center gap-2 w-full bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/40 hover:border-white/50 text-gray-800 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-xl"
                      variant="ghost"
                    >
                      <Settings size={16} />
                      <span>Управление на отбори</span>
                    </Button>
                    

            
                    {isCompetitiveGameActive && (
              <Button 
                onClick={handleEndCompetition}
                        className="flex items-center gap-2 w-full bg-gradient-to-r from-red-400/80 to-red-500/80 hover:from-red-500/80 hover:to-red-600/80 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-white/20 rounded-xl"
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
        <div className="flex-1 flex flex-col justify-center px-8">
          <div className="w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-3 grid-rows-2 gap-8 min-h-[140px]">
              {displayedCategories.map((category) => {
                const isDisabled = !canPlayIndividualGames;
                
                return (
                  <PuzzleCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category)}
                    disabled={isDisabled}
                    className={`transition-all duration-200 hover:scale-105 ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed hover:scale-100' 
                        : 'hover:shadow-xl'
                    }`}
                  />
                );
              })}
            </div>
            
            {/* Show message when individual games are disabled */}
            {!canPlayIndividualGames && (
              <div className="mt-6 text-center">
                <p className="text-orange-700 text-sm font-medium bg-orange-100/60 backdrop-blur-sm border border-orange-200/50 rounded-xl px-4 py-3 inline-block shadow-sm">
                  Индивидуалните игри са недостъпни когато има създадени отбори. Използвайте състезателния режим или премахнете отборите.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <PlayerDialog 
        open={showPlayerDialog} 
        onOpenChange={setShowPlayerDialog}
        onGameStart={handleGameStart} 
        initialTab={dialogInitialTab}
      />
    </div>
  );
};

export default Index;
