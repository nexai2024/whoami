"use client";

import React, { useState } from 'react';
import { useTour } from '@/lib/tours/TourProvider';
import { tours, Tour } from '@/lib/tours/tourConfig';
import { FiHelpCircle, FiX, FiCheck, FiClock, FiPlay, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export const HelpButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startTour, tourProgress } = useTour();

  const handleStartTour = (tourId: string) => {
    setIsModalOpen(false);
    startTour(tourId);
  };

  const getTourStatus = (tourId: string) => {
    const progress = tourProgress[tourId];
    return progress?.completed ? 'completed' : 'not_started';
  };

  const getUncompleteCount = () => {
    return tours.filter(tour => {
      const status = getTourStatus(tour.id);
      return status !== 'completed';
    }).length;
  };

  const toursByCategory = {
    getting_started: tours.filter(t => t.category === 'getting_started'),
    marketing: tours.filter(t => t.category === 'marketing'),
    advanced: tours.filter(t => t.category === 'advanced'),
  };

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-[9997] bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 group"
        aria-label="Open help and tours"
      >
        <FiHelpCircle size={24} />

        {/* Badge showing uncompleted tours */}
        {getUncompleteCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {getUncompleteCount()}
          </span>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Help & Tours
        </div>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                data-tour-id="help-modal-content"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Help & Guided Tours</h2>
                    <p className="text-indigo-100 text-sm">
                      Learn how to use features with interactive walkthroughs
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-indigo-200 transition-colors p-2"
                    aria-label="Close modal"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="px-8 py-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  {/* Getting Started Tours */}
                  <section className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Getting Started
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {toursByCategory.getting_started.map((tour) => (
                        <TourCard
                          key={tour.id}
                          tour={tour}
                          status={getTourStatus(tour.id)}
                          onStart={() => handleStartTour(tour.id)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Marketing Tours */}
                  <section className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Marketing Features
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {toursByCategory.marketing.map((tour) => (
                        <TourCard
                          key={tour.id}
                          tour={tour}
                          status={getTourStatus(tour.id)}
                          onStart={() => handleStartTour(tour.id)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Advanced Tours */}
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Advanced
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {toursByCategory.advanced.map((tour) => (
                        <TourCard
                          key={tour.id}
                          tour={tour}
                          status={getTourStatus(tour.id)}
                          onStart={() => handleStartTour(tour.id)}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

type TourCardProps = {
  tour: Tour;
  status: 'completed' | 'not_started';
  onStart: () => void;
};

const TourCard: React.FC<TourCardProps> = ({ tour, status, onStart }) => {
  const isCompleted = status === 'completed';

  return (
    <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200 hover:border-indigo-300 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{tour.name}</h4>
            {status === 'not_started' && (
              <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{tour.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FiClock size={12} />
              {tour.estimatedMinutes} min
            </span>
            <span className="flex items-center gap-1">
              {tour.steps.length} steps
            </span>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0 ml-3">
            <FiCheck className="text-green-600" size={16} />
          </div>
        )}
      </div>

      <button
        onClick={onStart}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isCompleted
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isCompleted ? (
          <>
            <FiRefreshCw size={16} />
            <span>Replay Tour</span>
          </>
        ) : (
          <>
            <FiPlay size={16} />
            <span>Start Tour</span>
          </>
        )}
      </button>
    </div>
  );
};
