"use client";
import React, { useState, useEffect } from 'react';
import { useErrorContext, AppError } from './ErrorContext';
import { checkFeatureClient } from '@/lib/features/checkFeature';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiChevronDown, FiChevronUp, FiMaximize2, FiMinimize2, FiClock, FiFilter, FiSearch, FiCheck, FiEdit3 } = FiIcons;

const ErrorConsole: React.FC = () => {
  const { errors: sessionErrors, clearErrors } = useErrorContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'session' | 'historical'>('session');
  const [historicalErrors, setHistoricalErrors] = useState<AppError[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters for historical view
  const [dateRange, setDateRange] = useState('24h');
  const [errorType, setErrorType] = useState('all');
  const [resolvedFilter, setResolvedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedError, setSelectedError] = useState<AppError | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');

  // Check if user has admin access
  useEffect(() => {
    checkFeatureClient('error_console_admin')
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, []);

  // Use refs to track fetch state and prevent infinite loops
  const fetchingRef = React.useRef(false);
  const lastFetchParamsRef = React.useRef<string>('');

  // Fetch historical errors function - stable and memoized
  const fetchHistoricalErrors = React.useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    
    // Build params string to detect actual changes
    const paramsString = `${dateRange}-${errorType}-${resolvedFilter}-${searchQuery}-${page}`;
    
    // Skip if params haven't changed (use ref to avoid dependency issues)
    if (lastFetchParamsRef.current === paramsString) {
      return;
    }
    
    fetchingRef.current = true;
    lastFetchParamsRef.current = paramsString;
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        dateRange,
        errorType,
        resolved: resolvedFilter,
        search: searchQuery,
        page: page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/errors?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHistoricalErrors(data.errors || []);
        setTotalPages(data.totalPages || 1);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch errors' }));
        console.error('Failed to fetch historical errors:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching historical errors:', error);
    } finally {
      setLoading(false);
      // Reset fetch lock after a delay to allow retries
      setTimeout(() => {
        fetchingRef.current = false;
      }, 1000);
    }
  }, [dateRange, errorType, resolvedFilter, searchQuery, page]);

  // Fetch historical errors when in historical mode - with proper debouncing
  useEffect(() => {
    if (!isAdmin || viewMode !== 'historical') {
      // Reset when switching away from historical view
      if (viewMode === 'session') {
        setHistoricalErrors([]);
        setPage(1);
      }
      return;
    }
    
    // Debounce fetch to prevent rapid successive calls
    const timeoutId = setTimeout(() => {
      fetchHistoricalErrors();
    }, 800);
    
    return () => clearTimeout(timeoutId);
  }, [isAdmin, viewMode, fetchHistoricalErrors]);

  const handleResolve = async (errorId: string, resolved: boolean) => {
    try {
      const response = await fetch(`/api/errors/${errorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved }),
      });

      if (response.ok && viewMode === 'historical') {
        // Refresh historical errors only if in historical mode, with delay to prevent rapid calls
        setTimeout(() => {
          lastFetchParamsRef.current = ''; // Force refresh
          fetchHistoricalErrors();
        }, 500);
      }
    } catch (error) {
      console.error('Error updating error status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedError || !notes.trim()) return;

    try {
      const response = await fetch(`/api/errors/${selectedError.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setShowNotesModal(false);
        setNotes('');
        setSelectedError(null);
        if (viewMode === 'historical') {
          setTimeout(() => {
            lastFetchParamsRef.current = ''; // Force refresh
            fetchHistoricalErrors();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const displayErrors = viewMode === 'session' ? sessionErrors : historicalErrors;

  // Don't show console if no errors and not admin
  if (displayErrors.length === 0 && !isAdmin) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed bottom-4 right-4 z-50 bg-white border border-red-300 shadow-lg rounded-lg overflow-hidden transition-all ${
          expanded ? 'w-1/2 h-2/3' : 'w-96'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-red-100 px-4 py-2 border-b border-red-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-red-700">
              Error Console {isAdmin && '(Admin)'}
            </span>
            {displayErrors.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {displayErrors.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-red-600 hover:text-red-800 p-1"
                title={expanded ? 'Minimize' : 'Maximize'}
              >
                {expanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              </button>
            )}
            <button
              onClick={clearErrors}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 space-y-3">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('session')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'session'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Current Session
              </button>
              <button
                onClick={() => setViewMode('historical')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'historical'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Historical Errors
              </button>
            </div>

            {/* Filters (only for historical view) */}
            {viewMode === 'historical' && (
              <div className="space-y-2">
                {/* Date Range */}
                <div className="flex gap-2">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="all">All time</option>
                  </select>

                  <select
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    <option value="runtime">Runtime</option>
                    <option value="boundary">Boundary</option>
                    <option value="api">API</option>
                    <option value="validation">Validation</option>
                  </select>

                  <select
                    value={resolvedFilter}
                    onChange={(e) => setResolvedFilter(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="false">Unresolved</option>
                    <option value="true">Resolved</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by message, URL, or email..."
                    className="w-full pl-9 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error List */}
        <div className={`overflow-y-auto divide-y divide-red-100 ${expanded ? 'h-full' : 'max-h-80'}`}>
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              Loading errors...
            </div>
          ) : displayErrors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {viewMode === 'session' ? 'No errors in current session' : 'No errors found'}
            </div>
          ) : (
            displayErrors.map((err) => (
              <div key={err.id} className="p-3 text-sm hover:bg-gray-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-red-600 truncate">{err.message}</div>

                    {/* Error metadata */}
                    <div className="mt-1 space-y-1">
                      {err.context && (
                        <div className="text-gray-600 text-xs">
                          <span className="font-medium">Context:</span> {err.context}
                        </div>
                      )}
                      {err.errorType && (
                        <div className="text-gray-600 text-xs">
                          <span className="font-medium">Type:</span>{' '}
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            err.errorType === 'boundary' ? 'bg-red-100 text-red-700' :
                            err.errorType === 'api' ? 'bg-blue-100 text-blue-700' :
                            err.errorType === 'validation' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {err.errorType}
                          </span>
                        </div>
                      )}
                      {viewMode === 'historical' && err.userEmail && (
                        <div className="text-gray-600 text-xs">
                          <span className="font-medium">User:</span> {err.userEmail}
                          {err.userPlan && ` (${err.userPlan})`}
                        </div>
                      )}
                      {err.url && (
                        <div className="text-gray-600 text-xs truncate">
                          <span className="font-medium">URL:</span> {err.url}
                        </div>
                      )}
                      {viewMode === 'historical' && err.resolved && (
                        <div className="text-green-600 text-xs flex items-center gap-1">
                          <FiCheck size={12} /> Resolved
                          {err.resolvedAt && ` on ${new Date(err.resolvedAt).toLocaleDateString()}`}
                        </div>
                      )}
                      {err.notes && (
                        <div className="text-gray-600 text-xs">
                          <span className="font-medium">Notes:</span> {err.notes}
                        </div>
                      )}
                    </div>

                    {err.stack && (
                      <details className="text-xs text-gray-400 mt-2">
                        <summary className="cursor-pointer hover:text-gray-600">Stack trace</summary>
                        <pre className="mt-1 text-xs overflow-x-auto bg-gray-100 p-2 rounded">{err.stack}</pre>
                      </details>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      {typeof err.time === 'string' ? new Date(err.time).toLocaleString() : err.time.toLocaleString()}
                    </div>
                  </div>

                  {/* Admin actions */}
                  {isAdmin && viewMode === 'historical' && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setSelectedError(err);
                          setShowDetailsModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-xs px-2 py-1 border border-indigo-300 rounded hover:bg-indigo-50"
                        title="View full details"
                      >
                        Details
                      </button>
                      {!err.resolved && (
                        <button
                          onClick={() => handleResolve(err.id, true)}
                          className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                          title="Mark as resolved"
                        >
                          Resolve
                        </button>
                      )}
                      {err.resolved && (
                        <button
                          onClick={() => handleResolve(err.id, false)}
                          className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          title="Mark as unresolved"
                        >
                          Unresolve
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedError(err);
                          setNotes(err.notes || '');
                          setShowNotesModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                        title="Add/edit notes"
                      >
                        <FiEdit3 size={12} className="inline" /> Note
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination (for historical view) */}
        {isAdmin && viewMode === 'historical' && totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-red-100 px-6 py-4 border-b border-red-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-red-700">Error Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Message</h4>
                  <p className="text-gray-900">{selectedError.message}</p>
                </div>

                {selectedError.errorType && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Type</h4>
                    <p className="text-gray-900">{selectedError.errorType}</p>
                  </div>
                )}

                {selectedError.url && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">URL</h4>
                    <p className="text-gray-900 break-all">{selectedError.url}</p>
                  </div>
                )}

                {selectedError.userAgent && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">User Agent</h4>
                    <p className="text-gray-900 text-sm">{selectedError.userAgent}</p>
                  </div>
                )}

                {selectedError.stack && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Stack Trace</h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">{selectedError.stack}</pre>
                  </div>
                )}

                {selectedError.componentStack && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Component Stack</h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">{selectedError.componentStack}</pre>
                  </div>
                )}

                {selectedError.userEmail && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">User</h4>
                    <p className="text-gray-900">{selectedError.userEmail} {selectedError.userPlan && `(${selectedError.userPlan})`}</p>
                  </div>
                )}

                {selectedError.context && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Context</h4>
                    <p className="text-gray-900">{selectedError.context}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {showNotesModal && selectedError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setShowNotesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Add/Edit Notes</h3>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes for: {selectedError.message}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add resolution notes, fix details, or other relevant information..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ErrorConsole;
