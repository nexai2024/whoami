import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const requesterId = request.headers.get('x-user-id');

    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        header: true,
        blocks: {
          where: requesterId ? {} : { isActive: true },
          orderBy: { position: 'asc' },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const isOwner = requesterId && requesterId === page.userId;

    if (!page.isActive && !isOwner) {
      return NextResponse.json(
        { error: 'This page is not published.' },
        { status: 403 }
      );
    }

    const blocks = isOwner
      ? page.blocks
      : page.blocks.filter((block: { isActive: boolean }) => block.isActive);

    // Get actual click count from database (with error handling)
    let clickCount = 0;
    try {
      clickCount = await prisma.click.count({
        where: { pageId: page.id }
      });
    } catch (countError) {
      logger.error('Error counting clicks:', countError);
      // Continue with 0 if count fails
    }

    const responsePayload = {
      id: page.id,
      userId: page.userId,
      slug: page.slug,
      title: page.title,
      description: page.description,
      backgroundColor: page.backgroundColor,
      textColor: page.textColor,
      fontFamily: page.fontFamily,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      metaKeywords: page.metaKeywords,
      ogImage: page.ogImage,
      isActive: page.isActive,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      blocks,
      user: page.user,
      pageHeader: page.header,
      _count: { clicks: clickCount },
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    logger.error('Error fetching page by slug:', error);

    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to fetch page: ${message}` },
      { status: 500 }
    );
  }
}
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { logger } from '@/lib/utils/logger';

// export async function POST(req: NextRequest) {
//   try {
//     const { slug } = await req.json();
    
//     if (!slug) {
//       return NextResponse.json(
//         { error: 'Slug is required' },
//         { status: 400 }
//       );
//     }

//     const page = await prisma.page.findUnique({
//       where: { slug },
//       include: {
//         user: {
//           include: {
//             profile: true
//           }
//         }
//       }
//     });

//     if (!page) {
//       return NextResponse.json(
//         { error: 'Page not found' },
//         { status: 404 }
//       );
//     }

//     if (!page.isActive) {
//       return NextResponse.json(
//         { error: 'Page is not published' },
//         { status: 403 }
//       );
//     }

//     // Get page header
//     const pageHeader = await prisma.pageHeader.findUnique({
//       where: { pageId: page.id },
//     });

//     if (!pageHeader) {
//       return NextResponse.json(
//         { error: 'Page header not found' },
//         { status: 404 }
//       );
//     }

//     // Get blocks
//     const blocks = await prisma.block.findMany({
//       where: { pageId: page.id, isActive: true },
//       orderBy: { position: 'asc' }
//     });
// console.log('blocks', blocks);
//     const pageWithData = {
//       ...page,
//       pageHeader,
//       blocks,
//       _count: { clicks: Math.floor(Math.random() * 1000) }
//     };

//     logger.info(`Page loaded successfully via API: ${slug}`);
//     return NextResponse.json(pageWithData);

//   } catch (error) {
//     logger.error('Error fetching page by slug via API:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }