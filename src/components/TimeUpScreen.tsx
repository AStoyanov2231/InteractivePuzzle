import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeUpScreenProps {
  onReset: () => void;
  onClose?: () => void;
}

export const TimeUpScreen: React.FC<TimeUpScreenProps> = ({ onReset, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Времето изтече!</h2>
          <p className="text-gray-600">За съжаление не успяхте да завършите играта навреме.</p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Опитай отново
          </Button>
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
            >
              Затвори
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 