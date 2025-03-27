import React, { ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import StatusBar from './StatusBar';
import NavigationBar from './NavigationBar';
import { useLocation } from 'wouter';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { themeColors } = useTheme();
  const [location] = useLocation();

  // Determine active screen based on location
  const getActiveScreen = () => {
    if (location === '/journal') return 'journal';
    if (location === '/feed') return 'feed';
    return 'home';
  };

  return (
    <div 
      className="phone-frame rounded-[40px] w-[375px] h-[812px] p-4 relative overflow-hidden shadow-xl"
      style={{ backgroundColor: themeColors.surface }}
    >
      <StatusBar />
      
      <div 
        className="app-content w-full h-[calc(100%-70px)] rounded-[30px] overflow-y-auto overflow-x-hidden relative"
        style={{ backgroundColor: themeColors.neutral }}
      >
        {children}
      </div>
      
      <NavigationBar activeScreen={getActiveScreen()} />
    </div>
  );
};

export default AppLayout;
