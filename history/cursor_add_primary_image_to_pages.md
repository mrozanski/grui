# Add primary image to model and individual pages
_Exported on 7/21/2025 at 10:58:06 MDT from Cursor (1.2.4)_

---

**User**

Models and individual instruments now have images coming from the database, add the main image which should have is_primary as true in the DB, to both individual and model pages. The placement is where the <Image> placeholder currently is in the JSX

---

**Cursor**

I'll help you add the main image from the database to both individual guitar and model pages. First, let me examine the current database schema to understand the image structure, then update the queries and components.


Now let me check the model detail page to see its current structure:


Now let me read the model detail page to see the current Image component:


Now I need to update both the guitar detail and model detail pages to include the primary image from the database. Let me start with the guitar detail page:


```typescriptreact
  const guitar = await prisma.individual_guitars.findUnique({
    where: { id },
    include: {
      models: {
        include: {
          manufacturers: true,
          product_lines: true,
        }
      },
      specifications: {
        orderBy: { id: 'asc' }
      },
      finishes: {
        orderBy: { finish_name: 'asc' }
      },
      notable_associations: {
        orderBy: { period_start: 'desc' },
        take: 10
      },
      market_valuations: {
        orderBy: { valuation_date: 'desc' },
        take: 5
      },
      _count: {
        select: {
          notable_associations: true,
          market_valuations: true,
          specifications: true,
          finishes: true,
        },
      },
    },
  })

->

  const guitar = await prisma.individual_guitars.findUnique({
    where: { id },
    include: {
      models: {
        include: {
          manufacturers: true,
          product_lines: true,
        }
      },
      specifications: {
        orderBy: { id: 'asc' }
      },
      finishes: {
        orderBy: { finish_name: 'asc' }
      },
      notable_associations: {
        orderBy: { period_start: 'desc' },
        take: 10
      },
      market_valuations: {
        orderBy: { valuation_date: 'desc' },
        take: 5
      },
      _count: {
        select: {
          notable_associations: true,
          market_valuations: true,
          specifications: true,
          finishes: true,
        },
      },
    },
  })

  // Get the primary image for this guitar
  const primaryImage = await prisma.images.findFirst({
    where: {
      entity_type: 'individual_guitars',
      entity_id: id,
      is_primary: true,
    },
    orderBy: { display_order: 'asc' }
  })
```

Now I need to update the Image component to use the primary image:


```typescriptreact
        <Image
          src="/images/guitars/guitar-default.jpg"
          alt="Guitar placeholder"
          width={300}
          height={200}
          className="rounded-lg"
        />

->

        <Image
          src={primaryImage?.medium_url || primaryImage?.original_url || "/images/guitars/guitar-default.jpg"}
          alt={primaryImage?.caption || "Guitar image"}
          width={300}
          height={200}
          className="rounded-lg"
        />
```

Now let me update the model detail page:


```typescriptreact
  const model = await prisma.models.findUnique({
    where: { id },
    include: {
      manufacturers: true,
      product_lines: true,
      specifications: {
        orderBy: { id: 'asc' }
      },
      finishes: {
        orderBy: { finish_name: 'asc' }
      },
      individual_guitars: {
        orderBy: [{ production_date: 'desc' }],
        take: 10,
        include: {
          _count: {
            select: { notable_associations: true },
          },
        },
      },
      _count: {
        select: {
          individual_guitars: true,
          specifications: true,
          finishes: true,
          market_valuations: true,
        },
      },
    },
  })

->

  const model = await prisma.models.findUnique({
    where: { id },
    include: {
      manufacturers: true,
      product_lines: true,
      specifications: {
        orderBy: { id: 'asc' }
      },
      finishes: {
        orderBy: { finish_name: 'asc' }
      },
      individual_guitars: {
        orderBy: [{ production_date: 'desc' }],
        take: 10,
        include: {
          _count: {
            select: { notable_associations: true },
          },
        },
      },
      _count: {
        select: {
          individual_guitars: true,
          specifications: true,
          finishes: true,
          market_valuations: true,
        },
      },
    },
  })

  // Get the primary image for this model
  const primaryImage = await prisma.images.findFirst({
    where: {
      entity_type: 'models',
      entity_id: id,
      is_primary: true,
    },
    orderBy: { display_order: 'asc' }
  })
```

Now I need to update the Image component in the model detail page:


```typescriptreact
        <Image
          src="/images/guitars/guitar-default.jpg"
          alt="Guitar model placeholder"
          width={400}
          height={300}
        />

->

        <Image
          src={primaryImage?.medium_url || primaryImage?.original_url || "/images/guitars/guitar-default.jpg"}
          alt={primaryImage?.caption || "Guitar model image"}
          width={400}
          height={300}
        />
```

Perfect! I've successfully updated both the individual guitar detail page and the model detail page to include the primary image from the database. Here's what I've implemented:

## Changes Made:

### 1. **Guitar Detail Page** (`src/app/guitars/[id]/guitar-detail.tsx`):
- Added a query to fetch the primary image for the individual guitar from the `images` table
- Updated the Image component to use the primary image's `medium_url` or `original_url` with a fallback to the default placeholder
- The image will display the caption from the database if available

### 2. **Model Detail Page** (`src/app/models/[id]/model-detail.tsx`):
- Added a query to fetch the primary image for the model from the `images` table  
- Updated the Image component to use the primary image's `medium_url` or `original_url` with a fallback to the default placeholder
- The image will display the caption from the database if available

## Key Features:

1. **Primary Image Selection**: Both pages now query for images where `is_primary: true` to get the main image for each entity
2. **Fallback Strategy**: If no primary image exists, it falls back to the default placeholder image
3. **Image Quality**: Uses `medium_url` first for better performance, then falls back to `original_url` if medium isn't available
4. **Accessibility**: Uses the image caption from the database for the alt text when available
5. **Entity Type Filtering**: Correctly filters by `entity_type` ('individual_guitars' or 'models') and `entity_id`

The implementation follows the database schema where images are stored with:
- `entity_type`: The type of entity ('individual_guitars' or 'models')
- `entity_id`: The ID of the specific entity
- `is_primary`: Boolean flag indicating if this is the main image
- `display_order`: For ordering multiple images
- `medium_url`/`original_url`: The actual image URLs

Both pages will now display the primary image from the database when available, maintaining the same visual layout and styling as before.

---

**User**

Please debug the issue described in @primary-image-not-showing.md 

---

**Cursor**

I can see the issue! Looking at the bug report, the problem is with the `entity_type` values in the database. The database is storing:

- `entity_type = 'model'` (singular)
- `entity_type = 'individual_guitar'` (singular)

But in my code, I'm querying for:

- `entity_type = 'models'` (plural)
- `entity_type = 'individual_guitars'` (plural)

Let me fix this by updating the queries to use the correct entity type values:


```typescriptreact
  // Get the primary image for this guitar
  const primaryImage = await prisma.images.findFirst({
    where: {
      entity_type: 'individual_guitars',
      entity_id: id,
      is_primary: true,
    },
    orderBy: { display_order: 'asc' }
  })

->

  // Get the primary image for this guitar
  const primaryImage = await prisma.images.findFirst({
    where: {
      entity_type: 'individual_guitar',
      entity_id: id,
      is_primary: true,
    },
    orderBy: { display_order: 'asc' }
  })
```

```typescriptreact
  // Get the primary image for this model
  const primaryImage = await prisma.images.findFirst({
    where: {
      entity_type: 'models',
      entity_id: id,
      is_primary: true,
    },
    orderBy: { display_order: 'asc' }
  })

->

  // Get the primary image for this model
  const primaryImage = await prisma.images.findFirst({
    where: {
      entity_type: 'model',
      entity_id: id,
      is_primary: true,
    },
    orderBy: { display_order: 'asc' }
  })
```

Perfect! I've fixed the issue. The problem was that I was using the plural form of the entity types in the database queries, but the database is actually storing the singular forms:

## The Fix:

1. **Individual Guitar**: Changed `entity_type: 'individual_guitars'` to `entity_type: 'individual_guitar'`
2. **Model**: Changed `entity_type: 'models'` to `entity_type: 'model'`

## Why This Happened:

The database schema shows the table names as plural (`individual_guitars`, `models`), but the `entity_type` field in the `images` table is storing the singular form of the entity type. This is a common pattern where:
- Table names are plural (following database conventions)
- Entity type references are singular (following application logic)

Now the queries will correctly match the data in your database:
- For models: `entity_type = 'model'` ✅
- For individual guitars: `entity_type = 'individual_guitar'` ✅

The primary images should now display correctly on both the individual guitar and model detail pages!

---

**User**

Still not there. Runtime error:
Error: Invalid src prop (https://res.cloudinary.com/dh6thxkuo/image/upload/w_800,c_limit,q_auto,f_auto/guitars/individual_guitar/01982952-37dd-7ea1-aba3-1f4ecc8092e7/primary/37b1d99a4bb6efb4) on `next/image`, hostname "res.cloudinary.com" is not configured under images in your `next.config.js`
See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host

---

**Cursor**

The issue is that Next.js requires external image domains to be configured in `next.config.js` for security reasons. I need to add the Cloudinary domain to the Next.js configuration.


```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

->

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dh6thxkuo/image/upload/**',
      },
    ],
  },
};

export default nextConfig;
```

Perfect! I've added the Cloudinary domain configuration to `next.config.ts`. This will allow Next.js to load images from your Cloudinary account.

## What I Added:

The configuration includes:
- **Protocol**: `https` (secure connection)
- **Hostname**: `res.cloudinary.com` (Cloudinary's image delivery domain)
- **Pathname**: `/dh6thxkuo/image/upload/**` (your specific Cloudinary account path)

## Why This Was Needed:

Next.js requires explicit configuration for external image domains as a security measure to prevent malicious image sources. The `remotePatterns` configuration tells Next.js that images from `res.cloudinary.com` with your account path are trusted.

## Next Steps:

After this change, you'll need to restart your Next.js development server for the configuration to take effect. The primary images should now load correctly from Cloudinary!

The error should be resolved and your guitar and model images should display properly.

