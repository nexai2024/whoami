"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiMaximize2, FiMinimize2, FiAlignCenter, FiAlignLeft, FiAlignRight, FiLayout } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';

interface LayoutControlsProps {
  layout: {
    containerWidth?: string;
    spacing?: string;
    alignment?: string;
    padding?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  } | null;
  onLayoutChange: (layout: any) => void;
}

export default function LayoutControls({ layout, onLayoutChange }: LayoutControlsProps) {
  const currentLayout = layout || {};

  const containerWidthOptions = [
    { id: 'narrow', label: 'Narrow', value: 'narrow', description: '320px - Mobile optimized', icon: FiMinimize2 },
    { id: 'compact', label: 'Compact', value: 'compact', description: '400px - Default', icon: FiMinimize2 },
    { id: 'md', label: 'Standard', value: 'md', description: '500px - Balanced', icon: FiMaximize2 },
    { id: 'standard', label: 'Wide', value: 'standard', description: '600px - More space', icon: FiMaximize2 },
    { id: 'wide', label: 'Extra Wide', value: 'wide', description: '700px - Maximum', icon: FiMaximize2 },
    { id: 'full', label: 'Full Width', value: 'full', description: '100% with constraints', icon: FiMaximize2 },
  ];

  const spacingOptions = [
    { id: 'tight', label: 'Tight', value: 'tight', description: '8px between blocks' },
    { id: 'normal', label: 'Normal', value: 'normal', description: '16px - Default' },
    { id: 'comfortable', label: 'Comfortable', value: 'comfortable', description: '24px - More breathing room' },
    { id: 'spacious', label: 'Spacious', value: 'spacious', description: '32px - Maximum spacing' },
  ];

  const alignmentOptions = [
    { id: 'left', label: 'Left Aligned', value: 'left', icon: FiAlignLeft, description: 'Content starts from left' },
    { id: 'center', label: 'Center Aligned', value: 'center', icon: FiAlignCenter, description: 'Content centered - Default' },
    { id: 'right', label: 'Right Aligned', value: 'right', icon: FiAlignRight, description: 'Content starts from right' },
  ];

  const handleContainerWidthChange = (value: string) => {
    onLayoutChange({
      ...currentLayout,
      containerWidth: value,
    });
  };

  const handleSpacingChange = (value: string) => {
    onLayoutChange({
      ...currentLayout,
      spacing: value,
    });
  };

  const handleAlignmentChange = (value: string) => {
    onLayoutChange({
      ...currentLayout,
      alignment: value,
    });
  };

  const handlePaddingChange = (side: 'top' | 'bottom' | 'left' | 'right', value: number) => {
    onLayoutChange({
      ...currentLayout,
      padding: {
        ...(currentLayout.padding || {}),
        [side]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiLayout} />
          Layout & Spacing
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Control how your page content is displayed and spaced
        </p>
      </div>

      {/* Container Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Container Width</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {containerWidthOptions.map((option) => {
            const isSelected = currentLayout.containerWidth === option.value || 
              (!currentLayout.containerWidth && option.value === 'md');
            return (
              <motion.button
                key={option.id}
                onClick={() => handleContainerWidthChange(option.value)}
                className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <SafeIcon name={undefined} icon={option.icon} className={`mt-0.5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Block Spacing</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {spacingOptions.map((option) => {
            const isSelected = currentLayout.spacing === option.value || 
              (!currentLayout.spacing && option.value === 'normal');
            return (
              <motion.button
                key={option.id}
                onClick={() => handleSpacingChange(option.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
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

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Content Alignment</label>
        <div className="grid grid-cols-3 gap-3">
          {alignmentOptions.map((option) => {
            const isSelected = currentLayout.alignment === option.value || 
              (!currentLayout.alignment && option.value === 'center');
            return (
              <motion.button
                key={option.id}
                onClick={() => handleAlignmentChange(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SafeIcon name={undefined} icon={option.icon} className={`text-2xl mx-auto mb-2 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Padding Controls (Advanced) */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Page Padding (Advanced)</label>
          <button
            onClick={() => {
              // Reset padding
              onLayoutChange({
                ...currentLayout,
                padding: undefined,
              });
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
            <div key={side}>
              <label className="block text-xs text-gray-600 mb-1 capitalize">{side}</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentLayout.padding?.[side] || 0}
                onChange={(e) => handlePaddingChange(side, parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="0"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
        <div
          className="p-6 rounded-lg border border-gray-200 bg-gray-50"
          style={{
            maxWidth: currentLayout.containerWidth === 'narrow' ? '320px' :
                     currentLayout.containerWidth === 'compact' ? '400px' :
                     currentLayout.containerWidth === 'md' ? '500px' :
                     currentLayout.containerWidth === 'standard' ? '600px' :
                     currentLayout.containerWidth === 'wide' ? '700px' :
                     currentLayout.containerWidth === 'full' ? '100%' : '500px',
            margin: '0 auto',
            textAlign: (currentLayout.alignment as React.CSSProperties['textAlign']) || 'center',
            paddingTop: currentLayout.padding?.top ? `${currentLayout.padding.top}px` : undefined,
            paddingBottom: currentLayout.padding?.bottom ? `${currentLayout.padding.bottom}px` : undefined,
            paddingLeft: currentLayout.padding?.left ? `${currentLayout.padding.left}px` : undefined,
            paddingRight: currentLayout.padding?.right ? `${currentLayout.padding.right}px` : undefined,
          }}
        >
          <div className="space-y-2">
            <div className="h-12 bg-indigo-200 rounded-lg flex items-center justify-center text-sm text-indigo-900">
              Block 1
            </div>
            <div 
              className="h-12 bg-indigo-200 rounded-lg flex items-center justify-center text-sm text-indigo-900"
              style={{
                marginTop: currentLayout.spacing === 'tight' ? '8px' :
                          currentLayout.spacing === 'normal' ? '16px' :
                          currentLayout.spacing === 'comfortable' ? '24px' :
                          currentLayout.spacing === 'spacious' ? '32px' : '16px',
              }}
            >
              Block 2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


