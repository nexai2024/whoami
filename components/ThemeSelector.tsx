"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { themePresets, type Theme } from '@/lib/themes/themePresets';
import { FiCheck, FiDroplet } from 'react-icons/fi';
import SafeIcon from '@/common/SafeIcon';

interface ThemeSelectorProps {
  selectedThemeId?: string;
  onThemeSelect: (theme: Theme) => void;
  showPreview?: boolean;
}

export default function ThemeSelector({
  selectedThemeId,
  onThemeSelect,
  showPreview = true,
}: ThemeSelectorProps) {
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(
    selectedThemeId ? themePresets.find(t => t.id === selectedThemeId) || null : null
  );

  const handleThemeClick = (theme: Theme) => {
    setPreviewTheme(theme);
    onThemeSelect(theme);
  };

  return (
    <div className="space-y-6">
      <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2">
          <SafeIcon name={undefined} icon={FiDroplet} />
          Choose a Theme
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a professional theme to instantly transform your page design
        </p>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themePresets.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          const isPreview = previewTheme?.id === theme.id;

          return (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeClick(theme)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : isPreview
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="bg-indigo-500 text-white rounded-full p-1">
                    <SafeIcon name={undefined} icon={FiCheck} className="w-3 h-3" />
                  </div>
                </div>
              )}

              {/* Color Preview */}
              <div className="flex gap-1 mb-3">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div
                  className="w-8 h-8 rounded border border-gray-300"
                  style={{ backgroundColor: theme.colors.background }}
                />
              </div>

              {/* Theme Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{theme.name}</h4>
                <p className="text-xs text-gray-600">{theme.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Preview Section */}
      {showPreview && previewTheme && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-xl border border-gray-200 bg-white"
        >
          <h4 className="font-medium text-gray-900 mb-4">Theme Preview</h4>
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: previewTheme.colors.background,
              color: previewTheme.colors.text,
            }}
          >
            <div
              className="p-4 rounded-lg mb-4"
              style={{
                backgroundColor: previewTheme.colors.surface,
                border: `1px solid ${previewTheme.colors.border}`,
              }}
            >
              <div
                className="font-semibold mb-2"
                style={{ color: previewTheme.colors.text }}
              >
                Sample Block
              </div>
              <div
                className="text-sm"
                style={{ color: previewTheme.colors.textSecondary }}
              >
                This is how your blocks will look with this theme
              </div>
            </div>
            <div className="flex gap-2">
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: previewTheme.colors.primary,
                  color: previewTheme.colors.background,
                }}
              >
                Primary Button
              </div>
              <div
                className="px-4 py-2 rounded-lg text-sm font-medium border"
                style={{
                  borderColor: previewTheme.colors.border,
                  color: previewTheme.colors.text,
                }}
              >
                Secondary Button
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}


