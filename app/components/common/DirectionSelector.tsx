'use client';

import { Direction, DIRECTION_LABELS, DIRECTION_FLAGS } from '../../types';
import { useEffect, useState } from 'react';

interface DirectionSelectorProps {
  direction: Direction;
  onChange: (direction: Direction) => void;
  className?: string;
}

export default function DirectionSelector({ 
  direction, 
  onChange, 
  className = '' 
}: DirectionSelectorProps) {
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Save direction to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('borderChecker_direction', direction);
    }
  }, [direction, mounted]);

  const handleDirectionChange = (newDirection: Direction) => {
    onChange(newDirection);
  };

  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleDirectionChange('usaToCanada')}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${direction === 'usaToCanada' 
              ? 'bg-white text-blue-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
          aria-pressed={direction === 'usaToCanada'}
          aria-label="Select USA to Canada direction"
        >
          <span className="text-lg" role="img" aria-label="USA flag">
            {DIRECTION_FLAGS.usaToCanada.from}
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-lg" role="img" aria-label="Canada flag">
            {DIRECTION_FLAGS.usaToCanada.to}
          </span>
          <span className="hidden sm:inline">USA → Canada</span>
        </button>
        
        <button
          onClick={() => handleDirectionChange('canadaToUsa')}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${direction === 'canadaToUsa' 
              ? 'bg-white text-blue-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
          aria-pressed={direction === 'canadaToUsa'}
          aria-label="Select Canada to USA direction"
        >
          <span className="text-lg" role="img" aria-label="Canada flag">
            {DIRECTION_FLAGS.canadaToUsa.from}
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-lg" role="img" aria-label="USA flag">
            {DIRECTION_FLAGS.canadaToUsa.to}
          </span>
          <span className="hidden sm:inline">Canada → USA</span>
        </button>
      </div>
      
      <div className="text-xs text-gray-500 ml-2">
        Travel Direction
      </div>
    </div>
  );
}

// Hook to get initial direction from localStorage or default
export function usePersistedDirection(): [Direction, (direction: Direction) => void] {
  const [direction, setDirection] = useState<Direction>('usaToCanada');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('borderChecker_direction') as Direction;
    if (saved && (saved === 'usaToCanada' || saved === 'canadaToUsa')) {
      setDirection(saved);
    }
  }, []);

  const updateDirection = (newDirection: Direction) => {
    setDirection(newDirection);
    if (mounted) {
      localStorage.setItem('borderChecker_direction', newDirection);
    }
  };

  return [direction, updateDirection];
}