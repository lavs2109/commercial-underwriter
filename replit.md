# UnderwriteAI - Commercial Real Estate Underwriting Platform

## Overview

UnderwriteAI is an AI-powered Commercial Real Estate (CRE) underwriting platform that analyzes multifamily property deals in under 30 seconds. The system simulates a real estate analyst's workflow but operates 100x faster, providing comprehensive financial analysis, market data integration, and investment recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack TypeScript architecture with a clear separation between frontend, backend, and shared components:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **File Processing**: Multer for handling file uploads (T12 financials and rent rolls)
- **API Design**: RESTful API with structured error handling
- **Development**: Hot reloading with Vite middleware integration

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless driver
- **Fallback**: In-memory storage implementation for development/testing

## Key Components

### 1. Property Analysis Engine
- **File Processing Service**: OCR simulation for T12 and rent roll document extraction
- **Underwriting Engine**: Calculates key financial metrics (Cash-on-Cash Return, Cap Rate, DSCR)
- **Market Data Service**: Simulates integration with CoStar, Zillow, and NeighborhoodScout APIs
- **Export Service**: Generates Excel models, PDF summaries, and Letters of Intent

### 2. User Interface Components
- **Dashboard**: Overview of analyzed deals and key statistics
- **Analysis Workflow**: Multi-step process for property input, file upload, and criteria setting
- **Results Display**: Comprehensive presentation of analysis results with pass/fail indicators
- **Form Components**: Property details, buy box criteria, and file upload interfaces

### 3. Data Models
- **Properties**: Basic property information (address, type, units, year built)
- **Deals**: Analysis results and financial calculations
- **Buy Box Criteria**: User-defined investment parameters
- **Document Uploads**: File metadata and extracted data storage
- **Market Comparables**: External market data integration

## Data Flow

1. **Property Creation**: User inputs property details and creates initial deal record
2. **Document Upload**: T12 and rent roll files are processed via simulated OCR
3. **Criteria Setting**: User defines investment parameters (min returns, cap rates, etc.)
4. **Analysis Execution**: Underwriting engine calculates financial metrics and risk assessment
5. **Market Data Integration**: External APIs provide comparative market analysis
6. **Results Generation**: Pass/fail evaluation against buy box criteria with recommendations
7. **Export Options**: Generate professional reports and investment documents

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database (configurable via DATABASE_URL)
- **Drizzle ORM**: Type-safe database queries and schema management
- **Neon Database**: Serverless PostgreSQL provider

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Build tool with HMR and development server
- **ESLint/Prettier**: Code quality and formatting (implied)

### Future Integrations (Currently Simulated)
- **CoStar API**: Commercial real estate data and comparables
- **Zillow API**: Residential market trends and valuations
- **NeighborhoodScout API**: Demographics, crime, and school ratings
- **OCR Services**: Tesseract.js or cloud-based document processing

## Deployment Strategy

### Development Environment
- Local development with Vite dev server
- Hot module replacement for rapid iteration
- In-memory storage fallback for testing without database

### Production Build
- **Frontend**: Vite builds React app to static assets
- **Backend**: ESBuild bundles Node.js server for production
- **Database**: PostgreSQL connection via environment variables
- **File Uploads**: Memory storage (production would use cloud storage)

### Environment Configuration
- `NODE_ENV`: Development/production mode switching
- `DATABASE_URL`: PostgreSQL connection string
- `REPL_ID`: Replit-specific development features

The application is designed to be deployed on platforms like Replit, with the ability to scale to cloud providers like Vercel, Railway, or AWS for production use.

## Recent Changes

### January 20, 2025 - Authentication System Implementation
- **Authentication**: Added Replit OpenID Connect authentication system with login/logout functionality
- **Landing Page**: Created professional landing page for non-authenticated users with feature overview
- **Protected Routes**: Implemented authentication guards requiring login to access dashboard and analysis features
- **Navigation Fix**: Fixed bug in NewAnalysis component where users weren't automatically proceeding to document upload step
- **User Profile**: Removed hardcoded "John Senior Underwriter" references and replaced with generic user profile with logout option
- **Database Setup**: Added PostgreSQL database with sessions and users tables for authentication support
- **Schema Updates**: Extended data model to support user management and session storage