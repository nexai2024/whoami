import React, { useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Lead, PipelineStage } from '@/types/leadData';
import styles from './LeadManager.module.css';

interface ListViewProps {
  stages: PipelineStage[];
  leads: Lead[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onLeadSelect: (leadId: string) => void;
  onLeadContextMenu: (lead: Lead, position: { x: number; y: number }) => void;
  sourceLabels?: Record<string, string>;
}

interface RowData {
  leads: Lead[];
  stages: PipelineStage[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onLeadSelect: (leadId: string) => void;
  onLeadContextMenu: (lead: Lead, position: { x: number; y: number }) => void;
  sourceLabels?: Record<string, string>;
}

/**
 * Virtualized list view for efficient rendering of large lead lists
 * Uses react-window for performance optimization
 */
const ListView: React.FC<ListViewProps> = ({
  stages,
  leads,
  onLeadUpdate,
  onLeadSelect,
  onLeadContextMenu,
  sourceLabels,
}) => {
  // Row renderer for virtualized list
  const Row = useCallback(({ index, style, data }: { index: number; style: React.CSSProperties; data: RowData }) => {
    const lead = data.leads[index];
    const resolvedSource =
      lead.source ? data.sourceLabels?.[lead.source] ?? lead.source : undefined;
    
    const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      e.stopPropagation(); // Prevent row click
      data.onLeadUpdate(lead.id, { stageId: e.target.value });
    };

    return (
      <div
        style={style}
        className={styles.tableRow}
        onClick={() => data.onLeadSelect(lead.id)}
        onContextMenu={(event) => {
          event.preventDefault();
          data.onLeadContextMenu(lead, { x: event.clientX, y: event.clientY });
        }}
      >
        <div className={styles.columnName}>{lead.name}</div>
        <div className={styles.columnEmail}>{lead.email}</div>
        <div className={styles.columnPhone}>{lead.phone || '-'}</div>
        <div className={styles.columnStage}>
          <select
            className={styles.stageDropdown}
            value={lead.stageId}
            onChange={handleStageChange}
            onClick={(e) => e.stopPropagation()} // Prevent row click when clicking dropdown
          >
            {data.stages.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.title}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.columnTags}>
          {lead.tags && lead.tags.length > 0 ? (
            <div className={styles.leadTags}>
              {lead.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>{tag}</span>
              ))}
            </div>
          ) : (
            <span style={{ color: '#999' }}>-</span>
          )}
        </div>
        <div className={styles.columnSource}>
          {resolvedSource || <span style={{ color: '#999' }}>-</span>}
        </div>
      </div>
    );
  }, []);

  // Data object for row renderer
  const itemData: RowData = {
    leads,
    stages,
    onLeadUpdate,
    onLeadSelect,
    onLeadContextMenu,
    sourceLabels,
  };

  // Calculate list height (subtract header height)
  const listHeight = window.innerHeight - 200; // Adjust based on your layout

  return (
    <div className={styles.listContainer}>
      {/* Table header */}
      <div className={styles.tableHeader}>
        <div className={styles.columnName}>Name</div>
        <div className={styles.columnEmail}>Email</div>
        <div className={styles.columnPhone}>Phone</div>
        <div className={styles.columnStage}>Stage</div>
        <div className={styles.columnTags}>Tags</div>
        <div className={styles.columnSource}>Source</div>
      </div>

      {/* Virtualized list body */}
      {leads.length > 0 ? (
        <List
          height={listHeight}
          itemCount={leads.length}
          itemSize={60} // Row height in pixels
          width="100%"
          itemData={itemData}
        >
          {Row}
        </List>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
          No leads found
        </div>
      )}
    </div>
  );
};

export default ListView;