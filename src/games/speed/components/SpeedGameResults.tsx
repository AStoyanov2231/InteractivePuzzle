
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Star, RotateCw } from "lucide-react";

interface SpeedGameResultsProps {
  correctAnswers: number;
  wrongAnswers: number;
  totalAttempts: number;
  timeSpent: number;
  onPlayAgain: () => void;
}

export const SpeedGameResults: React.FC<SpeedGameResultsProps> = ({
  correctAnswers,
  wrongAnswers,
  totalAttempts,
  timeSpent,
  onPlayAgain
}) => {
  // Calculate accuracy percentage
  const accuracy = totalAttempts > 0 
    ? Math.round((correctAnswers / totalAttempts) * 100) 
    : 0;

  // Calculate average response time in seconds (if applicable)
  const avgResponseTime = totalAttempts > 0 
    ? (timeSpent / totalAttempts).toFixed(2) 
    : "N/A";

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Резултати</h1>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Check className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-lg font-semibold text-green-700">{correctAnswers}</span>
            </div>
            <p className="text-sm text-green-700">правилни</p>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <X className="h-6 w-6 text-red-600 mr-2" />
              <span className="text-lg font-semibold text-red-700">{wrongAnswers}</span>
            </div>
            <p className="text-sm text-red-700">грешни</p>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-semibold text-blue-700">{timeSpent}с</span>
            </div>
            <p className="text-sm text-blue-700">време</p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="mb-2">
              <span className="text-lg font-semibold text-purple-700">{accuracy}%</span>
            </div>
            <p className="text-sm text-purple-700">точност</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <h3 className="font-semibold text-gray-700 mb-2">Статистика</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Общо опити</span>
              <span className="font-medium">{totalAttempts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Средно време за реакция</span>
              <span className="font-medium">{avgResponseTime} сек</span>
            </div>

          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={onPlayAgain}
            className="px-6 py-5 font-medium flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Играй отново
          </Button>
        </div>
      </div>
    </div>
  );
};
