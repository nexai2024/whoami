'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import LeadManager from '@/components/lead-management/LeadManager';
import { Lead, PipelineStage, LeadCreateInput } from '@/types/leadData';
import { useUser } from '@stackframe/stack';
import toast from 'react-hot-toast';
import {
  deleteLeadAction,
  fetchLeadsAction,
  updateLeadAction,
  upsertLeadAction,
} from './actions';

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 'new', title: 'New' },
  { id: 'contacted', title: 'Contacted' },
  { id: 'qualified', title: 'Qualified' },
  { id: 'proposal', title: 'Proposal' },
  { id: 'negotiation', title: 'Negotiation' },
  { id: 'won', title: 'Won' },
  { id: 'lost', title: 'Lost' },
];

export default function LeadsPage() {
  const user = useUser();
  const stages = useMemo(() => DEFAULT_STAGES, []);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    if (!user?.id) {
      setLeads([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchLeadsAction({
        userId: user.id,
      });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      // Ensure type compatibility: convert null phone to undefined if necessary
      const leadsData = Array.isArray(result.data)
        ? result.data.map((lead) => ({
            ...lead,
            phone: lead.phone === null ? undefined : lead.phone,
          }))
        : [];

      // Only handle the fields that actually exist on type Lead
      const fixedLeadsData = leadsData.map((lead) => ({
        ...lead,
        phone: lead.phone === null ? undefined : lead.phone,
        source: lead.source === null ? undefined : lead.source,
        company: lead.company === null ? undefined : lead.company,
        notes: lead.notes === null ? undefined : lead.notes,
        // Add further properties here if new nullable properties are added to Lead
      }));

      setLeads(fixedLeadsData);
    } catch (err) {
      console.error('Error fetching leads:', err);
      const message = err instanceof Error ? err.message : 'Failed to load leads';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleLeadUpdate = useCallback(
    async (leadId: string, updates: Partial<Lead>) => {
      if (!user?.id) {
        toast.error('You must be logged in to update leads.');
        return;
      }

      if (!updates || Object.keys(updates).length === 0) {
        return;
      }

      try {
        const result = await updateLeadAction({
          userId: user.id,
          leadId,
          updates,
          revalidate: { path: '/leads' },
        });

        if (!result.success) {
          throw new Error(result.error.message);
        }

        // Ensure the incoming 'result.data' is cast to 'Lead' type,
        // and normalize nullable fields so the array always stays Lead[]
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === result.data.id
              ? {
                  ...result.data,
                  phone: result.data.phone === null ? undefined : result.data.phone,
                  source: result.data.source === null ? undefined : result.data.source,
                  company: result.data.company === null ? undefined : result.data.company,
                  notes: result.data.notes === null ? undefined : result.data.notes,
                }
              : lead
          )
        );

        const keys = Object.keys(updates);
        const stageOnlyUpdate = keys.length === 1 && keys[0] === 'stageId';

        if (!stageOnlyUpdate) {
          toast.success('Lead updated');
        }
      } catch (err) {
        console.error('Error updating lead:', err);
        const message = err instanceof Error ? err.message : 'Failed to update lead';
        toast.error(message);
        await fetchLeads();
      }
    },
    [user?.id, fetchLeads]
  );

  const handleLeadCreate = useCallback(
    async (newLeadData: LeadCreateInput) => {
      if (!user?.id) {
        toast.error('You must be logged in to create leads.');
        return;
      }

      try {
        const result = await upsertLeadAction({
          userId: user.id,
          payload: newLeadData,
          revalidate: { path: '/leads' },
        });

        if (!result.success) {
          throw new Error(result.error.message);
        }

        // Normalize nullable fields to match Lead (no null values)
        setLeads((prev) => {
          const normalizedLead: Lead = {
            ...result.data,
            phone: result.data.phone === null ? undefined : result.data.phone,
            source: result.data.source === null ? undefined : result.data.source,
            company: result.data.company === null ? undefined : result.data.company,
            notes: result.data.notes === null ? undefined : result.data.notes,
          };
          const withoutExisting = prev.filter((lead) => lead.id !== normalizedLead.id);
          return [normalizedLead, ...withoutExisting];
        });

        toast.success('Lead saved');
      } catch (err) {
        console.error('Error creating lead:', err);
        const message = err instanceof Error ? err.message : 'Failed to save lead';
        toast.error(message);
        throw err;
      }
    },
    [user?.id]
  );

  const handleLeadDelete = useCallback(
    async (leadId: string) => {
      if (!user?.id) {
        toast.error('You must be logged in to delete leads.');
        return;
      }

      try {
        const result = await deleteLeadAction({
          userId: user.id,
          leadId,
          revalidate: { path: '/leads' },
        });

        if (!result.success) {
          throw new Error(result.error.message);
        }

        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
        toast.success('Lead deleted');
      } catch (err) {
        console.error('Error deleting lead:', err);
        const message = err instanceof Error ? err.message : 'Failed to delete lead';
        toast.error(message);
        throw err;
      }
    },
    [user?.id]
  );

  if (!user) {
    return (
      <div className="p-8 text-gray-500">
        Please sign in to manage your leads.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {loading && leads.length === 0 && (
        <div className="mb-4 text-gray-500">Loading leads...</div>
      )}
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
      <LeadManager
        stages={stages}
        leads={leads}
        onLeadUpdate={handleLeadUpdate}
        onLeadCreate={handleLeadCreate}
        onLeadDelete={handleLeadDelete}
      />
    </div>
  );
}
