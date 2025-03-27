import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Mood {
  emoji: string;
  label: string;
}

const MoodSelector: React.FC = () => {
  const { themeColors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<string>('Happy');
  
  const moods: Mood[] = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😢', label: 'Sad' }
  ];

  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: `${themeColors.accent}15` }}>
      <div className="grid grid-cols-5 gap-2">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.label;
          
          return (
            <button 
              key={mood.label} 
              className={`flex flex-col items-center transition-all duration-200 py-2 rounded-md ${
                isSelected ? 'scale-110' : 'scale-100 hover:scale-105'
              }`}
              style={{ 
                backgroundColor: isSelected ? `${themeColors.primary}15` : 'transparent',
              }}
              onClick={() => setSelectedMood(mood.label)}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl cursor-pointer"
                style={{ 
                  backgroundColor: isSelected ? themeColors.accent : `${themeColors.accent}30`,
                  boxShadow: isSelected ? `0 2px 8px ${themeColors.accent}50` : 'none'
                }}
              >
                {mood.emoji}
              </div>
              <span 
                className="text-xs mt-1 font-medium"
                style={{ 
                  color: isSelected ? themeColors.primary : themeColors.text
                }}
              >
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
