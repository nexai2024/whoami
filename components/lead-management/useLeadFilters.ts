import { useState, useMemo, useCallback } from 'react';
import { Lead } from '@/types/leadData';

/**
 * Custom hook to encapsulate lead filtering logic
 * Handles search and tag-based filtering
 */
export const useLeadFilters = (leads: Lead[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Memoized filtered leads based on search term and selected tags
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter - check name and email
      const matchesSearch =
        !searchTerm ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Tag filter - lead must have all selected tags
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => lead.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [leads, searchTerm, selectedTags]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedTags([]);
  }, []);

  // Toggle a tag in the filter
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    selectedTags,
    setSelectedTags,
    filteredLeads,
    clearFilters,
    toggleTag,
  };
};