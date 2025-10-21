"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tour, tours, getTourById, getAutoTriggerTour } from './tourConfig';
import { usePathname } from 'next/navigation';

type TourProgress = {
  [tourId: string]: {
    completed: boolean;
    completedAt?: string;
    currentStep?: number;
  };
};

type TourContextType = {
  currentTour: Tour | null;
  currentStep: number;
  isActive: boolean;
  tourProgress: TourProgress;
  startTour: (tourId: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  completeTour: () => void;
  skipTour: () => void;
  setUserHasPages: (has: boolean) => void;
};

const TourContext = createContext<TourContextType | undefined>(undefined);

const STORAGE_KEY = 'whoami_tour_progress';

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [tourProgress, setTourProgress] = useState<TourProgress>({});
  const [userHasPages, setUserHasPages] = useState(true);
  const [autoTriggeredTours, setAutoTriggeredTours] = useState<Set<string>>(new Set());

  // Load tour progress from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTourProgress(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse tour progress:', e);
      }
    }
  }, []);

  // Save tour progress to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(tourProgress).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tourProgress));
    }
  }, [tourProgress]);

  // Auto-trigger tours based on pathname and conditions
  useEffect(() => {
    if (isActive || !pathname) return;

    const autoTour = getAutoTriggerTour(pathname, userHasPages);
    if (autoTour && !autoTriggeredTours.has(autoTour.id)) {
      // Check if tour is already completed
      const progress = tourProgress[autoTour.id];
      if (!progress || !progress.completed) {
        // Delay to ensure DOM is ready
        setTimeout(() => {
          startTour(autoTour.id);
          setAutoTriggeredTours(prev => new Set(prev).add(autoTour.id));
        }, 1000);
      }
    }
  }, [pathname, isActive, userHasPages, tourProgress, autoTriggeredTours]);

  const startTour = (tourId: string) => {
    const tour = getTourById(tourId);
    if (!tour) {
      console.error(`Tour with id ${tourId} not found`);
      return;
    }

    setCurrentTour(tour);
    setCurrentStep(0);
    setIsActive(true);

    // Update progress
    setTourProgress(prev => ({
      ...prev,
      [tourId]: {
        ...prev[tourId],
        completed: false,
        currentStep: 0,
      },
    }));
  };

  const stopTour = () => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (!currentTour) return;

    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < currentTour.steps.length) {
      setCurrentStep(nextStepIndex);

      // Update progress
      if (currentTour) {
        setTourProgress(prev => ({
          ...prev,
          [currentTour.id]: {
            ...prev[currentTour.id],
            currentStep: nextStepIndex,
          },
        }));
      }
    } else {
      // Tour completed
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);

      // Update progress
      if (currentTour) {
        setTourProgress(prev => ({
          ...prev,
          [currentTour.id]: {
            ...prev[currentTour.id],
            currentStep: prevStepIndex,
          },
        }));
      }
    }
  };

  const completeTour = () => {
    if (!currentTour) return;

    setTourProgress(prev => ({
      ...prev,
      [currentTour.id]: {
        completed: true,
        completedAt: new Date().toISOString(),
        currentStep: currentTour.steps.length - 1,
      },
    }));

    stopTour();
  };

  const skipTour = () => {
    if (!currentTour) return;

    // Mark as dismissed (not completed) by setting currentStep without completed flag
    setTourProgress(prev => ({
      ...prev,
      [currentTour.id]: {
        ...prev[currentTour.id],
        completed: false,
        currentStep: currentStep,
      },
    }));

    stopTour();
  };

  const value: TourContextType = {
    currentTour,
    currentStep,
    isActive,
    tourProgress,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    completeTour,
    skipTour,
    setUserHasPages,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};
