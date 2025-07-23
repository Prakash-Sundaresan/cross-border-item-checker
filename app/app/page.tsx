'use client';

import { useState, useEffect } from 'react';
import { BorderItem, Category, Direction, SearchResult } from '../types';
import { loadAllData } from '../utils/dataLoader';
import { searchItems, getSearchSuggestions } from '../utils/search';
import SearchComponent from '../components/search/SearchComponent';
import CategoryGrid, { CategoryGridSkeleton } from '../components/categories/CategoryGrid';
import ItemCard from '../components/items/ItemCard';
import { usePersistedDirection } from '../components/common/DirectionSelector';

export default function Home() {
  const [data, setData] = useState<{ items: BorderItem[]; categories: Category[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [direction, setDirection] = usePersistedDirection();

  // Load data on component mount
  useEffect(() => {
    loadAllData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Handle search
  const handleSearch = (query: string, searchDirection: Direction) => {
    if (!data) return;
    
    setSearchQuery(query);
    setDirection(searchDirection);
    
    if (query.trim()) {
      const results = searchItems(data.items, {
        query,
        filters: { direction: searchDirection }
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Handle suggestion requests
  const handleSuggestionRequest = (query: string) => {
    if (!data) return;
    
    const newSuggestions = getSearchSuggestions(data.items, data.categories, query);
    setSuggestions(newSuggestions);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    // This would navigate to a category page in a real app
    // For now, we'll search for items in that category
    if (!data) return;
    
    const category = data.categories.find(c => c.id === categoryId);
    if (category) {
      const categoryItems = data.items.filter(item => item.category === categoryId);
      const results = categoryItems.map(item => ({ item, relevanceScore: 100 }));
      setSearchResults(results);
      setSearchQuery(`Category: ${category.name}`);
    }
  };

  // Handle item click
  const handleItemClick = (item: BorderItem) => {
    // This would navigate to an item detail page in a real app
    console.log('Navigate to item:', item.id);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🛂 Cross-Border Item Checker
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Check if items can legally cross the USA-Canada land border. 
              Get information on restrictions, limits, and requirements.
            </p>
          </div>
          
          {/* Search Interface */}
          <div className="max-w-4xl mx-auto">
            <SearchComponent
              onSearch={handleSearch}
              direction={direction}
              onDirectionChange={setDirection}
              suggestions={suggestions}
              onSuggestionRequest={handleSuggestionRequest}
              loading={loading}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchResults.length > 0 ? (
          /* Search Results */
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Search Results
              </h2>
              <p className="text-gray-600">
                {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} 
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(({ item }) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  direction={direction}
                  onClick={handleItemClick}
                  compact={true}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Category Overview */
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Browse by Category
              </h2>
              <p className="text-gray-600">
                Select a category to see what items you can bring across the border
              </p>
            </div>
            
            {loading ? (
              <CategoryGridSkeleton />
            ) : data ? (
              <CategoryGrid
                categories={data.categories}
                items={data.items}
                direction={direction}
                onCategorySelect={handleCategorySelect}
              />
            ) : null}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-gray-600 max-w-3xl mx-auto">
                This information is for guidance only and may not reflect the most current regulations. 
                Always verify current requirements with official border authorities (CBSA and CBP) before traveling. 
                Border rules can change frequently and may vary based on specific circumstances.
              </p>
            </div>
            
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <a 
                href="https://www.cbsa-asfc.gc.ca/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                CBSA Official Site
              </a>
              <a 
                href="https://www.cbp.gov/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                CBP Official Site
              </a>
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              Last updated: {data ? new Date(data.items[0]?.lastUpdated || '').toLocaleDateString() : 'Loading...'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
