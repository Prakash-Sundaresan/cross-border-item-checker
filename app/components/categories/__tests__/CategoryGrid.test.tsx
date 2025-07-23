import { render, screen, fireEvent } from '@testing-library/react';
import CategoryGrid, { CategoryGridSkeleton } from '../CategoryGrid';
import { Category, BorderItem, Direction } from '../../../types';

// Mock data
const mockCategories: Category[] = [
  {
    id: 'food-fresh',
    name: 'Fresh Food',
    description: 'Fresh fruits, vegetables, and perishable items',
    icon: '🍎',
    itemCount: 2
  },
  {
    id: 'alcohol',
    name: 'Alcohol',
    description: 'Beer, wine, spirits, and alcoholic beverages',
    icon: '🍷',
    itemCount: 1
  }
];

const mockItems: BorderItem[] = [
  {
    id: 'apple-fresh',
    name: 'Fresh Apples',
    category: 'food-fresh',
    aliases: ['apples', 'fresh fruit'],
    usaToCanada: {
      status: 'allowed',
      declarationRequired: false,
      dutyApplies: false
    },
    canadaToUsa: {
      status: 'restricted',
      declarationRequired: true,
      dutyApplies: false
    },
    lastUpdated: '2024-01-15',
    officialSources: []
  },
  {
    id: 'lemon',
    name: 'Lemon',
    category: 'food-fresh',
    aliases: ['lemons', 'citrus'],
    usaToCanada: {
      status: 'restricted',
      declarationRequired: true,
      dutyApplies: false
    },
    canadaToUsa: {
      status: 'restricted',
      declarationRequired: true,
      dutyApplies: false
    },
    lastUpdated: '2024-01-15',
    officialSources: []
  },
  {
    id: 'wine',
    name: 'Wine',
    category: 'alcohol',
    aliases: ['wine', 'red wine'],
    usaToCanada: {
      status: 'allowed',
      declarationRequired: true,
      dutyApplies: true
    },
    canadaToUsa: {
      status: 'allowed',
      declarationRequired: true,
      dutyApplies: true
    },
    lastUpdated: '2024-01-15',
    officialSources: []
  }
];

describe('CategoryGrid', () => {
  const mockOnCategorySelect = jest.fn();
  const defaultProps = {
    categories: mockCategories,
    items: mockItems,
    direction: 'usaToCanada' as Direction,
    onCategorySelect: mockOnCategorySelect
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all categories', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    expect(screen.getByText('Fresh Food')).toBeInTheDocument();
    expect(screen.getByText('Alcohol')).toBeInTheDocument();
  });

  test('displays category descriptions', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    expect(screen.getByText('Fresh fruits, vegetables, and perishable items')).toBeInTheDocument();
    expect(screen.getByText('Beer, wine, spirits, and alcoholic beverages')).toBeInTheDocument();
  });

  test('shows category icons', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    expect(screen.getByLabelText('Fresh Food icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Alcohol icon')).toBeInTheDocument();
  });

  test('displays item counts', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  test('shows status breakdown for categories', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    // Fresh Food category should show: 1 allowed, 1 restricted (for USA to Canada)
    expect(screen.getAllByText('1 allowed')).toHaveLength(2); // Fresh Food and Alcohol
    expect(screen.getByText('1 restricted')).toBeInTheDocument();
  });

  test('calls onCategorySelect when category is clicked', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    const freshFoodButton = screen.getByLabelText('Browse Fresh Food category with 2 items');
    fireEvent.click(freshFoodButton);
    
    expect(mockOnCategorySelect).toHaveBeenCalledWith('food-fresh');
  });

  test('shows different stats for different directions', () => {
    const { rerender } = render(<CategoryGrid {...defaultProps} />);
    
    // Check USA to Canada stats
    expect(screen.getAllByText('1 allowed')).toHaveLength(2);
    
    // Change to Canada to USA
    rerender(
      <CategoryGrid 
        {...defaultProps} 
        direction="canadaToUsa"
      />
    );
    
    // Fresh Food category should now show: 0 allowed, 2 restricted (for Canada to USA)
    expect(screen.getByText('2 restricted')).toBeInTheDocument();
  });

  test('displays majority status correctly', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    // Both categories should show "Mostly allowed"
    expect(screen.getAllByText('Mostly allowed')).toHaveLength(2);
  });

  test('renders empty state when no categories', () => {
    render(
      <CategoryGrid 
        {...defaultProps} 
        categories={[]}
      />
    );
    
    expect(screen.getByText('No categories available')).toBeInTheDocument();
    expect(screen.getByText('Categories will appear here when data is loaded.')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <CategoryGrid 
        {...defaultProps} 
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('has proper accessibility attributes', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    const freshFoodButton = screen.getByLabelText('Browse Fresh Food category with 2 items');
    expect(freshFoodButton).toHaveAttribute('aria-label');
    
    const alcoholButton = screen.getByLabelText('Browse Alcohol category with 1 items');
    expect(alcoholButton).toHaveAttribute('aria-label');
  });

  test('shows hover and focus states', () => {
    render(<CategoryGrid {...defaultProps} />);
    
    const freshFoodButton = screen.getByLabelText('Browse Fresh Food category with 2 items');
    expect(freshFoodButton).toHaveClass('hover:shadow-md', 'focus:ring-2');
  });
});

describe('CategoryGridSkeleton', () => {
  test('renders loading skeleton', () => {
    render(<CategoryGridSkeleton />);
    
    // Should render 6 skeleton cards
    const skeletonCards = screen.getAllByRole('generic');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  test('applies custom className', () => {
    const { container } = render(<CategoryGridSkeleton className="custom-skeleton" />);
    
    expect(container.firstChild).toHaveClass('custom-skeleton');
  });

  test('shows loading animation', () => {
    render(<CategoryGridSkeleton />);
    
    const animatedElements = document.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});