/**
 * Template Design System
 * Standardized design tokens for template creation
 */

// Header Styles
export type HeaderStyle = 'minimal' | 'card' | 'gradient' | 'split';

// Color Palettes (Industry-specific)
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const colorPalettes: Record<string, ColorPalette> = {
  // Creators/Influencers
  fashion: {
    primary: '#E91E63',
    secondary: '#F06292',
    accent: '#FF4081',
    background: '#FFFFFF',
    surface: '#FCE4EC',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  travel: {
    primary: '#00BCD4',
    secondary: '#4DD0E1',
    accent: '#26C6DA',
    background: '#FFFFFF',
    surface: '#E0F7FA',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  food: {
    primary: '#FF5722',
    secondary: '#FF7043',
    accent: '#FF6E40',
    background: '#FFFFFF',
    surface: '#FFF3E0',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  fitness: {
    primary: '#4CAF50',
    secondary: '#66BB6A',
    accent: '#81C784',
    background: '#FFFFFF',
    surface: '#E8F5E9',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  gaming: {
    primary: '#9C27B0',
    secondary: '#BA68C8',
    accent: '#CE93D8',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#404040',
  },
  // Business/Professional
  consultant: {
    primary: '#1976D2',
    secondary: '#42A5F5',
    accent: '#64B5F6',
    background: '#FFFFFF',
    surface: '#E3F2FD',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  realEstate: {
    primary: '#795548',
    secondary: '#A1887F',
    accent: '#BCAAA4',
    background: '#FFFFFF',
    surface: '#EFEBE9',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  legal: {
    primary: '#424242',
    secondary: '#616161',
    accent: '#757575',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  finance: {
    primary: '#1B5E20',
    secondary: '#388E3C',
    accent: '#4CAF50',
    background: '#FFFFFF',
    surface: '#E8F5E9',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  healthcare: {
    primary: '#0288D1',
    secondary: '#03A9F4',
    accent: '#29B6F6',
    background: '#FFFFFF',
    surface: '#E1F5FE',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  // Entrepreneurs
  saas: {
    primary: '#3F51B5',
    secondary: '#5C6BC0',
    accent: '#7986CB',
    background: '#FFFFFF',
    surface: '#E8EAF6',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  ecommerce: {
    primary: '#F57C00',
    secondary: '#FB8C00',
    accent: '#FF9800',
    background: '#FFFFFF',
    surface: '#FFF3E0',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  coach: {
    primary: '#7B1FA2',
    secondary: '#9C27B0',
    accent: '#BA68C8',
    background: '#FFFFFF',
    surface: '#F3E5F5',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  speaker: {
    primary: '#D32F2F',
    secondary: '#E53935',
    accent: '#EF5350',
    background: '#FFFFFF',
    surface: '#FFEBEE',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  author: {
    primary: '#5D4037',
    secondary: '#6D4C41',
    accent: '#8D6E63',
    background: '#FFFFFF',
    surface: '#EFEBE9',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  // Artists/Creatives
  photographer: {
    primary: '#000000',
    secondary: '#424242',
    accent: '#616161',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  musician: {
    primary: '#C2185B',
    secondary: '#E91E63',
    accent: '#F06292',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#404040',
  },
  designer: {
    primary: '#0097A7',
    secondary: '#00ACC1',
    accent: '#00BCD4',
    background: '#FFFFFF',
    surface: '#E0F7FA',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  writer: {
    primary: '#455A64',
    secondary: '#546E7A',
    accent: '#607D8B',
    background: '#FFFFFF',
    surface: '#ECEFF1',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  artist: {
    primary: '#E64A19',
    secondary: '#FF5722',
    accent: '#FF7043',
    background: '#FFFFFF',
    surface: '#FFF3E0',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  // Events/Organizations
  conference: {
    primary: '#512DA8',
    secondary: '#673AB7',
    accent: '#7E57C2',
    background: '#FFFFFF',
    surface: '#EDE7F6',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  nonprofit: {
    primary: '#00796B',
    secondary: '#00897B',
    accent: '#009688',
    background: '#FFFFFF',
    surface: '#E0F2F1',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  community: {
    primary: '#FBC02D',
    secondary: '#FDD835',
    accent: '#FFEB3B',
    background: '#FFFFFF',
    surface: '#FFFDE7',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  education: {
    primary: '#1976D2',
    secondary: '#1E88E5',
    accent: '#2196F3',
    background: '#FFFFFF',
    surface: '#E3F2FD',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  agency: {
    primary: '#303F9F',
    secondary: '#3949AB',
    accent: '#3F51B5',
    background: '#FFFFFF',
    surface: '#E8EAF6',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  // Specialty
  wedding: {
    primary: '#E91E63',
    secondary: '#F06292',
    accent: '#F8BBD0',
    background: '#FFFFFF',
    surface: '#FCE4EC',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  portfolio: {
    primary: '#263238',
    secondary: '#37474F',
    accent: '#455A64',
    background: '#FFFFFF',
    surface: '#ECEFF1',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  resume: {
    primary: '#1565C0',
    secondary: '#1976D2',
    accent: '#1E88E5',
    background: '#FFFFFF',
    surface: '#E3F2FD',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  productLaunch: {
    primary: '#E65100',
    secondary: '#F57C00',
    accent: '#FF9800',
    background: '#FFFFFF',
    surface: '#FFF3E0',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
  courseLanding: {
    primary: '#00695C',
    secondary: '#00796B',
    accent: '#00897B',
    background: '#FFFFFF',
    surface: '#E0F2F1',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  },
};

// Typography
export interface FontPairing {
  heading: string;
  body: string;
  display?: string;
}

export const fontPairings: Record<string, FontPairing> = {
  modern: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    display: 'Inter, system-ui, sans-serif',
  },
  classic: {
    heading: 'Georgia, serif',
    body: 'Georgia, serif',
    display: 'Playfair Display, serif',
  },
  creative: {
    heading: 'Poppins, sans-serif',
    body: 'Open Sans, sans-serif',
    display: 'Montserrat, sans-serif',
  },
};

// Spacing Configuration
export interface SpacingConfig {
  unit: number; // Base spacing unit in pixels
  scale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

export const spacingConfigs: Record<string, SpacingConfig> = {
  compact: {
    unit: 4,
    scale: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
  },
  comfortable: {
    unit: 8,
    scale: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
      xxl: 64,
    },
  },
  spacious: {
    unit: 12,
    scale: {
      xs: 12,
      sm: 24,
      md: 36,
      lg: 48,
      xl: 64,
      xxl: 96,
    },
  },
};

// Theme Configuration
export interface ThemeConfig {
  colors: ColorPalette;
  fonts: FontPairing;
  spacing: SpacingConfig;
}

// Industry to Color Palette Mapping
export const industryColorMap: Record<string, string> = {
  'Fashion/Beauty': 'fashion',
  Travel: 'travel',
  Food: 'food',
  Fitness: 'fitness',
  Gaming: 'gaming',
  Consultant: 'consultant',
  'Real Estate': 'realEstate',
  Legal: 'legal',
  Finance: 'finance',
  Healthcare: 'healthcare',
  'SaaS Founder': 'saas',
  'E-commerce': 'ecommerce',
  'Coach/Mentor': 'coach',
  Speaker: 'speaker',
  Author: 'author',
  Photographer: 'photographer',
  Musician: 'musician',
  Designer: 'designer',
  Writer: 'writer',
  Artist: 'artist',
  Conference: 'conference',
  'Non-profit': 'nonprofit',
  Community: 'community',
  Education: 'education',
  Agency: 'agency',
  Wedding: 'wedding',
  Portfolio: 'portfolio',
  Resume: 'resume',
  'Product Launch': 'productLaunch',
  'Course Landing': 'courseLanding',
};

// Get theme for industry
export function getThemeForIndustry(industry: string, fontStyle: string = 'modern', spacingStyle: string = 'comfortable'): ThemeConfig {
  const colorKey = industryColorMap[industry] || 'consultant';
  const colors = colorPalettes[colorKey] || colorPalettes.consultant;
  const fonts = fontPairings[fontStyle] || fontPairings.modern;
  const spacing = spacingConfigs[spacingStyle] || spacingConfigs.comfortable;

  return {
    colors,
    fonts,
    spacing,
  };
}

// Template Categories
export const templateCategories = [
  'Creators/Influencers',
  'Business/Professional',
  'Entrepreneurs',
  'Artists/Creatives',
  'Events/Organizations',
  'Specialty',
] as const;

export type TemplateCategory = typeof templateCategories[number];

// Industry Lists by Category
export const industriesByCategory: Record<TemplateCategory, string[]> = {
  'Creators/Influencers': ['Fashion/Beauty', 'Travel', 'Food', 'Fitness', 'Gaming'],
  'Business/Professional': ['Consultant', 'Real Estate', 'Legal', 'Finance', 'Healthcare'],
  'Entrepreneurs': ['SaaS Founder', 'E-commerce', 'Coach/Mentor', 'Speaker', 'Author'],
  'Artists/Creatives': ['Photographer', 'Musician', 'Designer', 'Writer', 'Artist'],
  'Events/Organizations': ['Conference', 'Non-profit', 'Community', 'Education', 'Agency'],
  'Specialty': ['Wedding', 'Portfolio', 'Resume', 'Product Launch', 'Course Landing'],
};

