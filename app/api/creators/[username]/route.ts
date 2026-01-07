import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import prisma from '@/lib/prisma';

/**
 * GET /api/creators/[username]
 * Fetch creator profile data with social links, products, courses, and lead magnets
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    logger.info('Fetching creator data', { username });

    // Fetch creator profile with social links
    const profile = await prisma.profile.findUnique({
      where: { username },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Build social links array
    type SocialLink = {
      platform: string;
      url: string;
      icon: React.ComponentType;
      color: string;
    };
    const socialLinks: SocialLink[] = [];

    // Import icons dynamically
    const {
      FiTwitter,
      FiInstagram,
      FiYoutube,
      FiLinkedin,
      FiFacebook,
      FiTwitch,
      FiMessageSquare,
      FiGlobe
    } = await import('react-icons/fi');

    type PlatformConfig = {
      icon: React.ComponentType;
      color: string;
      pattern: RegExp;
    };
    const SOCIAL_PLATFORM_CONFIG: Record<string, PlatformConfig> = {
      twitter: { icon: FiTwitter, color: 'bg-black hover:bg-gray-800', pattern: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/@?([^\/]+)/ },
      instagram: { icon: FiInstagram, color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500', pattern: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/]+)/ },
      youtube: { icon: FiYoutube, color: 'bg-red-600 hover:bg-red-700', pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:channel\/|c\/|user\/|@)?([^\/]+)/ },
      tiktok: { icon: FiGlobe, color: 'bg-black hover:bg-gray-800', pattern: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([^\/]+)/ },
      linkedin: { icon: FiLinkedin, color: 'bg-blue-600 hover:bg-blue-700', pattern: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^\/]+)/ },
      facebook: { icon: FiFacebook, color: 'bg-blue-500 hover:bg-blue-600', pattern: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^\/]+)/ },
      twitch: { icon: FiTwitch, color: 'bg-purple-600 hover:bg-purple-700', pattern: /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([^\/]+)/ },
      discord: { icon: FiMessageSquare, color: 'bg-indigo-600 hover:bg-indigo-700', pattern: /(?:https?:\/\/)?(?:www\.)?discord\.(?:gg|com)\/([^\/]+)/ },
    };

    // Map social link fields to platforms
    const socialFieldMap: Record<string, string> = {
      socialLinkTwitter: 'twitter',
      socialLinkInstagram: 'instagram',
      socialLinkYouTube: 'youtube',
      socialLinkTikTok: 'tiktok',
      socialLinkLinkedIn: 'linkedin',
      socialLinkFacebook: 'facebook',
      socialLinkTwitch: 'twitch',
      socialLinkDiscord: 'discord',
      socialLinkWebsite: 'website',
      socialLinkLinktree: 'linktree',
      socialLinkOther: 'other',
    };

    // Build social links from profile
    // Type-safe access to profile social link fields
    type ProfileWithSocialLinks = typeof profile & {
      socialLinkTwitter?: string | null;
      socialLinkInstagram?: string | null;
      socialLinkYouTube?: string | null;
      socialLinkTikTok?: string | null;
      socialLinkLinkedIn?: string | null;
      socialLinkFacebook?: string | null;
      socialLinkTwitch?: string | null;
      socialLinkDiscord?: string | null;
      socialLinkWebsite?: string | null;
      socialLinkLinktree?: string | null;
      socialLinkOther?: string | null;
    };
    
    const profileWithSocial = profile as ProfileWithSocialLinks;
    for (const [field, platform] of Object.entries(socialFieldMap)) {
      const url = profileWithSocial[field as keyof ProfileWithSocialLinks] as string | null | undefined;
      if (url) {
        const config = SOCIAL_PLATFORM_CONFIG[platform];
        socialLinks.push({
          platform,
          url,
          icon: config?.icon || FiGlobe,
          color: config?.color || 'bg-gray-600 hover:bg-gray-700',
        });
      }
    }

    // Fetch user's products
    const products = await prisma.product.findMany({
      where: {
        userId: profile.userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Fetch user's courses
    const courses = await prisma.course.findMany({
      where: {
        userId: profile.userId,
        status: 'PUBLISHED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Fetch user's lead magnets
    const leadMagnets = await prisma.leadMagnet.findMany({
      where: {
        userId: profile.userId,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Build creator response object
    const creator = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatar: profile.avatar,
      location: profile.location,
      isCoach: profile.isCoach,
      coachSlug: profile.coachSlug,
      bookingEnabled: profile.bookingEnabled,
      productsEnabled: profile.productsEnabled,
    };

    return NextResponse.json({
      success: true,
      creator,
      socialLinks,
      products,
      courses,
      leadMagnets,
    });

  } catch (error) {
    logger.error('Error fetching creator data:', error);

    let message = 'Failed to fetch creator data';
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      message = error.message;
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
