/**
 * Template Generator Utility
 * Creates standardized template structures with validation
 */

import { getThemeForIndustry, type ThemeConfig, type HeaderStyle } from './designSystem';

export interface HeaderData {
  headerStyle: HeaderStyle;
  displayName?: string;
  title?: string;
  company?: string;
  bio?: string;
  customIntroduction?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export interface BlockData {
  type: string;
  position: number;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  data?: Record<string, any>;
}

export interface Template {
  id?: string;
  name: string;
  category: string;
  industry?: string;
  description: string;
  thumbnailUrl: string;
  previewUrl?: string;
  featured: boolean;
  
  // Design
  headerData: HeaderData;
  blocksData: BlockData[];
  theme: ThemeConfig;
  
  // Metadata
  tags: string[];
  useCount: number;
  rating: number;
  createdAt?: Date;
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
}

export interface HeaderConfig {
  style: HeaderStyle;
  displayName?: string;
  title?: string;
  company?: string;
  bio?: string;
  customIntroduction?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: any;
}

export interface BlockConfig {
  type: string;
  position: number;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  data?: Record<string, any>;
}

export interface CreateTemplateConfig {
  name: string;
  category: string;
  industry?: string;
  description: string;
  thumbnailUrl: string;
  previewUrl?: string;
  featured?: boolean;
  header: HeaderConfig;
  blocks: BlockConfig[];
  theme?: ThemeConfig;
  tags?: string[];
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
}

/**
 * Validates header configuration
 */
function validateHeader(header: HeaderConfig): void {
  if (!header.style || !['minimal', 'card', 'gradient', 'split'].includes(header.style)) {
    throw new Error('Invalid header style. Must be one of: minimal, card, gradient, split');
  }
}

/**
 * Validates block configurations
 */
function validateBlocks(blocks: BlockConfig[], templateType: 'BIO_ONLY' | 'FULL_PAGE'): void {
  if (templateType === 'FULL_PAGE' && blocks.length === 0) {
    throw new Error('FULL_PAGE templates must have at least one block');
  }

  // Check for duplicate positions
  const positions = blocks.map(b => b.position);
  const uniquePositions = new Set(positions);
  if (positions.length !== uniquePositions.size) {
    throw new Error('Block positions must be unique');
  }

  // Validate block types
  const validBlockTypes = [
    'LINK', 'TEXT', 'IMAGE', 'VIDEO', 'BUTTON', 'SOCIAL', 
    'EMBED', 'CONTACT', 'FORM', 'CALENDAR', 'PRODUCT', 'TESTIMONIAL'
  ];
  
  for (const block of blocks) {
    if (!validBlockTypes.includes(block.type.toUpperCase())) {
      console.warn(`Unknown block type: ${block.type}. Consider using one of: ${validBlockTypes.join(', ')}`);
    }
  }
}

/**
 * Applies theme to header and blocks
 */
function applyTheme(
  header: HeaderData,
  blocks: BlockData[],
  theme: ThemeConfig
): { header: HeaderData; blocks: BlockData[] } {
  // Apply theme colors to header if not explicitly set
  const themedHeader: HeaderData = {
    ...header,
    backgroundColor: header.backgroundColor || theme.colors.background,
    textColor: header.textColor || theme.colors.text,
  };

  // Apply theme colors to blocks if not explicitly set
  const themedBlocks: BlockData[] = blocks.map(block => ({
    ...block,
    backgroundColor: block.backgroundColor || theme.colors.surface,
    textColor: block.textColor || theme.colors.text,
  }));

  return { header: themedHeader, blocks: themedBlocks };
}

/**
 * Creates a template from configuration
 */
export function createTemplate(config: CreateTemplateConfig): Template {
  // Validate required fields
  if (!config.name || !config.category || !config.header || !config.thumbnailUrl) {
    throw new Error('Missing required fields: name, category, header, thumbnailUrl');
  }

  // Validate header
  validateHeader(config.header);

  // Validate blocks
  validateBlocks(config.blocks, config.templateType);

  // Generate theme if not provided
  let theme = config.theme;
  if (!theme && config.industry) {
    theme = getThemeForIndustry(config.industry);
  } else if (!theme) {
    // Default theme
    theme = getThemeForIndustry('Consultant');
  }

  // Build header data
  const headerData: HeaderData = {
    headerStyle: config.header.style,
    displayName: config.header.displayName,
    title: config.header.title,
    company: config.header.company,
    bio: config.header.bio,
    customIntroduction: config.header.customIntroduction,
    profileImageUrl: config.header.profileImageUrl,
    coverImageUrl: config.header.coverImageUrl,
    backgroundColor: config.header.backgroundColor,
    textColor: config.header.textColor,
    ...Object.fromEntries(
      Object.entries(config.header).filter(([key]) => 
        !['style', 'displayName', 'title', 'company', 'bio', 'customIntroduction', 
          'profileImageUrl', 'coverImageUrl', 'backgroundColor', 'textColor'].includes(key)
      )
    ),
  };

  // Build blocks data
  const blocksData: BlockData[] = config.blocks.map(block => ({
    type: block.type.toUpperCase(),
    position: block.position,
    title: block.title,
    description: block.description,
    url: block.url,
    imageUrl: block.imageUrl,
    backgroundColor: block.backgroundColor,
    textColor: block.textColor,
    borderRadius: block.borderRadius || 8,
    data: block.data || {},
  }));

  // Apply theme
  const { header: themedHeader, blocks: themedBlocks } = applyTheme(headerData, blocksData, theme);

  // Build template
  const template: Template = {
    name: config.name,
    category: config.category,
    industry: config.industry,
    description: config.description,
    thumbnailUrl: config.thumbnailUrl,
    previewUrl: config.previewUrl,
    featured: config.featured || false,
    headerData: themedHeader,
    blocksData: themedBlocks,
    theme,
    tags: config.tags || [],
    useCount: 0,
    rating: 0,
    templateType: config.templateType,
  };

  return template;
}

/**
 * Validates an existing template structure
 */
export function validateTemplate(template: Partial<Template>): void {
  if (!template.name || !template.category || !template.headerData || !template.thumbnailUrl) {
    throw new Error('Template missing required fields: name, category, headerData, thumbnailUrl');
  }

  if (!template.templateType || !['BIO_ONLY', 'FULL_PAGE'].includes(template.templateType)) {
    throw new Error('Template must have valid templateType: BIO_ONLY or FULL_PAGE');
  }

  // Validate headerData with safer type assertion
  validateHeader(template.headerData as unknown as HeaderConfig);

  if (template.blocksData) {
    validateBlocks(template.blocksData as unknown as BlockConfig[], template.templateType);
  }
}

/**
 * Converts template to database format
 */
export function templateToDbFormat(template: Template): {
  name: string;
  description: string;
  category: string;
  industry: string | null;
  tags: string[];
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
  headerData: any;
  blocksData: any;
  theme: any;
  thumbnailUrl: string;
  previewUrl: string | null;
  featured: boolean;
} {
  return {
    name: template.name,
    description: template.description,
    category: template.category,
    industry: template.industry || null,
    tags: template.tags,
    templateType: template.templateType,
    headerData: template.headerData,
    blocksData: template.blocksData,
    theme: template.theme,
    thumbnailUrl: template.thumbnailUrl,
    previewUrl: template.previewUrl || null,
    featured: template.featured,
  };
}

