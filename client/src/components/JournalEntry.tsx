import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Tag from './Tag';
import { CalendarClock } from 'lucide-react';

interface JournalEntryProps {
  title: string;
  time: string;
  content: string;
  tags: string[];
}

const JournalEntry: React.FC<JournalEntryProps> = ({
  title,
  time,
  content,
  tags
}) => {
  const { themeColors } = useTheme();
  
  return (
    <div 
      className="p-4 rounded-lg mb-4 border transition-all duration-200 hover:shadow-sm"
      style={{ 
        backgroundColor: `${themeColors.surface}`,
        borderColor: `${themeColors.accent}20`
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 
          className="font-medium"
          style={{ color: themeColors.primary }}
        >
          {title}
        </h3>
        <div className="flex items-center gap-1 text-xs opacity-70" style={{ color: themeColors.text }}>
          <CalendarClock className="h-3 w-3" />
          <span>{time}</span>
        </div>
      </div>
      <p 
        className="text-sm line-clamp-2 mb-3"
        style={{ color: themeColors.text }}
      >
        {content}
      </p>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </div>
  );
};

export default JournalEntry;
