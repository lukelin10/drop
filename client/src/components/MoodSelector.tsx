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
    <div className="mb-6">
      <h2 
        className="text-lg font-medium mb-3"
        style={{ color: themeColors.text }}
      >
        Today's Mood
      </h2>
      <div className="flex gap-3 overflow-x-auto py-2">
        {moods.map((mood) => {
          const isSelected = selectedMood === mood.label;
          
          return (
            <div key={mood.label} className="flex flex-col items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer"
                style={{ 
                  backgroundColor: isSelected ? themeColors.secondary : '#E2E8F0',
                  color: isSelected ? 'white' : '#718096'
                }}
                onClick={() => setSelectedMood(mood.label)}
              >
                {mood.emoji}
              </div>
              <span 
                className="text-xs mt-1"
                style={{ color: themeColors.text }}
              >
                {mood.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
