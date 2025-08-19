
import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get username from localStorage
  const username = localStorage.getItem('currentPlayerName') || 'Играч';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
        <div className="mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-600 mb-2">Браво, {username}!</h2>
          <p className="text-lg text-gray-700 mb-4">Завърши скоростната игра!</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600">Време:</div>
                <div className="text-xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Общо опити:</div>
                <div className="text-xl font-bold text-green-600">{totalAttempts}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-green-600">Верни:</div>
                <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
              </div>
              <div>
                <div className="text-sm text-red-600">Грешни:</div>
                <div className="text-lg font-bold text-red-600">{wrongAnswers}</div>
              </div>
            </div>
          </div>
        </div>
        
                    <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Към началото
            </Button>
      </div>
    </div>
  );
};
