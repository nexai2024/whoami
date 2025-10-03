import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const { pageId } = await params;
  const headerData = await req.json();
  try {
console.log("Header data received for update:", headerData);
    const pageHeader = await prisma.pageHeader.findUnique({
            where: { pageId },
          });
     logger.info("Fetched page header for update:", pageHeader);
          
        
          if (!pageHeader) {
            throw new Error('Page Header not found');
          }
          
          const updatedPageHeader = await prisma.pageHeader.update({
            where: {
                        id: pageHeader.id
              }
            ,
            data: {
              data: headerData,
              updatedAt: new Date()
            }
          });
    
    
    
          logger.info(`Page header updated successfully: for page ${pageId} with header ${headerData.id}`);
    return NextResponse.json({ updatedPageHeader }, { status: 200 });
  } catch (error) {
    logger.error('Error saving blocks:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to save blocks ${errorMessage}` }, { status: 500 });
  }
}