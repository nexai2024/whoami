'use server';

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

import {
  deleteLead,
  getLeadCacheTag,
  LeadConflictError,
  LeadNotFoundError,
  LeadValidationError,
  listLeads,
  normalizeLeadFilterForCache,
  parseLeadListFilters,
  type LeadListFilterInput,
  type LeadUpdateInput,
  type LeadUpsertInput,
  updateLead,
  upsertLead,
} from '@/lib/services/leadService';
import type { LeadResponse } from '@/app/api/leads/utils';

type LeadActionErrorCode = 'validation_error' | 'conflict_error' | 'not_found' | 'unknown_error';

export interface LeadActionError {
  code: LeadActionErrorCode;
  message: string;
  field?: string;
}

export type LeadActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: LeadActionError;
    };

export interface FetchLeadsActionOptions {
  userId: string;
  filters?: LeadListFilterInput;
}

export interface UpsertLeadActionOptions {
  userId: string;
  payload: LeadUpsertInput;
  revalidate?: {
    path?: string;
    tags?: string[];
  };
}

export interface UpdateLeadActionOptions {
  userId: string;
  leadId: string;
  updates: LeadUpdateInput;
  revalidate?: {
    path?: string;
    tags?: string[];
  };
}

export interface DeleteLeadActionOptions {
  userId: string;
  leadId: string;
  revalidate?: {
    path?: string;
    tags?: string[];
  };
}

function mapLeadServiceError(error: unknown): LeadActionError {
  if (error instanceof LeadValidationError) {
    return {
      code: 'validation_error',
      message: error.message,
      field: error.field,
    };
  }

  if (error instanceof LeadConflictError) {
    return {
      code: 'conflict_error',
      message: error.message,
    };
  }

  if (error instanceof LeadNotFoundError) {
    return {
      code: 'not_found',
      message: 'Lead not found.',
    };
  }

  return {
    code: 'unknown_error',
    message: 'An unexpected error occurred while processing the lead request.',
  };
}

export async function fetchLeadsAction(
  options: FetchLeadsActionOptions
): Promise<LeadActionResult<LeadResponse[]>> {
  try {
    const filters = parseLeadListFilters(options.filters ?? {});
    const normalizedFilters = normalizeLeadFilterForCache(filters);
    const cacheKey = JSON.stringify(normalizedFilters);

    const cachedList = unstable_cache(
      () =>
        listLeads({
          userId: options.userId,
          filters: normalizedFilters,
        }),
      ['lead-service:list', options.userId, cacheKey],
      {
        tags: [getLeadCacheTag(options.userId)],
      }
    );

    const leads = await cachedList();

    return {
      success: true,
      data: leads,
    };
  } catch (error) {
    return {
      success: false,
      error: mapLeadServiceError(error),
    };
  }
}

function applyRevalidation(options: {
  revalidate?: { path?: string; tags?: string[] };
  userId: string;
}) {
  revalidateTag(getLeadCacheTag(options.userId), {});

  if (options.revalidate?.path) {
    revalidatePath(options.revalidate.path);
  }

  if (options.revalidate?.tags) {
    for (const tag of options.revalidate.tags) {
      revalidateTag(tag, {});
    }
  }
}

export async function upsertLeadAction(
  options: UpsertLeadActionOptions
): Promise<LeadActionResult<LeadResponse>> {
  try {
    const result = await upsertLead({
      userId: options.userId,
      payload: options.payload,
    });

    applyRevalidation({ revalidate: options.revalidate, userId: options.userId });

    return {
      success: true,
      data: result.lead,
    };
  } catch (error) {
    return {
      success: false,
      error: mapLeadServiceError(error),
    };
  }
}

export async function updateLeadAction(
  options: UpdateLeadActionOptions
): Promise<LeadActionResult<LeadResponse>> {
  try {
    const lead = await updateLead({
      userId: options.userId,
      leadId: options.leadId,
      updates: options.updates,
    });

    applyRevalidation({ revalidate: options.revalidate, userId: options.userId });

    return {
      success: true,
      data: lead,
    };
  } catch (error) {
    return {
      success: false,
      error: mapLeadServiceError(error),
    };
  }
}

export async function deleteLeadAction(
  options: DeleteLeadActionOptions
): Promise<LeadActionResult<{ success: true }>> {
  try {
    await deleteLead({
      userId: options.userId,
      leadId: options.leadId,
    });

    applyRevalidation({ revalidate: options.revalidate, userId: options.userId });

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return {
      success: false,
      error: mapLeadServiceError(error),
    };
  }
}

