/* // Use regular Prisma client for Node.js runtime (API routes)
// For Edge runtime (middleware), Prisma will work but with some limitations
// If you need full Edge support, consider using Prisma Data Proxy or Accelerate
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Prisma 7 requires either datasource URL or adapter/accelerateUrl
// Using direct database connection (most reliable and common approach)
const createPrismaClient = () => {
  // CRITICAL: Read DATABASE_URL when this function is called, not when module loads
  // During Next.js build, modules may be evaluated before .env files are processed
  // This lazy initialization ensures env vars are available before Prisma instantiation
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    // Provide helpful error message with troubleshooting steps
    const isDevelopment = process.env.NODE_ENV !== 'production'
    const isEdgeRuntime = typeof EdgeRuntime !== 'undefined' || process.env.NEXT_RUNTIME === 'edge'
    
    // Build error message - avoid Node.js APIs in Edge Runtime
    let cwdInfo = ''
    if (!isEdgeRuntime && typeof process.cwd === 'function') {
      try {
        cwdInfo = `\n4. Current working directory: ${process.cwd()}`
      } catch (e) {
        // Ignore if cwd() fails
      }
    }
    
    const errorMessage = isDevelopment
      ? `DATABASE_URL environment variable is required but not found.\n\n` +
        `Troubleshooting steps:\n` +
        `1. Ensure a .env or .env.local file exists in the project root\n` +
        `2. Add DATABASE_URL=your_connection_string to the .env file\n` +
        `3. Restart your dev server (Next.js loads .env files on startup)${cwdInfo}\n` +
        `${cwdInfo ? '5' : '4'}. Check that you're running from the project root directory`
      : 'DATABASE_URL environment variable is required. Please set it in your environment variables.'
    
    throw new Error(errorMessage)
  }

  // Use direct database connection
  // If you have Prisma Accelerate subscription, uncomment the accelerate section below
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
  
  // OPTIONAL: If you have Prisma Accelerate subscription, use this instead:
  // const accelerateUrl = process.env.PRISMA_ACCELERATE_URL
  // if (accelerateUrl && accelerateUrl.startsWith('prisma://')) {
  //   const { withAccelerate } = await import('@prisma/extension-accelerate')
  //   return new PrismaClient({
  //     accelerateUrl: accelerateUrl
  //   }).$extends(withAccelerate())
  // } else {
  //   return new PrismaClient({
  //     datasources: {
  //       db: {
  //         url: databaseUrl
  //       }
  //     }
  //   })
  // }
}

// Lazy initialization: Only create Prisma client when actually accessed
// This prevents initialization during build when env vars might not be loaded yet
function getPrismaClient() {
  // Reuse existing client if already created (singleton pattern)
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Create client on first access - this ensures DATABASE_URL is loaded
  // from environment before Prisma tries to use it
  globalForPrisma.prisma = createPrismaClient()
  return globalForPrisma.prisma
}

// IMPORTANT: Defer Prisma initialization until actually needed
// During Next.js build, modules may be evaluated before .env files are loaded
// Using a Proxy to intercept property access and initialize on first use
// This ensures initialization is deferred until runtime, not during module evaluation
// TypeScript types are provided in lib/prisma.d.ts
const lazyPrisma = new Proxy({}, {
  get(target, prop) {
    const client = getPrismaClient()
    const value = client[prop]
    // If it's a function, bind it to the client to maintain 'this' context
    return typeof value === 'function' ? value.bind(client) : value
  },
  // Support for 'in' operator and Object.keys()
  ownKeys(target) {
    return Reflect.ownKeys(getPrismaClient())
  },
  // Support for property descriptors
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(getPrismaClient(), prop)
  },
  // Support for 'in' operator
  has(target, prop) {
    return prop in getPrismaClient()
  }
})

export default lazyPrisma
 */
//import 'dotenv/config'
// Use @prisma/client which works reliably with Next.js
// Prisma generates the client to both @prisma/client and the custom output path
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Create Prisma client using adapter (required for Prisma 7)
// Prisma 7 requires either adapter or accelerateUrl - datasources is not supported
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    const isDevelopment = process.env.NODE_ENV !== 'production'
    const errorMessage = isDevelopment
      ? `DATABASE_URL environment variable is required but not found.\n\n` +
        `Troubleshooting steps:\n` +
        `1. Ensure a .env or .env.local file exists in the project root\n` +
        `2. Add DATABASE_URL=your_connection_string to the .env file\n` +
        `3. Restart your dev server (Next.js loads .env files on startup)\n` +
        `4. Check that you're running from the project root directory`
      : 'DATABASE_URL environment variable is required. Please set it in your environment variables.'
    
    throw new Error(errorMessage)
  }

  // Prisma 7 requires either adapter or accelerateUrl
  // Check runtime environment first - Edge runtime can't use Node.js adapters
  const isEdge = typeof EdgeRuntime !== 'undefined' || process.env.NEXT_RUNTIME === 'edge'
  
  // For Edge runtime, Prisma 7 requires accelerateUrl (prisma://...)
  // Cannot use datasources or adapters in Edge runtime
  if (isEdge) {
    const accelerateUrl = process.env.PRISMA_ACCELERATE_URL
    if (accelerateUrl && accelerateUrl.startsWith('prisma://')) {
      return new PrismaClient({
        accelerateUrl: accelerateUrl,
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error']
      })
    } else {
      // Edge runtime requires Prisma Accelerate URL
      // If not available, throw helpful error message
      throw new Error(
        'Prisma 7 requires PRISMA_ACCELERATE_URL for Edge runtime (middleware). ' +
        'Set PRISMA_ACCELERATE_URL environment variable with your Prisma Accelerate connection string (prisma://...). ' +
        'Alternatively, consider moving database queries from middleware to API routes.'
      )
    }
  }
  
  // Node.js runtime - use adapter for better performance
  // Neon is PostgreSQL-compatible, so use PrismaPg adapter
  let adapter = null
  
  try {
    const { PrismaPg } = require("@prisma/adapter-pg")
    adapter = new PrismaPg({ connectionString })
  } catch (error) {
    // If adapter fails to load, fall back to direct connection
    console.warn('Failed to load Prisma adapter:', error.message)
  }

  // Create client with adapter (required for Prisma 7 in Node.js)
  const client = new PrismaClient({
    adapter: adapter || undefined, // Use adapter if available, undefined otherwise
    // Fallback to direct connection if no adapter
    ...(adapter ? {} : {
      datasources: {
        db: {
          url: connectionString
        }
      }
    }),
    // Add logging in development to debug connection issues
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
  })

  return client
}

// Lazy initialization: Only create Prisma client when actually accessed
function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }
  globalForPrisma.prisma = createPrismaClient()
  return globalForPrisma.prisma
}

// Use Proxy to defer initialization until first access
// This prevents adapter from being loaded during module evaluation in Edge runtime
const lazyPrisma = new Proxy({}, {
  get(target, prop) {
    const client = getPrismaClient()
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
  ownKeys(target) {
    return Reflect.ownKeys(getPrismaClient())
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(getPrismaClient(), prop)
  },
  has(target, prop) {
    return prop in getPrismaClient()
  }
})

export default lazyPrisma