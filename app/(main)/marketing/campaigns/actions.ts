'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { CampaignStatus, Platform } from '@prisma/client';

import {
  CampaignRateLimitError,
  GenerateCampaignConfig,
  generateCampaign,
  getCampaignCacheTag,
  listCampaigns,
  serializeCampaignListFilters,
} from '@/lib/services/campaignService';
import prisma from '@/lib/prisma';

type CampaignActionErrorCode = 'validation_error' | 'not_found' | 'rate_limited' | 'unknown_error';

interface CampaignActionError {
  code: CampaignActionErrorCode;
  message: string;
}

interface ActionSuccess<T> {
  success: true;
  data: T;
}

interface ActionFailure {
  success: false;
  error: CampaignActionError;
}

type CampaignActionResult<T> = ActionSuccess<T> | ActionFailure;

interface FetchCampaignsActionOptions {
  userId: string;
  status?: CampaignStatus;
}

interface GenerateCampaignActionOptions {
  userId: string;
  payload: {
    productId?: string;
    blockId?: string;
    customContent?: {
      title: string;
      description: string;
      imageUrl?: string;
    };
    config: GenerateCampaignConfig & { platforms: (Platform | string)[] };
  };
  revalidate?: {
    path?: string;
    tags?: string[];
  };
}

type BasicProduct = {
  id: string;
  name: string;
};

type BasicBlock = {
  id: string;
  type: string;
  data: Record<string, unknown> | null;
};

function mapCampaignError(error: unknown): CampaignActionError {
  if (error instanceof CampaignRateLimitError) {
    return {
      code: 'rate_limited',
      message: error.message,
    };
  }

  if (error instanceof Error) {
    if (error.message === 'Product not found' || error.message === 'Block not found') {
      return {
        code: 'not_found',
        message: error.message,
      };
    }

    if (error.message.startsWith('Invalid request')) {
      return {
        code: 'validation_error',
        message: error.message,
      };
    }
  }

  return {
    code: 'unknown_error',
    message: 'An unexpected error occurred while processing the campaign request.',
  };
}

export async function fetchCampaignsAction(
  options: FetchCampaignsActionOptions
): Promise<CampaignActionResult<Awaited<ReturnType<typeof listCampaigns>>>> {
  try {
    const filters = options.status ? { status: options.status } : undefined;
    const cacheKey = serializeCampaignListFilters(filters);
    const cachedCampaigns = unstable_cache(
      () =>
        listCampaigns({
          userId: options.userId,
          filters,
        }),
      ['campaign-service:list', options.userId, cacheKey],
      {
        tags: [getCampaignCacheTag(options.userId)],
      }
    );

    const campaigns = await cachedCampaigns();

    return {
      success: true,
      data: campaigns,
    };
  } catch (error) {
    return {
      success: false,
      error: mapCampaignError(error),
    };
  }
}

export async function generateCampaignAction(
  options: GenerateCampaignActionOptions
): Promise<
  CampaignActionResult<{
    campaignId: string;
    status: CampaignStatus;
  }>
> {
  try {
    const platforms = options.payload.config.platforms as Platform[];

    const result = await generateCampaign({
      userId: options.userId,
      productId: options.payload.productId,
      blockId: options.payload.blockId,
      customContent: options.payload.customContent,
      config: {
        ...options.payload.config,
        platforms,
      },
    });

    revalidateTag(getCampaignCacheTag(options.userId), 'max');

    if (options.revalidate?.path) {
      revalidatePath(options.revalidate.path);
    }

    if (options.revalidate?.tags) {
      for (const tag of options.revalidate.tags) {
        revalidateTag(tag, 'max');
      }
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: mapCampaignError(error),
    };
  }
}

export async function fetchCampaignProductsAction({
  userId,
}: {
  userId: string | null | undefined;
}): Promise<CampaignActionResult<BasicProduct[]>> {
  if (!userId) {
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: 'User ID is required to load products.',
      },
    };
  }

  try {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    return {
      success: false,
      error: mapCampaignError(error),
    };
  }
}

export async function fetchCampaignBlocksAction({
  userId,
}: {
  userId: string | null | undefined;
}): Promise<CampaignActionResult<BasicBlock[]>> {
  if (!userId) {
    return {
      success: false,
      error: {
        code: 'validation_error',
        message: 'User ID is required to load blocks.',
      },
    };
  }

  try {
    const blocks = await prisma.block.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        data: true,
      },
    });

    return {
      success: true,
      data: blocks.map((block: { id: any; type: any; data: Record<string, unknown> | null; }) => ({
        id: block.id,
        type: block.type,
        data: block.data as Record<string, unknown> | null,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: mapCampaignError(error),
    };
  }
}

