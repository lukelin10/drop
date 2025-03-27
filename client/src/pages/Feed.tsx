import React from 'react';
import { useTheme } from '../context/ThemeContext';
import FeedItem from '@/components/FeedItem';
import { Filter } from 'lucide-react';

const Feed: React.FC = () => {
  const { themeColors } = useTheme();
  
  // Sample data for feed items
  const feedItems = [
    {
      id: 1,
      author: {
        initial: 'M',
        name: 'Megan T.',
        time: '2 hours ago'
      },
      content: 'Just finished reading "The Alchemist" and it\'s changed my perspective on following your dreams. Has anyone else read it?',
      tags: ['Books', 'Inspiration'],
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      author: {
        initial: 'A',
        name: 'Alex W.',
        time: 'Yesterday'
      },
      content: 'Finally tried that meditation technique everyone\'s been talking about. 10 minutes of mindfulness and my day feels completely different!',
      image: 'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      tags: ['Wellness', 'Meditation'],
      likes: 42,
      comments: 15
    }
  ];
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-poppins font-semibold"
          style={{ color: themeColors.text }}
        >
          Community
        </h1>
        <button 
          className="px-3 py-1 rounded-full text-sm flex items-center"
          style={{ 
            backgroundColor: `${themeColors.secondary}20`,
            color: themeColors.primary
          }}
        >
          <Filter className="w-4 h-4 mr-1" />
          <span>Filter</span>
        </button>
      </div>
      
      {feedItems.map(item => (
        <FeedItem 
          key={item.id}
          author={item.author}
          content={item.content}
          tags={item.tags}
          image={item.image}
          likes={item.likes}
          comments={item.comments}
        />
      ))}
    </div>
  );
};

export default Feed;
