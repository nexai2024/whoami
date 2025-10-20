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
  };

  // Check for special mappings first
  if (specialMappings[frontendType]) {
    return specialMappings[frontendType];
  }

  // For standard mappings, convert to uppercase
  const backendType = frontendType.toUpperCase() as BlockType;

  // Validate the type exists in BlockType enum
  if (!Object.values(BlockType).includes(backendType)) {
    throw new Error(`Unknown block type: ${frontendType}`);
  }

  return backendType;
}
