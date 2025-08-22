# Electric Guitar Registry

**The Lore Of The Strings**

A comprehensive digital registry for electric guitars, featuring detailed cataloging of manufacturers, models, individual instruments, and their historical significance. Built with modern web technologies to preserve and share the rich history of electric guitars.

## Features

### Core Registry Functionality
- **Manufacturers Directory**: Browse guitar manufacturers by country, founding year, and status
- **Product Lines**: Organized catalog of manufacturer product lines and series
- **Model Database**: Detailed model specifications, production years, and market valuations
- **Individual Guitars**: Registry of notable instruments with serial numbers, provenance, and historical associations
- **Market Valuations**: Historical pricing data and market trends
- **Specifications Database**: Comprehensive technical specifications for models and individual instruments

### Advanced Features
- **Notable Associations**: Track historical connections between guitars and notable musicians/events
- **Expert Reviews**: Professional reviews and assessments linked to multiple models
- **Attestations System**: Verification and credibility system for historical claims (in development)
- **Image Management**: Comprehensive image storage with metadata and attribution
- **Search & Discovery**: Advanced search capabilities across all registry entities

### User Interface
- **Responsive Design**: Optimized for desktop and mobile devices
- **Professional Aesthetics**: Custom color scheme and typography designed for readability
- **Intuitive Navigation**: Easy browsing through manufacturers → product lines → models → individual guitars
- **Dashboard Analytics**: Statistics and insights about registry content

## Architecture Overview

### Frontend Stack
- **Next.js 15.3.4** - React framework with App Router
- **React 19** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components

### Backend & Database
- **Prisma ORM** - Type-safe database client and query builder
- **PostgreSQL** - Primary database with full-text search capabilities
- **Server Actions** - Next.js server-side data mutations
- **Server Components** - Optimized server-side rendering

### Key Design Decisions
- **Database-First Architecture**: PostgreSQL schema drives the application structure
- **Server Components**: Leverages Next.js App Router for optimal performance
- **Component Library**: Radix UI for accessibility and customization
- **Type Safety**: Full TypeScript coverage from database to UI

## Getting Started

### Prerequisites
- Node.js 18.x or later
- PostgreSQL 14.x or later
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd guitar-registry-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/guitar_registry"
   ```

4. **Database Setup**
   ```bash
   # Pull the existing PostgreSQL schema and generate Prisma client
   npx prisma db pull
   npx prisma generate
   
   # Optional: Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

## Database Management

### Prisma Schema Updates

After updating the PostgreSQL schema, regenerate Prisma models:

```bash
npx prisma db pull
npx prisma generate
```

### Database Operations
```bash
# View your data
npx prisma studio

# Reset database (destructive)
npx prisma db push --force-reset

# Deploy migrations
npx prisma migrate deploy
```

## Development Guidelines

### Implementation Steps for Coding Agents

1. **Run SQL schema updates** on your PostgreSQL database
2. **Execute `npx prisma db pull && npx prisma generate`** to update Prisma models
3. **Create server actions** in `/src/lib/actions/` with many-to-many support
4. **Create data fetching functions** in `/src/lib/data/` with proper joins
5. **Build React components** with model selection UI
6. **Update model and guitar detail pages** to include new sections
7. **Add mock data** with many-to-many associations
8. **Test the simulation flows** (archival, attestation, verification, model selection)

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── manufacturers/      # Manufacturer pages
│   ├── product-lines/      # Product line pages
│   ├── models/             # Model pages
│   ├── guitars/            # Individual guitar pages
│   └── attestation-demo/   # Attestation features
├── components/             # React components
│   ├── ui/                 # Base UI components
│   ├── layout/             # Layout components
│   ├── reviews/            # Review components
│   └── attestations/       # Attestation components
├── lib/                    # Utilities and configurations
│   ├── actions/            # Server actions
│   ├── data/               # Data fetching functions
│   └── utils.ts            # Helper utilities
└── hooks/                  # Custom React hooks
```

## Contributing

1. Follow the TypeScript and ESLint configurations
2. Use Radix UI components for consistent design
3. Implement server actions for data mutations
4. Add proper error handling and loading states
5. Test database operations thoroughly
6. Document any schema changes

## Technology Stack

- **Framework**: Next.js 15.3.4
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Lucide React
- **Fonts**: Inter (body), Special Elite (brand), JetBrains Mono (monospace)

## License

This project is licensed under the terms specified in the LICENSE file.

---

Built with passion for preserving electric guitar history and heritage.
