import React, { useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  Active,
  Over,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Lead, PipelineStage } from '@/types/leadData';
import LeadCard from './LeadCard';
import styles from './LeadManager.module.css';

interface KanbanViewProps {
  stages: PipelineStage[];
  leads: Lead[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onLeadSelect: (leadId: string) => void;
}

/**
 * Kanban board view with drag-and-drop functionality
 * Uses @dnd-kit for modern, accessible drag-and-drop
 */
const KanbanView: React.FC<KanbanViewProps> = ({
  stages,
  leads,
  onLeadUpdate,
  onLeadSelect,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  // Configure drag sensors for better UX
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px drag before activating
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group leads by stage
  const leadsByStage = React.useMemo(() => {
    const grouped = new Map<string, Lead[]>();
    stages.forEach(stage => grouped.set(stage.id, []));
    leads.forEach(lead => {
      const stageLeads = grouped.get(lead.stageId) || [];
      stageLeads.push(lead);
      grouped.set(lead.stageId, stageLeads);
    });
    return grouped;
  }, [leads, stages]);

  // Find the active lead being dragged
  const activeLead = React.useMemo(
    () => leads.find(lead => lead.id === activeId),
    [leads, activeId]
  );

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag over (for visual feedback)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string | null);
  }, []);

  // Handle drag end - update lead stage
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const leadId = active.id as string;
    const targetStageId = over.id as string;
    const lead = leads.find(l => l.id === leadId);

    if (lead && lead.stageId !== targetStageId && stages.some(s => s.id === targetStageId)) {
      // Update the lead's stage
      onLeadUpdate(leadId, { stageId: targetStageId });
    }

    setActiveId(null);
    setOverId(null);
  }, [leads, stages, onLeadUpdate]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.kanbanContainer}>
        {stages.map((stage) => {
          const stageLeads = leadsByStage.get(stage.id) || [];
          const isDraggingOver = overId === stage.id;

          return (
            <div key={stage.id} className={styles.stageColumn}>
              <div className={styles.stageHeader}>
                <h3 className={styles.stageTitle}>{stage.title}</h3>
                <div className={styles.leadCount}>{stageLeads.length} leads</div>
              </div>
              
              <div className={styles.stageContent}>
                <SortableContext
                  id={stage.id}
                  items={stageLeads.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className={`${styles.dropzone} ${isDraggingOver ? styles.isDraggingOver : ''}`}
                    // Make the stage droppable by giving it the stage ID
                    data-droppable-id={stage.id}
                  >
                    {stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        isDragging={activeId === lead.id}
                        onClick={() => onLeadSelect(lead.id)}
                      />
                    ))}
                    
                    {/* Empty state */}
                    {stageLeads.length === 0 && !isDraggingOver && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                        No leads in this stage
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag overlay for better visual feedback */}
      <DragOverlay>
        {activeLead && (
          <div style={{ opacity: 0.8, transform: 'rotate(3deg)' }}>
            <LeadCard lead={activeLead} isDragging={true} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanView;