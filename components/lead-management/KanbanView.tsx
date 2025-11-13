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
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead, PipelineStage } from '@/types/leadData';
import LeadCard from './LeadCard';
import styles from './LeadManager.module.css';

interface KanbanViewProps {
  stages: PipelineStage[];
  leads: Lead[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void> | void;
  onLeadSelect: (leadId: string) => void;
  onLeadContextMenu: (lead: Lead, position: { x: number; y: number }) => void;
  sourceLabels?: Record<string, string>;
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
  onLeadContextMenu,
  sourceLabels,
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
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setOverId(null);

      if (!over) {
        return;
      }

      const activeLead = leads.find((lead) => lead.id === active.id);
      if (!activeLead) {
        return;
      }

      let targetStageId: string | undefined;

      const overData = over.data.current as
        | {
            type?: 'lead' | 'column';
            containerId?: string;
            sortable?: {
              containerId?: string;
            };
          }
        | undefined;

      if (overData?.type === 'column') {
        targetStageId = over.id as string;
      } else if (overData?.sortable?.containerId) {
        targetStageId = overData.sortable.containerId;
      } else if (overData?.containerId) {
        targetStageId = overData.containerId;
      } else if (typeof over.id === 'string') {
        const targetLead = leads.find((lead) => lead.id === over.id);
        targetStageId = targetLead?.stageId ?? (over.id as string);
      }

      if (!targetStageId || targetStageId === activeLead.stageId) {
        return;
      }

      if (!stages.some((stage) => stage.id === targetStageId)) {
        return;
      }

      await onLeadUpdate(activeLead.id, { stageId: targetStageId });
    },
    [leads, stages, onLeadUpdate]
  );

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
          const { setNodeRef: setStageRef, isOver: isStageOver } = useDroppable({
            id: stage.id,
            data: { type: 'column', stageId: stage.id },
          });
          const isDraggingOver = isStageOver || overId === stage.id;

          return (
            <div key={stage.id} className={styles.stageColumn}>
              <div className={styles.stageHeader}>
                <h3 className={styles.stageTitle}>{stage.title}</h3>
                <div className={styles.leadCount}>{stageLeads.length} leads</div>
              </div>

              <div className={styles.stageContent}>
                <SortableContext
                  id={stage.id}
                  items={stageLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    ref={setStageRef}
                    className={`${styles.dropzone} ${isDraggingOver ? styles.isDraggingOver : ''}`}
                  >
                    {stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        isDragging={activeId === lead.id}
                        onClick={() => onLeadSelect(lead.id)}
                        onContextMenu={(event) =>
                          onLeadContextMenu(lead, { x: event.clientX, y: event.clientY })
                        }
                        sourceLabel={
                          lead.source ? sourceLabels?.[lead.source] ?? lead.source : undefined
                        }
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
            <LeadCard
              lead={activeLead}
              isDragging={true}
              onClick={() => {}}
              sourceLabel={
                activeLead.source
                  ? sourceLabels?.[activeLead.source] ?? activeLead.source
                  : undefined
              }
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanView;