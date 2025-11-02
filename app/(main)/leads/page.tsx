'use client';

import { useState, useCallback } from 'react';
import LeadManager from "@/components/lead-management/LeadManager";
import { Lead, PipelineStage } from "@/types/leadData";

export default function LeadsPage() {
    // Initialize pipeline stages
    const [stages, setStages] = useState<PipelineStage[]>([
        { id: 'new', title: 'New' },
        { id: 'contacted', title: 'Contacted' },
        { id: 'qualified', title: 'Qualified' },
        { id: 'proposal', title: 'Proposal' },
        { id: 'negotiation', title: 'Negotiation' },
        { id: 'won', title: 'Won' },
        { id: 'lost', title: 'Lost' }
    ]);

    // Initialize mock leads data
    const [leads, setLeads] = useState<Lead[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            stageId: 'new',
            tags: ['enterprise', 'beta-user'],
            source: 'Website',
            lastContacted: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+0987654321',
            stageId: 'contacted',
            tags: ['small-business'],
            source: 'Referral',
            lastContacted: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob.johnson@example.com',
            stageId: 'qualified',
            tags: ['startup'],
            source: 'Website',
            lastContacted: new Date(Date.now() - 172800000).toISOString()
        }
    ]);

    // Handler to update a lead
    const handleLeadUpdate = useCallback((leadId: string, updates: Partial<Lead>) => {
        setLeads(prevLeads =>
            prevLeads.map(lead =>
                lead.id === leadId ? { ...lead, ...updates } : lead
            )
        );
        // TODO: Make API call to persist changes
        console.log('Lead updated:', leadId, updates);
    }, []);

    // Handler to create a new lead
    const handleLeadCreate = useCallback((newLeadData: Omit<Lead, 'id'>) => {
        const newLead: Lead = {
            id: `${Date.now()}`, // Generate ID
            ...newLeadData
        };
        setLeads(prevLeads => [newLead, ...prevLeads]);
        // TODO: Make API call to persist changes
        console.log('Lead created:', newLead);
    }, []);

    // Handler to delete a lead
    const handleLeadDelete = useCallback((leadId: string) => {
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        // TODO: Make API call to persist changes
        console.log('Lead deleted:', leadId);
    }, []);

    return (
        <div>
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