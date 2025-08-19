import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Play } from "lucide-react";

interface UsernameDialogProps {
  open: boolean;
  onSubmit: (username: string) => void;
  categoryName?: string;
}

export const UsernameDialog: React.FC<UsernameDialogProps> = ({
  open,
  onSubmit,
  categoryName = "игра"
}) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && username.trim()) {
      onSubmit(username.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            Въведете вашето име
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {/* <p className="text-center text-gray-600 mb-6">
            Моля въведете вашето име преди да започнете <strong>{categoryName}</strong>. 
            То ще бъде показано в резултатите.
          </p> */}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Име на играча
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Въведете вашето име..."
                className="mt-1"
                autoFocus
                maxLength={20}
              />
            </div>
            
            <Button 
              type="submit"
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 mr-2" />
              Започни играта
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 