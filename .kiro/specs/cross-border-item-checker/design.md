# Design Document

## Overview

The Cross-Border Item Checker is a web application built with Next.js, TypeScript, and Tailwind CSS that helps travelers determine whether specific items can legally cross the USA-Canada land border. The application provides a user-friendly interface for searching items, browsing categories, and accessing detailed border crossing information with official source references.

## Architecture

### Technology Stack
- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and context for local state
- **Data Storage**: Static JSON files for item database (future: database integration)
- **Deployment**: Containerized with Docker for consistent deployment

### Data Strategy
The application uses a **pre-populated static database approach** for optimal performance and reliability:

- **Static Data**: Border crossing rules are pre-researched and compiled into JSON files
- **Manual Curation**: Data is manually curated from official CBSA and CBP sources
- **No Real-time Queries**: The app does not query government websites in real-time
- **Periodic Updates**: Data is updated periodically through manual review and updates
- **Official Source Links**: Each item includes direct links to official sources for verification

This approach ensures:
- Fast response times for users
- Reliable availability (no dependency on government site uptime)
- Consistent data format and quality
- Better user experience with instant search results

### Application Structure
```
app/
├── components/           # Reusable UI components
│   ├── search/          # Search-related components
│   ├── categories/      # Category browsing components
│   ├── items/           # Item display components
│   └── common/          # Shared UI components
├── data/                # Pre-populated static data files
│   ├── items.json       # Curated item database from CBSA/CBP sources
│   └── categories.json  # Category definitions
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── (routes)/            # App router pages
│   ├── page.tsx         # Home page
│   ├── search/          # Search results page
│   ├── category/        # Category browsing page
│   └── item/            # Individual item details page
└── globals.css          # Global styles
```

## Components and Interfaces

### Core Data Models

```typescript
interface BorderItem {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  usaToCanada: BorderRule;
  canadaToUsa: BorderRule;
  lastUpdated: string;
  officialSources: OfficialSource[];
}

interface BorderRule {
  status: 'allowed' | 'restricted' | 'prohibited';
  quantityLimit?: QuantityLimit;
  ageRestriction?: number;
  specialRequirements?: string[];
  declarationRequired: boolean;
  dutyApplies: boolean;
  notes?: string;
}

interface QuantityLimit {
  amount: number;
  unit: string;
  period: 'per person' | 'per trip' | 'per day';
}

interface OfficialSource {
  name: string;
  url: string;
  type: 'CBSA' | 'CBP' | 'other';
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
}
```

### Key Components

#### SearchComponent
- **Purpose**: Handles item search functionality
- **Features**: 
  - Real-time search with debouncing
  - Autocomplete suggestions
  - Direction selector (USA→Canada, Canada→USA)
- **Props**: `onSearch: (query: string, direction: Direction) => void`

#### CategoryGrid
- **Purpose**: Displays item categories with visual indicators
- **Features**:
  - Responsive grid layout
  - Category icons and item counts
  - Quick status indicators
- **Props**: `categories: Category[], onCategorySelect: (categoryId: string) => void`

#### ItemCard
- **Purpose**: Displays individual item information
- **Features**:
  - Status badges (allowed/restricted/prohibited)
  - Quantity limits display
  - Quick action buttons
- **Props**: `item: BorderItem, direction: Direction, compact?: boolean`

#### ItemDetails
- **Purpose**: Shows comprehensive item information
- **Features**:
  - Detailed rules and restrictions
  - Official source links
  - Last updated information
  - Penalty warnings
- **Props**: `item: BorderItem, direction: Direction`

#### DirectionSelector
- **Purpose**: Allows users to choose travel direction
- **Features**:
  - Toggle between USA→Canada and Canada→USA
  - Visual flag indicators
  - Persistent selection
- **Props**: `direction: Direction, onChange: (direction: Direction) => void`

## Data Models

### Item Database Structure
The application uses a structured JSON database containing border crossing information:

```json
{
  "items": [
    {
      "id": "apple-fresh",
      "name": "Fresh Apples",
      "category": "food-fresh",
      "aliases": ["apples", "fresh fruit"],
      "usaToCanada": {
        "status": "allowed",
        "declarationRequired": false,
        "dutyApplies": false,
        "notes": "Must be free of pests and disease"
      },
      "canadaToUsa": {
        "status": "restricted",
        "specialRequirements": ["Must be commercially packaged"],
        "declarationRequired": true,
        "dutyApplies": false
      },
      "lastUpdated": "2024-01-15",
      "officialSources": [
        {
          "name": "CBSA Food Guidelines",
          "url": "https://www.cbsa-asfc.gc.ca/travel-voyage/declare-declarer/food-aliments-eng.html",
          "type": "CBSA"
        }
      ]
    }
  ],
  "categories": [
    {
      "id": "food-fresh",
      "name": "Fresh Food",
      "description": "Fresh fruits, vegetables, and perishable items",
      "icon": "🍎",
      "itemCount": 25
    }
  ]
}
```

### Search and Filtering Logic
- **Fuzzy Search**: Implements fuzzy matching for item names and aliases
- **Hierarchical Matching**: Maps specific items to broader regulatory categories
- **Category Filtering**: Allows filtering by category with subcategory support
- **Direction-Specific Results**: Shows rules specific to selected travel direction
- **Status Filtering**: Option to filter by allowed/restricted/prohibited status

### Handling Granularity Mismatch
The application addresses the common issue where users search for specific items (e.g., "lemon") while regulations cover broader categories (e.g., "citrus fruits"):

**Data Structure Approach:**
- **Parent-Child Relationships**: Items are linked to their regulatory parent categories
- **Specific Item Entries**: Create entries for common specific items that reference broader rules
- **Alias System**: Extensive alias mapping (e.g., "lemon" → "citrus fruits")
- **Category Inheritance**: Specific items inherit rules from their parent categories

**Example Data Structure:**
```json
{
  "id": "lemon",
  "name": "Lemon",
  "category": "food-fresh",
  "parentRegulation": "citrus-fruits",
  "aliases": ["lemons", "fresh lemon"],
  "usaToCanada": {
    "status": "restricted",
    "inheritedFrom": "citrus-fruits",
    "notes": "Subject to citrus fruit regulations"
  }
}
```

**User Experience:**
- **Clear Attribution**: Show that "lemon" rules come from "citrus fruits" regulations
- **Related Items**: Display other items in the same regulatory category
- **Regulatory Context**: Explain the broader category that applies
- **Official Source**: Link directly to the specific regulation section

## Error Handling

### User-Facing Errors
- **Search No Results**: Clear messaging with suggestions for alternative searches
- **Invalid Item**: Graceful handling of non-existent items with category suggestions
- **Network Issues**: Offline-friendly design with cached data
- **Data Loading**: Loading states and skeleton components

### Technical Error Handling
- **Type Safety**: Comprehensive TypeScript interfaces prevent runtime errors
- **Data Validation**: JSON schema validation for item data integrity
- **Fallback Content**: Default content when data is unavailable
- **Error Boundaries**: React error boundaries for component-level error handling

## Testing Strategy

### Unit Testing
- **Component Testing**: Test individual components with React Testing Library
- **Utility Functions**: Test search algorithms, data filtering, and validation
- **Type Checking**: Ensure TypeScript compilation without errors
- **Data Validation**: Test JSON schema validation and data integrity

### Integration Testing
- **Search Flow**: End-to-end search functionality testing
- **Navigation**: Test routing between pages and deep linking
- **Responsive Design**: Test mobile and desktop layouts
- **Accessibility**: Test keyboard navigation and screen reader compatibility

### Test Data
- **Mock Data**: Comprehensive test dataset covering edge cases
- **API Mocking**: Mock external API calls for consistent testing
- **Performance Testing**: Test search performance with large datasets
- **Cross-Browser Testing**: Ensure compatibility across modern browsers

## Performance Considerations

### Optimization Strategies
- **Static Generation**: Pre-generate pages for common searches and categories
- **Code Splitting**: Lazy load components and routes for faster initial load
- **Image Optimization**: Use Next.js Image component for category icons and flags
- **Search Debouncing**: Prevent excessive API calls during typing
- **Caching**: Implement client-side caching for search results and item data

### Mobile Optimization
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch Interactions**: Appropriate touch targets and gesture support
- **Performance**: Optimize for slower mobile networks
- **Progressive Web App**: Consider PWA features for offline access

## Security and Compliance

### Data Security
- **No Personal Data**: Application doesn't collect or store personal information
- **Official Sources**: All information linked to authoritative government sources
- **Content Security**: Implement CSP headers to prevent XSS attacks
- **HTTPS**: Ensure all connections are encrypted

### Legal Considerations
- **Disclaimers**: Clear disclaimers about information accuracy and official verification
- **Source Attribution**: Proper attribution to CBSA and CBP sources
- **Update Frequency**: Regular updates to maintain information accuracy
- **Liability**: Clear statements about user responsibility for compliance

## Accessibility

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Ensure sufficient contrast ratios for all text
- **Focus Management**: Clear focus indicators and logical tab order

### Inclusive Design
- **Language Support**: Clear, simple language avoiding jargon
- **Visual Indicators**: Use icons and colors with text labels
- **Font Sizing**: Responsive text sizing for readability
- **Alternative Formats**: Consider audio descriptions for complex information