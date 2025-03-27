import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Plus } from 'lucide-react';
import { useLocation } from 'wouter';

const FABButton: React.FC = () => {
  const { themeColors } = useTheme();
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    setLocation('/journal');
  };
  
  return (
    <button
      className="fab-button w-14 h-14 rounded-full flex items-center justify-center shadow-lg fixed bottom-20 right-5 z-10"
      style={{ backgroundColor: themeColors.primary, color: 'white' }}
      onClick={handleClick}
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};

export default FABButton;
