import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard, { ItemCardSkeleton } from '../ItemCard';
import { BorderItem, Direction } from '../../../types';

// Mock data
const mockItem: BorderItem = {
  id: 'wine',
  name: 'Wine',
  category: 'alcohol',
  aliases: ['red wine', 'white wine', 'rosé'],
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
    notes: 'Duty-free allowance for visitors staying 48+ hours'
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
    notes: 'Must be for personal consumption'
  },
  lastUpdated: '2024-01-15',
  officialSources: [
    {
      name: 'CBSA Alcohol Guidelines',
      url: 'https://www.cbsa-asfc.gc.ca/travel-voyage/declare-declarer/alcohol-alcool-eng.html',
      type: 'CBSA'
    }
  ]
};

const mockRestrictedItem: BorderItem = {
  id: 'lemon',
  name: 'Lemon',
  category: 'food-fresh',
  parentRegulation: 'citrus-fruits',
  aliases: ['lemons', 'fresh lemon'],
  usaToCanada: {
    status: 'restricted',
    specialRequirements: ['Must be commercially packaged', 'Subject to pest inspection'],
    declarationRequired: true,
    dutyApplies: false,
    inheritedFrom: 'citrus-fruits',
    notes: 'Subject to citrus fruit regulations'
  },
  canadaToUsa: {
    status: 'restricted',
    specialRequirements: ['Must be from approved regions'],
    declarationRequired: true,
    dutyApplies: false,
    inheritedFrom: 'citrus-fruits'
  },
  lastUpdated: '2024-01-15',
  officialSources: []
};

describe('ItemCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders item name and status', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('Wine')).toBeInTheDocument();
    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });

  test('displays aliases in non-compact mode', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText(/Also known as:/)).toBeInTheDocument();
    expect(screen.getByText(/red wine, white wine, rosé/)).toBeInTheDocument();
  });

  test('hides aliases in compact mode', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
        compact={true}
      />
    );

    expect(screen.queryByText(/Also known as:/)).not.toBeInTheDocument();
  });

  test('shows parent regulation when present', () => {
    render(
      <ItemCard 
        item={mockRestrictedItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('via citrus-fruits')).toBeInTheDocument();
  });

  test('displays quantity limit', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('Limit: 1.5 liters per person')).toBeInTheDocument();
  });

  test('shows age restriction', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('Age 19+ required')).toBeInTheDocument();
  });

  test('indicates declaration requirement', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('Declaration required')).toBeInTheDocument();
  });

  test('shows duty information', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('Duty may apply')).toBeInTheDocument();
  });

  test('displays special requirements', () => {
    render(
      <ItemCard 
        item={mockRestrictedItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('Requirements:')).toBeInTheDocument();
    expect(screen.getByText('• Must be commercially packaged')).toBeInTheDocument();
    expect(screen.getByText('• Subject to pest inspection')).toBeInTheDocument();
  });

  test('shows different information for different directions', () => {
    const { rerender } = render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText('Age 19+ required')).toBeInTheDocument();

    rerender(
      <ItemCard 
        item={mockItem} 
        direction="canadaToUsa" 
      />
    );

    expect(screen.getByText('Age 21+ required')).toBeInTheDocument();
  });

  test('displays last updated date', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  test('shows notes in non-compact mode', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByText(/Duty-free allowance for visitors staying 48\+ hours/)).toBeInTheDocument();
  });

  test('hides notes in compact mode', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
        compact={true}
      />
    );

    expect(screen.queryByText(/Duty-free allowance/)).not.toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
        onClick={mockOnClick}
      />
    );

    const card = screen.getByLabelText('View details for Wine');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockItem);
  });

  test('handles keyboard navigation', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
        onClick={mockOnClick}
      />
    );

    const card = screen.getByLabelText('View details for Wine');
    
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith(mockItem);

    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  test('shows click indicator when onClick is provided', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Click for details →')).toBeInTheDocument();
  });

  test('does not show click indicator when onClick is not provided', () => {
    render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.queryByText('Click for details →')).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('shows correct status colors and icons', () => {
    const { rerender } = render(
      <ItemCard 
        item={mockItem} 
        direction="usaToCanada" 
      />
    );

    // Allowed status
    expect(screen.getByLabelText('allowed status')).toBeInTheDocument();

    // Restricted status
    rerender(
      <ItemCard 
        item={mockRestrictedItem} 
        direction="usaToCanada" 
      />
    );

    expect(screen.getByLabelText('restricted status')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  test('limits special requirements in compact mode', () => {
    const itemWithManyRequirements = {
      ...mockRestrictedItem,
      usaToCanada: {
        ...mockRestrictedItem.usaToCanada,
        specialRequirements: ['Req 1', 'Req 2', 'Req 3', 'Req 4', 'Req 5']
      }
    };

    render(
      <ItemCard 
        item={itemWithManyRequirements} 
        direction="usaToCanada" 
        compact={true}
      />
    );

    expect(screen.getByText('+3 more requirements')).toBeInTheDocument();
  });
});

describe('ItemCardSkeleton', () => {
  test('renders loading skeleton', () => {
    render(<ItemCardSkeleton />);
    
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  test('renders compact skeleton', () => {
    const { container } = render(<ItemCardSkeleton compact={true} />);
    
    expect(container.querySelector('.p-4')).toBeInTheDocument();
  });

  test('renders full skeleton by default', () => {
    const { container } = render(<ItemCardSkeleton />);
    
    expect(container.querySelector('.p-6')).toBeInTheDocument();
  });
});