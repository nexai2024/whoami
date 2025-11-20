import { BlockType } from '@prisma/client';

/**
 * Maps frontend block type names (lowercase) to Prisma BlockType enum values (uppercase)
 * Handles special cases where frontend and backend naming differs
 *
 * @param frontendType - Frontend block type name (e.g., 'link', 'email', 'image')
 * @returns Prisma BlockType enum value (e.g., 'LINK', 'EMAIL_CAPTURE', 'IMAGE_GALLERY')
 * @throws Error if block type is not recognized
 */
export function mapBlockType(frontendType: string): BlockType {
  if (!frontendType) {
    throw new Error('Block type is required');
  }

  // Normalize to lowercase for consistent matching (handles both 'DEEP_LINK' and 'deep_link')
  const normalizedType = frontendType.toLowerCase();

  // Handle special mappings where frontend and backend names differ
  const specialMappings: Record<string, BlockType> = {
    'email': BlockType.EMAIL_CAPTURE,
    'image': BlockType.IMAGE_GALLERY,
    'music': BlockType.MUSIC_PLAYER,
    'video': BlockType.VIDEO_EMBED,
    'booking': BlockType.BOOKING_CALENDAR,
    'tip': BlockType.TIP_JAR,
    'social_feed': BlockType.SOCIAL_FEED,
    'ama': BlockType.AMA_BLOCK,
    'gated': BlockType.GATED_CONTENT,
    'rss': BlockType.RSS_FEED,
    'contact': BlockType.CONTACT_FORM,
    'text': BlockType.TEXT_BLOCK,
    'course': BlockType.COURSE,
    'deep_link': BlockType.DEEP_LINK,
    'deeplink': BlockType.DEEP_LINK,
    'funnel': BlockType.FUNNEL,
  };

  // Check for special mappings first
  if (specialMappings[normalizedType]) {
    return specialMappings[normalizedType];
  }

  // For standard mappings, convert to uppercase
  const backendType = normalizedType.toUpperCase().replace(/-/g, '_') as BlockType;

  // Validate the type exists in BlockType enum
  if (!Object.values(BlockType).includes(backendType)) {
    throw new Error(`Unknown block type: ${frontendType} (normalized: ${normalizedType}, backend: ${backendType})`);
  }

  return backendType;
}

/**
 * Maps Prisma BlockType enum values (uppercase) back to frontend block type names (lowercase)
 * Handles reverse mapping for display and frontend usage
 *
 * @param backendType - Prisma BlockType enum value (e.g., 'LINK', 'EMAIL_CAPTURE', 'DEEP_LINK')
 * @returns Frontend block type name (e.g., 'link', 'email', 'deep_link')
 */
export function mapBlockTypeToFrontend(backendType: BlockType | string): string {
  if (!backendType) {
    return '';
  }

  // Normalize to uppercase enum value
  const normalizedType = typeof backendType === 'string' ? backendType.toUpperCase() : backendType;

  // Reverse special mappings
  const reverseMappings: Record<string, string> = {
    [BlockType.EMAIL_CAPTURE]: 'email',
    [BlockType.IMAGE_GALLERY]: 'image',
    [BlockType.MUSIC_PLAYER]: 'music',
    [BlockType.VIDEO_EMBED]: 'video',
    [BlockType.BOOKING_CALENDAR]: 'booking',
    [BlockType.TIP_JAR]: 'tip',
    [BlockType.SOCIAL_FEED]: 'social_feed',
    [BlockType.AMA_BLOCK]: 'ama',
    [BlockType.GATED_CONTENT]: 'gated',
    [BlockType.RSS_FEED]: 'rss',
    [BlockType.CONTACT_FORM]: 'contact',
    [BlockType.TEXT_BLOCK]: 'text',
    [BlockType.COURSE]: 'course',
    [BlockType.DEEP_LINK]: 'deep_link',
    [BlockType.FUNNEL]: 'funnel',
  };

  // Check for reverse mappings first
  if (reverseMappings[normalizedType as BlockType]) {
    return reverseMappings[normalizedType as BlockType];
  }

  // For standard mappings, convert to lowercase
  return normalizedType.toLowerCase().replace(/_/g, '_');
}
