import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Tag from './Tag';
import { Heart, Share, MessageCircle } from 'lucide-react';

interface FeedItemProps {
  author: {
    initial: string;
    name: string;
    time: string;
  };
  content: string;
  tags: string[];
  image?: string;
  likes: number;
  comments: number;
}

const FeedItem: React.FC<FeedItemProps> = ({
  author,
  content,
  tags,
  image,
  likes,
  comments
}) => {
  const { themeColors } = useTheme();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };
  
  return (
    <div className="feed-item bg-white shadow-sm overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
            style={{ backgroundColor: themeColors.secondary }}
          >
            {author.initial}
          </div>
          <div>
            <h3 
              className="font-medium"
              style={{ color: themeColors.text }}
            >
              {author.name}
            </h3>
            <p className="text-xs text-gray-500">{author.time}</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">{content}</p>
        
        {image && (
          <div className="w-full h-48 bg-gray-200 mb-3 rounded relative overflow-hidden">
            <img 
              src={image} 
              alt="Post content" 
              className="absolute w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex gap-2 mb-3 flex-wrap">
          {tags.map(tag => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        
        <div className="flex justify-between text-gray-500 text-sm border-t pt-3">
          <button 
            className="flex items-center"
            onClick={handleLike}
          >
            <Heart 
              className={`mr-1 w-4 h-4 ${liked ? 'fill-current' : ''}`} 
              style={{ color: liked ? themeColors.primary : 'inherit' }}
            />
            <span>{likeCount}</span>
          </button>
          <button className="flex items-center">
            <MessageCircle className="mr-1 w-4 h-4" />
            <span>{comments}</span>
          </button>
          <button className="flex items-center">
            <Share className="mr-1 w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedItem;
