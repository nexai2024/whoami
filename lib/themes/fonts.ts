/**
 * Professional font library with Google Fonts integration
 */

export interface FontOption {
  id: string;
  name: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace';
  googleFont?: string;
  weights?: number[];
  description?: string;
}

export const fontOptions: FontOption[] = [
  // Sans-serif (most popular for web)
  {
    id: 'inter',
    name: 'Inter',
    category: 'sans-serif',
    googleFont: 'Inter',
    weights: [300, 400, 500, 600, 700],
    description: 'Modern, highly legible sans-serif',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'sans-serif',
    googleFont: 'Poppins',
    weights: [300, 400, 500, 600, 700],
    description: 'Geometric, friendly sans-serif',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    category: 'sans-serif',
    googleFont: 'Montserrat',
    weights: [300, 400, 500, 600, 700],
    description: 'Elegant, versatile sans-serif',
  },
  {
    id: 'work-sans',
    name: 'Work Sans',
    category: 'sans-serif',
    googleFont: 'Work Sans',
    weights: [300, 400, 500, 600, 700],
    description: 'Professional, readable sans-serif',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    category: 'sans-serif',
    googleFont: 'DM Sans',
    weights: [300, 400, 500, 600, 700],
    description: 'Clean, modern sans-serif',
  },
  {
    id: 'open-sans',
    name: 'Open Sans',
    category: 'sans-serif',
    googleFont: 'Open Sans',
    weights: [300, 400, 500, 600, 700],
    description: 'Humanist, friendly sans-serif',
  },
  
  // Serif (for elegant, traditional feel)
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'serif',
    googleFont: 'Playfair Display',
    weights: [400, 500, 600, 700],
    description: 'Elegant, high-contrast serif',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    googleFont: 'Merriweather',
    weights: [300, 400, 700],
    description: 'Readable, warm serif',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'serif',
    googleFont: 'Lora',
    weights: [400, 500, 600, 700],
    description: 'Well-balanced serif',
  },
  
  // Display (for headings)
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    category: 'display',
    googleFont: 'Bebas Neue',
    weights: [400],
    description: 'Bold, condensed display font',
  },
  {
    id: 'oswald',
    name: 'Oswald',
    category: 'display',
    googleFont: 'Oswald',
    weights: [300, 400, 500, 600, 700],
    description: 'Condensed sans-serif for impact',
  },
  {
    id: 'raleway',
    name: 'Raleway',
    category: 'display',
    googleFont: 'Raleway',
    weights: [300, 400, 500, 600, 700],
    description: 'Elegant, geometric sans-serif',
  },
  
  // Monospace (for tech profiles)
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    category: 'monospace',
    googleFont: 'JetBrains Mono',
    weights: [400, 500, 600, 700],
    description: 'Developer-friendly monospace',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    category: 'monospace',
    googleFont: 'Fira Code',
    weights: [400, 500, 600, 700],
    description: 'Programming ligatures included',
  },
];

/**
 * Get font by ID
 */
export function getFontById(id: string): FontOption | undefined {
  return fontOptions.find(font => font.id === id);
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: FontOption['category']): FontOption[] {
  return fontOptions.filter(font => font.category === category);
}

/**
 * Get Google Fonts URL for a font
 */
export function getGoogleFontsURL(fonts: FontOption[]): string {
  const families = fonts
    .filter(font => font.googleFont)
    .map(font => {
      const weights = font.weights?.join(',') || '400';
      return `${font.googleFont}:wght@${weights}`;
    })
    .join('&family=');
  
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

/**
 * Get CSS font-family string
 */
export function getFontFamilyCSS(font: FontOption): string {
  if (font.googleFont) {
    return `'${font.googleFont}', ${font.category === 'serif' ? 'serif' : 'sans-serif'}`;
  }
  return font.category === 'serif' ? 'serif' : 'sans-serif';
}





