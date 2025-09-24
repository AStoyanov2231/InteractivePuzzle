import React from 'react';

interface CompactChronometerProps {
  seconds: number;
  hasStarted: boolean;
  label?: string;
  className?: string;
}

/**
 * Compact chronometer component optimized for PWA landscape mode
 * Takes up minimal space while maintaining readability
 */
export const CompactChronometer: React.FC<CompactChronometerProps> = ({ 
  seconds, 
  hasStarted, 
  label = "",
  className = ""
}) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className={`flex flex-col items-center ${className}`} data-testid="compact-chronometer">
      {label && (
        <div className="text-xs text-gray-600 mb-1 text-center whitespace-nowrap">
          {label}
        </div>
      )}
      <div className="relative w-16 h-16 flex-shrink-0">
        {/* Chronometer outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-50 to-slate-200 border-2 border-slate-300 shadow-lg" />
        {/* Inner display area */}
        <div className="absolute inset-1 rounded-full bg-white shadow-inner" />
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm font-bold tabular-nums tracking-tight text-gray-800">
            {hasStarted ? `${mins}:${secs}` : "00:00"}
          </div>
        </div>
        {/* Minimal tick marks */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-slate-400 rounded" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 left-1 w-2 h-0.5 bg-slate-400 rounded" />
        <div className="absolute top-1/2 -translate-y-1/2 right-1 w-2 h-0.5 bg-slate-400 rounded" />
      </div>
    </div>
  );
};

export default CompactChronometer;
