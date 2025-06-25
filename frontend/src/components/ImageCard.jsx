import { useState } from 'react';
import { EyeIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const ImageCard = ({ 
  imageUrl, 
  title, 
  description, 
  date,
  onView,
  onAddToCompare,
  metadata = {}
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group rounded-lg overflow-hidden bg-black/20 border border-white/10 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative cursor-pointer" onClick={() => onView(imageUrl)}>
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {onAddToCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the onView handler on the parent div
                onAddToCompare({ imageUrl, title, date });
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Add to Compare"
            >
              <PlusCircleIcon className="w-8 h-8 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2">
        <h3 className="text-base sm:text-lg font-semibold text-white">{title}</h3>
        {date && (
          <p className="text-xs sm:text-sm text-white/70">{new Date(date).toLocaleDateString()}</p>
        )}
        {description && (
          <p className="text-xs sm:text-sm text-white/80 line-clamp-2">{description}</p>
        )}
        
        {/* Metadata Display */}
        {Object.entries(metadata).length > 0 && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs sm:text-sm">
                <span className="text-white/60">{key}:</span>
                <span className="text-white/90">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard; 