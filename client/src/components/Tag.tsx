import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Plus } from 'lucide-react';

interface TagProps {
  label: string;
  onRemove?: () => void;
  isAddButton?: boolean;
  onClick?: () => void;
}

const Tag: React.FC<TagProps> = ({ 
  label, 
  onRemove, 
  isAddButton = false,
  onClick
}) => {
  const { themeColors } = useTheme();
  
  if (isAddButton) {
    return (
      <div 
        className="px-3 py-1 rounded-full text-sm flex items-center cursor-pointer"
        style={{ 
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: themeColors.secondary,
          color: themeColors.secondary
        }}
        onClick={onClick}
      >
        <Plus className="w-3 h-3 mr-1" />
        <span>{label}</span>
      </div>
    );
  }
  
  return (
    <div 
      className="px-3 py-1 rounded-full text-sm flex items-center"
      style={{ 
        backgroundColor: `${themeColors.secondary}20`,
        color: themeColors.primary
      }}
    >
      <span>{label}</span>
      {onRemove && (
        <button 
          className="ml-2 text-xs"
          onClick={onRemove}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default Tag;
