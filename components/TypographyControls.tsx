"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiType, FiBold, FiMinus, FiPlus } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';
import { fontOptions, getFontById, getFontsByCategory, type FontOption } from '@/lib/themes/fonts';

interface TypographyControlsProps {
  typography: {
    fontFamily?: string;
    headingFont?: string;
    bodyFont?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  } | null;
  onTypographyChange: (typography: any) => void;
}

export default function TypographyControls({ typography, onTypographyChange }: TypographyControlsProps) {
  const currentTypography = typography || {};
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sans-serif' | 'serif' | 'display' | 'monospace'>('all');

  const fontCategories = [
    { id: 'all', label: 'All Fonts' },
    { id: 'sans-serif', label: 'Sans-Serif' },
    { id: 'serif', label: 'Serif' },
    { id: 'display', label: 'Display' },
    { id: 'monospace', label: 'Monospace' },
  ];

  const fontWeightOptions = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi-Bold (600)' },
    { value: '700', label: 'Bold (700)' },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', size: '0.875rem' },
    { value: 'base', label: 'Base', size: '1rem' },
    { value: 'large', label: 'Large', size: '1.125rem' },
    { value: 'xl', label: 'Extra Large', size: '1.25rem' },
  ];

  const lineHeightOptions = [
    { value: 'tight', label: 'Tight (1.2)', height: '1.2' },
    { value: 'normal', label: 'Normal (1.5)', height: '1.5' },
    { value: 'relaxed', label: 'Relaxed (1.8)', height: '1.8' },
  ];

  const letterSpacingOptions = [
    { value: 'tight', label: 'Tight (-0.025em)' },
    { value: 'normal', label: 'Normal (0)' },
    { value: 'wide', label: 'Wide (0.025em)' },
  ];

  const handleFontChange = (fontId: string, type: 'fontFamily' | 'headingFont' | 'bodyFont' = 'fontFamily') => {
    onTypographyChange({
      ...currentTypography,
      [type]: fontId,
      // If setting main fontFamily, also set it as bodyFont if bodyFont not set
      ...(type === 'fontFamily' && !currentTypography.bodyFont ? { bodyFont: fontId } : {}),
    });
  };

  const handleWeightChange = (weight: string) => {
    onTypographyChange({
      ...currentTypography,
      fontWeight: weight,
    });
  };

  const handleSizeChange = (size: string) => {
    onTypographyChange({
      ...currentTypography,
      fontSize: size,
    });
  };

  const handleLineHeightChange = (height: string) => {
    onTypographyChange({
      ...currentTypography,
      lineHeight: height,
    });
  };

  const handleLetterSpacingChange = (spacing: string) => {
    onTypographyChange({
      ...currentTypography,
      letterSpacing: spacing,
    });
  };

  // Filter fonts by category
  const filteredFonts = selectedCategory === 'all' 
    ? fontOptions 
    : getFontsByCategory(selectedCategory);

  const selectedFont = getFontById(currentTypography.fontFamily || 'inter');
  const selectedHeadingFont = getFontById(currentTypography.headingFont || currentTypography.fontFamily || 'inter');
  const selectedBodyFont = getFontById(currentTypography.bodyFont || currentTypography.fontFamily || 'inter');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiType} />
          Typography
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose fonts and text styling for your page
        </p>
      </div>

      {/* Font Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Category</label>
        <div className="flex gap-2 flex-wrap">
          {fontCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Font Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Main Font</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {filteredFonts.map((font) => {
            const isSelected = currentTypography.fontFamily === font.id || 
              (!currentTypography.fontFamily && font.id === 'inter');
            return (
              <motion.button
                key={font.id}
                onClick={() => handleFontChange(font.id, 'fontFamily')}
                className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 mb-1" style={{ fontFamily: font.googleFont ? `'${font.googleFont}', ${font.category === 'serif' ? 'serif' : 'sans-serif'}` : 'inherit' }}>
                  {font.name}
                </div>
                <div className="text-xs text-gray-600">{font.description || font.category}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Heading Font (Optional - separate from body) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Heading Font <span className="text-gray-500 font-normal">(Optional - uses main font if not set)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
          {filteredFonts.slice(0, 9).map((font) => {
            const isSelected = currentTypography.headingFont === font.id;
            return (
              <motion.button
                key={font.id}
                onClick={() => handleFontChange(font.id, 'headingFont')}
                className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 mb-1" style={{ fontFamily: font.googleFont ? `'${font.googleFont}', ${font.category === 'serif' ? 'serif' : 'sans-serif'}` : 'inherit' }}>
                  {font.name}
                </div>
              </motion.button>
            );
          })}
          {currentTypography.headingFont && (
            <button
              onClick={() => handleFontChange('', 'headingFont')}
              className="p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600 text-sm"
            >
              Use Main Font
            </button>
          )}
        </div>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiBold} />
          Font Weight
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {fontWeightOptions.map((option) => {
            const isSelected = currentTypography.fontWeight === option.value || 
              (!currentTypography.fontWeight && option.value === '400');
            return (
              <motion.button
                key={option.value}
                onClick={() => handleWeightChange(option.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900" style={{ fontWeight: parseInt(option.value) }}>
                  {option.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Base Font Size</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fontSizeOptions.map((option) => {
            const isSelected = currentTypography.fontSize === option.value || 
              (!currentTypography.fontSize && option.value === 'base');
            return (
              <motion.button
                key={option.value}
                onClick={() => handleSizeChange(option.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 mb-1" style={{ fontSize: option.size }}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-600">{option.size}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Line Height</label>
        <div className="grid grid-cols-3 gap-3">
          {lineHeightOptions.map((option) => {
            const isSelected = currentTypography.lineHeight === option.value || 
              (!currentTypography.lineHeight && option.value === 'normal');
            return (
              <motion.button
                key={option.value}
                onClick={() => handleLineHeightChange(option.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                <div className="text-xs text-gray-600">{option.height}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Letter Spacing</label>
        <div className="grid grid-cols-3 gap-3">
          {letterSpacingOptions.map((option) => {
            const isSelected = currentTypography.letterSpacing === option.value || 
              (!currentTypography.letterSpacing && option.value === 'normal');
            return (
              <motion.button
                key={option.value}
                onClick={() => handleLetterSpacingChange(option.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
        <div
          className="p-6 rounded-lg border border-gray-200 bg-gray-50"
          style={{
            fontFamily: selectedFont?.googleFont ? `'${selectedFont.googleFont}', ${selectedFont.category === 'serif' ? 'serif' : 'sans-serif'}` : 'inherit',
            fontWeight: currentTypography.fontWeight || '400',
            fontSize: fontSizeOptions.find(o => o.value === (currentTypography.fontSize || 'base'))?.size || '1rem',
            lineHeight: lineHeightOptions.find(o => o.value === (currentTypography.lineHeight || 'normal'))?.height || '1.5',
            letterSpacing: currentTypography.letterSpacing === 'tight' ? '-0.025em' :
                          currentTypography.letterSpacing === 'wide' ? '0.025em' : '0',
          }}
        >
          <h2
            style={{
              fontFamily: selectedHeadingFont?.googleFont ? `'${selectedHeadingFont.googleFont}', ${selectedHeadingFont.category === 'serif' ? 'serif' : 'sans-serif'}` : 'inherit',
              fontWeight: currentTypography.fontWeight || '600',
              marginBottom: '1rem',
            }}
          >
            Heading Example
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            This is how your body text will look with the selected typography settings.
          </p>
          <p style={{ opacity: 0.7 }}>
            You can adjust font family, weight, size, line height, and letter spacing to match your brand.
          </p>
        </div>
      </div>
    </div>
  );
}


