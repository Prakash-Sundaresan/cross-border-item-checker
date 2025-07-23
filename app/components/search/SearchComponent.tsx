'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Direction } from '../../types';
import DirectionSelector from '../common/DirectionSelector';

interface SearchComponentProps {
  onSearch: (query: string, direction: Direction) => void;
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  loading?: boolean;
  onSuggestionRequest?: (query: string) => void;
}

export default function SearchComponent({
  onSearch,
  direction,
  onDirectionChange,
  placeholder = "Search for items (e.g., apple, wine, laptop)...",
  className = '',
  suggestions = [],
  loading = false,
  onSuggestionRequest
}: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce search query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery, direction);
      if (onSuggestionRequest) {
        onSuggestionRequest(debouncedQuery);
      }
    }
  }, [debouncedQuery, direction, onSearch, onSuggestionRequest]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, direction);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, direction);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Direction Selector */}
        <DirectionSelector 
          direction={direction}
          onChange={onDirectionChange}
          className="flex-shrink-0"
        />
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(query.length > 0)}
              placeholder={placeholder}
              className="
                w-full px-4 py-3 pr-20 text-gray-900 bg-white border border-gray-300 
                rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                placeholder-gray-500 text-base
              "
              aria-label="Search for border crossing items"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              autoComplete="off"
            />
            
            {/* Loading indicator */}
            {loading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="
                  absolute right-3 top-1/2 transform -translate-y-1/2 
                  text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600
                "
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search button for mobile */}
          <button
            type="submit"
            className="
              sm:hidden mt-2 w-full bg-blue-600 text-white py-3 px-4 rounded-lg
              hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            disabled={!query.trim() || loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul
            ref={suggestionsRef}
            role="listbox"
            aria-label="Search suggestions"
            className="py-1"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                role="option"
                aria-selected={index === selectedSuggestionIndex}
                className={`
                  px-4 py-2 cursor-pointer text-sm
                  ${index === selectedSuggestionIndex 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedSuggestionIndex(index)}
              >
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {suggestion}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* No suggestions message */}
      {showSuggestions && query.length > 0 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500">
            No suggestions found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
}