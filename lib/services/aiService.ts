/**
 * AI Service
 * Shared service for interacting with Google Gemini API
 * Used by Campaign Generator, Content Repurposing, and Lead Magnet features
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Get the model instance
function getModel(modelName: string = 'gemini-1.5-pro'): GenerativeModel {
  return genAI.getGenerativeModel({ model: modelName });
}

export interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

/**
 * Generate content using Google Gemini with automatic retry logic
 */
export async function generateContent(
  options: GenerateOptions,
  retryOptions: RetryOptions = {}
): Promise<string> {
  const {
    systemPrompt,
    userPrompt,
    maxTokens = 4096,
    temperature = 0.7,
    model = 'gemini-1.5-pro',
  } = options;

  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
  } = retryOptions;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const geminiModel = getModel(model);

      // Combine system and user prompts for Gemini
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        },
      });

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No text content in Gemini response');
      }

      return text;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('API key')) {
        throw new Error('Invalid Google Gemini API key');
      }

      // Don't retry on invalid request errors
      if (error instanceof Error && error.message.includes('invalid')) {
        throw error;
      }

      // Retry on rate limit or server errors
      if (attempt < maxRetries - 1) {
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt),
          maxDelay
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw new Error(
    `Gemini API request failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Generate structured JSON content with automatic parsing
 */
export async function generateJSON<T = Record<string, string>>(
  options: GenerateOptions,
  retryOptions?: RetryOptions
): Promise<T> {
  // Add JSON instruction to the prompt
  const enhancedOptions = {
    ...options,
    userPrompt: `${options.userPrompt}\n\nIMPORTANT: Return ONLY valid JSON, no additional text or explanation.`,
  };

  const content = await generateContent(enhancedOptions, retryOptions);

  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;

    // Remove any text before the first { or [
    const trimmedJson = jsonString.trim();
    const jsonStart = Math.max(
      trimmedJson.indexOf('{') >= 0 ? trimmedJson.indexOf('{') : Infinity,
      trimmedJson.indexOf('[') >= 0 ? trimmedJson.indexOf('[') : Infinity
    );

    if (jsonStart === Infinity) {
      throw new Error('No JSON found in response');
    }

    const cleanedJson = trimmedJson.substring(jsonStart);

    return JSON.parse(cleanedJson) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse Gemini response as JSON: ${(error as Error).message}`
    );
  }
}

/**
 * Extract key points from text content
 */
export async function extractKeyPoints(
  content: string,
  count: number = 5
): Promise<string[]> {
  const systemPrompt = 'You are an expert content analyst. Extract the most important insights from content.';

  const userPrompt = `Extract the ${count} most important key points from this content. Return a JSON array of strings.

Content:
${content}

Return only a JSON array like: ["Point 1", "Point 2", ...]`;

  return generateJSON<string[]>({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
    temperature: 0.3,
  });
}

/**
 * Generate marketing copy variants
 */
export async function generateCopyVariants(
  input: {
    type: 'headline' | 'cta' | 'subject';
    context: string;
    tone: string;
    count: number;
  }
): Promise<string[]> {
  const systemPrompt = 'You are an expert marketing copywriter for course creators and coaches.';

  const typeDescriptions = {
    headline: 'attention-grabbing headlines',
    cta: 'compelling call-to-action phrases',
    subject: 'email subject lines',
  };

  const userPrompt = `Generate ${input.count} ${typeDescriptions[input.type]} with a ${input.tone} tone.

Context:
${input.context}

Return a JSON array of strings, each containing one ${input.type}.`;

  return generateJSON<string[]>({
    systemPrompt,
    userPrompt,
    maxTokens: 2048,
    temperature: 0.8,
  });
}

/**
 * Summarize content for different platforms
 */
export async function summarizeForPlatform(
  content: string,
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook',
  tone: string = 'professional'
): Promise<string> {
  const systemPrompt = 'You are an expert social media content creator.';

  const platformSpecs = {
    twitter: 'a Twitter/X post (max 280 characters)',
    linkedin: 'a LinkedIn post (engaging, professional, 1-3 paragraphs)',
    instagram: 'an Instagram caption (storytelling, engaging, with line breaks)',
    facebook: 'a Facebook post (conversational, community-focused)',
  };

  const userPrompt = `Create ${platformSpecs[platform]} from this content with a ${tone} tone.

Original content:
${content}

Return only the post text, no additional formatting or explanation.`;

  return generateContent({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
    temperature: 0.7,
  });
}

/**
 * Generate opt-in copy for lead magnets
 */
export async function generateOptInCopy(input: {
  magnetName: string;
  magnetType: string;
  targetAudience?: string;
  benefits?: string[];
}): Promise<{
  headline: string;
  subheadline: string;
  benefits: string[];
}> {
  const systemPrompt = 'You are an expert conversion copywriter specializing in lead magnet opt-in pages.';

  const userPrompt = `Create compelling opt-in copy for this lead magnet:

Name: ${input.magnetName}
Type: ${input.magnetType}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ''}
${input.benefits ? `Key Benefits: ${input.benefits.join(', ')}` : ''}

Return JSON with:
{
  "headline": "attention-grabbing headline (5-10 words)",
  "subheadline": "supporting subheadline (10-15 words)",
  "benefits": ["benefit 1", "benefit 2", "benefit 3"]
}`;

  return generateJSON({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
    temperature: 0.7,
  });
}

/**
 * Generate complete page template from natural language description
 */
export async function generatePageTemplate(input: {
  prompt: string;
  templateType: 'BIO_ONLY' | 'FULL_PAGE';
  preferences?: {
    headerStyle?: 'minimal' | 'card' | 'gradient' | 'split';
    colorScheme?: string;
    includeBlocks?: string[];
  };
}): Promise<{
  name: string;
  description: string;
  category: string;
  headerData: Record<string, any>;
  blocksData: Record<string, any>[];
  suggestedTags: string[];
}> {
  const systemPrompt = 'You are a professional web designer creating page templates.';

  const blockDataExamples = `
Example block data structures:
- link block: {url: "https://example.com", icon: "link", featured: false}
- product block: {productId: null, price: 99, currency: "USD", ctaText: "Buy Now", originalPrice: null}
- email_capture block: {placeholder: "Enter your email", buttonText: "Subscribe", successMessage: "Thank you!", formId: null}
- portfolio block: {items: [{title: "Project Name", description: "Description", imageUrl: null, projectUrl: "https://...", tags: ["tag1"]}]}
- contact_form block: {fields: [{name: "name", type: "text", required: true, placeholder: "Your Name"}], submitButtonText: "Send", successMessage: "Message sent!"}
- text_block: {content: "Your text content here", alignment: "left"}
- newsletter: {placeholder: "Email address", buttonText: "Subscribe", successMessage: "Welcome!", frequency: "weekly"}
- social_share: {platforms: ["twitter", "linkedin", "facebook", "email"], shareText: "Check this out!"}
- divider: {style: "line", thickness: 1}
- promo: {items: ["Bonus 1", "Bonus 2"], expiresAt: null}
`;

  const userPrompt = `Generate a JSON structure for a ${input.templateType} template.

User request: ${input.prompt}

Requirements:
- headerStyle: ${input.preferences?.headerStyle || 'select most appropriate: minimal, card, gradient, or split'}
- colorScheme: ${input.preferences?.colorScheme || 'modern and professional'}
${input.templateType === 'FULL_PAGE' ? `- Include these block types if specified: ${input.preferences?.includeBlocks?.join(', ') || '3-8 relevant blocks based on the request'}` : '- No blocks (bio-only template)'}

Generate a complete template with:
1. Inferred category from: Bio, Portfolio, Link-in-Bio, E-commerce, Course Creator, Event Landing, Newsletter Signup, Service Business, Product Launch, Minimalist
2. Professional name (descriptive, no generic prefixes)
3. Compelling description (50-150 characters)
4. Complete headerData with realistic placeholder content
5. ${input.templateType === 'FULL_PAGE' ? 'Array of 3-8 blocks with complete configurations' : 'Empty blocks array'}
6. Suggested tags (3-5 relevant keywords)

Header fields to populate:
- displayName: Professional name placeholder (or empty string if not applicable)
- title: Role/position placeholder (or empty string)
- company: Company name if relevant (or empty string)
- bio: Compelling bio text (50-200 words) matching template purpose
- email: Realistic placeholder or empty string
- phone: Placeholder or empty string  
- website: Placeholder or empty string
- location: "City, Country" format or empty string
- avatar: null
- backgroundImage: null
- socialLinks: Object with platforms: {twitter: "username" or "", instagram: "", linkedin: "", facebook: "", github: "", youtube: "", tiktok: "", custom: []}
- customIntroduction: Optional highlighted message or empty string
- headerStyle: One of: minimal, card, gradient, split

${input.templateType === 'FULL_PAGE' ? `
Block types available: LINK, PRODUCT, EMAIL_CAPTURE, IMAGE_GALLERY, MUSIC_PLAYER, VIDEO_EMBED, BOOKING_CALENDAR, TIP_JAR, SOCIAL_FEED, AMA_BLOCK, GATED_CONTENT, RSS_FEED, PORTFOLIO, CONTACT_FORM, DIVIDER, TEXT_BLOCK, ANALYTICS, PROMO, DISCOUNT, SOCIAL_SHARE, WAITLIST, NEWSLETTER, CUSTOM

For each block provide:
- type: BlockType in UPPERCASE (e.g., "LINK", "PRODUCT", "CONTACT_FORM")
- position: Sequential integer starting from 0
- title: Block title (string)
- description: Optional description (string or null)
- url: URL if applicable (string or null)
- imageUrl: null (user will upload)
- backgroundColor: Hex color matching colorScheme
- textColor: Hex color for contrast
- borderRadius: 8 or higher for modern look
- data: Type-specific data object

${blockDataExamples}
` : ''}

Return JSON with this exact structure:
{
  "name": "template name",
  "description": "template description",
  "category": "category name",
  "headerData": {
    "displayName": "...",
    "title": "...",
    "company": "...",
    "bio": "...",
    "email": "...",
    "phone": "...",
    "website": "...",
    "location": "...",
    "avatar": null,
    "backgroundImage": null,
    "socialLinks": {...},
    "customIntroduction": "...",
    "headerStyle": "..."
  },
  "blocksData": [...],
  "suggestedTags": ["tag1", "tag2", "tag3"]
}

Return ONLY valid JSON, no markdown formatting.`;

  const result = await generateJSON({
    systemPrompt,
    userPrompt,
    maxTokens: 8000,
    temperature: 0.8,
  }, { maxRetries: 2 });

  // Validate required fields
  if (!result.name || !result.category || !result.headerData) {
    throw new Error('Generated template missing required fields');
  }

  if (!result.headerData.headerStyle || !['minimal', 'card', 'gradient', 'split'].includes(result.headerData.headerStyle)) {
    throw new Error('Invalid or missing headerStyle in generated template');
  }

  if (input.templateType === 'FULL_PAGE' && !Array.isArray(result.blocksData)) {
    throw new Error('FULL_PAGE template must have blocksData array');
  }

  // Ensure all block types are UPPERCASE (post-process to handle any AI variance)
  if (Array.isArray(result.blocksData)) {
    result.blocksData = result.blocksData.map((block: any) => ({
      ...block,
      type: block.type ? block.type.toUpperCase() : block.type
    }));
  }

  return result as any;
}

/**
 * Regenerate specific section of existing template
 */
export async function regenerateTemplateSection(input: {
  currentTemplate: {
    name: string;
    category: string;
    templateType: 'BIO_ONLY' | 'FULL_PAGE';
    headerData: Record<string, any>;
    blocksData: Record<string, any>[];
  };
  section: 'header' | 'block';
  blockIndex?: number;
  prompt: string;
}): Promise<Record<string, any>> {
  const systemPrompt = 'You are a professional web designer refining page templates based on user feedback.';

  if (input.section === 'header') {
    const userPrompt = `Regenerate the header/bio section of this template based on user feedback.

Current header data:
${JSON.stringify(input.currentTemplate.headerData, null, 2)}

User feedback: ${input.prompt}

Regenerate the header while:
- Preserving the overall headerStyle unless user requests change
- Keeping structural elements (fields, social platforms) unless user requests changes
- Applying the requested modifications
- Maintaining professional quality and visual appeal

Return complete headerData JSON with all required fields:
- displayName, title, company, bio, email, phone, website, location
- avatar: null, backgroundImage: null
- socialLinks object with all platforms
- customIntroduction
- headerStyle (must be one of: minimal, card, gradient, split)

Return ONLY valid JSON, no markdown formatting.`;

    const result = await generateJSON({
      systemPrompt,
      userPrompt,
      maxTokens: 4000,
      temperature: 0.7,
    }, { maxRetries: 2 });

    if (!result.headerStyle || !['minimal', 'card', 'gradient', 'split'].includes(result.headerStyle)) {
      throw new Error('Invalid headerStyle in regenerated header');
    }

    return result;
  } else if (input.section === 'block') {
    if (input.blockIndex === undefined || input.blockIndex < 0 || input.blockIndex >= input.currentTemplate.blocksData.length) {
      throw new Error('Invalid blockIndex for block regeneration');
    }

    const currentBlock = input.currentTemplate.blocksData[input.blockIndex];

    const userPrompt = `Regenerate this page block based on user feedback.

Current block:
${JSON.stringify(currentBlock, null, 2)}

User feedback: ${input.prompt}

Regenerate the block while:
- Preserving the block type unless user requests change
- Maintaining position: ${input.blockIndex}
- Applying the requested modifications
- Keeping styling consistent with template

Block must have these fields:
- type (block type string)
- position (integer)
- title (string)
- description (string or null)
- url (string or null)
- imageUrl (null)
- backgroundColor (hex color)
- textColor (hex color)
- borderRadius (integer)
- data (type-specific object)

Return complete block JSON, no markdown formatting.`;

    const result = await generateJSON({
      systemPrompt,
      userPrompt,
      maxTokens: 2000,
      temperature: 0.7,
    }, { maxRetries: 2 });

    // Ensure position is maintained
    result.position = input.blockIndex.toString();

    return result;
  }

  throw new Error('Invalid section specified for regeneration');
}

/**
 * Check if API key is configured
 */
export function isConfigured(): boolean {
  return !!process.env.GOOGLE_GEMINI_API_KEY;
}
