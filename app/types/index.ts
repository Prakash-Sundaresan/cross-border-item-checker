// Core data types for the Cross-Border Item Checker application

export type Direction = 'usaToCanada' | 'canadaToUsa';

export type BorderStatus = 'allowed' | 'restricted' | 'prohibited';

export type SourceType = 'CBSA' | 'CBP' | 'other';

export type QuantityPeriod = 'per person' | 'per trip' | 'per day';

export interface QuantityLimit {
  amount: number;
  unit: string;
  period: QuantityPeriod;
}

export interface OfficialSource {
  name: string;
  url: string;
  type: SourceType;
}

export interface BorderRule {
  status: BorderStatus;
  quantityLimit?: QuantityLimit;
  ageRestriction?: number;
  specialRequirements?: string[];
  declarationRequired: boolean;
  dutyApplies: boolean;
  notes?: string;
  inheritedFrom?: string; // For items that inherit rules from parent categories
}

export interface BorderItem {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  parentRegulation?: string; // For handling granularity mismatch
  usaToCanada: BorderRule;
  canadaToUsa: BorderRule;
  lastUpdated: string;
  officialSources: OfficialSource[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
}

// Search and filtering types
export interface SearchFilters {
  direction: Direction;
  category?: string;
  status?: BorderStatus;
}

export interface SearchResult {
  item: BorderItem;
  relevanceScore: number;
  matchedAlias?: string;
}

export interface SearchOptions {
  query: string;
  filters: SearchFilters;
  limit?: number;
}

// Component prop types
export interface DirectionSelectorProps {
  direction: Direction;
  onChange: (direction: Direction) => void;
  className?: string;
}

export interface SearchComponentProps {
  onSearch: (query: string, direction: Direction) => void;
  direction: Direction;
  onDirectionChange: (direction: Direction) => void;
  placeholder?: string;
  className?: string;
}

export interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

export interface ItemCardProps {
  item: BorderItem;
  direction: Direction;
  compact?: boolean;
  onClick?: (item: BorderItem) => void;
  className?: string;
}

export interface ItemDetailsProps {
  item: BorderItem;
  direction: Direction;
  className?: string;
}

// Data structure types
export interface ItemsDatabase {
  items: BorderItem[];
  categories: Category[];
  lastUpdated: string;
}

// Utility types for data validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Direction display helpers
export const DIRECTION_LABELS: Record<Direction, string> = {
  usaToCanada: 'USA → Canada',
  canadaToUsa: 'Canada → USA'
};

export const DIRECTION_FLAGS: Record<Direction, { from: string; to: string }> = {
  usaToCanada: { from: '🇺🇸', to: '🇨🇦' },
  canadaToUsa: { from: '🇨🇦', to: '🇺🇸' }
};

// Status display helpers
export const STATUS_COLORS: Record<BorderStatus, string> = {
  allowed: 'text-green-600 bg-green-50 border-green-200',
  restricted: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  prohibited: 'text-red-600 bg-red-50 border-red-200'
};

export const STATUS_LABELS: Record<BorderStatus, string> = {
  allowed: 'Allowed',
  restricted: 'Restricted',
  prohibited: 'Prohibited'
};