import React, { useState, useMemo, useCallback } from 'react';
import { Lead, PipelineStage, LeadManagerProps, ViewMode, LeadCreateInput } from '@/types/leadData';
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
  sourceLabels,
  onLeadUpdate,
  onLeadCreate,
  onLeadDelete
}) => {
  // Internal view state
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    lead: Lead;
    position: { x: number; y: number };
  } | null>(null);

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
    setStartInEditMode(false);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setSelectedLeadId(null);
    setIsCreating(false);
    setStartInEditMode(false);
  }, []);

  // Handle lead creation
  const handleCreateLead = useCallback(async (leadData: LeadCreateInput) => {
    await onLeadCreate(leadData);
    handleModalClose();
  }, [onLeadCreate, handleModalClose]);

  // Handle lead update
  const handleUpdateLead = useCallback(
    (leadId: string, updates: Partial<Lead>) => {
      try {
        const result = onLeadUpdate(leadId, updates);
        if (result && typeof (result as Promise<unknown>).catch === 'function') {
          return (result as Promise<unknown>).catch((error) => {
            console.error('Error updating lead from LeadManager:', error);
          });
        }
        return result;
      } catch (error) {
        console.error('Error updating lead from LeadManager:', error);
        throw error;
      }
    },
    [onLeadUpdate]
  );

  // Handle lead deletion
  const handleDeleteLead = useCallback(async (leadId: string) => {
    await onLeadDelete(leadId);
    handleModalClose();
  }, [onLeadDelete, handleModalClose]);

  const handleContextMenu = useCallback(
    (lead: Lead, position: { x: number; y: number }) => {
      setContextMenu({ lead, position });
    },
    []
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleQuickEdit = useCallback(
    (leadId: string) => {
      setSelectedLeadId(leadId);
      setStartInEditMode(true);
      closeContextMenu();
    },
    [closeContextMenu]
  );

  const handleQuickMoveToStage = useCallback(
    (leadId: string, stageId: string) => {
      closeContextMenu();
      handleUpdateLead(leadId, { stageId });
    },
    [closeContextMenu, handleUpdateLead]
  );

  const handleQuickDelete = useCallback(
    (leadId: string) => {
      closeContextMenu();
      handleDeleteLead(leadId);
    },
    [closeContextMenu, handleDeleteLead]
  );

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
            onLeadContextMenu={handleContextMenu}
            sourceLabels={sourceLabels}
          />
        ) : (
          <ListView
            stages={stages}
            leads={filteredLeads}
            onLeadUpdate={handleUpdateLead}
            onLeadSelect={handleLeadSelect}
            onLeadContextMenu={handleContextMenu}
            sourceLabels={sourceLabels}
          />
        )}
      </div>

      {contextMenu && (
        <div
          className={styles.contextMenuBackdrop}
          onClick={closeContextMenu}
          onContextMenu={(e) => {
            e.preventDefault();
            closeContextMenu();
          }}
        >
          <div
            className={styles.contextMenu}
            style={{ top: contextMenu.position.y, left: contextMenu.position.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <button
              className={styles.contextMenuItem}
              onClick={() => {
                handleLeadSelect(contextMenu.lead.id);
                closeContextMenu();
              }}
            >
              View Details
            </button>
            <button
              className={styles.contextMenuItem}
              onClick={() => handleQuickEdit(contextMenu.lead.id)}
            >
              Edit Lead
            </button>
            <div className={styles.contextMenuGroup}>
              <div className={styles.contextMenuGroupLabel}>Move to stage</div>
              {stages.map((stage) => (
                <button
                  key={stage.id}
                  className={styles.contextMenuSubItem}
                  onClick={() => handleQuickMoveToStage(contextMenu.lead.id, stage.id)}
                >
                  {stage.title}
                </button>
              ))}
            </div>
            <button
              className={`${styles.contextMenuItem} ${styles.contextMenuDanger}`}
              onClick={() => handleQuickDelete(contextMenu.lead.id)}
            >
              Delete Lead
            </button>
          </div>
        </div>
      )}

      {/* Lead detail/create modal */}
      {(selectedLead || isCreating) && (
        <LeadDetailModal
          lead={selectedLead}
          stages={stages}
          isCreating={isCreating}
          startInEditMode={startInEditMode}
          onUpdate={handleUpdateLead}
          onCreate={handleCreateLead}
          onDelete={handleDeleteLead}
          onClose={handleModalClose}
          sourceLabels={sourceLabels}
        />
      )}
    </div>
  );
};

export default LeadManager;