import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeName, themes } from '../lib/themes';
import { Palette } from 'lucide-react';

const ThemeSwitcher = () => {
  const { activeTheme, setTheme } = useTheme();
  const [showSelector, setShowSelector] = useState(false);

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    setShowSelector(false);
  };

  const toggleSelector = () => {
    setShowSelector(prev => !prev);
  };

  return (
    <div className="relative">
      <button 
        className="p-1 rounded-full transition-all duration-200 hover:bg-opacity-10"
        style={{ 
          backgroundColor: showSelector ? `${themes[activeTheme].primary}20` : 'transparent',
          color: themes[activeTheme].primary
        }}
        onClick={toggleSelector}
        aria-label="Change theme"
      >
        <Palette className="w-5 h-5" />
      </button>
      
      {showSelector && (
        <div 
          className="absolute right-0 top-10 p-3 rounded-lg shadow-md flex gap-2 z-20 border"
          style={{ 
            backgroundColor: themes[activeTheme].surface,
            borderColor: `${themes[activeTheme].accent}20`
          }}
        >
          {Object.entries(themes).map(([themeName, themeColors]) => (
            <button 
              key={themeName}
              className={`p-1 rounded-full transition-all duration-200 ${
                activeTheme === themeName ? 'scale-110 shadow-sm' : 'scale-100 hover:scale-105'
              }`}
              onClick={() => handleThemeChange(themeName as ThemeName)}
              aria-label={`Switch to ${themeName} theme`}
              aria-current={activeTheme === themeName ? 'true' : 'false'}
            >
              <div 
                className="w-6 h-6 rounded-full"
                style={{ 
                  backgroundColor: themeColors.primary,
                  boxShadow: activeTheme === themeName ? `0 0 0 2px white, 0 0 0 4px ${themeColors.primary}` : 'none'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
