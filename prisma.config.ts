import 'dotenv/config'
import { defineConfig } from '@prisma/config'

// Ensure DATABASE_URL includes search_path parameter for PostgreSQL
// PostgreSQL requires a schema to be selected before creating tables
// The default schema is 'public', so we ensure it's set
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  // Check if search_path or schema is already specified
  const hasSchemaParam = url.includes('search_path=') || url.includes('schema=')
  
  if (!hasSchemaParam) {
    // Add search_path=public to ensure PostgreSQL knows which schema to use
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}search_path=public`
  }
  
  return url
}

export default defineConfig({
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: getDatabaseUrl(),
  },
})
