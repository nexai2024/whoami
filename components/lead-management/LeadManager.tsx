import React, { useState, useMemo, useCallback } from 'react';
import { Lead, PipelineStage, LeadManagerProps, ViewMode } from '@/types/leadData';
import KanbanView from './KanbanView';
import ListView from './ListView';
import LeadDetailModal from './LeadDetailModal';
import { useLeadFilters } from './useLeadFilters';
import styles from './LeadManager.module.css';

/**
 * Main LeadManager component
 * Manages view state and filtering while remaining controlled through props
 */
const LeadManager: React.FC<LeadManagerProps> = ({
  stages,
  leads,
  onLeadUpdate,
  onLeadCreate,
  onLeadDelete
}) => {
  // Internal view state
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Use custom hook for filtering logic
  const {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    filteredLeads
  } = useLeadFilters(leads);

  // Get all unique tags from leads
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    leads.forEach(lead => {
      lead.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [leads]);

  // Find selected lead
  const selectedLead = useMemo(() => {
    return leads.find(lead => lead.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Handle lead selection
  const handleLeadSelect = useCallback((leadId: string) => {
    setSelectedLeadId(leadId);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setSelectedLeadId(null);
    setIsCreating(false);
  }, []);

  // Handle lead creation
  const handleCreateLead = useCallback((leadData: Omit<Lead, 'id'>) => {
    onLeadCreate(leadData);
    handleModalClose();
  }, [onLeadCreate, handleModalClose]);

  // Handle lead update
  const handleUpdateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    onLeadUpdate(leadId, updates);
  }, [onLeadUpdate]);

  // Handle lead deletion
  const handleDeleteLead = useCallback((leadId: string) => {
    onLeadDelete(leadId);
    handleModalClose();
  }, [onLeadDelete, handleModalClose]);

  return (
    <div className={styles.container}>
      {/* Header with controls */}
      <div className={styles.header}>
        <h2 className={styles.title}>Lead Manager</h2>
        
        <div className={styles.controls}>
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          {/* Tag filter */}
          <div className={styles.tagFilter}>
            <label>Filter by tags:</label>
            <select
              multiple
              value={selectedTags}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedTags(selected);
              }}
              className={styles.tagSelect}
            >
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'kanban' ? styles.active : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>

          {/* Create lead button */}
          <button
            className={styles.createButton}
            onClick={() => setIsCreating(true)}
          >
            Create Lead
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className={styles.content}>
        {viewMode === 'kanban' ? (
          <KanbanView
            stages={stages}
            leads={filteredLeads}
            onLeadUpdate={handleUpdateLead}
            onLeadSelect={handleLeadSelect}
          />
        ) : (
          <ListView
            stages={stages}
            leads={filteredLeads}
            onLeadUpdate={handleUpdateLead}
            onLeadSelect={handleLeadSelect}
          />
        )}
      </div>

      {/* Lead detail/create modal */}
      {(selectedLead || isCreating) && (
        <LeadDetailModal
          lead={selectedLead}
          stages={stages}
          isCreating={isCreating}
          onUpdate={handleUpdateLead}
          onCreate={handleCreateLead}
          onDelete={handleDeleteLead}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default LeadManager;