import 'server-only'
//import { PrismaClient } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis

// Prisma 7 requires accelerateUrl or adapter in constructor
// Use DATABASE_URL as accelerateUrl (works with or without Prisma Accelerate)
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

  return new PrismaClient({
    accelerateUrl: databaseUrl,
  }).$extends(withAccelerate())
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
// We only create the client if DATABASE_URL is available at module load time
// Otherwise, it will be created on first actual use (runtime, not build time)

let prisma = null

// Only try to initialize if we have DATABASE_URL available right now
if (process.env.DATABASE_URL) {
  // DATABASE_URL is available - safe to initialize
  prisma = globalForPrisma.prisma || getPrismaClient()
} else if (globalForPrisma.prisma) {
  // Reuse existing client if it exists
  prisma = globalForPrisma.prisma
}
// If prisma is still null, it means DATABASE_URL wasn't available
// This is OK during build - it will be created when actually used at runtime

// Store for reuse in development (Hot Module Replacement)
if (process.env.NODE_ENV !== 'production') {
  if (prisma) {
    globalForPrisma.prisma = prisma
  }
  globalForPrisma.getPrismaClient = getPrismaClient
}

// Export: Always try to get/create the client
// If DATABASE_URL isn't available at build time, this will throw
// but that's OK - it means the .env file needs to be properly loaded
// The error message will guide the user to fix the issue
export default prisma || getPrismaClient()
