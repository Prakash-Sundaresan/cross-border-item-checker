'use client';

import { BorderItem, Direction, STATUS_COLORS, STATUS_LABELS, DIRECTION_LABELS } from '../../types';

interface ItemDetailsProps {
  item: BorderItem;
  direction: Direction;
  className?: string;
}

export default function ItemDetails({
  item,
  direction,
  className = ''
}: ItemDetailsProps) {
  const rule = direction === 'usaToCanada' ? item.usaToCanada : item.canadaToUsa;
  const oppositeDirection = direction === 'usaToCanada' ? 'canadaToUsa' : 'usaToCanada';
  const oppositeRule = item[oppositeDirection];

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

  const formatQuantityLimit = (quantityLimit: any) => {
    if (!quantityLimit) return null;
    
    const { amount, unit, period } = quantityLimit;
    return `${amount} ${unit} ${period}`;
  };

  const getConsequenceText = (status: string) => {
    switch (status) {
      case 'prohibited':
        return 'This item cannot be brought across the border. Attempting to bring prohibited items may result in confiscation, fines, or other penalties.';
      case 'restricted':
        return 'This item has specific restrictions or requirements. Failure to comply with these requirements may result in confiscation or additional duties.';
      case 'allowed':
        return 'This item is generally allowed across the border under normal circumstances.';
      default:
        return 'Status unclear. Please verify with official sources.';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h1>
            
            {item.aliases.length > 0 && (
              <p className="text-gray-600 mb-3">
                <span className="font-medium">Also known as:</span> {item.aliases.join(', ')}
              </p>
            )}
            
            {item.parentRegulation && (
              <div className="mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <span className="mr-1">🔗</span>
                  Regulated under: {item.parentRegulation}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 ml-6">
            <div className={`
              inline-flex items-center px-4 py-2 rounded-full text-lg font-medium border-2
              ${STATUS_COLORS[rule.status]}
            `}>
              <span className="mr-2" role="img" aria-label={`${rule.status} status`}>
                {getStatusIcon(rule.status)}
              </span>
              {STATUS_LABELS[rule.status]}
            </div>
          </div>
        </div>
      </div>

      {/* Current Direction Details */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {DIRECTION_LABELS[direction]} Rules
        </h2>
        
        {/* Status explanation */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{getConsequenceText(rule.status)}</p>
        </div>

        {/* Detailed requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Quantity Limits */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2" role="img" aria-label="quantity">📏</span>
              Quantity Limits
            </h3>
            {rule.quantityLimit ? (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-blue-800 font-medium">
                  {formatQuantityLimit(rule.quantityLimit)}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No specific quantity limits</p>
            )}
          </div>

          {/* Age Restrictions */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2" role="img" aria-label="age">🔞</span>
              Age Requirements
            </h3>
            {rule.ageRestriction ? (
              <div className="p-3 bg-yellow-50 rounded-md">
                <p className="text-yellow-800 font-medium">
                  Must be {rule.ageRestriction} years or older
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No age restrictions</p>
            )}
          </div>

          {/* Declaration */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2" role="img" aria-label="declaration">📋</span>
              Declaration
            </h3>
            <div className={`p-3 rounded-md ${rule.declarationRequired ? 'bg-orange-50' : 'bg-green-50'}`}>
              <p className={`font-medium ${rule.declarationRequired ? 'text-orange-800' : 'text-green-800'}`}>
                {rule.declarationRequired ? 'Declaration required' : 'No declaration required'}
              </p>
            </div>
          </div>

          {/* Duties */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span className="mr-2" role="img" aria-label="duty">💰</span>
              Duties & Taxes
            </h3>
            <div className={`p-3 rounded-md ${rule.dutyApplies ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`font-medium ${rule.dutyApplies ? 'text-red-800' : 'text-green-800'}`}>
                {rule.dutyApplies ? 'Duty may apply' : 'No duty expected'}
              </p>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        {rule.specialRequirements && rule.specialRequirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2" role="img" aria-label="requirements">⚡</span>
              Special Requirements
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="space-y-2">
                {rule.specialRequirements.map((req, index) => (
                  <li key={index} className="flex items-start text-yellow-800">
                    <span className="mr-2 mt-1 text-yellow-600">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Notes */}
        {rule.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="mr-2" role="img" aria-label="note">📝</span>
              Additional Notes
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">{rule.notes}</p>
            </div>
          </div>
        )}

        {/* Inherited Information */}
        {rule.inheritedFrom && (
          <div className="mb-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-purple-900 mb-2 flex items-center">
                <span className="mr-2" role="img" aria-label="inherited">🔗</span>
                Inherited Rules
              </h3>
              <p className="text-purple-800">
                These rules are inherited from the broader category: <strong>{rule.inheritedFrom}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Opposite Direction Comparison */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {DIRECTION_LABELS[oppositeDirection]} Comparison
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <span className="text-lg" role="img" aria-label={`${oppositeRule.status} status`}>
              {getStatusIcon(oppositeRule.status)}
            </span>
            <div>
              <p className="font-medium text-gray-900">
                {DIRECTION_LABELS[oppositeDirection]}: {STATUS_LABELS[oppositeRule.status]}
              </p>
              {oppositeRule.quantityLimit && (
                <p className="text-sm text-gray-600">
                  Limit: {formatQuantityLimit(oppositeRule.quantityLimit)}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => window.location.reload()} // This would be handled by parent component
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Switch direction →
          </button>
        </div>
      </div>

      {/* Official Sources */}
      <div className="p-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2" role="img" aria-label="sources">🔗</span>
          Official Sources
        </h2>
        
        <div className="space-y-3">
          {item.officialSources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{source.name}</p>
                  <p className="text-sm text-gray-600">{source.type}</p>
                </div>
                <span className="text-blue-600" role="img" aria-label="external link">🔗</span>
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Disclaimer:</span> This information is for guidance only. 
            Always verify current regulations with official border authorities before traveling.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last updated: {new Date(item.lastUpdated).toLocaleDateString()}</span>
          <span>Item ID: {item.id}</span>
        </div>
      </div>
    </div>
  );
}