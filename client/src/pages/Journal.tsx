import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Tag from '@/components/Tag';
import { ArrowLeft, Image, Mic, Paperclip } from 'lucide-react';
import { useLocation } from 'wouter';

const Journal: React.FC = () => {
  const { themeColors } = useTheme();
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>(['Grateful', 'Productive']);
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddTag = () => {
    // In a real app, this would open a tag selection dialog
    const newTag = prompt('Enter a new tag:');
    if (newTag && !tags.includes(newTag)) {
      setTags(prev => [...prev, newTag]);
    }
  };
  
  const handleGoBack = () => {
    setLocation('/');
  };
  
  const handleSave = () => {
    // In a real app, this would save the journal entry
    // For this prototype, just navigate back to home
    setLocation('/');
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button 
          className="mr-2"
          onClick={handleGoBack}
          style={{ color: themeColors.text }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 
          className="text-xl font-poppins font-semibold"
          style={{ color: themeColors.text }}
        >
          New Entry
        </h1>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 bg-white rounded-lg mb-2 font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50"
          style={{ 
            color: themeColors.text,
            borderColor: themeColors.primary,
          }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div className="flex mb-3 gap-2 flex-wrap">
          {tags.map(tag => (
            <Tag 
              key={tag} 
              label={tag} 
              onRemove={() => handleRemoveTag(tag)} 
            />
          ))}
          <Tag 
            label="Add Tag" 
            isAddButton 
            onClick={handleAddTag}
          />
        </div>
        
        <textarea
          className="w-full h-[200px] bg-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
          placeholder="What's on your mind today?"
          style={{ 
            color: themeColors.text,
            borderColor: themeColors.primary
          }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      
      <div className="flex gap-3">
        <button className="flex items-center justify-center bg-white p-2 rounded-full">
          <Image 
            className="w-5 h-5"
            style={{ color: themeColors.text }}
          />
        </button>
        <button className="flex items-center justify-center bg-white p-2 rounded-full">
          <Mic 
            className="w-5 h-5"
            style={{ color: themeColors.text }}
          />
        </button>
        <button className="flex items-center justify-center bg-white p-2 rounded-full">
          <Paperclip 
            className="w-5 h-5"
            style={{ color: themeColors.text }}
          />
        </button>
        <div className="ml-auto">
          <button 
            className="px-6 py-2 rounded-lg font-medium text-white"
            style={{ backgroundColor: themeColors.primary }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Journal;
