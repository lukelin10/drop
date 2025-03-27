import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from 'wouter';
import { Home, BookOpen, Compass, Bell } from 'lucide-react';

interface NavigationBarProps {
  activeScreen: 'home' | 'journal' | 'feed';
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeScreen }) => {
  const { themeColors } = useTheme();
  const [, setLocation] = useLocation();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal' },
    { id: 'feed', label: 'Explore', icon: Compass, path: '/feed' },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/alerts' }
  ];

  return (
    <div 
      className="nav-bar h-[70px] w-full absolute bottom-0 left-0 flex justify-around items-center border-t"
      style={{ 
        backgroundColor: themeColors.surface,
        borderColor: `${themeColors.secondary}20`, // 20% opacity
        color: themeColors.text 
      }}
    >
      {navItems.map(item => {
        const isActive = activeScreen === item.id;
        const IconComponent = item.icon;
        
        return (
          <button 
            key={item.id}
            className="nav-item flex flex-col items-center justify-center text-xs font-medium w-[60px]"
            onClick={() => setLocation(item.path)}
            disabled={item.id === 'alerts'} // Disable alerts for prototype
          >
            <IconComponent 
              className="mb-1 w-5 h-5"
              style={{ color: isActive ? themeColors.primary : 'inherit' }}
            />
            <span style={{ color: isActive ? themeColors.primary : 'inherit' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default NavigationBar;
