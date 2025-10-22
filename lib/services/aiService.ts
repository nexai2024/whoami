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
export async function generateJSON<T = any>(
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
 * Check if API key is configured
 */
export function isConfigured(): boolean {
  return !!process.env.GOOGLE_GEMINI_API_KEY;
}

export default {
  generateContent,
  generateJSON,
  extractKeyPoints,
  generateCopyVariants,
  summarizeForPlatform,
  generateOptInCopy,
  isConfigured,
};
