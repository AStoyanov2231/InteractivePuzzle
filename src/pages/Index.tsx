import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { PuzzleCard } from "@/components/PuzzleCard";
import { PuzzleDetails } from "@/components/PuzzleDetails";
import { CompetitiveDetails } from "@/components/CompetitiveDetails";
import { PuzzleCategory } from "@/types";
import { puzzleCategories } from "@/data/puzzleData";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Trophy } from "lucide-react";
import { PlayerDialog } from "@/components/PlayerDialog";
import { Toaster } from "@/components/ui/toaster";
import { FullscreenButton } from "@/components/FullscreenButton";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCompetitiveGameActive, setIsCompetitiveGameActive] = useState(false);
  const [showCompetitiveDetails, setShowCompetitiveDetails] = useState(false);

  // Check if competitive game is active on component mount
  useEffect(() => {
    const storedTeams = localStorage.getItem('puzzleGameTeams');
    if (storedTeams) {
      try {
        const teams = JSON.parse(storedTeams);
        const hasActivePlayers = teams.some((team: any) => team.players && team.players.length > 0);
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
    // If competitive game is active, only allow competitive category
    if (isCompetitiveGameActive && category.id !== "competitive") {
      return;
    }

    if (category.id === "competitive") {
      if (isCompetitiveGameActive) {
        setShowCompetitiveDetails(true);
        setIsClosing(false);
        setSearchParams({ category: category.id });
      } else {
        setShowPlayerDialog(true);
      }
    } else {
      setSelectedCategory(category);
      setShowDetails(true);
      setIsClosing(false);
      // Update URL to reflect selected category
      setSearchParams({ category: category.id });
    }
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
  };

  const handleGameStart = () => {
    // When teams are created and game is started, 
    // activate competitive mode and show competitive details
    setIsCompetitiveGameActive(true);
    setShowCompetitiveDetails(true);
    setSearchParams({ category: 'competitive' });
  };

  // Filter categories based on game state - show all but disable non-competitive ones
  const availableCategories = puzzleCategories;

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
    <div className="min-h-screen bg-orange-200 py-6 px-6 flex flex-col overflow-hidden relative">
      {/* Fullscreen button in top right corner */}
      <FullscreenButton className="fixed top-4 right-4 z-50" />
      
      <Header />
      <Toaster />
      
      <main className="flex-1 flex flex-row items-stretch justify-center mt-6 sm:mt-10 w-full px-4 sm:px-6 md:px-8 gap-8 md:gap-10">
        <div className="flex flex-col items-start justify-start py-4 w-1/4 lg:w-1/5 xl:w-1/6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 sm:mb-10">Категории</h2>
          
          {/* Competitive game status indicator */}
          {isCompetitiveGameActive && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-sm shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="font-medium">Активно състезание</span>
              </div>
              <p className="text-xs opacity-90">Само състезателни игри са достъпни</p>
            </div>
          )}
          
          <div className="space-y-3 w-full">
            <Button 
              onClick={() => setShowPlayerDialog(true)}
              className="flex items-center gap-2 w-full md:w-auto rounded-full shadow-sm"
              variant="outline"
              size="lg"
              aria-label="Players"
            >
              <Users size={20} />
              <span className="font-medium">Играчи</span>
            </Button>
            
            {/* End competition button */}
            {isCompetitiveGameActive && (
              <Button 
                onClick={handleEndCompetition}
                className="flex items-center gap-2 w-full md:w-auto rounded-full shadow-sm bg-red-500 hover:bg-red-600 text-white"
                size="lg"
              >
                <Trophy size={20} />
                <span className="font-medium">Приключи състезанието</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 p-1 w-full">
          {availableCategories.map((category) => (
            <PuzzleCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category)}
              className={`rounded-2xl shadow-lg touch-manipulation ${
                isCompetitiveGameActive && category.id !== "competitive" 
                  ? 'opacity-30 cursor-not-allowed' 
                  : ''
              }`}
            />
          ))}
        </div>
      </main>
      
      <PlayerDialog 
        open={showPlayerDialog} 
        onOpenChange={setShowPlayerDialog}
        onGameStart={handleGameStart} 
      />
    </div>
  );
};

export default Index;
