'use client';

/**
 * Getting Started Checklist Component
 * Shows key tasks for new users
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
}

const CHECKLIST_ITEMS: Omit<ChecklistItem, 'completed'>[] = [
  {
    id: 'create_product',
    title: 'Create your first product',
    description: 'Add a digital product to sell or promote',
    link: '/marketing/products'
  },
  {
    id: 'create_campaign',
    title: 'Generate a marketing campaign',
    description: 'Use AI to create multi-channel content',
    link: '/marketing/campaigns/new'
  },
  {
    id: 'schedule_post',
    title: 'Schedule your first post',
    description: 'Plan content across social platforms',
    link: '/marketing/schedule'
  },
  {
    id: 'create_lead_magnet',
    title: 'Create a lead magnet',
    description: 'Build your email list with valuable content',
    link: '/marketing/lead-magnets'
  },
  {
    id: 'explore_repurpose',
    title: 'Try content repurposing',
    description: 'Transform existing content for different platforms',
    link: '/marketing/repurpose'
  }
];

export default function GettingStartedChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/onboarding', {
        headers: { 'x-user-id': 'demo-user' }
      });
      const data = await response.json();

      const progress = data.checklistProgress || {};
      const checklistItems = CHECKLIST_ITEMS.map(item => ({
        ...item,
        completed: progress[item.id] || false
      }));

      setItems(checklistItems);
    } catch (error) {
      console.error('Error fetching checklist progress:', error);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    setItems(updatedItems);

    // Update progress
    const progress = updatedItems.reduce((acc, item) => {
      acc[item.id] = item.completed;
      return acc;
    }, {} as Record<string, boolean>);

    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({ checklistProgress: progress })
      });

      // Check if all completed
      const allCompleted = updatedItems.every(item => item.completed);
      if (allCompleted) {
        toast.success('Checklist complete! You\'re all set! 🎉');
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = (completedCount / totalCount) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-bold text-gray-900">Getting Started</h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          <button className="text-gray-400">
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pt-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      {isExpanded && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                item.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } transition-colors cursor-pointer`}
              onClick={() => handleToggleItem(item.id)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${item.completed ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                  {item.title}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {item.description}
                </p>
                {!item.completed && item.link && (
                  <a
                    href={item.link}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Start now →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
