import { Maximize, Minimize } from "lucide-react";
import { useFullscreen } from "@/hooks/useFullscreen";
import { Button } from "@/components/ui/button";

interface FullscreenButtonProps {
  className?: string;
}

export const FullscreenButton = ({ className = "" }: FullscreenButtonProps) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <Button
      onClick={toggleFullscreen}
      variant="outline"
      size="sm"
      className={`p-3 rounded-2xl bg-white/60 hover:bg-white/80 active:bg-white/90 backdrop-blur-sm border border-white/30 touch-manipulation transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
      aria-label={isFullscreen ? "Изход от цял екран" : "Цял екран"}
      title={isFullscreen ? "Изход от цял екран (ESC)" : "Цял екран (F11)"}
    >
      {isFullscreen ? (
        <Minimize className="w-5 h-5 text-gray-700" />
      ) : (
        <Maximize className="w-5 h-5 text-gray-700" />
      )}
    </Button>
  );
}; 