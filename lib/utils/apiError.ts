import { NextResponse } from 'next/server'
import { logger } from './logger'

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string
  code?: string
  details?: any
  requestId?: string
}

/**
 * Handle API errors consistently across all routes
 * 
 * @param error - The error to handle
 * @param context - Optional context about where the error occurred
 * @returns NextResponse with appropriate error format
 */
/**
 * Generate a UUID compatible with both Node.js and Edge runtime
 */
function generateRequestId(): string {
  // Use Web Crypto API which works in both Node.js and Edge runtime
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export function handleApiError(error: unknown, context?: string): NextResponse<ErrorResponse> {
  // Generate request ID for tracking
  const requestId = generateRequestId()
  
  // Log error with context
  const errorContext = context ? ` in ${context}` : ''
  logger.error(`API Error${errorContext}:`, {
    error,
    requestId,
    context
  })
  
  // Handle known ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        requestId
      },
      { status: error.statusCode }
    )
  }
  
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any; message?: string }
    
    // Handle specific Prisma error codes
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'A record with this value already exists',
            code: 'DUPLICATE_ENTRY',
            requestId
          },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          {
            error: 'Record not found',
            code: 'NOT_FOUND',
            requestId
          },
          { status: 404 }
        )
      case 'P2003':
        return NextResponse.json(
          {
            error: 'Invalid reference to related record',
            code: 'INVALID_REFERENCE',
            requestId
          },
          { status: 400 }
        )
      default:
        logger.error('Unhandled Prisma error:', prismaError)
    }
  }
  
  // Handle validation errors (Zod)
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> }
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: zodError.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        })),
        requestId
      },
      { status: 400 }
    )
  }
  
  // Handle standard Error instances
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        error: isDevelopment ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        requestId,
        ...(isDevelopment && { stack: error.stack })
      },
      { status: 500 }
    )
  }
  
  // Handle unknown error types
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      requestId
    },
    { status: 500 }
  )
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status })
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      code,
      details,
      requestId: generateRequestId()
    },
    { status }
  )
}

