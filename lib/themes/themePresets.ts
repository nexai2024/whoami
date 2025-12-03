/**
 * Professional theme presets for pages and funnels
 * Each theme includes colors, typography hints, and styling preferences
 */

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  border: string;
  shadow: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  typography?: {
    fontFamily?: string;
    headingFont?: string;
    fontWeight?: string;
  };
  blockStyle?: {
    shadow?: string;
    borderRadius?: number;
    border?: string;
  };
}

export const themePresets: Theme[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple with black, white, and gray',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: '#111827',
      textSecondary: '#6B7280',
      accent: '#000000',
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.05)',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontWeight: '600',
    },
    blockStyle: {
      shadow: 'sm',
      borderRadius: 12,
      border: '1px solid #E5E7EB',
    },
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Modern dark theme with high contrast',
    colors: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      accent: '#3B82F6',
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontWeight: '600',
    },
    blockStyle: {
      shadow: 'lg',
      borderRadius: 12,
      border: '1px solid #334155',
    },
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold colors with high energy',
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      background: '#FFFFFF',
      surface: '#F5F3FF',
      text: '#1E1B4B',
      textSecondary: '#6366F1',
      accent: '#EC4899',
      border: '#E0E7FF',
      shadow: 'rgba(99, 102, 241, 0.15)',
    },
    typography: {
      fontFamily: 'Poppins',
      headingFont: 'Poppins',
      fontWeight: '700',
    },
    blockStyle: {
      shadow: 'md',
      borderRadius: 16,
      border: 'none',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional and trustworthy',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      background: '#FFFFFF',
      surface: '#EFF6FF',
      text: '#1E293B',
      textSecondary: '#475569',
      accent: '#1E40AF',
      border: '#DBEAFE',
      shadow: 'rgba(30, 64, 175, 0.1)',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontWeight: '600',
    },
    blockStyle: {
      shadow: 'sm',
      borderRadius: 8,
      border: '1px solid #DBEAFE',
    },
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic and expressive',
    colors: {
      primary: '#EC4899',
      secondary: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FDF2F8',
      text: '#1F2937',
      textSecondary: '#9CA3AF',
      accent: '#EC4899',
      border: '#FCE7F3',
      shadow: 'rgba(236, 72, 153, 0.15)',
    },
    typography: {
      fontFamily: 'Poppins',
      headingFont: 'Playfair Display',
      fontWeight: '600',
    },
    blockStyle: {
      shadow: 'md',
      borderRadius: 20,
      border: 'none',
    },
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Earth tones and organic feel',
    colors: {
      primary: '#059669',
      secondary: '#10B981',
      background: '#FFFFFF',
      surface: '#ECFDF5',
      text: '#064E3B',
      textSecondary: '#047857',
      accent: '#059669',
      border: '#D1FAE5',
      shadow: 'rgba(5, 150, 105, 0.1)',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontWeight: '600',
    },
    blockStyle: {
      shadow: 'sm',
      borderRadius: 12,
      border: '1px solid #D1FAE5',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming blues and teals',
    colors: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      background: '#FFFFFF',
      surface: '#ECFEFF',
      text: '#0C4A6E',
      textSecondary: '#075985',
      accent: '#0891B2',
      border: '#CFFAFE',
      shadow: 'rgba(8, 145, 178, 0.1)',
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      fontWeight: '600',
    },
    blockStyle: {
      shadow: 'sm',
      borderRadius: 12,
      border: '1px solid #CFFAFE',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges, pinks, and purples',
    colors: {
      primary: '#F97316',
      secondary: '#EC4899',
      background: '#FFFFFF',
      surface: '#FFF7ED',
      text: '#7C2D12',
      textSecondary: '#C2410C',
      accent: '#F97316',
      border: '#FFEDD5',
      shadow: 'rgba(249, 115, 22, 0.15)',
    },
    typography: {
      fontFamily: 'Poppins',
      headingFont: 'Poppins',
      fontWeight: '700',
    },
    blockStyle: {
      shadow: 'md',
      borderRadius: 16,
      border: 'none',
    },
  },
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
  return themePresets.find(theme => theme.id === id);
}

/**
 * Get default theme
 */
export function getDefaultTheme(): Theme {
  return themePresets[0]; // Minimalist
}

/**
 * Apply theme colors to CSS variables
 */
export function getThemeCSSVariables(theme: Theme): Record<string, string> {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text': theme.colors.text,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-accent': theme.colors.accent,
    '--theme-border': theme.colors.border,
    '--theme-shadow': theme.colors.shadow,
  };
}





