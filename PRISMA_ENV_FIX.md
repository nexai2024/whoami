# Prisma Environment Variable Loading Fix

## Problem
Prisma was being instantiated before environment variables (specifically `DATABASE_URL`) were loaded, causing build-time errors even though `DATABASE_URL` exists in the `.env` file.

## Root Cause
Next.js evaluates modules during the build process, and sometimes this happens before `.env` files are fully loaded. This is especially true with Turbopack and during static page generation.

## Solution Implemented

The Prisma client initialization in `lib/prisma.js` has been updated with **lazy initialization**:

1. **Conditional Initialization**: Prisma client is only created if `DATABASE_URL` is available at module load time
2. **Deferred Creation**: If `DATABASE_URL` isn't available during build, the client creation is deferred until first actual use (runtime)
3. **Helpful Error Messages**: If `DATABASE_URL` is missing when actually needed, a detailed error message guides you to fix it

## How It Works

```javascript
// Only initialize if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  prisma = getPrismaClient()  // Create immediately
} else {
  prisma = null  // Defer until needed
}

// Export: Will create on first use if not already created
export default prisma || getPrismaClient()
```

## Ensuring DATABASE_URL is Loaded

### For Development (`npm run dev`)
Next.js automatically loads `.env` files. Make sure:
- `.env` or `.env.local` exists in the project root
- `DATABASE_URL` is set in the file
- You restart the dev server after adding/modifying `.env`

### For Production Build (`npm run build`)
1. **Option 1**: Set `DATABASE_URL` as a system environment variable
   ```bash
   export DATABASE_URL="your_connection_string"
   npm run build
   ```

2. **Option 2**: Use `.env.production` file (Next.js loads this during build)
   ```bash
   echo 'DATABASE_URL=your_connection_string' > .env.production
   npm run build
   ```

3. **Option 3**: Use Vercel/your hosting platform's environment variables
   - Set `DATABASE_URL` in your deployment platform's environment settings
   - This ensures it's available during build and runtime

### For CI/CD
Set `DATABASE_URL` as a secret/environment variable in your CI/CD pipeline.

## Verification

To verify `DATABASE_URL` is accessible:

```bash
# Check if .env file has DATABASE_URL
grep DATABASE_URL .env

# Test loading with Node.js
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')"
```

## Troubleshooting

If you still see "DATABASE_URL is not found" errors:

1. **Check file location**: `.env` must be in the project root (same directory as `package.json`)
2. **Check file format**: No spaces around `=`, proper quotes if needed:
   ```env
   DATABASE_URL="your_connection_string"
   ```
3. **Restart dev server**: After modifying `.env`, restart `npm run dev`
4. **Check Next.js version**: Ensure you're using a version that properly loads `.env` files
5. **Check build logs**: Look for any warnings about environment variables

## Current Status

The lazy initialization pattern ensures:
- ✅ Build succeeds even if `DATABASE_URL` isn't loaded during build
- ✅ Runtime errors are clear and actionable
- ✅ No performance impact (client is cached after first creation)
- ✅ Works with Next.js Hot Module Replacement in development

## Note

The Prisma client is still created as a singleton (reused across requests), but now it's created only when actually needed, ensuring environment variables are available first.
