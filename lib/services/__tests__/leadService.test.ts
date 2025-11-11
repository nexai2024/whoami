import { describe, expect, it, vi } from 'vitest';

import {
  deleteLead,
  LeadConflictError,
  LeadNotFoundError,
  LeadValidationError,
  listLeads,
  parseLeadListFilters,
  updateLead,
  upsertLead,
} from '../leadService';

const emailSubscriberMock = {
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/prisma', () => ({
  default: {
    emailSubscriber: emailSubscriberMock,
  },
}));

const baseLeadRecord = {
  id: 'lead-1',
  userId: 'user-1',
  pageId: 'crm-user-1',
  pageType: 'CRM',
  email: 'lead@example.com',
  name: 'Lead Name',
  source: null,
  phone: null,
  company: null,
  notes: null,
  tags: ['vip'],
  pipelineStage: 'NEW',
  lastContactedAt: new Date('2024-03-01T12:00:00.000Z'),
  lastActivityAt: new Date('2024-03-02T12:00:00.000Z'),
  estimatedValue: 100,
  isActive: true,
  createdAt: new Date('2024-02-28T12:00:00.000Z'),
};

describe('parseLeadListFilters', () => {
  it('normalizes filters and validates stage', () => {
    const filters = parseLeadListFilters({
      search: '  Alice ',
      stage: 'qualified',
      pageType: '  crm ',
      pageId: ' page-1 ',
      tags: [' primary ', 'primary', 'beta'],
    });

    expect(filters).toEqual({
      search: 'Alice',
      stage: 'QUALIFIED',
      pageType: 'crm',
      pageId: 'page-1',
      tags: ['primary', 'beta'],
    });
  });

  it('accepts comma-separated tags', () => {
    const filters = parseLeadListFilters({
      tags: 'alpha, beta , alpha',
    });

    expect(filters.tags).toEqual(['alpha', 'beta']);
  });

  it('throws for invalid stage values', () => {
    expect(() => parseLeadListFilters({ stage: 'invalid' })).toThrow(LeadValidationError);
  });

  it('throws when tags are not string or array', () => {
    expect(() =>
      parseLeadListFilters({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tags: 123 as any,
      })
    ).toThrow(LeadValidationError);
  });
});

describe('listLeads', () => {
  it('applies filters and maps Prisma records to lead responses', async () => {
    const prismaRecords = [
      {
        ...baseLeadRecord,
        email: 'alice@example.com',
        name: 'Alice',
        pipelineStage: 'PROPOSAL',
      },
    ];

    emailSubscriberMock.findMany.mockResolvedValueOnce(prismaRecords);

    const result = await listLeads({
      userId: 'user-1',
      filters: {
        search: 'alice',
      },
    });

    expect(emailSubscriberMock.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        OR: [
          { email: { contains: 'alice', mode: 'insensitive' } },
          { name: { contains: 'alice', mode: 'insensitive' } },
          { company: { contains: 'alice', mode: 'insensitive' } },
        ],
      },
      orderBy: [
        { lastActivityAt: 'desc' },
        { lastContactedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    expect(result).toEqual([
      expect.objectContaining({
        id: 'lead-1',
        email: 'alice@example.com',
        stageId: 'proposal',
        lastActivity: prismaRecords[0].lastActivityAt.toISOString(),
      }),
    ]);
  });
});

describe('upsertLead', () => {
  it('creates a new lead when none exists', async () => {
    vi.useFakeTimers();
    const now = new Date('2024-05-01T08:00:00.000Z');
    vi.setSystemTime(now);

    emailSubscriberMock.findUnique.mockResolvedValueOnce(null);

    const createdRecord = {
      ...baseLeadRecord,
      id: 'lead-new',
      email: 'alice@example.com',
      name: 'Alice',
      tags: ['vip', 'beta'],
      pipelineStage: 'CONTACTED',
      lastActivityAt: now,
      lastContactedAt: new Date('2024-04-30T09:00:00.000Z'),
      estimatedValue: 200,
    };

    emailSubscriberMock.create.mockResolvedValueOnce(createdRecord);

    const result = await upsertLead({
      userId: 'user-1',
      payload: {
        email: 'Alice@Example.com',
        name: ' Alice ',
        tags: ['vip', ' beta ', 'vip'],
        stageId: 'contacted',
        estimatedValue: '200',
        lastContacted: '2024-04-30T09:00:00.000Z',
      },
    });

    expect(emailSubscriberMock.findUnique).toHaveBeenCalledWith({
      where: {
        pageId_email: {
          pageId: 'crm-user-1',
          email: 'alice@example.com',
        },
      },
    });

    expect(emailSubscriberMock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        email: 'alice@example.com',
        name: 'Alice',
        pipelineStage: 'CONTACTED',
        tags: ['vip', 'beta'],
        lastContactedAt: new Date('2024-04-30T09:00:00.000Z'),
        lastActivityAt: now,
        pageId: 'crm-user-1',
        pageType: 'CRM',
        estimatedValue: 200,
      }),
    });

    expect(result.created).toBe(true);
    expect(result.lead).toEqual(
      expect.objectContaining({
        id: 'lead-new',
        email: 'alice@example.com',
        stageId: 'contacted',
        tags: ['vip', 'beta'],
        lastActivity: now.toISOString(),
      })
    );
  });

  it('updates an existing lead without overwriting tags when not provided', async () => {
    vi.useFakeTimers();
    const now = new Date('2024-06-01T10:00:00.000Z');
    vi.setSystemTime(now);

    const existingRecord = {
      ...baseLeadRecord,
      email: 'alice@example.com',
      tags: ['vip'],
    };

    emailSubscriberMock.findUnique.mockResolvedValueOnce(existingRecord);

    const updatedRecord = {
      ...existingRecord,
      name: 'Updated Alice',
      lastActivityAt: now,
      lastContactedAt: now,
    };

    emailSubscriberMock.update.mockResolvedValueOnce(updatedRecord);

    const result = await upsertLead({
      userId: 'user-1',
      payload: {
        email: 'alice@example.com',
        name: 'Updated Alice',
      },
    });

    const updateArgs = emailSubscriberMock.update.mock.calls[0][0];

    expect(updateArgs).toEqual({
      where: { id: existingRecord.id },
      data: expect.objectContaining({
        name: 'Updated Alice',
        lastActivityAt: now,
        lastContactedAt: now,
      }),
    });

    expect(updateArgs.data).not.toHaveProperty('tags');

    expect(result.created).toBe(false);
    expect(result.lead.name).toBe('Updated Alice');
  });

  it('throws when a lead exists for another user', async () => {
    emailSubscriberMock.findUnique.mockResolvedValueOnce({
      ...baseLeadRecord,
      userId: 'other-user',
    });

    await expect(
      upsertLead({
        userId: 'user-1',
        payload: {
          email: 'lead@example.com',
        },
      })
    ).rejects.toThrow(LeadConflictError);
  });

  it('validates required email', async () => {
    await expect(
      upsertLead({
        userId: 'user-1',
        payload: {
          email: undefined,
        },
      })
    ).rejects.toThrow(LeadValidationError);
  });
});

describe('updateLead', () => {
  it('updates provided fields and preserves others', async () => {
    vi.useFakeTimers();
    const now = new Date('2024-07-01T12:00:00.000Z');
    vi.setSystemTime(now);

    emailSubscriberMock.findUnique.mockResolvedValueOnce({
      ...baseLeadRecord,
      tags: ['vip'],
    });

    const updatedRecord = {
      ...baseLeadRecord,
      email: 'lead@example.com',
      tags: ['vip', 'hot'],
      pipelineStage: 'QUALIFIED',
      lastActivityAt: now,
      lastContactedAt: now,
    };

    emailSubscriberMock.update.mockResolvedValueOnce(updatedRecord);

    const result = await updateLead({
      userId: 'user-1',
      leadId: 'lead-1',
      updates: {
        stageId: 'qualified',
        tags: ['vip', 'hot'],
      },
    });

    expect(emailSubscriberMock.findUnique).toHaveBeenCalledWith({ where: { id: 'lead-1' } });

    expect(emailSubscriberMock.update).toHaveBeenCalledWith({
      where: { id: 'lead-1' },
      data: expect.objectContaining({
        pipelineStage: { set: 'QUALIFIED' },
        tags: ['vip', 'hot'],
        lastActivityAt: now,
        lastContactedAt: now,
      }),
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'lead-1',
        tags: ['vip', 'hot'],
        stageId: 'qualified',
      })
    );
  });

  it('returns existing lead when no updates supplied', async () => {
    emailSubscriberMock.findUnique.mockResolvedValueOnce(baseLeadRecord);

    const result = await updateLead({
      userId: 'user-1',
      leadId: 'lead-1',
      updates: {},
    });

    expect(emailSubscriberMock.update).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ id: 'lead-1' }));
  });

  it('validates email when provided', async () => {
    emailSubscriberMock.findUnique.mockResolvedValueOnce(baseLeadRecord);

    await expect(
      updateLead({
        userId: 'user-1',
        leadId: 'lead-1',
        updates: { email: 'not-an-email' },
      })
    ).rejects.toThrow(LeadValidationError);
  });

  it('throws when lead not found for user', async () => {
    emailSubscriberMock.findUnique.mockResolvedValueOnce(null);

    await expect(
      updateLead({
        userId: 'user-1',
        leadId: 'missing',
        updates: { name: 'Test' },
      })
    ).rejects.toThrow(LeadNotFoundError);
  });
});

describe('deleteLead', () => {
  it('deletes lead when user owns it', async () => {
    emailSubscriberMock.findUnique.mockResolvedValueOnce(baseLeadRecord);
    emailSubscriberMock.delete.mockResolvedValueOnce(undefined);

    await deleteLead({
      userId: 'user-1',
      leadId: 'lead-1',
    });

    expect(emailSubscriberMock.findUnique).toHaveBeenCalledWith({ where: { id: 'lead-1' } });
    expect(emailSubscriberMock.delete).toHaveBeenCalledWith({ where: { id: 'lead-1' } });
  });

  it('throws when deleting missing lead', async () => {
    emailSubscriberMock.findUnique.mockResolvedValueOnce(null);

    await expect(
      deleteLead({
        userId: 'user-1',
        leadId: 'missing',
      })
    ).rejects.toThrow(LeadNotFoundError);
  });
});

