import React from 'react';
import { useTheme } from '../context/ThemeContext';
import MoodSelector from '@/components/MoodSelector';
import JournalEntry from '@/components/JournalEntry';
import FABButton from '@/components/FABButton';
import { User } from 'lucide-react';

const Home: React.FC = () => {
  const { themeColors } = useTheme();
  
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
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-poppins font-semibold"
          style={{ color: themeColors.text }}
        >
          Drop
        </h1>
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: themeColors.secondary }}
        >
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <MoodSelector />
      
      <h2 
        className="text-lg font-medium mb-3"
        style={{ color: themeColors.text }}
      >
        Recent Entries
      </h2>
      
      {journalEntries.map(entry => (
        <JournalEntry 
          key={entry.id}
          title={entry.title}
          time={entry.time}
          content={entry.content}
          tags={entry.tags}
        />
      ))}
      
      <FABButton />
    </div>
  );
};

export default Home;
