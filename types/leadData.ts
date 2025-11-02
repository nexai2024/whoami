/**
 * Core data models for the lead management system
 */

export interface PipelineStage {
    id: string;
    title: string; // e.g., "New", "Contacted", "Qualified", "Won", "Lost"
  }
  
  export interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    stageId: string; // links to PipelineStage.id
    tags?: string[]; // e.g., ["enterprise", "beta-user"]
    source?: string; // e.g., "Website", "Referral"
    lastContacted: string; // ISO date string
  }
  
  export type ViewMode = 'kanban' | 'list';
  
  export interface LeadManagerProps {
    stages: PipelineStage[];
    leads: Lead[];
    onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
    onLeadCreate: (newLeadData: Omit<Lead, 'id'>) => void;
    onLeadDelete: (leadId: string) => void;
  }