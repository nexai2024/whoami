import {
  AssetStatus,
  AssetType,
  CampaignStatus,
  Platform,
  Prisma,
} from '@prisma/client';

import prisma from '@/lib/prisma';
import { generateJSON } from '@/lib/services/aiService';
import { logger } from '@/lib/utils/logger';

export interface CampaignListFilters {
  status?: CampaignStatus;
}

export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
  goal: string | null;
  sourceType: 'PRODUCT' | 'BLOCK' | 'CUSTOM';
  platforms: string[];
  createdAt: string;
  product: {
    id: string;
    name: string;
  } | null;
  _count: {
    assets: number;
    scheduledPosts: number;
  };
  stats: {
    totalEngagement: number;
  };
}

export interface CampaignDetail {
  id: string;
  name: string;
  status: CampaignStatus;
  goal: string | null;
  targetAudience: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: Prisma.Decimal | null;
  } | null;
  assets: Array<{
    id: string;
    type: AssetType;
    platform: Platform | null;
    content: string;
    mediaUrl: string | null;
    status: AssetStatus;
    scheduledAt: string | null;
    publishedAt: string | null;
    performance: {
      views: number;
      clicks: number;
      conversions: number;
    };
  }>;
}

export interface GenerateCampaignConfig {
  socialPostCount: number;
  emailCount: number;
  platforms: Platform[];
  pageVariants: number;
  goal: 'LAUNCH' | 'PROMOTION' | 'ENGAGEMENT';
  targetAudience?: string;
  tone: 'PROFESSIONAL' | 'CASUAL' | 'EXCITED' | 'EDUCATIONAL';
}

export interface GenerateCampaignInput {
  userId: string;
  productId?: string;
  blockId?: string;
  customContent?: {
    title: string;
    description: string;
    imageUrl?: string;
  };
  config: GenerateCampaignConfig;
}

const CAMPAIGN_RATE_LIMIT = 5;
const CAMPAIGN_RATE_WINDOW_MS = 60 * 60 * 1000;

export class CampaignRateLimitError extends Error {
  constructor(message: string = `Rate limit exceeded. Maximum ${CAMPAIGN_RATE_LIMIT} campaigns per hour.`) {
    super(message);
    this.name = 'CampaignRateLimitError';
  }
}

export function getCampaignCacheTag(userId: string): string {
  return `campaigns:user:${userId}`;
}

export function serializeCampaignListFilters(filters?: CampaignListFilters): string {
  return JSON.stringify({
    status: filters?.status ?? null,
  });
}

async function enforceCampaignRateLimit({
  userId,
  limit = CAMPAIGN_RATE_LIMIT,
  windowMs = CAMPAIGN_RATE_WINDOW_MS,
}: {
  userId: string;
  limit?: number;
  windowMs?: number;
}): Promise<void> {
  const windowStart = new Date(Date.now() - windowMs);

  const recentCampaignCount = await prisma.campaign.count({
    where: {
      userId,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  if (recentCampaignCount >= limit) {
    throw new CampaignRateLimitError(
      `Rate limit exceeded. Maximum ${limit} campaigns per hour.`
    );
  }
}

export async function listCampaigns({
  userId,
  filters,
}: {
  userId: string;
  filters?: CampaignListFilters;
}): Promise<CampaignSummary[]> {
  const campaigns = await prisma.campaign.findMany({
    where: {
      userId,
      ...(filters?.status ? { status: filters.status } : {}),
    },
    include: {
      assets: {
        select: {
          id: true,
          status: true,
          platform: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return campaigns.map((campaign) => {
    const platforms = Array.from(
      new Set(
        campaign.assets
          .map((asset) => asset.platform)
          .filter((platform): platform is Platform => !!platform)
      )
    );

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      goal: campaign.goal,
      sourceType: campaign.productId ? 'PRODUCT' : campaign.blockId ? 'BLOCK' : 'CUSTOM',
      platforms,
      createdAt: campaign.createdAt.toISOString(),
      product: campaign.product,
      _count: {
        assets: campaign.assets.length,
        scheduledPosts: campaign.assets.filter(
          (asset) => asset.status === AssetStatus.SCHEDULED
        ).length,
      },
      stats: {
        totalEngagement: 0,
      },
    };
  });
}

export async function getCampaign({
  userId,
  campaignId,
}: {
  userId: string;
  campaignId: string;
}): Promise<CampaignDetail | null> {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      userId,
    },
    include: {
      assets: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      product: true,
    },
  });

  if (!campaign) {
    return null;
  }

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    goal: campaign.goal,
    targetAudience: campaign.targetAudience,
    createdAt: campaign.createdAt.toISOString(),
    product: campaign.product
      ? {
          id: campaign.product.id,
          name: campaign.product.name,
          price: campaign.product.price,
        }
      : null,
    assets: campaign.assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      platform: asset.platform,
      content: asset.content,
      mediaUrl: asset.mediaUrl,
      status: asset.status,
      scheduledAt: asset.scheduledAt?.toISOString() ?? null,
      publishedAt: asset.publishedAt?.toISOString() ?? null,
      performance: {
        views: asset.views,
        clicks: asset.clicks,
        conversions: asset.conversions,
      },
    })),
  };
}

export async function generateCampaign(input: GenerateCampaignInput): Promise<{
  campaignId: string;
  status: CampaignStatus;
}> {
  const { userId, productId, blockId, customContent, config } = input;

  if (!productId && !blockId && !customContent) {
    throw new Error(
      "Invalid request: expected one of 'productId', 'blockId', or 'customContent'"
    );
  }

  await enforceCampaignRateLimit({ userId });

  let sourceContent: {
    title: string;
    description: string;
    price?: Prisma.Decimal | number | null;
    currency?: string | null;
    imageUrl?: string;
  };

  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    sourceContent = {
      title: product.name,
      description: product.description || '',
      price: product.price,
      currency: product.currency,
    };
  } else if (blockId) {
    const block = await prisma.block.findUnique({
      where: { id: blockId },
    });

    if (!block) {
      throw new Error('Block not found');
    }

    sourceContent = {
      title: block.title,
      description: block.description || '',
      imageUrl: block.imageUrl || undefined,
    };
  } else {
    sourceContent = {
      title: customContent!.title,
      description: customContent!.description,
      imageUrl: customContent!.imageUrl,
    };
  }

  const campaign = await prisma.campaign.create({
    data: {
      userId,
      productId: productId ?? null,
      blockId: blockId ?? null,
      customContent: customContent ?? undefined,
      name: `${sourceContent.title} Campaign`,
      goal: config.goal,
      targetAudience: config.targetAudience || null,
      status: CampaignStatus.GENERATING,
    },
  });

  void generateCampaignAssets({
    campaignId: campaign.id,
    sourceContent,
    config,
  }).catch((error) => {
    logger.error('Error generating campaign assets', { error, campaignId: campaign.id });
  });

  return {
    campaignId: campaign.id,
    status: CampaignStatus.GENERATING,
  };
}

async function generateCampaignAssets({
  campaignId,
  sourceContent,
  config,
}: {
  campaignId: string;
  sourceContent: {
    title: string;
    description: string;
    price?: Prisma.Decimal | number | null;
    currency?: string | null;
    imageUrl?: string;
  };
  config: GenerateCampaignConfig;
}) {
  try {
    const assets: Array<{
      type: AssetType;
      platform: Platform | null;
      content: string;
    }> = [];

    if (config.platforms.length > 0 && config.socialPostCount > 0) {
      const perPlatformCount = Math.max(
        1,
        Math.ceil(config.socialPostCount / config.platforms.length)
      );

      for (const platform of config.platforms) {
        const posts = await generateSocialPosts(
          campaignId,
          platform,
          sourceContent,
          config,
          perPlatformCount
        );
        assets.push(...posts);
      }
    }

    if (config.emailCount > 0) {
      const emails = await generateEmailSequence(campaignId, sourceContent, config, config.emailCount);
      assets.push(...emails);
    }

    if (config.pageVariants > 0) {
      const variants = await generatePageVariants(
        campaignId,
        sourceContent,
        config,
        config.pageVariants
      );
      assets.push(...variants);
    }

    if (assets.length > 0) {
      await prisma.campaignAsset.createMany({
        data: assets.map((asset) => ({
          campaignId,
          type: asset.type,
          platform: asset.platform,
          content: asset.content,
          status: AssetStatus.DRAFT,
        })),
      });
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.READY },
    });
  } catch (error) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.FAILED },
    });
    throw error;
  }
}

async function generateSocialPosts(
  campaignId: string,
  platform: Platform,
  sourceContent: {
    title: string;
    description: string;
    price?: Prisma.Decimal | number | null;
    currency?: string | null;
  },
  config: GenerateCampaignConfig,
  count: number
): Promise<Array<{ type: AssetType; platform: Platform; content: string }>> {
  const systemPrompt =
    'You are an expert marketing copywriter for course creators and coaches. Generate compelling, conversion-focused content.';

  const platformSpecs: Record<
    Platform,
    {
      maxLength: number;
      style: string;
    }
  > = {
    TWITTER: { maxLength: 280, style: 'concise with hashtags' },
    INSTAGRAM: { maxLength: 2200, style: 'storytelling with emojis' },
    FACEBOOK: { maxLength: 63206, style: 'conversational and community-focused' },
    LINKEDIN: { maxLength: 3000, style: 'professional thought leadership' },
    TIKTOK: { maxLength: 2200, style: 'trendy and engaging' },
    EMAIL: { maxLength: 0, style: '' },
    LINK_IN_BIO: { maxLength: 0, style: '' },
  };

  const spec = platformSpecs[platform];

  const userPrompt = `Create ${count} ${platform} posts for launching this product:

Title: ${sourceContent.title}
Description: ${sourceContent.description}
${sourceContent.price ? `Price: ${sourceContent.price} ${sourceContent.currency ?? ''}` : ''}
${config.targetAudience ? `Target Audience: ${config.targetAudience}` : ''}
Goal: ${config.goal}
Tone: ${config.tone}

Requirements:
- Each post ${spec.maxLength > 0 ? `max ${spec.maxLength} characters` : ''}
- Style: ${spec.style}
- Include relevant hashtags (2-4 per post)
- Focus on different benefits/angles
- Include clear CTAs
- Vary emotional hooks (curiosity, urgency, social proof, education)

Return JSON array format:
[
  {"content": "post text here #hashtag"}
]`;

  try {
    const result = await generateJSON<Array<{ content: string }>>(
      {
        systemPrompt,
        userPrompt,
        maxTokens: 2048,
        temperature: 0.8,
      },
      { maxRetries: 2 }
    );

    return result.map((item) => ({
      type: AssetType.SOCIAL_POST,
      platform,
      content: item.content,
    }));
  } catch (error) {
    logger.error(`Error generating ${platform} posts`, { error, campaignId });
    return [];
  }
}

async function generateEmailSequence(
  campaignId: string,
  sourceContent: {
    title: string;
    description: string;
  },
  config: GenerateCampaignConfig,
  count: number
): Promise<Array<{ type: AssetType; platform: null; content: string }>> {
  const systemPrompt = 'You are an expert email marketing copywriter.';

  const userPrompt = `Create a ${count}-email sequence for launching this product:

Title: ${sourceContent.title}
Description: ${sourceContent.description}
Goal: ${config.goal}
Tone: ${config.tone}

Email sequence strategy:
- Email 1: Awareness (introduce the problem)
- Email 2: Consideration (present the solution)
- Email 3: Conversion (strong CTA with urgency)

For each email, provide:
- Subject line
- Preview text
- Email body (HTML-friendly)

Return JSON array format:
[
  {
    "subject": "subject line",
    "preview": "preview text",
    "body": "email body content"
  }
]`;

  try {
    const result = await generateJSON<
      Array<{ subject: string; preview: string; body: string }>
    >(
      {
        systemPrompt,
        userPrompt,
        maxTokens: 3072,
        temperature: 0.7,
      },
      { maxRetries: 2 }
    );

    return result.map((email) => ({
      type: AssetType.EMAIL,
      platform: null,
      content: JSON.stringify(email),
    }));
  } catch (error) {
    logger.error('Error generating email sequence', { error, campaignId });
    return [];
  }
}

async function generatePageVariants(
  campaignId: string,
  sourceContent: {
    title: string;
    description: string;
  },
  config: GenerateCampaignConfig,
  count: number
): Promise<Array<{ type: AssetType; platform: null; content: string }>> {
  const systemPrompt = 'You are an expert at creating high-converting landing page copy.';

  const userPrompt = `Create ${count} landing page headline variants for A/B testing:

Product: ${sourceContent.title}
Description: ${sourceContent.description}
Goal: ${config.goal}

Create variants with different approaches:
- Benefit-focused
- Feature-focused
- Curiosity-driven
- Social proof
- Urgency

For each variant, provide:
- Headline
- Subheadline
- CTA button text

Return JSON array format:
[
  {
    "approach": "benefit-focused",
    "headline": "headline text",
    "subheadline": "subheadline text",
    "cta": "CTA text"
  }
]`;

  try {
    const result = await generateJSON<
      Array<{ approach: string; headline: string; subheadline: string; cta: string }>
    >(
      {
        systemPrompt,
        userPrompt,
        maxTokens: 1536,
        temperature: 0.8,
      },
      { maxRetries: 2 }
    );

    return result.map((variant) => ({
      type: AssetType.PAGE_VARIANT,
      platform: null,
      content: JSON.stringify(variant),
    }));
  } catch (error) {
    logger.error('Error generating page variants', { error, campaignId });
    return [];
  }
}

