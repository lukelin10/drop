import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeSwitcher from './ThemeSwitcher';

const StatusBar: React.FC = () => {
  const { themeColors } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    // Initial time
    updateTime();
    
    // Update time every minute
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const updateTime = () => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }));
  };

  return (
    <header 
      className="flex justify-between items-center py-3 px-4 border-b fixed top-0 left-0 right-0 z-10"
      style={{ 
        backgroundColor: `${themeColors.surface}DD`,
        borderColor: `${themeColors.accent}10`, 
        color: themeColors.text,
        backdropFilter: 'blur(8px)'
      }}
    >
      <span className="text-sm font-medium">{currentTime}</span>
      <h1 className="font-semibold" style={{ color: themeColors.primary }}>
        Drop
      </h1>
      <ThemeSwitcher />
    </header>
  );
};

export default StatusBar;
