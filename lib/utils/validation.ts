import { z } from 'zod'

/**
 * Common validation schemas for reuse across API routes
 */

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().optional()
})

// Page creation/update schema
export const pageSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  isActive: z.boolean().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(255).optional()
})

// Product schema
export const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive(),
  currency: z.string().length(3).default('USD'),
  type: z.enum(['PRODUCT', 'PACKAGE']).default('PRODUCT'),
  packageProducts: z.array(z.string()).optional(),
  fileUrl: z.string().url().optional(),
  downloadLimit: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().default(true)
})

// Course schema
export const courseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).default('BEGINNER'),
  estimatedTime: z.coerce.number().int().positive().optional(),
  language: z.string().length(2).default('en'),
  coverImageUrl: z.string().url().optional(),
  promoVideoUrl: z.string().url().optional(),
  accessType: z.enum(['FREE', 'PAID', 'EMAIL_GATE', 'MEMBERSHIP']).default('FREE'),
  price: z.coerce.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  isLeadMagnet: z.boolean().default(false),
  requiresEmail: z.boolean().default(false)
})

// Block schema
export const blockSchema = z.object({
  type: z.string(),
  position: z.coerce.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  borderRadius: z.coerce.number().int().nonnegative().default(8),
  data: z.record(z.string(), z.any()).optional()
})

// Lead/Email subscriber schema
export const leadSchema = z.object({
  email: z.string().email(),
  name: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  pipelineStage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).optional()
})

// Campaign schema
export const campaignSchema = z.object({
  name: z.string().min(1).max(200),
  goal: z.string().max(500).optional(),
  targetAudience: z.string().max(500).optional(),
  productId: z.string().optional(),
  blockId: z.string().optional(),
  customContent: z.record(z.string(), z.any()).optional()
})

// Funnel schema
export const funnelSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  goalType: z.enum(['LEAD_CAPTURE', 'PRODUCT_SALE', 'COURSE_ENROLLMENT', 'BOOKING', 'CUSTOM']),
  goalValue: z.string().optional(),
  conversionGoal: z.string().min(1),
  trackingEnabled: z.boolean().default(true),
  exitRedirect: z.string().url().optional()
})

// Booking schema
export const bookingSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().max(200).optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative().optional(),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).optional()
})

// Lead magnet schema
export const leadMagnetSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(['PDF', 'EBOOK', 'TEMPLATE', 'CHECKLIST', 'WORKBOOK', 'VIDEO', 'VIDEO_COURSE', 'AUDIO', 'SPREADSHEET', 'ZIP_BUNDLE', 'CUSTOM']),
  headline: z.string().min(1).max(200),
  subheadline: z.string().max(500).optional(),
  benefits: z.array(z.string()).optional(),
  deliveryMethod: z.enum(['INSTANT_DOWNLOAD', 'EMAIL_DELIVERY', 'GATED_ACCESS', 'HYBRID', 'DRIP_COURSE']),
  deliveryDelay: z.coerce.number().int().nonnegative().default(0),
  dripEnabled: z.boolean().default(false)
})

/**
 * Validate request body with a Zod schema
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    // If JSON parsing fails, return a validation error
    // Create a simple validation schema to generate a proper ZodError
    const issues: z.ZodIssue[] = [{
      code: 'custom',
      path: [],
      message: 'Invalid JSON in request body'
    }]
    return { success: false, error: new z.ZodError(issues) }
  }
}

/**
 * Validate query parameters with a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const params = Object.fromEntries(searchParams.entries())
  const result = schema.safeParse(params)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, error: result.error }
  }
}

