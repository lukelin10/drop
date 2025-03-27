import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeName, themes } from '../lib/themes';

const ThemeSwitcher = () => {
  const { activeTheme, setTheme } = useTheme();

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
  };

  return (
    <div className="theme-switcher flex justify-center gap-6 mt-6">
      <div className="flex flex-col items-center">
        <div 
          className={`theme-dot w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${activeTheme === 'ocean' ? 'ring-2 ring-white ring-offset-2' : ''}`}
          style={{ backgroundColor: themes.ocean.primary }}
          onClick={() => handleThemeChange('ocean')}
        />
        <span className="text-xs mt-1">Ocean</span>
      </div>
      <div className="flex flex-col items-center">
        <div 
          className={`theme-dot w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${activeTheme === 'forest' ? 'ring-2 ring-white ring-offset-2' : ''}`}
          style={{ backgroundColor: themes.forest.primary }}
          onClick={() => handleThemeChange('forest')}
        />
        <span className="text-xs mt-1">Forest</span>
      </div>
      <div className="flex flex-col items-center">
        <div 
          className={`theme-dot w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${activeTheme === 'sunset' ? 'ring-2 ring-white ring-offset-2' : ''}`}
          style={{ backgroundColor: themes.sunset.primary }}
          onClick={() => handleThemeChange('sunset')}
        />
        <span className="text-xs mt-1">Sunset</span>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
