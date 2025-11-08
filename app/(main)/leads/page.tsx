'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import LeadManager from '@/components/lead-management/LeadManager';
import { Lead, PipelineStage, LeadCreateInput } from '@/types/leadData';
import { useUser } from '@stackframe/stack';
import toast from 'react-hot-toast';

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
      const response = await fetch('/api/leads', {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load leads' }));
        throw new Error(errorData.error || 'Failed to load leads');
      }

      const data = await response.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
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
        const response = await fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to update lead' }));
          throw new Error(errorData.error || 'Failed to update lead');
        }

        const data = await response.json();
        const updatedLead: Lead = data.lead;

        setLeads((prev) =>
          prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
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
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify(newLeadData),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save lead');
        }

        const savedLead: Lead = data.lead;
        setLeads((prev) => {
          const withoutExisting = prev.filter((lead) => lead.id !== savedLead.id);
          return [savedLead, ...withoutExisting];
        });

        toast.success(response.status === 201 ? 'Lead created' : 'Lead updated');
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
        const response = await fetch(`/api/leads/${leadId}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': user.id,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to delete lead' }));
          throw new Error(errorData.error || 'Failed to delete lead');
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
