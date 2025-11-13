import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/types/leadData';
import styles from './LeadManager.module.css';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  onClick: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
  sourceLabel?: string;
}

/**
 * Individual lead card component used in Kanban view
 * Integrates with @dnd-kit for drag-and-drop functionality
 */
const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  isDragging,
  onClick,
  onContextMenu,
  sourceLabel,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  // Combine transform and transition for smooth animations
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Format last contacted date
  const lastContactedDate = new Date(lead.lastContacted);
  const daysSinceContact = Math.floor(
    (Date.now() - lastContactedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.leadCard} ${isDragging || isSortableDragging ? styles.isDragging : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      <div className={styles.leadName}>{lead.name}</div>
      <div className={styles.leadEmail}>{lead.email}</div>
      
      {lead.phone && (
        <div className={styles.leadPhone}>{lead.phone}</div>
      )}

      {(sourceLabel ?? lead.source) && (
        <div className={styles.leadSource}>
          <span className={styles.fieldLabel}>Source:</span> {sourceLabel ?? lead.source}
        </div>
      )}

      <div className={styles.leadLastContact}>
        <span className={styles.fieldLabel}>Last contact:</span>{' '}
        {daysSinceContact === 0
          ? 'Today'
          : daysSinceContact === 1
          ? 'Yesterday'
          : `${daysSinceContact} days ago`}
      </div>

      {lead.tags && lead.tags.length > 0 && (
        <div className={styles.leadTags}>
          {lead.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadCard;