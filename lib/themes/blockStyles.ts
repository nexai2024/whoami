/**
 * Block styling utilities for shadows, borders, and hover effects
 */

export type ShadowPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'colored';
export type BorderRadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type HoverEffect = 'none' | 'lift' | 'glow' | 'scale' | 'slide' | 'fade';

export interface BlockStyle {
  shadow?: ShadowPreset;
  borderRadius?: BorderRadiusPreset | number;
  border?: {
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
  };
  hoverEffect?: HoverEffect;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Get Tailwind shadow class
 */
export function getShadowClass(shadow: ShadowPreset, color?: string): string {
  if (shadow === 'none') return '';
  if (shadow === 'colored' && color) {
    // Use custom colored shadow via inline style
    return '';
  }
  return `shadow-${shadow}`;
}

/**
 * Get shadow style for colored shadows
 */
export function getShadowStyle(shadow: ShadowPreset, color?: string): React.CSSProperties {
  if (shadow === 'colored' && color) {
    const opacity = 0.15;
    return {
      boxShadow: `0 4px 6px -1px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, 0 2px 4px -1px ${color}${Math.round(opacity * 0.5 * 255).toString(16).padStart(2, '0')}`,
    };
  }
  return {};
}

/**
 * Get border radius class or value
 */
export function getBorderRadiusClass(borderRadius: BorderRadiusPreset | number | undefined): string {
  if (!borderRadius) return 'rounded-lg';
  if (typeof borderRadius === 'number') {
    return '';
  }
  const map: Record<BorderRadiusPreset, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };
  return map[borderRadius] || 'rounded-lg';
}

/**
 * Get border radius style for custom values
 */
export function getBorderRadiusStyle(borderRadius: BorderRadiusPreset | number | undefined): React.CSSProperties {
  if (typeof borderRadius === 'number') {
    return { borderRadius: `${borderRadius}px` };
  }
  return {};
}

/**
 * Get hover effect classes
 */
export function getHoverEffectClasses(hoverEffect: HoverEffect): string {
  const effects: Record<HoverEffect, string> = {
    none: '',
    lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
    glow: 'hover:shadow-xl hover:shadow-indigo-500/20 transition-shadow duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    slide: 'hover:translate-x-1 transition-transform duration-200',
    fade: 'hover:opacity-80 transition-opacity duration-200',
  };
  return effects[hoverEffect] || '';
}

/**
 * Get border classes
 */
export function getBorderClasses(border?: BlockStyle['border']): string {
  if (!border || !border.width) return '';
  const width = border.width || 1;
  const style = border.style || 'solid';
  return `border-${width === 1 ? '' : `[${width}px]`} border-${style}`;
}

/**
 * Get border style
 */
export function getBorderStyle(border?: BlockStyle['border']): React.CSSProperties {
  if (!border) return {};
  return {
    borderWidth: `${border.width || 1}px`,
    borderStyle: border.style || 'solid',
    borderColor: border.color || 'currentColor',
  };
}

/**
 * Apply block style to component props
 */
export function applyBlockStyle(style: BlockStyle | undefined, defaultColor?: string) {
  const shadowClass = getShadowClass(style?.shadow || 'md', style?.backgroundColor || defaultColor);
  const shadowStyle = getShadowStyle(style?.shadow || 'md', style?.backgroundColor || defaultColor);
  const borderRadiusClass = getBorderRadiusClass(style?.borderRadius);
  const borderRadiusStyle = getBorderRadiusStyle(style?.borderRadius);
  const hoverClasses = getHoverEffectClasses(style?.hoverEffect || 'lift');
  const borderClasses = getBorderClasses(style?.border);
  const borderStyle = getBorderStyle(style?.border);

  return {
    className: `${shadowClass} ${borderRadiusClass} ${hoverClasses} ${borderClasses}`.trim(),
    style: {
      ...shadowStyle,
      ...borderRadiusStyle,
      ...borderStyle,
      backgroundColor: style?.backgroundColor,
      color: style?.textColor,
    },
  };
}





