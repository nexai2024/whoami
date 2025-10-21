/**
 * POST /api/repurpose/analyze
 * Analyze source URL and extract content for repurposing
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, SourceType, RepurposeStatus, RepurposeAssetType } from '@prisma/client';
import aiService from '@/lib/services/aiService';

const prisma = new PrismaClient();

interface RepurposeConfig {
  outputFormats: RepurposeAssetType[];
  brandColors?: { primary: string; secondary: string };
  brandLogo?: string;
  customInstructions?: string;
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
    const { sourceUrl, sourceType, config } = body as {
      sourceUrl: string;
      sourceType?: SourceType;
      config: RepurposeConfig;
    };

    if (!sourceUrl) {
      return NextResponse.json(
        { error: 'Source URL is required' },
        { status: 400 }
      );
    }

    // Detect source type if not provided
    const detectedType = sourceType || detectSourceType(sourceUrl);

    if (!detectedType) {
      return NextResponse.json(
        { error: 'Could not detect source type. Please specify sourceType.' },
        { status: 400 }
      );
    }

    // Check rate limits
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentJobs = await prisma.repurposedContent.count({
      where: {
        userId,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    // TODO: Check user's plan limits
    const hourlyLimit = 3; // FREE plan limit

    if (recentJobs >= hourlyLimit) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Upgrade your plan for more repurposing jobs.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Create repurposed content record
    const repurposedContent = await prisma.repurposedContent.create({
      data: {
        userId,
        sourceUrl,
        sourceType: detectedType,
        status: RepurposeStatus.ANALYZING,
        brandColors: config.brandColors || null,
        brandLogo: config.brandLogo || null,
      },
    });

    // Trigger background processing (in production, use job queue)
    // For demonstration, we'll simulate it
    processContentRepurposing(
      repurposedContent.id,
      sourceUrl,
      detectedType,
      config
    ).catch((error) => {
      console.error('Error processing content:', error);
    });

    return NextResponse.json({
      repurposedContentId: repurposedContent.id,
      status: 'ANALYZING',
      estimatedTime: '120-300 seconds',
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Detect source type from URL
 */
function detectSourceType(url: string): SourceType | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return SourceType.YOUTUBE;
    } else if (hostname.includes('tiktok.com')) {
      return SourceType.TIKTOK;
    } else if (hostname.includes('instagram.com')) {
      return SourceType.INSTAGRAM;
    } else if (hostname.includes('vimeo.com')) {
      return SourceType.VIMEO;
    } else if (hostname.includes('medium.com')) {
      return SourceType.MEDIUM;
    } else if (hostname.includes('substack.com')) {
      return SourceType.SUBSTACK;
    } else if (hostname.includes('linkedin.com')) {
      return SourceType.LINKEDIN_ARTICLE;
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return SourceType.TWITTER_THREAD;
    } else if (hostname.includes('spotify.com')) {
      return SourceType.SPOTIFY;
    } else {
      // Default to blog for other URLs
      return SourceType.BLOG;
    }
  } catch {
    return null;
  }
}

/**
 * Process content repurposing (background job)
 * In production, this would be handled by a job queue
 */
async function processContentRepurposing(
  contentId: string,
  sourceUrl: string,
  sourceType: SourceType,
  config: RepurposeConfig
): Promise<void> {
  try {
    // Step 1: Extract content
    await prisma.repurposedContent.update({
      where: { id: contentId },
      data: { status: RepurposeStatus.EXTRACTING },
    });

    const extractedContent = await extractContent(sourceUrl, sourceType);

    // Update with extracted data
    await prisma.repurposedContent.update({
      where: { id: contentId },
      data: {
        sourceTitle: extractedContent.title,
        transcript: extractedContent.transcript,
        duration: extractedContent.duration,
        sourceMeta: extractedContent.metadata,
      },
    });

    // Step 2: Extract key points using AI
    const keyPoints = await aiService.extractKeyPoints(
      extractedContent.transcript || extractedContent.content,
      5
    );

    await prisma.repurposedContent.update({
      where: { id: contentId },
      data: { keyPoints },
    });

    // Step 3: Generate repurposed assets
    await prisma.repurposedContent.update({
      where: { id: contentId },
      data: { status: RepurposeStatus.GENERATING },
    });

    for (const format of config.outputFormats) {
      await generateAsset(contentId, format, extractedContent, keyPoints, config);
    }

    // Step 4: Mark as ready
    await prisma.repurposedContent.update({
      where: { id: contentId },
      data: { status: RepurposeStatus.READY },
    });
  } catch (error) {
    console.error('Error processing content repurposing:', error);

    await prisma.repurposedContent.update({
      where: { id: contentId },
      data: {
        status: RepurposeStatus.FAILED,
        error: (error as Error).message,
      },
    });
  }
}

/**
 * Extract content from source
 */
async function extractContent(
  url: string,
  sourceType: SourceType
): Promise<any> {
  // Simplified extraction - in production, use dedicated extractors
  // For YouTube: Use YouTube Data API + transcript API
  // For blogs: Use web scraping with Readability.js
  // For podcasts: Use RSS parsing + audio transcription

  // Simulated extraction
  return {
    title: 'Sample Content Title',
    transcript: 'This is the extracted content from the source...',
    content: 'Main content extracted from the source.',
    duration: null,
    metadata: {
      author: 'Content Author',
      publishedAt: new Date().toISOString(),
    },
  };
}

/**
 * Generate a repurposed asset using AI
 */
async function generateAsset(
  contentId: string,
  assetType: RepurposeAssetType,
  extractedContent: any,
  keyPoints: string[],
  config: RepurposeConfig
): Promise<void> {
  try {
    let content: string;

    const sourceContent = extractedContent.transcript || extractedContent.content;

    // Generate content based on asset type
    switch (assetType) {
      case RepurposeAssetType.TWITTER_THREAD:
        content = await generateTwitterThread(sourceContent, keyPoints);
        break;

      case RepurposeAssetType.LINKEDIN_POST:
        content = await aiService.summarizeForPlatform(
          sourceContent,
          'linkedin',
          'professional'
        );
        break;

      case RepurposeAssetType.INSTAGRAM_CAPTION:
        content = await aiService.summarizeForPlatform(
          sourceContent,
          'instagram',
          'casual'
        );
        break;

      case RepurposeAssetType.EMAIL_NEWSLETTER:
        content = await generateEmailNewsletter(sourceContent, keyPoints);
        break;

      case RepurposeAssetType.BLOG_SUMMARY:
        content = await generateBlogSummary(sourceContent, keyPoints);
        break;

      default:
        content = sourceContent.substring(0, 500);
    }

    // Create asset
    await prisma.repurposedAsset.create({
      data: {
        repurposedContentId: contentId,
        type: assetType,
        content,
        platform: assetType.includes('TWITTER')
          ? 'TWITTER'
          : assetType.includes('LINKEDIN')
          ? 'LINKEDIN'
          : assetType.includes('INSTAGRAM')
          ? 'INSTAGRAM'
          : null,
      },
    });
  } catch (error) {
    console.error(`Error generating ${assetType} asset:`, error);
  }
}

/**
 * Generate Twitter thread
 */
async function generateTwitterThread(
  content: string,
  keyPoints: string[]
): Promise<string> {
  const systemPrompt = 'You are an expert at creating engaging Twitter threads.';

  const userPrompt = `Create a Twitter thread from this content. Each tweet should be 240-280 characters. Start with a hook, then cover the key points, and end with a CTA.

Content:
${content}

Key Points:
${keyPoints.join('\n')}

Return as plain text with tweets separated by ---`;

  return aiService.generateContent({
    systemPrompt,
    userPrompt,
    maxTokens: 2048,
    temperature: 0.8,
  });
}

/**
 * Generate email newsletter
 */
async function generateEmailNewsletter(
  content: string,
  keyPoints: string[]
): Promise<string> {
  const systemPrompt = 'You are an expert email newsletter writer.';

  const userPrompt = `Create an engaging email newsletter from this content. Include a compelling subject line, introduction, key insights, and clear CTA.

Content:
${content}

Key Points:
${keyPoints.join('\n')}`;

  return aiService.generateContent({
    systemPrompt,
    userPrompt,
    maxTokens: 2048,
  });
}

/**
 * Generate blog summary
 */
async function generateBlogSummary(
  content: string,
  keyPoints: string[]
): Promise<string> {
  const systemPrompt = 'You are an expert content summarizer.';

  const userPrompt = `Create a comprehensive blog summary that captures the essence of this content in 3-5 paragraphs.

Content:
${content}

Key Points:
${keyPoints.join('\n')}`;

  return aiService.generateContent({
    systemPrompt,
    userPrompt,
    maxTokens: 1536,
  });
}
