"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiArrowDown, FiEye, FiMousePointer } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';

interface AnimationControlsProps {
  animations: {
    pageLoad?: string;
    scroll?: string;
    blockHover?: string;
    microInteractions?: boolean;
    staggerDelay?: number;
  } | null;
  onAnimationChange: (animations: any) => void;
}

export default function AnimationControls({ animations, onAnimationChange }: AnimationControlsProps) {
  const currentAnimations = animations || {};
  const [previewAnimation, setPreviewAnimation] = useState<string | null>(null);

  const pageLoadOptions = [
    { 
      id: 'none', 
      label: 'None', 
      value: 'none', 
      description: 'Instant display - no animation',
      preview: null
    },
    { 
      id: 'fade', 
      label: 'Fade In', 
      value: 'fade', 
      description: 'Smooth opacity transition',
      preview: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6 } }
    },
    { 
      id: 'slide-up', 
      label: 'Slide Up', 
      value: 'slide-up', 
      description: 'Content slides from bottom',
      preview: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6 } }
    },
    { 
      id: 'slide-down', 
      label: 'Slide Down', 
      value: 'slide-down', 
      description: 'Content slides from top',
      preview: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6 } }
    },
    { 
      id: 'zoom', 
      label: 'Zoom In', 
      value: 'zoom', 
      description: 'Subtle scale animation',
      preview: { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5 } }
    },
    { 
      id: 'stagger', 
      label: 'Stagger', 
      value: 'stagger', 
      description: 'Blocks appear sequentially',
      preview: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay: 0.1 } }
    },
  ];

  const scrollOptions = [
    { 
      id: 'none', 
      label: 'None', 
      value: 'none', 
      description: 'No scroll effects'
    },
    { 
      id: 'fade-on-scroll', 
      label: 'Fade on Scroll', 
      value: 'fade-on-scroll', 
      description: 'Elements fade in as you scroll'
    },
    { 
      id: 'slide-on-scroll', 
      label: 'Slide on Scroll', 
      value: 'slide-on-scroll', 
      description: 'Elements slide in from sides'
    },
    { 
      id: 'parallax', 
      label: 'Parallax', 
      value: 'parallax', 
      description: 'Background moves slower (subtle)'
    },
  ];

  const blockHoverOptions = [
    { 
      id: 'none', 
      label: 'None', 
      value: 'none', 
      description: 'No hover effect'
    },
    { 
      id: 'lift', 
      label: 'Lift', 
      value: 'lift', 
      description: 'Block lifts with shadow increase'
    },
    { 
      id: 'glow', 
      label: 'Glow', 
      value: 'glow', 
      description: 'Border/background glow effect'
    },
    { 
      id: 'scale', 
      label: 'Scale', 
      value: 'scale', 
      description: 'Slight scale up on hover'
    },
    { 
      id: 'slide', 
      label: 'Slide', 
      value: 'slide', 
      description: 'Content slides on hover'
    },
    { 
      id: 'fade', 
      label: 'Fade', 
      value: 'fade', 
      description: 'Opacity change on hover'
    },
  ];

  const handlePageLoadChange = (value: string) => {
    onAnimationChange({
      ...currentAnimations,
      pageLoad: value,
    });
    // Show preview
    const option = pageLoadOptions.find(o => o.value === value);
    if (option?.preview) {
      setPreviewAnimation(value);
      setTimeout(() => setPreviewAnimation(null), 1000);
    }
  };

  const handleScrollChange = (value: string) => {
    onAnimationChange({
      ...currentAnimations,
      scroll: value,
    });
  };

  const handleBlockHoverChange = (value: string) => {
    onAnimationChange({
      ...currentAnimations,
      blockHover: value,
    });
  };

  const handleMicroInteractionsToggle = (enabled: boolean) => {
    onAnimationChange({
      ...currentAnimations,
      microInteractions: enabled,
    });
  };

  const handleStaggerDelayChange = (delay: number) => {
    onAnimationChange({
      ...currentAnimations,
      staggerDelay: delay,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiZap} />
          Animations & Effects
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add smooth animations to enhance user experience
        </p>
      </div>

      {/* Page Load Animation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiEye} />
          Page Load Animation
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {pageLoadOptions.map((option) => {
            const isSelected = currentAnimations.pageLoad === option.value || 
              (!currentAnimations.pageLoad && option.value === 'fade');
            return (
              <motion.button
                key={option.id}
                onClick={() => handlePageLoadChange(option.value)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...(previewAnimation === option.value && option.preview ? option.preview : {})}
              >
                <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </motion.button>
            );
          })}
        </div>
        {currentAnimations.pageLoad === 'stagger' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stagger Delay: {currentAnimations.staggerDelay || 0.1}s
            </label>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.05"
              value={currentAnimations.staggerDelay || 0.1}
              onChange={(e) => handleStaggerDelayChange(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0s (Fast)</span>
              <span>0.5s (Slow)</span>
            </div>
          </div>
        )}
      </div>

      {/* Scroll Animation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiArrowDown} />
          Scroll Animation
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scrollOptions.map((option) => {
            const isSelected = currentAnimations.scroll === option.value || 
              (!currentAnimations.scroll && option.value === 'none');
            return (
              <motion.button
                key={option.id}
                onClick={() => handleScrollChange(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Block Hover Effect */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiMousePointer} />
          Block Hover Effect
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {blockHoverOptions.map((option) => {
            const isSelected = currentAnimations.blockHover === option.value || 
              (!currentAnimations.blockHover && option.value === 'lift');
            return (
              <motion.button
                key={option.id}
                onClick={() => handleBlockHoverChange(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Micro-interactions */}
      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
          <div>
            <div className="font-medium text-gray-700 mb-1">Micro-interactions</div>
            <div className="text-sm text-gray-600">
              Enable subtle animations for buttons, forms, and interactions
            </div>
          </div>
          <input
            type="checkbox"
            checked={currentAnimations.microInteractions || false}
            onChange={(e) => handleMicroInteractionsToggle(e.target.checked)}
            className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Animation Preview</h4>
        <div className="p-6 rounded-lg border border-gray-200 bg-gray-50">
          <div className="space-y-3">
            {[1, 2, 3].map((num, index) => {
              const delay = currentAnimations.pageLoad === 'stagger' 
                ? (currentAnimations.staggerDelay || 0.1) * index 
                : 0;
              
              const animationProps = currentAnimations.pageLoad === 'fade' 
                ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, delay } }
                : currentAnimations.pageLoad === 'slide-up'
                ? { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay } }
                : currentAnimations.pageLoad === 'zoom'
                ? { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5, delay } }
                : currentAnimations.pageLoad === 'stagger'
                ? { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay } }
                : {};

              return (
                <motion.div
                  key={num}
                  className="h-16 bg-indigo-200 rounded-lg flex items-center justify-center text-sm text-indigo-900"
                  {...animationProps}
                >
                  Block {num}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


