import React, { useState, useEffect, useCallback } from 'react';
import { Lead, PipelineStage, LeadCreateInput } from '@/types/leadData';
import styles from './LeadManager.module.css';
import RichTextEditor from '@/components/common/RichTextEditor';
import DOMPurify from 'isomorphic-dompurify';
import { isRichTextEmpty } from '@/lib/utils/richText';

interface LeadDetailModalProps {
  lead: Lead | null;
  stages: PipelineStage[];
  isCreating: boolean;
  startInEditMode?: boolean;
  sourceLabels?: Record<string, string>;
  onUpdate: (leadId: string, updates: Partial<Lead>) => Promise<void> | void;
  onCreate: (leadData: LeadCreateInput) => Promise<void> | void;
  onDelete: (leadId: string) => Promise<void> | void;
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
  startInEditMode = false,
  sourceLabels,
  onUpdate,
  onCreate,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(isCreating || startInEditMode);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    stageId: stages[0]?.id || '',
    tags: [],
    source: '',
    lastContacted: new Date().toISOString().split('T')[0],
    company: '',
    notes: '',
    estimatedValue: undefined,
  });
  const [newTag, setNewTag] = useState('');

  // Initialize form data when lead or initial state changes
  useEffect(() => {
    setIsEditing(isCreating || startInEditMode);

    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        stageId: lead.stageId,
        tags: lead.tags || [],
        source: lead.source || '',
        lastContacted: (lead.lastContacted || new Date().toISOString()).split('T')[0], // Convert to date input format
        company: lead.company || '',
        notes: lead.notes || '',
        estimatedValue: typeof lead.estimatedValue === 'number' ? lead.estimatedValue : undefined,
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
        company: '',
        notes: '',
        estimatedValue: undefined,
      });
    }
  }, [lead, isCreating, startInEditMode, stages]);

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
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    const leadData: LeadCreateInput = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      stageId: formData.stageId!,
      tags: formData.tags,
      source: formData.source,
      lastContacted: formData.lastContacted ? `${formData.lastContacted}T00:00:00.000Z` : new Date().toISOString(),
      company: formData.company,
      notes: formData.notes,
      estimatedValue:
        typeof formData.estimatedValue === 'number'
          ? formData.estimatedValue
          : formData.estimatedValue == null
          ? null
          : Number(formData.estimatedValue),
    };

    try {
      if (isCreating) {
        await onCreate(leadData);
      } else if (lead) {
        await onUpdate(lead.id, leadData);
        setIsEditing(false);
      }
    } catch (submissionError) {
      console.error('Error saving lead:', submissionError);
      return;
    }
  }, [formData, isCreating, lead, onCreate, onUpdate]);

  // Handle delete confirmation
  const handleDelete = useCallback(async () => {
    if (lead && window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await onDelete(lead.id);
      } catch (deleteError) {
        console.error('Error deleting lead:', deleteError);
      }
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
                <div className={styles.fieldValue}>
                  {formData.source
                    ? sourceLabels?.[formData.source] ?? formData.source
                    : '-'}
                </div>
              )}
              {isEditing && formData.source && sourceLabels?.[formData.source] && (
                <div className={styles.helperText}>
                  Display name: {sourceLabels[formData.source]}
                </div>
              )}
            </div>

            {/* Company field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Company</label>
              {isEditing || isCreating ? (
                <input
                  type="text"
                  className={styles.formInput}
                  value={formData.company || ''}
                  onChange={(e) => handleFieldChange('company', e.target.value)}
                />
              ) : (
                <div className={styles.fieldValue}>{formData.company || '-'}</div>
              )}
            </div>

            {/* Estimated value field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estimated Value</label>
              {isEditing || isCreating ? (
                <input
                  type="number"
                  className={styles.formInput}
                  value={
                    typeof formData.estimatedValue === 'number' && !Number.isNaN(formData.estimatedValue)
                      ? formData.estimatedValue
                      : formData.estimatedValue ?? ''
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      'estimatedValue',
                      e.target.value === '' ? undefined : Number(e.target.value)
                    )
                  }
                  min={0}
                />
              ) : (
                <div className={styles.fieldValue}>
                  {typeof formData.estimatedValue === 'number' && !Number.isNaN(formData.estimatedValue)
                    ? `$${formData.estimatedValue.toLocaleString()}`
                    : '-'}
                </div>
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

            {/* Notes field */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notes</label>
              {isEditing || isCreating ? (
                <RichTextEditor
                  value={formData.notes || ''}
                  onChange={(content) => handleFieldChange('notes', content)}
                  placeholder="Add detailed notes about this lead..."
                />
              ) : (
                <div className={`${styles.fieldValue} ${styles.richTextPreview}`}>
                  {!isRichTextEmpty(formData.notes) ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(formData.notes ?? ''),
                      }}
                    />
                  ) : (
                    <span className={styles.placeholder}>-</span>
                  )}
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
                            lastContacted: (lead.lastContacted || new Date().toISOString()).split('T')[0],
                            company: lead.company || '',
                            notes: lead.notes || '',
                            estimatedValue: typeof lead.estimatedValue === 'number' ? lead.estimatedValue : undefined,
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