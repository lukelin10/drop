import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Battery, Wifi } from 'lucide-react';

const StatusBar: React.FC = () => {
  const { themeColors } = useTheme();
  
  // Get current time in format 4:03 PM
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div 
      className="status-bar flex justify-between items-center py-2 px-5 text-xs font-semibold"
      style={{ color: themeColors.text }}
    >
      <span>{currentTime}</span>
      <div className="flex items-center gap-1">
        <Wifi className="h-4 w-4" />
        <Battery className="h-4 w-4" />
      </div>
    </div>
  );
};

export default StatusBar;
