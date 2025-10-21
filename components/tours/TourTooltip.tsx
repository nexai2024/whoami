"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useTour } from '@/lib/tours/TourProvider';
import { FiX, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

export const TourTooltip: React.FC = () => {
  const { currentTour, currentStep, isActive, nextStep, prevStep, completeTour, skipTour } = useTour();
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !currentTour) {
      setHighlightedElement(null);
      setTooltipPosition(null);
      return;
    }

    const step = currentTour.steps[currentStep];
    if (!step) return;

    // Find the target element
    const targetElement = document.querySelector(`[data-tour-id="${step.target}"]`) as HTMLElement;
    if (!targetElement) {
      console.warn(`Tour target element not found: ${step.target}`);
      return;
    }

    setHighlightedElement(targetElement);

    // Scroll element into view
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Calculate tooltip position
    const calculatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 400;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 200;
      const padding = 16;

      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'top':
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          break;
        default:
          // Default to bottom
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
      }

      // Ensure tooltip stays within viewport
      const maxLeft = window.innerWidth - tooltipWidth - padding;
      const maxTop = window.innerHeight - tooltipHeight - padding;
      left = Math.max(padding, Math.min(left, maxLeft));
      top = Math.max(padding, Math.min(top, maxTop));

      setTooltipPosition({ top, left });
    };

    // Calculate initially and on resize
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isActive, currentTour, currentStep]);

  if (!isActive || !currentTour || !tooltipPosition) {
    return null;
  }

  const step = currentTour.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === currentTour.steps.length - 1;
  const totalSteps = currentTour.steps.length;

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background: highlightedElement
            ? `radial-gradient(circle at ${highlightedElement.getBoundingClientRect().left + highlightedElement.getBoundingClientRect().width / 2}px ${highlightedElement.getBoundingClientRect().top + highlightedElement.getBoundingClientRect().height / 2}px, transparent 0px, transparent ${Math.max(highlightedElement.getBoundingClientRect().width, highlightedElement.getBoundingClientRect().height) / 2 + 20}px, rgba(0, 0, 0, 0.6) ${Math.max(highlightedElement.getBoundingClientRect().width, highlightedElement.getBoundingClientRect().height) / 2 + 60}px)`
            : 'rgba(0, 0, 0, 0.6)',
        }}
      />

      {/* Highlighted element outline */}
      {highlightedElement && (
        <div
          className={`fixed border-4 border-indigo-500 rounded-lg z-[9999] pointer-events-none transition-all duration-300 ${
            step.highlightPulse ? 'animate-pulse' : ''
          }`}
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] pointer-events-auto animate-fadeIn"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          maxWidth: '400px',
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border-2 border-indigo-500 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <button
              onClick={skipTour}
              className="text-white hover:text-indigo-200 transition-colors p-1"
              aria-label="Close tour"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-700 leading-relaxed">{step.content}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Progress indicator */}
              {step.showProgress && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? 'bg-indigo-600'
                            : index < currentStep
                            ? 'bg-indigo-400'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiChevronLeft size={16} />
                  <span className="text-sm font-medium">Back</span>
                </button>
              )}

              {!isLastStep && (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span className="text-sm font-medium">Next</span>
                  <FiChevronRight size={16} />
                </button>
              )}

              {isLastStep && (
                <button
                  onClick={completeTour}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="text-sm font-medium">Complete</span>
                  <FiCheck size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
