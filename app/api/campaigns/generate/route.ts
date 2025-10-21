/**
 * POST /api/campaigns/generate
 * Generate new marketing campaign from product/block using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, CampaignStatus, AssetType, Platform, AssetStatus } from '@prisma/client';
import aiService from '@/lib/services/aiService';

const prisma = new PrismaClient();

interface GenerateConfig {
  socialPostCount: number;
  emailCount: number;
  platforms: Platform[];
  pageVariants: number;
  goal: 'LAUNCH' | 'PROMOTION' | 'ENGAGEMENT';
  targetAudience?: string;
  tone: 'PROFESSIONAL' | 'CASUAL' | 'EXCITED' | 'EDUCATIONAL';
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with actual auth middleware
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, blockId, customContent, config } = body as {
      productId?: string;
      blockId?: string;
      customContent?: {
        title: string;
        description: string;
        imageUrl?: string;
      };
      config: GenerateConfig;
    };

    // Validate input
    if (!productId && !blockId && !customContent) {
      return NextResponse.json(
        { error: 'Must provide productId, blockId, or customContent' },
        { status: 400 }
      );
    }

    // Check rate limits
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCampaigns = await prisma.campaign.count({
      where: {
        userId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    // TODO: Check user's plan limits
    const hourlyLimit = 5; // FREE plan limit

    if (recentCampaigns >= hourlyLimit) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Maximum 5 campaigns per hour.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Fetch source content
    let sourceContent: any = customContent;

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
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
        return NextResponse.json(
          { error: 'Block not found' },
          { status: 404 }
        );
      }

      sourceContent = {
        title: block.title,
        description: block.description || '',
        imageUrl: block.imageUrl,
      };
    }

    // Create campaign record
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        productId: productId || null,
        blockId: blockId || null,
        customContent: customContent || null,
        name: `${sourceContent.title} Campaign`,
        goal: config.goal,
        targetAudience: config.targetAudience || null,
        status: CampaignStatus.GENERATING,
      },
    });

    // Trigger background generation
    generateCampaignAssets(campaign.id, sourceContent, config).catch((error) => {
      console.error('Error generating campaign:', error);
    });

    return NextResponse.json({
      campaignId: campaign.id,
      status: 'GENERATING',
      estimatedTime: '60-120 seconds',
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate campaign assets using AI
 * In production, this would be a background job
 */
async function generateCampaignAssets(
  campaignId: string,
  sourceContent: any,
  config: GenerateConfig
): Promise<void> {
  try {
    const assets: Array<{
      type: AssetType;
      platform: Platform | null;
      content: string;
    }> = [];

    // Generate social posts for each platform
    for (const platform of config.platforms) {
      const posts = await generateSocialPosts(
        platform,
        sourceContent,
        config,
        Math.ceil(config.socialPostCount / config.platforms.length)
      );

      assets.push(...posts);
    }

    // Generate email sequence
    const emails = await generateEmailSequence(
      sourceContent,
      config,
      config.emailCount
    );
    assets.push(...emails);

    // Generate page variants
    const pageVariants = await generatePageVariants(
      sourceContent,
      config,
      config.pageVariants
    );
    assets.push(...pageVariants);

    // Create all assets in database
    await prisma.campaignAsset.createMany({
      data: assets.map((asset) => ({
        campaignId,
        type: asset.type,
        platform: asset.platform,
        content: asset.content,
        status: AssetStatus.DRAFT,
      })),
    });

    // Mark campaign as ready
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.READY },
    });
  } catch (error) {
    console.error('Error generating campaign assets:', error);

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.FAILED,
      },
    });
  }
}

/**
 * Generate social media posts for a platform
 */
async function generateSocialPosts(
  platform: Platform,
  sourceContent: any,
  config: GenerateConfig,
  count: number
): Promise<Array<{ type: AssetType; platform: Platform; content: string }>> {
  const systemPrompt = 'You are an expert marketing copywriter for course creators and coaches. Generate compelling, conversion-focused content.';

  const platformSpecs: Record<Platform, { maxLength: number; style: string }> = {
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
${sourceContent.price ? `Price: ${sourceContent.price} ${sourceContent.currency}` : ''}
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
  {"content": "post text here #hashtag"},
  ...
]`;

  try {
    const result = await aiService.generateJSON<Array<{ content: string }>>(
      {
        systemPrompt,
        userPrompt,
        maxTokens: 2048,
        temperature: 0.8,
      }
    );

    return result.map((item) => ({
      type: AssetType.SOCIAL_POST,
      platform,
      content: item.content,
    }));
  } catch (error) {
    console.error(`Error generating ${platform} posts:`, error);
    return [];
  }
}

/**
 * Generate email sequence
 */
async function generateEmailSequence(
  sourceContent: any,
  config: GenerateConfig,
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
  },
  ...
]`;

  try {
    const result = await aiService.generateJSON<
      Array<{ subject: string; preview: string; body: string }>
    >({
      systemPrompt,
      userPrompt,
      maxTokens: 3072,
      temperature: 0.7,
    });

    return result.map((email) => ({
      type: AssetType.EMAIL,
      platform: null,
      content: JSON.stringify(email),
    }));
  } catch (error) {
    console.error('Error generating email sequence:', error);
    return [];
  }
}

/**
 * Generate page variants for A/B testing
 */
async function generatePageVariants(
  sourceContent: any,
  config: GenerateConfig,
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
  },
  ...
]`;

  try {
    const result = await aiService.generateJSON<
      Array<{
        approach: string;
        headline: string;
        subheadline: string;
        cta: string;
      }>
    >({
      systemPrompt,
      userPrompt,
      maxTokens: 1536,
      temperature: 0.8,
    });

    return result.map((variant) => ({
      type: AssetType.PAGE_VARIANT,
      platform: null,
      content: JSON.stringify(variant),
    }));
  } catch (error) {
    console.error('Error generating page variants:', error);
    return [];
  }
}
