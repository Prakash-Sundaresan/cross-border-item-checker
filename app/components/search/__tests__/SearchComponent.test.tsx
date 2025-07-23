import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchComponent from '../SearchComponent';
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

// Mock timers for debouncing
jest.useFakeTimers();

// Mock DirectionSelector to avoid hydration issues
jest.mock('../../common/DirectionSelector', () => {
  return function MockDirectionSelector({ direction, onChange }: any) {
    return (
      <div data-testid="direction-selector">
        <button 
          onClick={() => onChange('usaToCanada')}
          aria-pressed={direction === 'usaToCanada'}
          aria-label="Select USA to Canada direction"
        >
          USA → Canada
        </button>
        <button 
          onClick={() => onChange('canadaToUsa')}
          aria-pressed={direction === 'canadaToUsa'}
          aria-label="Select Canada to USA direction"
        >
          Canada → USA
        </button>
      </div>
    );
  };
});

describe('SearchComponent', () => {
  const mockOnSearch = jest.fn();
  const mockOnDirectionChange = jest.fn();
  const mockOnSuggestionRequest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
  });

  const defaultProps = {
    onSearch: mockOnSearch,
    direction: 'usaToCanada' as Direction,
    onDirectionChange: mockOnDirectionChange,
  };

  test('renders search input and direction selector', async () => {
    render(<SearchComponent {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Search for border crossing items')).toBeInTheDocument();
      expect(screen.getByLabelText('Select USA to Canada direction')).toBeInTheDocument();
    });
  });

  test('calls onSearch when form is submitted', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<SearchComponent {...defaultProps} />);
    
    const input = screen.getByLabelText('Search for border crossing items');
    
    await user.type(input, 'apple');
    
    // Fast-forward timers to trigger debounced search
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('apple', 'usaToCanada');
    });
  });

  test('debounces search input', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<SearchComponent {...defaultProps} />);
    
    const input = screen.getByLabelText('Search for border crossing items');
    
    await user.type(input, 'a');
    await user.type(input, 'p');
    await user.type(input, 'p');
    
    // Should not call onSearch immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('app', 'usaToCanada');
    });
  });

  test('shows suggestions when provided', async () => {
    const suggestions = ['apple', 'apples', 'fresh apples'];
    
    render(
      <SearchComponent 
        {...defaultProps} 
        suggestions={suggestions}
        onSuggestionRequest={mockOnSuggestionRequest}
      />
    );
    
    const input = screen.getByLabelText('Search for border crossing items');
    
    await userEvent.type(input, 'app');
    
    await waitFor(() => {
      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });
  });

  test('handles suggestion click', async () => {
    const suggestions = ['apple', 'apples'];
    
    render(
      <SearchComponent 
        {...defaultProps} 
        suggestions={suggestions}
      />
    );
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'app');
    
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('apple'));
    
    expect(mockOnSearch).toHaveBeenCalledWith('apple', 'usaToCanada');
    expect(input).toHaveValue('apple');
  });

  test('handles keyboard navigation in suggestions', async () => {
    const suggestions = ['apple', 'apples', 'fresh apples'];
    
    render(
      <SearchComponent 
        {...defaultProps} 
        suggestions={suggestions}
      />
    );
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'app');
    
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
    });
    
    // Navigate down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('apple')).toHaveClass('bg-blue-50');
    
    // Navigate down again
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getByText('apples')).toHaveClass('bg-blue-50');
    
    // Navigate up
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getByText('apple')).toHaveClass('bg-blue-50');
    
    // Select with Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockOnSearch).toHaveBeenCalledWith('apple', 'usaToCanada');
  });

  test('closes suggestions on Escape key', async () => {
    const suggestions = ['apple', 'apples'];
    
    render(
      <SearchComponent 
        {...defaultProps} 
        suggestions={suggestions}
      />
    );
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'app');
    
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(input, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
    });
  });

  test('shows clear button when input has value', async () => {
    render(<SearchComponent {...defaultProps} />);
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'apple');
    
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  test('clears input when clear button is clicked', async () => {
    render(<SearchComponent {...defaultProps} />);
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'apple');
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
  });

  test('shows loading indicator when loading prop is true', () => {
    render(<SearchComponent {...defaultProps} loading={true} />);
    
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  test('disables search button when loading', async () => {
    render(<SearchComponent {...defaultProps} loading={true} />);
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'apple');
    
    // Check mobile search button
    const searchButton = screen.getByRole('button', { name: /searching/i });
    expect(searchButton).toBeDisabled();
  });

  test('shows no suggestions message when no suggestions available', async () => {
    render(
      <SearchComponent 
        {...defaultProps} 
        suggestions={[]}
        onSuggestionRequest={mockOnSuggestionRequest}
      />
    );
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'xyz');
    
    // Fast-forward timers to trigger debounced search
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    await waitFor(() => {
      expect(screen.getByText('No suggestions found. Try a different search term.')).toBeInTheDocument();
    });
  });

  test('calls onSuggestionRequest when query changes', async () => {
    render(
      <SearchComponent 
        {...defaultProps} 
        onSuggestionRequest={mockOnSuggestionRequest}
      />
    );
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'apple');
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    await waitFor(() => {
      expect(mockOnSuggestionRequest).toHaveBeenCalledWith('apple');
    });
  });

  test('uses custom placeholder', () => {
    const customPlaceholder = 'Custom placeholder text';
    
    render(
      <SearchComponent 
        {...defaultProps} 
        placeholder={customPlaceholder}
      />
    );
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <SearchComponent 
        {...defaultProps} 
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('closes suggestions when clicking outside', async () => {
    const suggestions = ['apple', 'apples'];
    
    render(
      <SearchComponent 
        {...defaultProps} 
        suggestions={suggestions}
      />
    );
    
    const input = screen.getByLabelText('Search for border crossing items');
    await userEvent.type(input, 'app');
    
    await waitFor(() => {
      expect(screen.getByText('apple')).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('apple')).not.toBeInTheDocument();
    });
  });
});