import { BorderItem, Category, ValidationResult, BorderStatus, SourceType, QuantityPeriod } from '../types';

// Validation functions for data integrity

export function validateBorderItem(item: any): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!item.id || typeof item.id !== 'string') {
    errors.push('Item must have a valid id');
  }
  
  if (!item.name || typeof item.name !== 'string') {
    errors.push('Item must have a valid name');
  }
  
  if (!item.category || typeof item.category !== 'string') {
    errors.push('Item must have a valid category');
  }
  
  if (!Array.isArray(item.aliases)) {
    errors.push('Item must have an aliases array');
  }
  
  if (!item.lastUpdated || typeof item.lastUpdated !== 'string') {
    errors.push('Item must have a lastUpdated date');
  }
  
  if (!Array.isArray(item.officialSources)) {
    errors.push('Item must have an officialSources array');
  }

  // Validate border rules
  const usaToCanadaValidation = validateBorderRule(item.usaToCanada, 'usaToCanada');
  const canadaToUsaValidation = validateBorderRule(item.canadaToUsa, 'canadaToUsa');
  
  errors.push(...usaToCanadaValidation.errors);
  errors.push(...canadaToUsaValidation.errors);

  // Validate official sources
  if (item.officialSources) {
    item.officialSources.forEach((source: any, index: number) => {
      const sourceValidation = validateOfficialSource(source);
      if (!sourceValidation.isValid) {
        errors.push(`Official source ${index}: ${sourceValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateBorderRule(rule: any, direction: string): ValidationResult {
  const errors: string[] = [];
  
  if (!rule) {
    errors.push(`${direction} rule is required`);
    return { isValid: false, errors };
  }

  // Validate status
  const validStatuses: BorderStatus[] = ['allowed', 'restricted', 'prohibited'];
  if (!validStatuses.includes(rule.status)) {
    errors.push(`${direction} must have a valid status: ${validStatuses.join(', ')}`);
  }

  // Validate boolean fields
  if (typeof rule.declarationRequired !== 'boolean') {
    errors.push(`${direction} declarationRequired must be a boolean`);
  }
  
  if (typeof rule.dutyApplies !== 'boolean') {
    errors.push(`${direction} dutyApplies must be a boolean`);
  }

  // Validate optional fields
  if (rule.quantityLimit) {
    const quantityValidation = validateQuantityLimit(rule.quantityLimit);
    if (!quantityValidation.isValid) {
      errors.push(`${direction} quantity limit: ${quantityValidation.errors.join(', ')}`);
    }
  }

  if (rule.ageRestriction && (typeof rule.ageRestriction !== 'number' || rule.ageRestriction < 0)) {
    errors.push(`${direction} ageRestriction must be a positive number`);
  }

  if (rule.specialRequirements && !Array.isArray(rule.specialRequirements)) {
    errors.push(`${direction} specialRequirements must be an array`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateQuantityLimit(limit: any): ValidationResult {
  const errors: string[] = [];

  if (typeof limit.amount !== 'number' || limit.amount <= 0) {
    errors.push('Quantity limit amount must be a positive number');
  }

  if (!limit.unit || typeof limit.unit !== 'string') {
    errors.push('Quantity limit must have a valid unit');
  }

  const validPeriods: QuantityPeriod[] = ['per person', 'per trip', 'per day'];
  if (!validPeriods.includes(limit.period)) {
    errors.push(`Quantity limit period must be one of: ${validPeriods.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateOfficialSource(source: any): ValidationResult {
  const errors: string[] = [];

  if (!source.name || typeof source.name !== 'string') {
    errors.push('Official source must have a valid name');
  }

  if (!source.url || typeof source.url !== 'string') {
    errors.push('Official source must have a valid URL');
  }

  const validTypes: SourceType[] = ['CBSA', 'CBP', 'other'];
  if (!validTypes.includes(source.type)) {
    errors.push(`Official source type must be one of: ${validTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCategory(category: any): ValidationResult {
  const errors: string[] = [];

  if (!category.id || typeof category.id !== 'string') {
    errors.push('Category must have a valid id');
  }

  if (!category.name || typeof category.name !== 'string') {
    errors.push('Category must have a valid name');
  }

  if (!category.description || typeof category.description !== 'string') {
    errors.push('Category must have a valid description');
  }

  if (!category.icon || typeof category.icon !== 'string') {
    errors.push('Category must have a valid icon');
  }

  if (typeof category.itemCount !== 'number' || category.itemCount < 0) {
    errors.push('Category itemCount must be a non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateItemsDatabase(data: any): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(data.items)) {
    errors.push('Database must have an items array');
  } else {
    data.items.forEach((item: any, index: number) => {
      const itemValidation = validateBorderItem(item);
      if (!itemValidation.isValid) {
        errors.push(`Item ${index} (${item.id || 'unknown'}): ${itemValidation.errors.join(', ')}`);
      }
    });
  }

  if (!data.lastUpdated || typeof data.lastUpdated !== 'string') {
    errors.push('Database must have a lastUpdated date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateCategoriesDatabase(data: any): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(data.categories)) {
    errors.push('Database must have a categories array');
  } else {
    data.categories.forEach((category: any, index: number) => {
      const categoryValidation = validateCategory(category);
      if (!categoryValidation.isValid) {
        errors.push(`Category ${index} (${category.id || 'unknown'}): ${categoryValidation.errors.join(', ')}`);
      }
    });
  }

  if (!data.lastUpdated || typeof data.lastUpdated !== 'string') {
    errors.push('Database must have a lastUpdated date');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}