import React from 'react';
import { useTheme } from '../context/ThemeContext';
import MoodSelector from '../components/MoodSelector';
import JournalEntry from '../components/JournalEntry';
import FABButton from '../components/FABButton';
import { useLocation } from 'wouter';
import { Sun, Calendar, History } from 'lucide-react';

const Home: React.FC = () => {
  const { themeColors } = useTheme();
  const [, setLocation] = useLocation();
  
  // Sample data for journal entries
  const journalEntries = [
    {
      id: 1,
      title: 'Morning Reflection',
      time: 'Today, 8:30 AM',
      content: 'Started the day with a refreshing walk by the beach. The sound of waves always brings clarity to my thoughts...',
      tags: ['Calm', 'Mindful']
    },
    {
      id: 2,
      title: 'Work Goals',
      time: 'Yesterday, 3:15 PM',
      content: 'Set my quarterly objectives today. Feeling optimistic about the direction of the project...',
      tags: ['Productive', 'Focused']
    }
  ];

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long', 
    day: 'numeric'
  });
  
  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Calendar className="w-4 h-4" style={{ color: themeColors.secondary }} />
        <span className="text-sm" style={{ color: themeColors.text }}>
          {formattedDate}
        </span>
      </div>
      
      <div 
        className="p-5 rounded-lg mb-6 border"
        style={{ 
          backgroundColor: themeColors.surface,
          borderColor: `${themeColors.primary}30`,
          boxShadow: `0 4px 20px ${themeColors.primary}15`
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5" style={{ color: themeColors.primary }} />
          <h2 className="font-medium" style={{ color: themeColors.primary }}>
            Today's Question
          </h2>
        </div>
        <p 
          className="text-xl mb-6 font-medium leading-relaxed"
          style={{ color: themeColors.text }}
        >
          What small moment brought you joy today?
        </p>
        <button 
          className="w-full py-3 px-4 rounded-md font-medium transition-all duration-300 
            hover:scale-[1.02] active:scale-[0.98]"
          style={{ 
            backgroundColor: themeColors.primary,
            color: 'white',
            boxShadow: `0 2px 10px ${themeColors.primary}40`
          }}
          onClick={() => setLocation('/journal')}
        >
          Reflect on This
        </button>
      </div>
      
      <div className="mb-8">
        <h2 
          className="font-medium mb-3"
          style={{ color: themeColors.text }}
        >
          How are you feeling today?
        </h2>
        <MoodSelector />
      </div>
      
      <div className="mb-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="font-medium flex items-center gap-2"
            style={{ color: themeColors.text }}
          >
            <History className="w-4 h-4" style={{ color: themeColors.secondary }} />
            Recent Reflections
          </h2>
          <button 
            className="text-xs font-medium py-1 px-2 rounded"
            style={{ color: themeColors.secondary }}
            onClick={() => setLocation('/journal')}
          >
            See All
          </button>
        </div>
        
        {journalEntries.map(entry => (
          <JournalEntry 
            key={entry.id}
            title={entry.title}
            time={entry.time}
            content={entry.content}
            tags={entry.tags}
          />
        ))}
      </div>
      
      <FABButton />
    </>
  );
};

export default Home;
