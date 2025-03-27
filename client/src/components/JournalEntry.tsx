import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Tag from './Tag';

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
    <div className="bg-white p-4 rounded-xl shadow-sm mb-3">
      <div className="flex justify-between items-start mb-2">
        <h3 
          className="font-medium"
          style={{ color: themeColors.text }}
        >
          {title}
        </h3>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2">{content}</p>
      <div className="flex mt-3 gap-2 flex-wrap">
        {tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </div>
  );
};

export default JournalEntry;
