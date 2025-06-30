# Guitar Registry Web App - Claude Code Session History

## Project Overview
**Goal**: Create a web app for visualizing data in a PostgreSQL database containing guitar registry information.

**Tech Stack**:
- Next.js 14+ with App Router & TypeScript
- PostgreSQL with Prisma ORM
- Tailwind CSS + shadcn/ui components
- NextAuth.js for authentication

## Database Schema
The PostgreSQL database contains:
- `manufacturers` - Guitar companies (Fender, Gibson, etc.)
- `product_lines` - Guitar series (Stratocaster, Les Paul, etc.)
- `models` - Specific guitar models by year
- `individual_guitars` - Individual instruments with serial numbers
- `specifications` - Technical specs for models/guitars
- `finishes` - Color and finish options
- `notable_associations` - Famous players/owners
- `data_sources` & `citations` - References
- `market_valuations` - Price/value tracking
- `users` & `contributions` - User accounts and submissions

## Completed Phases

### Phase 1: Project Setup & Core Infrastructure ✅
- [x] Initialize Next.js project with TypeScript
- [x] Set up Prisma with PostgreSQL connection
- [x] Configure Tailwind CSS and shadcn/ui
- [x] Implement basic authentication system (NextAuth.js)
- [x] Create database seed scripts
- [x] Database introspection (schema matches existing DB)

### Phase 2: Core Entity Views ✅
- [x] Create navigation layout (sidebar + header)
- [x] Create dashboard with statistics and recent items
- [x] Create manufacturers list page with filtering
- [x] Create manufacturer detail page with related data
- [x] Responsive design with modern UI

## Current Status

### Application Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout with sidebar/header
│   ├── page.tsx                # Dashboard with stats
│   ├── manufacturers/
│   │   ├── page.tsx            # Manufacturers list
│   │   └── [id]/page.tsx       # Manufacturer detail
│   └── api/auth/               # NextAuth.js configuration
├── components/
│   ├── layout/                 # Sidebar & Header components
│   ├── providers/              # AuthProvider
│   └── ui/                     # shadcn/ui components
└── lib/
    ├── prisma.ts               # Database client
    └── utils.ts                # Utility functions
```

### Database Connection
- **Environment**: `.env.local` with your PostgreSQL credentials
- **Status**: Connected and working
- **Prisma Client**: Generated and functional

### Working Features
1. **Dashboard**: Shows database statistics and recent entries
2. **Manufacturers List**: Grid view with status badges, country info
3. **Manufacturer Detail**: Complete info with product lines and models
4. **Navigation**: Responsive sidebar with clean routing
5. **Authentication**: NextAuth.js configured (ready for login)

### Current URLs (if running)
- Dashboard: http://localhost:3000
- Manufacturers: http://localhost:3000/manufacturers
- Manufacturer Detail: http://localhost:3000/manufacturers/[id]

## Next Steps - Phase 3: Relational Navigation

### Pending Implementation
- [ ] Models catalog page with advanced filtering
- [ ] Individual guitars registry page
- [ ] Product lines browsing
- [ ] Search functionality across entities
- [ ] Click-through foreign key relationships
- [ ] Advanced filtering and sorting

### Key Commands
```bash
# Start development
npm run dev

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed sample data

# Build & lint
npm run build
npm run lint
```

## Technical Implementation Notes

### Database Integration
- Uses Prisma for type-safe database queries
- All pages use server-side rendering with direct DB queries
- Optimized queries with proper includes and counts

### UI/UX Design
- Modern card-based layout
- Status badges with color coding
- Hover effects and smooth transitions
- Responsive grid layouts
- Clean typography with proper hierarchy

### Navigation Patterns
- Breadcrumb navigation for deep pages
- Sidebar with contextual active states
- Quick links from dashboard stats
- Related entity navigation (manufacturer → models)

### Component Architecture
- Reusable UI components from shadcn/ui
- Consistent styling with Tailwind CSS utilities
- Proper TypeScript types throughout
- Server components for data fetching

## Session Context
You were in the middle of implementing Phase 2 when this session ended. The core infrastructure is solid and the first entity views (manufacturers) are fully functional. The application is ready to continue with models, individual guitars, and advanced navigation features.

The database connection is working, the UI framework is established, and the patterns for list/detail pages are proven. You can proceed directly to implementing the remaining entity pages following the same patterns established with manufacturers.