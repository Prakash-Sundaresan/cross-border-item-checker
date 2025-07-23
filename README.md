# Cross-Border Item Checker 🛂

A web application that helps travelers determine whether specific items can legally cross the USA-Canada land border. Get clear information on customs regulations, restrictions, and requirements for food, alcohol, tobacco, and other goods.

![Cross-Border Item Checker](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

## ✨ Features

- **🔍 Smart Search**: Search for specific items with autocomplete and fuzzy matching
- **📱 Mobile Responsive**: Optimized for mobile devices and touch interactions
- **🎯 Direction-Specific**: Toggle between USA→Canada and Canada→USA travel directions
- **📂 Category Browsing**: Browse items by category with visual status indicators
- **📊 Real Data**: Curated information from official CBSA and CBP sources
- **⚡ Fast Performance**: Static data with client-side search for instant results
- **🔗 Official Sources**: Direct links to government sources for verification
- **♿ Accessible**: WCAG compliant with keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prakash-Sundaresan/cross-border-item-checker.git
   cd cross-border-item-checker
   ```

2. **Install dependencies**
   ```bash
   cd app
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Docker Deployment

1. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```
   
   This starts:
   - Web application on port 3000
   - Nginx reverse proxy on port 80
   - Data service on port 8080
   - Monitoring (Prometheus) on port 9090

2. **Using Docker only**
   ```bash
   cd app
   docker build -t cross-border-checker .
   docker run -p 3000:3000 cross-border-checker
   ```

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

## 🏗️ Project Structure

```
├── app/                    # Next.js application
│   ├── components/         # React components
│   │   ├── categories/     # Category browsing
│   │   ├── common/         # Shared components
│   │   ├── items/          # Item display
│   │   └── search/         # Search functionality
│   ├── data/              # Static JSON data files
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── __tests__/         # Test files
├── nginx/                 # Nginx configuration
├── monitoring/            # Prometheus configuration
├── logging/               # Fluent Bit configuration
└── .kiro/                 # Kiro IDE specifications
```

## 🎯 Key Components

### Search System
- **Fuzzy matching** for item names and aliases
- **Parent-child relationships** (e.g., "lemon" inherits from "citrus fruits")
- **Direction-specific filtering** for travel direction
- **Real-time suggestions** with debounced input

### Data Structure
- **BorderItem**: Core item with USA↔Canada rules
- **Categories**: Organized groupings with visual indicators
- **Official Sources**: Links to CBSA/CBP documentation
- **Quantity Limits**: Specific amounts and restrictions

### UI/UX Features
- **Responsive design** with mobile-first approach
- **Visual status indicators** (allowed/restricted/prohibited)
- **Touch-friendly** interactions for mobile
- **Loading states** and error handling

## 📊 Data Categories

- 🍎 **Fruits & Vegetables** - Fresh produce and agricultural items
- 🥩 **Meat & Poultry** - Fresh and processed meat products
- 🐟 **Fish & Seafood** - Fresh and processed seafood
- 🥜 **Nuts & Seeds** - Tree nuts, peanuts, and seed products
- 🥛 **Dairy & Eggs** - Milk products, cheese, and eggs
- 🥫 **Processed Food** - Packaged and canned items
- 🍷 **Alcohol** - Beer, wine, and spirits
- 🚬 **Tobacco** - Cigarettes and tobacco products
- 📱 **Electronics** - Personal electronic devices
- 💊 **Medications** - Prescription and OTC medications

## ⚠️ Important Disclaimer

This information is for guidance only and may not reflect the most current regulations. Always verify current requirements with official border authorities before traveling:

- **CBSA (Canada)**: https://www.cbsa-asfc.gc.ca/
- **CBP (United States)**: https://www.cbp.gov/

Border rules can change frequently and may vary based on specific circumstances.

## 🧪 Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

Test coverage includes:
- Component rendering and interactions
- Search algorithm accuracy
- Data validation and integrity
- Responsive design behavior

## 🚀 Deployment Options

### Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel --prod
```

### AWS Amplify
1. Connect your GitHub repository
2. Amplify auto-detects Next.js configuration
3. Deploy with automatic CI/CD

### Docker + AWS ECS/Fargate
```bash
# Build and push to ECR
docker build -t cross-border-checker .
docker tag cross-border-checker:latest YOUR_ECR_URI
docker push YOUR_ECR_URI
```

### Netlify
```bash
npm run build
# Deploy the .next folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Ensure mobile responsiveness
- Update data sources with official links
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CBSA** and **CBP** for providing official border crossing regulations
- **Next.js** team for the excellent React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Kiro IDE** for development workflow and specifications

## 📞 Support

If you have questions or need help:

1. Check the [Issues](https://github.com/Prakash-Sundaresan/cross-border-item-checker/issues) page
2. Create a new issue with detailed information
3. For urgent border crossing questions, contact official authorities directly

---

**Built with ❤️ for travelers crossing the USA-Canada border**