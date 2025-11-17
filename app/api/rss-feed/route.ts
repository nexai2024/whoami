import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/rss-feed?url=...
 * Fetch and parse RSS feed
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const feedUrl = searchParams.get('url');
    const itemCount = parseInt(searchParams.get('itemCount') || '10', 10);

    if (!feedUrl) {
      return NextResponse.json(
        { error: 'Feed URL is required' },
        { status: 400 }
      );
    }

    // Fetch RSS feed
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'WhoAmI RSS Reader/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlText = await response.text();

    // Parse RSS XML (simple parser - could use a library like rss-parser for production)
    const items = parseRSSFeed(xmlText, itemCount);

    return NextResponse.json({
      success: true,
      items,
      feedUrl
    });

  } catch (error) {
    logger.error('Error fetching RSS feed:', error);
    let message = 'Failed to fetch RSS feed';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as any).message;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function parseRSSFeed(xmlText: string, maxItems: number) {
  const items: any[] = [];
  
  try {
    // Simple regex-based parsing (for production, use a proper XML parser)
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    const matches = xmlText.matchAll(itemRegex);

    for (const match of matches) {
      if (items.length >= maxItems) break;

      const itemXml = match[1];
      
      const getTagContent = (tag: string) => {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const match = itemXml.match(regex);
        return match ? match[1].trim().replace(/<[^>]+>/g, '') : '';
      };

      const getTagAttribute = (tag: string, attr: string) => {
        const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
        const match = itemXml.match(regex);
        return match ? match[1] : '';
      };

      const title = getTagContent('title');
      const description = getTagContent('description');
      const link = getTagContent('link');
      const pubDate = getTagContent('pubDate');
      const guid = getTagContent('guid') || link;
      
      // Get image from enclosure or media:content
      let image = getTagAttribute('enclosure', 'url');
      if (!image) {
        const mediaContent = getTagContent('media:content') || getTagContent('content');
        if (mediaContent) {
          const imgMatch = mediaContent.match(/url=["']([^"']+)["']/i);
          image = imgMatch ? imgMatch[1] : '';
        }
      }

      if (title) {
        items.push({
          title,
          description: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
          link,
          pubDate,
          guid,
          image
        });
      }
    }
  } catch (error) {
    logger.error('Error parsing RSS feed:', error);
  }

  return items;
}

