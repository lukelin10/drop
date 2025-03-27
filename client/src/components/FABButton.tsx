import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Pencil } from 'lucide-react';
import { useLocation } from 'wouter';

const FABButton: React.FC = () => {
  const { themeColors } = useTheme();
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation('/journal');
  };
  
  return (
    <button
      className="w-14 h-14 rounded-full flex items-center justify-center fixed bottom-20 right-5 z-10 transition-all duration-300 hover:scale-105 active:scale-95"
      style={{ 
        backgroundColor: themeColors.primary, 
        color: 'white',
        boxShadow: `0 4px 14px ${themeColors.primary}40`
      }}
      onClick={handleClick}
      aria-label="New journal entry"
    >
      <Pencil className="w-5 h-5" />
    </button>
  );
};

export default FABButton;
