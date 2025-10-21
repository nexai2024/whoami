/**
 * Platform Publisher Service
 * Handles posting to various social media platforms
 * Used by Campaign Generator and Smart Scheduler
 */

import { Platform, PostType } from '@prisma/client';

export interface PostContent {
  content: string;
  mediaUrls?: string[];
  scheduledFor?: Date;
}

export interface PublishResult {
  success: boolean;
  externalId?: string;
  externalUrl?: string;
  error?: string;
  rateLimitReset?: Date;
}

export interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  additionalData?: Record<string, any>;
}

/**
 * Abstract base publisher class
 */
abstract class BasePlatformPublisher {
  protected credentials: PlatformCredentials;

  constructor(credentials: PlatformCredentials) {
    this.credentials = credentials;
  }

  abstract publish(
    content: PostContent,
    postType: PostType
  ): Promise<PublishResult>;

  abstract validateCredentials(): Promise<boolean>;

  protected async refreshAccessToken(): Promise<void> {
    // Override in subclasses if refresh is supported
    throw new Error('Token refresh not implemented for this platform');
  }
}

/**
 * Twitter/X Publisher
 */
class TwitterPublisher extends BasePlatformPublisher {
  async publish(
    content: PostContent,
    postType: PostType
  ): Promise<PublishResult> {
    try {
      // Twitter API v2 endpoint
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content.content,
          ...(content.mediaUrls && content.mediaUrls.length > 0
            ? { media: { media_ids: await this.uploadMedia(content.mediaUrls) } }
            : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to post to Twitter');
      }

      const data = await response.json();

      return {
        success: true,
        externalId: data.data.id,
        externalUrl: `https://twitter.com/i/web/status/${data.data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async uploadMedia(urls: string[]): Promise<string[]> {
    // Simplified - in production, download media and upload to Twitter
    // Twitter requires media to be uploaded separately before posting
    return [];
  }
}

/**
 * LinkedIn Publisher
 */
class LinkedInPublisher extends BasePlatformPublisher {
  async publish(
    content: PostContent,
    postType: PostType
  ): Promise<PublishResult> {
    try {
      const personUrn = this.credentials.additionalData?.personUrn;

      if (!personUrn) {
        throw new Error('LinkedIn person URN not found');
      }

      const response = await fetch(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            author: personUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: content.content,
                },
                shareMediaCategory: 'NONE',
              },
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post to LinkedIn');
      }

      const data = await response.json();
      const postId = data.id.split(':').pop();

      return {
        success: true,
        externalId: data.id,
        externalUrl: `https://www.linkedin.com/feed/update/${postId}/`,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Instagram Publisher (requires Facebook Graph API)
 */
class InstagramPublisher extends BasePlatformPublisher {
  async publish(
    content: PostContent,
    postType: PostType
  ): Promise<PublishResult> {
    try {
      const instagramAccountId = this.credentials.additionalData?.instagramAccountId;

      if (!instagramAccountId) {
        throw new Error('Instagram account ID not found');
      }

      // Create media container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: content.mediaUrls?.[0],
            caption: content.content,
            access_token: this.credentials.accessToken,
          }),
        }
      );

      if (!containerResponse.ok) {
        throw new Error('Failed to create Instagram media container');
      }

      const containerData = await containerResponse.json();

      // Publish media container
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: this.credentials.accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        throw new Error('Failed to publish Instagram post');
      }

      const publishData = await publishResponse.json();

      return {
        success: true,
        externalId: publishData.id,
        externalUrl: `https://www.instagram.com/p/${publishData.id}/`,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const instagramAccountId = this.credentials.additionalData?.instagramAccountId;

      if (!instagramAccountId) {
        return false;
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${instagramAccountId}?access_token=${this.credentials.accessToken}`
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Facebook Publisher
 */
class FacebookPublisher extends BasePlatformPublisher {
  async publish(
    content: PostContent,
    postType: PostType
  ): Promise<PublishResult> {
    try {
      const pageId = this.credentials.additionalData?.pageId;

      if (!pageId) {
        throw new Error('Facebook page ID not found');
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.content,
            access_token: this.credentials.accessToken,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to post to Facebook');
      }

      const data = await response.json();

      return {
        success: true,
        externalId: data.id,
        externalUrl: `https://www.facebook.com/${data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const pageId = this.credentials.additionalData?.pageId;

      if (!pageId) {
        return false;
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?access_token=${this.credentials.accessToken}`
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * TikTok Publisher
 */
class TikTokPublisher extends BasePlatformPublisher {
  async publish(
    content: PostContent,
    postType: PostType
  ): Promise<PublishResult> {
    // TikTok API implementation would go here
    // Note: TikTok API access is limited and requires approval
    return {
      success: false,
      error: 'TikTok publishing not yet implemented',
    };
  }

  async validateCredentials(): Promise<boolean> {
    return false;
  }
}

/**
 * Factory to get appropriate publisher
 */
function getPublisher(
  platform: Platform,
  credentials: PlatformCredentials
): BasePlatformPublisher {
  switch (platform) {
    case Platform.TWITTER:
      return new TwitterPublisher(credentials);
    case Platform.LINKEDIN:
      return new LinkedInPublisher(credentials);
    case Platform.INSTAGRAM:
      return new InstagramPublisher(credentials);
    case Platform.FACEBOOK:
      return new FacebookPublisher(credentials);
    case Platform.TIKTOK:
      return new TikTokPublisher(credentials);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Main publish function
 */
export async function publish(
  platform: Platform,
  content: PostContent,
  postType: PostType,
  credentials: PlatformCredentials
): Promise<PublishResult> {
  try {
    const publisher = getPublisher(platform, credentials);

    // Validate credentials before attempting to publish
    const isValid = await publisher.validateCredentials();

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid or expired credentials',
      };
    }

    return await publisher.publish(content, postType);
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Batch publish with error handling
 */
export async function publishBatch(
  posts: Array<{
    platform: Platform;
    content: PostContent;
    postType: PostType;
    credentials: PlatformCredentials;
  }>
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  for (const post of posts) {
    const result = await publish(
      post.platform,
      post.content,
      post.postType,
      post.credentials
    );

    results.push(result);

    // Add delay between posts to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Validate platform credentials
 */
export async function validateCredentials(
  platform: Platform,
  credentials: PlatformCredentials
): Promise<boolean> {
  try {
    const publisher = getPublisher(platform, credentials);
    return await publisher.validateCredentials();
  } catch {
    return false;
  }
}

/**
 * Get platform-specific posting limits
 */
export function getPlatformLimits(platform: Platform): {
  maxContentLength: number;
  maxMediaCount: number;
  supportsScheduling: boolean;
} {
  const limits = {
    [Platform.TWITTER]: {
      maxContentLength: 280,
      maxMediaCount: 4,
      supportsScheduling: true,
    },
    [Platform.LINKEDIN]: {
      maxContentLength: 3000,
      maxMediaCount: 9,
      supportsScheduling: false,
    },
    [Platform.INSTAGRAM]: {
      maxContentLength: 2200,
      maxMediaCount: 10,
      supportsScheduling: false,
    },
    [Platform.FACEBOOK]: {
      maxContentLength: 63206,
      maxMediaCount: 10,
      supportsScheduling: true,
    },
    [Platform.TIKTOK]: {
      maxContentLength: 2200,
      maxMediaCount: 1,
      supportsScheduling: false,
    },
    [Platform.EMAIL]: {
      maxContentLength: 1000000,
      maxMediaCount: 0,
      supportsScheduling: true,
    },
    [Platform.LINK_IN_BIO]: {
      maxContentLength: 10000,
      maxMediaCount: 1,
      supportsScheduling: false,
    },
  };

  return limits[platform];
}

export default {
  publish,
  publishBatch,
  validateCredentials,
  getPlatformLimits,
};
