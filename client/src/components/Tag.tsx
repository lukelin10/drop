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
      <button 
        className="px-2.5 py-0.5 rounded-md text-xs flex items-center gap-1 transition-colors"
        style={{ 
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: `${themeColors.secondary}50`,
          color: themeColors.secondary,
        }}
        onClick={onClick}
      >
        <Plus className="w-3 h-3" />
        <span>{label}</span>
      </button>
    );
  }
  
  return (
    <div 
      className="px-2.5 py-0.5 rounded-md text-xs flex items-center gap-1.5"
      style={{ 
        backgroundColor: `${themeColors.accent}20`,
        color: themeColors.secondary,
      }}
    >
      <span className="font-medium">{label}</span>
      {onRemove && (
        <button 
          className="opacity-70 hover:opacity-100 transition-opacity"
          onClick={onRemove}
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default Tag;
