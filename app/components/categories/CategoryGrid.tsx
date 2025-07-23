'use client';

import { Category, Direction, BorderItem } from '../../types';
import { getCategoryStats } from '../../utils/search';

interface CategoryGridProps {
  categories: Category[];
  items: BorderItem[];
  direction: Direction;
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

interface CategoryCardProps {
  category: Category;
  stats: {
    total: number;
    allowed: number;
    restricted: number;
    prohibited: number;
  };
  onClick: () => void;
}

function CategoryCard({ category, stats, onClick }: CategoryCardProps) {
  const getStatusColor = (status: 'allowed' | 'restricted' | 'prohibited') => {
    switch (status) {
      case 'allowed':
        return 'bg-green-100 text-green-800';
      case 'restricted':
        return 'bg-yellow-100 text-yellow-800';
      case 'prohibited':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMajorityStatus = () => {
    if (stats.allowed >= stats.restricted && stats.allowed >= stats.prohibited) {
      return 'allowed';
    } else if (stats.restricted >= stats.prohibited) {
      return 'restricted';
    } else {
      return 'prohibited';
    }
  };

  const majorityStatus = getMajorityStatus();

  return (
    <button
      onClick={onClick}
      className="
        w-full p-6 bg-white rounded-lg border border-gray-200 shadow-sm
        hover:shadow-md hover:border-gray-300 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        text-left group
      "
      aria-label={`Browse ${category.name} category with ${stats.total} items`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl" role="img" aria-label={`${category.name} icon`}>
              {category.icon}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {category.name}
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {category.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {stats.total} {stats.total === 1 ? 'item' : 'items'}
            </span>
            
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${getStatusColor(majorityStatus)}
            `}>
              Mostly {majorityStatus}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex space-x-4 text-xs">
          {stats.allowed > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{stats.allowed} allowed</span>
            </div>
          )}
          {stats.restricted > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">{stats.restricted} restricted</span>
            </div>
          )}
          {stats.prohibited > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">{stats.prohibited} prohibited</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default function CategoryGrid({
  categories,
  items,
  direction,
  onCategorySelect,
  className = ''
}: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories available</h3>
        <p className="text-gray-500">Categories will appear here when data is loaded.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const stats = getCategoryStats(items, category.id, direction);
          
          return (
            <CategoryCard
              key={category.id}
              category={category}
              stats={stats}
              onClick={() => onCategorySelect(category.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Loading skeleton component
export function CategoryGridSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse"
          >
            <div className="flex items-start space-x-3 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex space-x-4">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-18"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}