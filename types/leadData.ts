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
  company?: string;
  notes?: string;
  estimatedValue?: number | null;
  pageId?: string;
  pageType?: string;
  createdAt: string;
  lastActivity?: string;
}

export type LeadCreateInput = Omit<Lead, 'id' | 'createdAt'>;

export type ViewMode = 'kanban' | 'list';

export interface LeadManagerProps {
  stages: PipelineStage[];
  leads: Lead[];
  sourceLabels?: Record<string, string>;
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void> | void;
  onLeadCreate: (newLeadData: LeadCreateInput) => Promise<void> | void;
  onLeadDelete: (leadId: string) => Promise<void> | void;
}