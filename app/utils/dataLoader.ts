import { useState, useEffect } from 'react';
import { BorderItem, Category, ItemsDatabase } from '../types';
import { validateItemsDatabase, validateCategoriesDatabase } from './dataValidation';

// Load items data
export async function loadItems(): Promise<BorderItem[]> {
  try {
    const response = await fetch('/data/items.json');
    if (!response.ok) {
      throw new Error(`Failed to load items: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate data structure
    const validation = validateItemsDatabase(data);
    if (!validation.isValid) {
      console.error('Items data validation failed:', validation.errors);
      throw new Error('Invalid items data structure');
    }
    
    return data.items;
  } catch (error) {
    console.error('Error loading items:', error);
    throw error;
  }
}

// Load categories data
export async function loadCategories(): Promise<Category[]> {
  try {
    const response = await fetch('/data/categories.json');
    if (!response.ok) {
      throw new Error(`Failed to load categories: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate data structure
    const validation = validateCategoriesDatabase(data);
    if (!validation.isValid) {
      console.error('Categories data validation failed:', validation.errors);
      throw new Error('Invalid categories data structure');
    }
    
    return data.categories;
  } catch (error) {
    console.error('Error loading categories:', error);
    throw error;
  }
}

// Load both items and categories
export async function loadAllData(): Promise<{ items: BorderItem[]; categories: Category[] }> {
  try {
    const [items, categories] = await Promise.all([
      loadItems(),
      loadCategories()
    ]);
    
    return { items, categories };
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// Client-side data loading hook
export function useDataLoader() {
  const [data, setData] = useState<{ items: BorderItem[]; categories: Category[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// For server-side rendering or static generation
export async function getStaticData(): Promise<{ items: BorderItem[]; categories: Category[] }> {
  // This function would be used in getStaticProps or similar server-side functions
  // For now, we'll use the same client-side loading approach
  return loadAllData();
}

// Cache for client-side data
let dataCache: { items: BorderItem[]; categories: Category[] } | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedData(): Promise<{ items: BorderItem[]; categories: Category[] }> {
  const now = Date.now();
  
  if (dataCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return dataCache;
  }
  
  const data = await loadAllData();
  dataCache = data;
  cacheTimestamp = now;
  
  return data;
}