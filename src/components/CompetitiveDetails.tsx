import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Brain, Calculator, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { memoryCategories } from "@/games/memory/utils/memoryUtils";

interface CompetitiveDetailsProps {
  onClose: () => void;
}

interface CompetitiveGame {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  backgroundColor: string;
  estimatedTime: string;
}

const competitiveGames: CompetitiveGame[] = [
  {
    id: "memory",
    name: "Игра на паметта",
    description: "Отборите се редуват в запомняне на картички",
    icon: <Brain className="w-8 h-8" />,
    category: "memory",
    backgroundColor: "#F3E8FF",
    estimatedTime: "2-3 мин",
  },
  {
    id: "math",
    name: "Математически маратон",
    description: "Бързи математически изчисления",
    icon: <Calculator className="w-8 h-8" />,
    category: "math",
    backgroundColor: "#FCE7F3",
    estimatedTime: "2-3 мин",
  },
  {
    id: "words",
    name: "Словесни състезания",
    description: "Отгатване на разбъркани думи",
    icon: <FileText className="w-8 h-8" />,
    category: "words",
    backgroundColor: "#E0E7FF",
    estimatedTime: "3-4 мин",
  },
  {
    id: "quiz",
    name: "Блицвикторина",
    description: "Бързи въпроси от различни области",
    icon: <HelpCircle className="w-8 h-8" />,
    category: "quiz",
    backgroundColor: "#FCE7F3",
    estimatedTime: "2-3 мин",
  }
];

export const CompetitiveDetails = ({ onClose }: CompetitiveDetailsProps) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<CompetitiveGame | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("animals");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const storedTeams = localStorage.getItem('puzzleGameTeams');
    if (storedTeams) {
      try {
        const parsedTeams = JSON.parse(storedTeams);
        setTeams(parsedTeams);
      } catch (e) {
        console.error('Error parsing teams from localStorage', e);
      }
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleGameSelect = (game: CompetitiveGame) => {
    setSelectedGame(game);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleStartGame = () => {
    if (selectedGame) {
      // Set the competitive mode in localStorage for the game to recognize
      localStorage.setItem('competitiveMode', 'true');
      localStorage.setItem('currentGameCategory', selectedGame.category);
      if (selectedGame.id === 'memory') {
        localStorage.setItem('selectedMemoryCategory', selectedCategory);
      }
      
      // Navigate to a competitive game level (using level 1 for simplicity)
      navigate(`/competitive-game/${selectedGame.category}`);
    }
  };

  return (
    <div 
      className={`bg-gradient-to-br from-orange-400 via-orange-200 to-orange-200 rounded-3xl shadow-2xl overflow-hidden w-full h-full flex flex-col transition-all duration-300 ${isClosing ? 'animate-slide-out' : 'animate-slide-in'}`}
    >
      <div className="flex-1 flex flex-col lg:flex-row p-6 sm:p-8 gap-6 sm:gap-8 overflow-y-auto">
        {/* Left side - Game selection */}
        <div className="flex flex-col space-y-6 lg:space-y-8 lg:w-3/5 xl:w-2/3">
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Състезателни игри</h3>
              </div>
            </div>
          </div>

          {/* Game selection grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitiveGames.map((game) => (
              <Card 
                key={game.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 border-2 ${
                  selectedGame?.id === game.id 
                    ? 'border-purple-500 ring-2 ring-purple-200' 
                    : 'border-white/30 hover:border-purple-300'
                } bg-white/80 backdrop-blur-sm`}
                onClick={() => handleGameSelect(game)}
                style={{ backgroundColor: `${game.backgroundColor}CC` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-md">
                      {game.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-1">{game.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{game.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category selector for memory game */}
          {selectedGame?.id === 'memory' && (
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
              <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">
                Изберете категория за играта на паметта
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {memoryCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`
                      flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                      ${selectedCategory === category.id
                        ? 'border-purple-500 bg-white/80 shadow-lg scale-105'
                        : 'border-white/30 bg-white/40 hover:bg-white/60 hover:border-white/50'
                      }
                    `}
                    style={{
                      borderColor: selectedCategory === category.id ? category.color : undefined
                    }}
                  >
                    <div 
                      className="text-2xl mb-2 p-2 rounded-lg"
                      style={{
                        backgroundColor: selectedCategory === category.id ? `${category.color}20` : 'transparent'
                      }}
                    >
                      {category.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-800 text-center">
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-600 text-center mt-1">
                      {category.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Game details and teams */}
        <div className="flex flex-col space-y-6 lg:space-y-8 lg:w-2/5 xl:w-1/3 lg:justify-between">
          {selectedGame ? (
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-white/80 flex items-center justify-center shadow-md">
                  {selectedGame.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedGame.name}</h4>
                  <p className="text-gray-600 text-sm">{selectedGame.description}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Време за играч:</span>
                  <span className="font-medium">{selectedGame.estimatedTime}</span>
                </div>
                {selectedGame.id === 'memory' && (
                  <div className="flex justify-between">
                    <span>Категория:</span>
                    <span className="font-medium capitalize">
                      {memoryCategories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Активни отбори:</span>
                  <span className="font-medium">{teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Общо играчи:</span>
                  <span className="font-medium">{teams.reduce((acc, team) => acc + team.players.length, 0)}</span>
                </div>
              </div>

              <Button 
                onClick={handleStartGame}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium shadow-lg"
                size="lg"
              >
                Започни играта
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-600 bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
              <div>
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Изберете игра за да видите детайли</p>
              </div>
            </div>
          )}

          {/* Teams list */}
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-gray-700" />
              <h4 className="text-lg font-bold text-gray-800">Отбори ({teams.length})</h4>
            </div>
            
            {teams.length > 0 ? (
              <div className="space-y-3 max-h-90 overflow-y-auto">
                {teams.map((team, index) => (
                  <div key={team.id} className="bg-white/70 rounded-xl p-3 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-800">{team.name}</h5>
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                        {team.players.length} играча
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {team.players.map((player: any) => player.name).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-6">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Няма регистрирани отбори</p>
                <p className="text-sm">Създайте отбори преди да започнете</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 