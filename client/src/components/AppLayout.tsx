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
      className="app-container min-h-screen flex flex-col"
      style={{ 
        backgroundColor: themeColors.neutral,
        color: themeColors.text
      }}
    >
      <StatusBar />
      
      <main 
        className="flex-1 max-w-md mx-auto w-full px-4 pt-20 pb-24 overflow-y-auto"
      >
        {children}
      </main>
      
      <NavigationBar activeScreen={getActiveScreen()} />
    </div>
  );
};

export default AppLayout;
