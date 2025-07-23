import {
  calculateRelevanceScore,
  searchItems,
  getItemsByCategory,
  getItemsByStatus,
  findRelatedItems,
  getSearchSuggestions,
  filterItems,
  getCategoryStats
} from '../search';
import { BorderItem, Category, SearchOptions } from '../../types';

// Mock data for testing
const mockItems: BorderItem[] = [
  {
    id: 'apple-fresh',
    name: 'Fresh Apples',
    category: 'food-fresh',
    aliases: ['apples', 'fresh fruit', 'apple'],
    usaToCanada: {
      status: 'allowed',
      declarationRequired: false,
      dutyApplies: false,
      notes: 'Must be free of pests'
    },
    canadaToUsa: {
      status: 'restricted',
      declarationRequired: true,
      dutyApplies: false,
      notes: 'Subject to inspection'
    },
    lastUpdated: '2024-01-15',
    officialSources: []
  },
  {
    id: 'lemon',
    name: 'Lemon',
    category: 'food-fresh',
    parentRegulation: 'citrus-fruits',
    aliases: ['lemons', 'fresh lemon', 'citrus'],
    usaToCanada: {
      status: 'restricted',
      inheritedFrom: 'citrus-fruits',
      declarationRequired: true,
      dutyApplies: false,
      notes: 'Subject to citrus regulations'
    },
    canadaToUsa: {
      status: 'restricted',
      inheritedFrom: 'citrus-fruits',
      declarationRequired: true,
      dutyApplies: false,
      notes: 'Subject to citrus regulations'
    },
    lastUpdated: '2024-01-15',
    officialSources: []
  },
  {
    id: 'wine',
    name: 'Wine',
    category: 'alcohol',
    aliases: ['wine', 'red wine', 'white wine'],
    usaToCanada: {
      status: 'allowed',
      quantityLimit: {
        amount: 1.5,
        unit: 'liters',
        period: 'per person'
      },
      ageRestriction: 19,
      declarationRequired: true,
      dutyApplies: true,
      notes: 'Duty-free allowance'
    },
    canadaToUsa: {
      status: 'allowed',
      quantityLimit: {
        amount: 1,
        unit: 'liter',
        period: 'per person'
      },
      ageRestriction: 21,
      declarationRequired: true,
      dutyApplies: true,
      notes: 'Personal consumption'
    },
    lastUpdated: '2024-01-15',
    officialSources: []
  }
];

const mockCategories: Category[] = [
  {
    id: 'food-fresh',
    name: 'Fresh Food',
    description: 'Fresh fruits and vegetables',
    icon: '🍎',
    itemCount: 2
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    description: 'Alcoholic beverages',
    icon: '🍷',
    itemCount: 1
  }
];

describe('calculateRelevanceScore', () => {
  test('exact match returns 100', () => {
    expect(calculateRelevanceScore('apple', 'apple')).toBe(100);
  });

  test('starts with query returns 90', () => {
    expect(calculateRelevanceScore('app', 'apple')).toBe(90);
  });

  test('contains query returns 70', () => {
    expect(calculateRelevanceScore('ppl', 'apple')).toBe(70);
  });

  test('empty query returns 0', () => {
    expect(calculateRelevanceScore('', 'apple')).toBe(0);
  });

  test('case insensitive matching', () => {
    expect(calculateRelevanceScore('APPLE', 'apple')).toBe(100);
  });
});

describe('searchItems', () => {
  test('finds items by name', () => {
    const options: SearchOptions = {
      query: 'apple',
      filters: { direction: 'usaToCanada' }
    };
    
    const results = searchItems(mockItems, options);
    expect(results).toHaveLength(1);
    expect(results[0].item.name).toBe('Fresh Apples');
  });

  test('finds items by alias', () => {
    const options: SearchOptions = {
      query: 'citrus',
      filters: { direction: 'usaToCanada' }
    };
    
    const results = searchItems(mockItems, options);
    expect(results).toHaveLength(1);
    expect(results[0].item.name).toBe('Lemon');
    expect(results[0].matchedAlias).toBe('citrus');
  });

  test('filters by category', () => {
    const options: SearchOptions = {
      query: 'fresh',
      filters: { 
        direction: 'usaToCanada',
        category: 'food-fresh'
      }
    };
    
    const results = searchItems(mockItems, options);
    expect(results).toHaveLength(2); // Apple and Lemon
  });

  test('filters by status', () => {
    const options: SearchOptions = {
      query: 'apple',
      filters: { 
        direction: 'usaToCanada',
        status: 'allowed'
      }
    };
    
    const results = searchItems(mockItems, options);
    expect(results).toHaveLength(1);
    expect(results[0].item.usaToCanada.status).toBe('allowed');
  });

  test('returns empty array for empty query', () => {
    const options: SearchOptions = {
      query: '',
      filters: { direction: 'usaToCanada' }
    };
    
    const results = searchItems(mockItems, options);
    expect(results).toHaveLength(0);
  });

  test('sorts results by relevance score', () => {
    const options: SearchOptions = {
      query: 'wine',
      filters: { direction: 'usaToCanada' }
    };
    
    const results = searchItems(mockItems, options);
    expect(results[0].relevanceScore).toBeGreaterThanOrEqual(results[results.length - 1]?.relevanceScore || 0);
  });
});

describe('getItemsByCategory', () => {
  test('returns items in specified category', () => {
    const items = getItemsByCategory(mockItems, 'food-fresh');
    expect(items).toHaveLength(2);
    expect(items.every(item => item.category === 'food-fresh')).toBe(true);
  });

  test('returns empty array for non-existent category', () => {
    const items = getItemsByCategory(mockItems, 'non-existent');
    expect(items).toHaveLength(0);
  });
});

describe('getItemsByStatus', () => {
  test('returns items with specified status for direction', () => {
    const items = getItemsByStatus(mockItems, 'allowed', 'usaToCanada');
    expect(items).toHaveLength(2); // Apple and Wine
    expect(items.every(item => item.usaToCanada.status === 'allowed')).toBe(true);
  });

  test('returns different results for different directions', () => {
    const usaToCanada = getItemsByStatus(mockItems, 'allowed', 'usaToCanada');
    const canadaToUsa = getItemsByStatus(mockItems, 'allowed', 'canadaToUsa');
    
    expect(usaToCanada.length).not.toBe(canadaToUsa.length);
  });
});

describe('findRelatedItems', () => {
  test('finds items in same category', () => {
    const apple = mockItems[0];
    const related = findRelatedItems(mockItems, apple);
    
    expect(related).toHaveLength(1); // Lemon
    expect(related[0].category).toBe(apple.category);
  });

  test('excludes the target item itself', () => {
    const apple = mockItems[0];
    const related = findRelatedItems(mockItems, apple);
    
    expect(related.every(item => item.id !== apple.id)).toBe(true);
  });
});

describe('getSearchSuggestions', () => {
  test('returns suggestions based on item names', () => {
    const suggestions = getSearchSuggestions(mockItems, mockCategories, 'app');
    expect(suggestions).toContain('apple'); // Aliases are prioritized over full names
  });

  test('returns suggestions based on aliases', () => {
    const suggestions = getSearchSuggestions(mockItems, mockCategories, 'citrus');
    expect(suggestions).toContain('citrus');
  });

  test('returns suggestions based on category names', () => {
    const suggestions = getSearchSuggestions(mockItems, mockCategories, 'fresh');
    expect(suggestions).toContain('Fresh Food');
  });

  test('limits number of suggestions', () => {
    const suggestions = getSearchSuggestions(mockItems, mockCategories, 'a', 2);
    expect(suggestions.length).toBeLessThanOrEqual(2);
  });

  test('returns empty array for empty query', () => {
    const suggestions = getSearchSuggestions(mockItems, mockCategories, '');
    expect(suggestions).toHaveLength(0);
  });
});

describe('filterItems', () => {
  test('filters by category', () => {
    const filtered = filterItems(mockItems, {
      category: 'alcohol',
      direction: 'usaToCanada'
    });
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe('alcohol');
  });

  test('filters by quantity limit presence', () => {
    const filtered = filterItems(mockItems, {
      hasQuantityLimit: true,
      direction: 'usaToCanada'
    });
    
    expect(filtered).toHaveLength(1); // Only wine has quantity limit
    expect(filtered[0].usaToCanada.quantityLimit).toBeDefined();
  });

  test('filters by age restriction presence', () => {
    const filtered = filterItems(mockItems, {
      hasAgeRestriction: true,
      direction: 'usaToCanada'
    });
    
    expect(filtered).toHaveLength(1); // Only wine has age restriction
    expect(filtered[0].usaToCanada.ageRestriction).toBeDefined();
  });

  test('filters by declaration requirement', () => {
    const filtered = filterItems(mockItems, {
      requiresDeclaration: true,
      direction: 'usaToCanada'
    });
    
    expect(filtered).toHaveLength(2); // Lemon and Wine require declaration
    expect(filtered.every(item => item.usaToCanada.declarationRequired)).toBe(true);
  });
});

describe('getCategoryStats', () => {
  test('calculates correct statistics for category', () => {
    const stats = getCategoryStats(mockItems, 'food-fresh', 'usaToCanada');
    
    expect(stats.total).toBe(2);
    expect(stats.allowed).toBe(1); // Apple
    expect(stats.restricted).toBe(1); // Lemon
    expect(stats.prohibited).toBe(0);
  });

  test('returns different stats for different directions', () => {
    const usaToCanada = getCategoryStats(mockItems, 'food-fresh', 'usaToCanada');
    const canadaToUsa = getCategoryStats(mockItems, 'food-fresh', 'canadaToUsa');
    
    expect(usaToCanada.allowed).not.toBe(canadaToUsa.allowed);
  });
});