'use client';

import { BorderItem, Direction, STATUS_COLORS, STATUS_LABELS } from '../../types';

interface ItemCardProps {
  item: BorderItem;
  direction: Direction;
  compact?: boolean;
  onClick?: (item: BorderItem) => void;
  className?: string;
}

export default function ItemCard({
  item,
  direction,
  compact = false,
  onClick,
  className = ''
}: ItemCardProps) {
  const rule = direction === 'usaToCanada' ? item.usaToCanada : item.canadaToUsa;
  
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(item);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allowed':
        return '✅';
      case 'restricted':
        return '⚠️';
      case 'prohibited':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatQuantityLimit = () => {
    if (!rule.quantityLimit) return null;
    
    const { amount, unit, period } = rule.quantityLimit;
    return `${amount} ${unit} ${period}`;
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`
        ${compact ? 'p-4' : 'p-6'} bg-white rounded-lg border border-gray-200 shadow-sm
        ${onClick ? 'hover:shadow-md hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer' : ''}
        text-left w-full ${className}
      `}
      aria-label={onClick ? `View details for ${item.name}` : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-900 truncate`}>
              {item.name}
            </h3>
            {item.parentRegulation && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                via {item.parentRegulation}
              </span>
            )}
          </div>
          
          {!compact && item.aliases.length > 0 && (
            <p className="text-sm text-gray-600 mb-3">
              Also known as: {item.aliases.slice(0, 3).join(', ')}
              {item.aliases.length > 3 && ` +${item.aliases.length - 3} more`}
            </p>
          )}
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <div className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
            ${STATUS_COLORS[rule.status]}
          `}>
            <span className="mr-1" role="img" aria-label={`${rule.status} status`}>
              {getStatusIcon(rule.status)}
            </span>
            {STATUS_LABELS[rule.status]}
          </div>
        </div>
      </div>
      
      {/* Key information */}
      <div className="mt-4 space-y-2">
        {rule.quantityLimit && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2" role="img" aria-label="quantity limit">📏</span>
            <span>Limit: {formatQuantityLimit()}</span>
          </div>
        )}
        
        {rule.ageRestriction && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2" role="img" aria-label="age restriction">🔞</span>
            <span>Age {rule.ageRestriction}+ required</span>
          </div>
        )}
        
        {rule.declarationRequired && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2" role="img" aria-label="declaration required">📋</span>
            <span>Declaration required</span>
          </div>
        )}
        
        {rule.dutyApplies && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2" role="img" aria-label="duty applies">💰</span>
            <span>Duty may apply</span>
          </div>
        )}
        
        {rule.specialRequirements && rule.specialRequirements.length > 0 && (
          <div className="flex items-start text-sm text-gray-600">
            <span className="mr-2 mt-0.5" role="img" aria-label="special requirements">⚡</span>
            <div>
              <span className="font-medium">Requirements:</span>
              <ul className="mt-1 space-y-1">
                {rule.specialRequirements.slice(0, compact ? 2 : 3).map((req, index) => (
                  <li key={index} className="text-xs">• {req}</li>
                ))}
                {rule.specialRequirements.length > (compact ? 2 : 3) && (
                  <li className="text-xs text-gray-500">
                    +{rule.specialRequirements.length - (compact ? 2 : 3)} more requirements
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
        {onClick && (
          <span className="text-blue-600">Click for details →</span>
        )}
      </div>
      
      {rule.notes && !compact && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Note:</span> {rule.notes}
          </p>
        </div>
      )}
    </Component>
  );
}

// Loading skeleton for ItemCard
export function ItemCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${compact ? 'p-4' : 'p-6'} bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          {!compact && <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>}
        </div>
        <div className="h-6 bg-gray-200 rounded w-20 ml-4"></div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}