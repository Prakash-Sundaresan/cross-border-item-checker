import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DirectionSelector, { usePersistedDirection } from '../DirectionSelector';
import { Direction } from '../../../types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component that uses the hook
function TestComponent() {
  const [direction, setDirection] = usePersistedDirection();
  return (
    <DirectionSelector 
      direction={direction} 
      onChange={setDirection}
      data-testid="direction-selector"
    />
  );
}

describe('DirectionSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('renders both direction options', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <DirectionSelector 
        direction="usaToCanada" 
        onChange={mockOnChange} 
      />
    );

    // Wait for component to mount
    await waitFor(() => {
      expect(screen.getByLabelText('Select USA to Canada direction')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Canada to USA direction')).toBeInTheDocument();
    });
  });

  test('shows correct active state for usaToCanada', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <DirectionSelector 
        direction="usaToCanada" 
        onChange={mockOnChange} 
      />
    );

    await waitFor(() => {
      const usaToCanadaButton = screen.getByLabelText('Select USA to Canada direction');
      const canadaToUsaButton = screen.getByLabelText('Select Canada to USA direction');
      
      expect(usaToCanadaButton).toHaveAttribute('aria-pressed', 'true');
      expect(canadaToUsaButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test('shows correct active state for canadaToUsa', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <DirectionSelector 
        direction="canadaToUsa" 
        onChange={mockOnChange} 
      />
    );

    await waitFor(() => {
      const usaToCanadaButton = screen.getByLabelText('Select USA to Canada direction');
      const canadaToUsaButton = screen.getByLabelText('Select Canada to USA direction');
      
      expect(usaToCanadaButton).toHaveAttribute('aria-pressed', 'false');
      expect(canadaToUsaButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test('calls onChange when direction is clicked', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <DirectionSelector 
        direction="usaToCanada" 
        onChange={mockOnChange} 
      />
    );

    await waitFor(() => {
      const canadaToUsaButton = screen.getByLabelText('Select Canada to USA direction');
      fireEvent.click(canadaToUsaButton);
      
      expect(mockOnChange).toHaveBeenCalledWith('canadaToUsa');
    });
  });

  test('saves direction to localStorage when changed', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <DirectionSelector 
        direction="usaToCanada" 
        onChange={mockOnChange} 
      />
    );

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('borderChecker_direction', 'usaToCanada');
    });
  });

  test('displays flag emojis correctly', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <DirectionSelector 
        direction="usaToCanada" 
        onChange={mockOnChange} 
      />
    );

    await waitFor(() => {
      // Check for USA and Canada flag emojis
      expect(screen.getAllByRole('img', { name: /flag/ })).toHaveLength(4); // 2 flags per button
    });
  });

  test('applies custom className', async () => {
    const mockOnChange = jest.fn();
    
    const { container } = render(
      <DirectionSelector 
        direction="usaToCanada" 
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    await waitFor(() => {
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  test('shows loading state during SSR', () => {
    const mockOnChange = jest.fn();
    
    // Mock useState to return false for mounted state
    const originalUseState = require('react').useState;
    jest.spyOn(require('react'), 'useState')
      .mockImplementationOnce(() => [false, jest.fn()]) // mounted state
      .mockImplementation(originalUseState);
    
    const { container } = render(
      <DirectionSelector 
        direction="usaToCanada" 
        onChange={mockOnChange} 
      />
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});

describe('usePersistedDirection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('returns default direction when no saved value', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<TestComponent />);
    
    await waitFor(() => {
      const usaToCanadaButton = screen.getByLabelText('Select USA to Canada direction');
      expect(usaToCanadaButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test('returns saved direction from localStorage', async () => {
    localStorageMock.getItem.mockReturnValue('canadaToUsa');
    
    render(<TestComponent />);
    
    await waitFor(() => {
      const canadaToUsaButton = screen.getByLabelText('Select Canada to USA direction');
      expect(canadaToUsaButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test('ignores invalid saved direction', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-direction');
    
    render(<TestComponent />);
    
    await waitFor(() => {
      const usaToCanadaButton = screen.getByLabelText('Select USA to Canada direction');
      expect(usaToCanadaButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test('saves direction to localStorage when changed', async () => {
    render(<TestComponent />);
    
    await waitFor(() => {
      const canadaToUsaButton = screen.getByLabelText('Select Canada to USA direction');
      fireEvent.click(canadaToUsaButton);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('borderChecker_direction', 'canadaToUsa');
    });
  });
});