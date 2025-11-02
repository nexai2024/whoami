import React, { useState, useEffect, useCallback } from 'react';
import { Lead, PipelineStage } from '@/types/leadData';
import styles from './LeadManager.module.css';

interface LeadDetailModalProps {
  lead: Lead | null;
  stages: PipelineStage[];
  isCreating: boolean;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onCreate: (leadData: Omit<Lead, 'id'>) => void;
  onDelete: (leadId: string) => void;
  onClose: () => void;
}

/**
 * Modal component for creating, viewing, and editing lead details
 * Supports both controlled form inputs and tag management
 */
const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  stages,
  isCreating,
  onUpdate,
  onCreate,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(isCreating);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    stageId: stages[0]?.id || '',
    tags: [],
    source: '',
    lastContacted: new Date().toISOString().split('T')[0],
  });
  const [newTag, setNewTag] = useState('');

  // Initialize form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        stageId: lead.stageId,
        tags: lead.tags || [],
        source: lead.source || '',
        lastContacted: lead.lastContacted.split('T')[0], // Convert to date input format
      });
    } else if (isCreating) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        stageId: stages[0]?.id || '',
        tags: [],
        source: '',
        lastContacted: new Date().toISOString().split('T')[0],
      });
    }
  }, [lead, isCreating, stages]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Add a new tag
  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  // Remove a tag
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    const leadData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      stageId: formData.stageId!,
      tags: formData.tags,
      source: formData.source,
      lastContacted: formData.lastContacted ? `${formData.lastContacted}T00:00:00.000Z` : new Date().toISOString(),
    };

    if (isCreating) {
      onCreate(leadData as Omit<Lead, 'id'>);
    } else if (lead) {
      onUpdate(lead.id, leadData);
      setIsEditing(false);
    }
  }, [formData, isCreating, lead, onCreate, onUpdate]);

  // Handle delete confirmation
  const handleDelete = useCallback(() => {
    if (lead && window.confirm('Are you sure you want to delete this lead?')) {
      onDelete(lead.id);
    }
  }, [lead, onDelete]);

  // Modal title based on state
  const modalTitle = isCreating ? 'Create New Lead' : isEditing ? 'Edit Lead' : 'Lead Details';

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{modalTitle}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit}>
            {/* Name field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Name *</label>
              {isEditing || isCreating ? (
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  required
                />
              ) : (
                <div className={styles.fieldValue}>{formData.name}</div>
              )}
            </div>

            {/* Email field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email *</label>
              {isEditing || isCreating ? (
                <input
                  type="email"
                  className={styles.formInput}
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  required
                />
              ) : (
                <div className={styles.fieldValue}>{formData.email}</div>
              )}
            </div>

            {/* Phone field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone</label>
              {isEditing || isCreating ? (
                <input
                  type="tel"
                  className={styles.formInput}
                  value={formData.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                />
              ) : (
                <div className={styles.fieldValue}>{formData.phone || '-'}</div>
              )}
            </div>

            {/* Stage field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Stage</label>
              {isEditing || isCreating ? (
                <select
                  className={styles.formSelect}
                  value={formData.stageId}
                  onChange={(e) => handleFieldChange('stageId', e.target.value)}
                >
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.title}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={styles.fieldValue}>
                  {stages.find(s => s.id === formData.stageId)?.title || '-'}
                </div>
              )}
            </div>

            {/* Source field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Source</label>
              {isEditing || isCreating ? (
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.source}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  placeholder="e.g., Website, Referral"
                />
              ) : (
                <div className={styles.fieldValue}>{formData.source || '-'}</div>
              )}
            </div>

            {/* Last contacted field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Last Contacted</label>
              {isEditing || isCreating ? (
                <input
                  type="date"
                  className={styles.formInput}
                  value={formData.lastContacted?.split('T')[0]}
                  onChange={(e) => handleFieldChange('lastContacted', e.target.value)}
                />
              ) : (
                <div className={styles.fieldValue}>
                  {formData.lastContacted ? new Date(formData.lastContacted).toLocaleDateString() : '-'}
                </div>
              )}
            </div>

            {/* Tags field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tags</label>
              {isEditing || isCreating ? (
                <>
                  <div className={styles.tagInput}>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      className={styles.addTagButton}
                      onClick={handleAddTag}
                    >
                      Add
                    </button>
                  </div>
                  <div className={styles.existingTags}>
                    {formData.tags?.map((tag, index) => (
                      <span key={index} className={styles.tagWithRemove}>
                        <span className={styles.tag}>{tag}</span>
                        <button
                          type="button"
                          className={styles.removeTagButton}
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.existingTags}>
                  {formData.tags && formData.tags.length > 0 ? (
                    formData.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))
                  ) : (
                    <span style={{ color: '#999' }}>No tags</span>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className={styles.modalActions}>
              {isEditing || isCreating ? (
                <>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                  >
                    {isCreating ? 'Create Lead' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      if (isCreating) {
                        onClose();
                      } else {
                        setIsEditing(false);
                        // Reset form data to original lead data
                        if (lead) {
                          setFormData({
                            name: lead.name,
                            email: lead.email,
                            phone: lead.phone || '',
                            stageId: lead.stageId,
                            tags: lead.tags || [],
                            source: lead.source || '',
                            lastContacted: lead.lastContacted.split('T')[0],
                          });
                        }
                      }
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={onClose}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;