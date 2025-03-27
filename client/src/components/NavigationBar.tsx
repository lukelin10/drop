import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'wouter';
import { Home, BookOpen, Compass } from 'lucide-react';

interface NavigationBarProps {
  activeScreen: 'home' | 'journal' | 'feed';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeScreen }) => {
  const { themeColors } = useTheme();
  const [, setLocation] = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal' },
    { id: 'feed', label: 'Explore', icon: Compass, path: '/feed' }
  ];

  return (
    <nav 
      className="py-2 w-full fixed bottom-0 border-t flex justify-center"
      style={{ 
        backgroundColor: themeColors.surface,
        borderColor: `${themeColors.accent}15`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex max-w-md w-full justify-around px-4">
        {navItems.map(item => {
          const isActive = activeScreen === item.id;
          const IconComponent = item.icon;
          
          return (
            <button 
              key={item.id}
              className="flex flex-col items-center gap-1 py-2 transition-all relative"
              onClick={() => setLocation(item.path)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <IconComponent 
                className={`w-5 h-5 transition-all ${isActive ? 'scale-110' : 'scale-100'}`}
                style={{ 
                  color: isActive ? themeColors.primary : `${themeColors.text}80`
                }}
              />
              <span 
                className={`text-xs font-medium transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}
                style={{ 
                  color: isActive ? themeColors.primary : themeColors.text
                }}
              >
                {item.label}
              </span>
              
              {isActive && (
                <div 
                  className="absolute -top-2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: themeColors.primary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBar;
