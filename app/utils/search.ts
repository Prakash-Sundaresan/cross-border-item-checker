import { BorderItem, Category, SearchResult, SearchOptions, Direction, BorderStatus } from '../types';

// Fuzzy matching utility
export function calculateRelevanceScore(query: string, text: string): number {
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase();
  
  if (!queryLower || !textLower) return 0;
  
  // Exact match gets highest score
  if (textLower === queryLower) return 100;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 90;
  
  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 70;
  
  // Fuzzy matching for partial matches
  let score = 0;
  const queryWords = queryLower.split(' ').filter(word => word.length > 0);
  const textWords = textLower.split(' ').filter(word => word.length > 0);
  
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      if (textWord.includes(queryWord)) {
        score += 30;
      } else if (queryWord.includes(textWord)) {
        score += 20;
      } else {
        // Character-level similarity
        const similarity = calculateStringSimilarity(queryWord, textWord);
        if (similarity > 0.6) {
          score += similarity * 25;
        }
      }
    }
  }
  
  return Math.min(score, 100);
}

// Calculate string similarity using Levenshtein distance
function calculateStringSimilarity(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len1][len2]) / maxLen;
}

// Search items with fuzzy matching and alias support
export function searchItems(items: BorderItem[], options: SearchOptions): SearchResult[] {
  const { query, filters, limit = 50 } = options;
  
  if (!query.trim()) {
    return [];
  }
  
  const results: SearchResult[] = [];
  
  for (const item of items) {
    // Skip items that don't match category filter
    if (filters.category && item.category !== filters.category) {
      continue;
    }
    
    // Skip items that don't match status filter
    if (filters.status) {
      const rule = filters.direction === 'usaToCanada' ? item.usaToCanada : item.canadaToUsa;
      if (rule.status !== filters.status) {
        continue;
      }
    }
    
    // Calculate relevance scores for name and aliases
    const nameScore = calculateRelevanceScore(query, item.name);
    let bestAliasScore = 0;
    let matchedAlias: string | undefined;
    
    for (const alias of item.aliases) {
      const aliasScore = calculateRelevanceScore(query, alias);
      if (aliasScore > bestAliasScore) {
        bestAliasScore = aliasScore;
        matchedAlias = alias;
      }
    }
    
    // Use the best score between name and aliases
    const relevanceScore = Math.max(nameScore, bestAliasScore);
    
    // Only include items with a minimum relevance score
    if (relevanceScore > 10) {
      results.push({
        item,
        relevanceScore,
        matchedAlias: bestAliasScore > nameScore ? matchedAlias : undefined
      });
    }
  }
  
  // Sort by relevance score (highest first)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // Apply limit
  return results.slice(0, limit);
}

// Get items by category
export function getItemsByCategory(items: BorderItem[], categoryId: string): BorderItem[] {
  return items.filter(item => item.category === categoryId);
}

// Get items by status for a specific direction
export function getItemsByStatus(
  items: BorderItem[], 
  status: BorderStatus, 
  direction: Direction
): BorderItem[] {
  return items.filter(item => {
    const rule = direction === 'usaToCanada' ? item.usaToCanada : item.canadaToUsa;
    return rule.status === status;
  });
}

// Find related items (same category or parent regulation)
export function findRelatedItems(items: BorderItem[], targetItem: BorderItem): BorderItem[] {
  const related: BorderItem[] = [];
  
  for (const item of items) {
    if (item.id === targetItem.id) continue;
    
    // Items in the same category
    if (item.category === targetItem.category) {
      related.push(item);
    }
    
    // Items with the same parent regulation
    if (targetItem.parentRegulation && item.parentRegulation === targetItem.parentRegulation) {
      related.push(item);
    }
    
    // Items where one inherits from the other
    if (item.parentRegulation === targetItem.id || targetItem.parentRegulation === item.id) {
      related.push(item);
    }
  }
  
  // Remove duplicates and limit results
  const uniqueRelated = related.filter((item, index, self) => 
    self.findIndex(i => i.id === item.id) === index
  );
  
  return uniqueRelated.slice(0, 10);
}

// Get search suggestions based on partial input
export function getSearchSuggestions(
  items: BorderItem[], 
  categories: Category[], 
  query: string, 
  limit: number = 5
): string[] {
  const suggestions: Set<string> = new Set();
  const queryLower = query.toLowerCase().trim();
  
  if (!queryLower) return [];
  
  // Add item names that start with or contain the query
  for (const item of items) {
    if (item.name.toLowerCase().startsWith(queryLower)) {
      suggestions.add(item.name);
    }
    
    // Add matching aliases
    for (const alias of item.aliases) {
      if (alias.toLowerCase().startsWith(queryLower)) {
        suggestions.add(alias);
      }
    }
  }
  
  // Add category names that match
  for (const category of categories) {
    if (category.name.toLowerCase().startsWith(queryLower)) {
      suggestions.add(category.name);
    }
  }
  
  // Convert to array and sort by length (shorter suggestions first)
  const suggestionArray = Array.from(suggestions).sort((a, b) => a.length - b.length);
  
  return suggestionArray.slice(0, limit);
}

// Filter items by multiple criteria
export function filterItems(
  items: BorderItem[],
  filters: {
    category?: string;
    status?: BorderStatus;
    direction: Direction;
    hasQuantityLimit?: boolean;
    hasAgeRestriction?: boolean;
    requiresDeclaration?: boolean;
  }
): BorderItem[] {
  return items.filter(item => {
    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }
    
    const rule = filters.direction === 'usaToCanada' ? item.usaToCanada : item.canadaToUsa;
    
    // Status filter
    if (filters.status && rule.status !== filters.status) {
      return false;
    }
    
    // Quantity limit filter
    if (filters.hasQuantityLimit !== undefined) {
      const hasLimit = !!rule.quantityLimit;
      if (filters.hasQuantityLimit !== hasLimit) {
        return false;
      }
    }
    
    // Age restriction filter
    if (filters.hasAgeRestriction !== undefined) {
      const hasAge = !!rule.ageRestriction;
      if (filters.hasAgeRestriction !== hasAge) {
        return false;
      }
    }
    
    // Declaration requirement filter
    if (filters.requiresDeclaration !== undefined) {
      if (filters.requiresDeclaration !== rule.declarationRequired) {
        return false;
      }
    }
    
    return true;
  });
}

// Resolve parent-child relationships for granularity handling
export function resolveItemWithParent(
  items: BorderItem[], 
  item: BorderItem
): BorderItem & { parentItem?: BorderItem } {
  if (!item.parentRegulation) {
    return item;
  }
  
  const parentItem = items.find(i => i.id === item.parentRegulation);
  return {
    ...item,
    parentItem
  };
}

// Get category statistics
export function getCategoryStats(
  items: BorderItem[], 
  categoryId: string, 
  direction: Direction
): {
  total: number;
  allowed: number;
  restricted: number;
  prohibited: number;
} {
  const categoryItems = getItemsByCategory(items, categoryId);
  
  const stats = {
    total: categoryItems.length,
    allowed: 0,
    restricted: 0,
    prohibited: 0
  };
  
  for (const item of categoryItems) {
    const rule = direction === 'usaToCanada' ? item.usaToCanada : item.canadaToUsa;
    stats[rule.status]++;
  }
  
  return stats;
}