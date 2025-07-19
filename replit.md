# Durger King - Food Ordering Web App

## Overview

Durger King is a full-featured food ordering web application built as a Telegram Mini App for customers and includes a separate secure admin dashboard for restaurant management. The application uses a modern tech stack with React frontend, Express.js backend, PostgreSQL database, and Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, Vite build system, Tailwind CSS for styling
- **Backend**: Express.js server with TypeScript 
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: Zustand for cart management, TanStack Query for server state

## Key Components

### Frontend Architecture
- **React Router**: Uses wouter for lightweight routing
- **Component Library**: Built on Radix UI primitives with custom theming
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: 
  - Zustand for cart state with localStorage persistence
  - TanStack Query for API data fetching and caching
- **Theme System**: Dynamic light/dark mode with system preference detection

### Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **Authentication**: Passport.js with OpenID Connect strategy for Replit Auth
- **Session Management**: Express sessions stored in PostgreSQL
- **Storage Interface**: Abstracted storage layer for all database operations

### Database Schema
- **Users**: Stores user information from Replit Auth and Telegram
- **Categories**: Food categories with emoji icons and sorting
- **Menu Items**: Products with pricing, descriptions, and category relationships
- **Orders**: Customer orders with status tracking
- **Order Items**: Line items for each order
- **Staff**: Admin user management
- **Settings**: Application configuration
- **Sessions**: Authentication session storage

### Telegram Integration
- **WebApp API**: Integration with Telegram's WebApp interface
- **User Detection**: Automatic user identification from Telegram context
- **Haptic Feedback**: Touch feedback for mobile interactions
- **Theme Sync**: Automatic theme detection from Telegram client

## Data Flow

1. **Customer Flow**:
   - User accesses app via Telegram Mini App
   - Categories and menu items loaded from API
   - Cart state managed locally with Zustand
   - Orders submitted through protected API endpoints
   - Real-time status updates for order tracking

2. **Admin Flow**:
   - Authentication required via Replit Auth
   - Admin role verification for protected routes
   - CRUD operations for menu management
   - Order status updates and user management
   - Analytics and reporting dashboard

3. **Authentication Flow**:
   - OpenID Connect with Replit as identity provider
   - Session persistence in PostgreSQL
   - Role-based access control for admin features
   - Automatic user creation and profile updates

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, TypeScript support
- **Backend**: Express.js, Node.js runtime
- **Database**: PostgreSQL via Neon serverless, Drizzle ORM
- **Authentication**: Passport.js, OpenID Client, express-session

### UI and Styling
- **Component Library**: Radix UI primitives (30+ components)
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React icon library
- **Animations**: Class Variance Authority for component variants

### State Management and Data
- **Client State**: Zustand with persistence middleware
- **Server State**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns utility library

### Development Tools
- **Build System**: Vite with React plugin
- **Type Safety**: TypeScript, Zod schema validation
- **Code Quality**: ESLint configuration
- **Development**: Replit-specific plugins and error handling

## Deployment Strategy

The application is designed for deployment on Replit with the following considerations:

1. **Environment Configuration**:
   - DATABASE_URL for PostgreSQL connection
   - SESSION_SECRET for session encryption
   - REPLIT_DOMAINS for auth configuration
   - NODE_ENV for environment detection

2. **Build Process**:
   - Vite builds the React frontend to `dist/public`
   - esbuild compiles the Express server to `dist/index.js`
   - Database migrations handled via Drizzle Kit

3. **Production Setup**:
   - Static file serving for the built React app
   - Express server handles API routes and authentication
   - PostgreSQL database with connection pooling
   - Session storage in database for scalability

4. **Development Workflow**:
   - Hot reload for frontend development
   - TypeScript compilation and type checking
   - Database schema synchronization
   - Integrated development server with Vite middleware

The architecture prioritizes type safety, developer experience, and scalability while maintaining simplicity for a food ordering application that works seamlessly as both a Telegram Mini App and a standalone web application.