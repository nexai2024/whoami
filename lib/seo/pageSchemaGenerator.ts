/**
 * Automatic schema markup generation for pages
 * Analyzes page data and generates appropriate schema markup
 */

import { 
  generatePersonSchema, 
  generateOrganizationSchema,
  generateProductSchema,
  generateCourseSchema,
  PersonSchema,
  OrganizationSchema,
  ProductSchema,
  CourseSchema
} from './schemaMarkup';

interface PageData {
  title?: string;
  description?: string;
  user?: {
    profile?: {
      displayName?: string;
      title?: string;
      company?: string;
      bio?: string;
      email?: string;
      phone?: string;
      website?: string;
      avatar?: string;
      socialLinks?: Record<string, string>;
    };
  };
  blocks?: Array<{
    type: string;
    title?: string;
    description?: string;
    data?: any;
  }>;
  customDomain?: string;
  subdomain?: string;
}

/**
 * Automatically generate schema markup based on page content
 */
export function generatePageSchema(pageData: PageData, baseUrl: string): {
  type: 'Person' | 'Organization' | 'Product' | 'Course';
  schema: PersonSchema | OrganizationSchema | ProductSchema | CourseSchema;
} | null {
  const profile = pageData.user?.profile;
  
  if (!profile) {
    return null;
  }

  // Determine page type based on content
  const hasProducts = pageData.blocks?.some(b => b.type === 'PRODUCT');
  const hasCourses = pageData.blocks?.some(b => b.type === 'COURSE');
  const isOrganization = profile.company && !profile.displayName;

  // Build page URL
  const pageUrl = pageData.customDomain
    ? `https://${pageData.customDomain}`
    : pageData.subdomain
      ? `${baseUrl}/p/${pageData.subdomain}`
      : undefined;

  // Generate Person schema (most common for bio pages)
  if (!isOrganization && !hasProducts && !hasCourses) {
    const schema = generatePersonSchema({
      name: profile.displayName || 'User',
      jobTitle: profile.title || undefined,
      company: profile.company || undefined,
      url: pageUrl,
      image: profile.avatar || undefined,
      socialLinks: profile.socialLinks || {},
      email: profile.email || undefined,
      bio: profile.bio || undefined
    });

    return {
      type: 'Person',
      schema
    };
  }

  // Generate Organization schema for business pages
  if (isOrganization && profile.company) {
    const schema = generateOrganizationSchema({
      name: profile.company,
      url: pageUrl,
      logo: profile.avatar || undefined,
      description: profile.bio || pageData.description || undefined,
      email: profile.email || undefined,
      phone: profile.phone || undefined,
      socialLinks: profile.socialLinks || {}
    });

    return {
      type: 'Organization',
      schema
    };
  }

  // Generate Product schema if products are present
  if (hasProducts) {
    const productBlock = pageData.blocks?.find(b => b.type === 'PRODUCT');
    if (productBlock) {
      const schema = generateProductSchema({
        name: productBlock.title || pageData.title || 'Product',
        description: productBlock.description || pageData.description || undefined,
        price: productBlock.data?.price,
        currency: productBlock.data?.currency || 'USD',
        url: pageUrl,
        brand: profile.company || profile.displayName || undefined
      });

      return {
        type: 'Product',
        schema
      };
    }
  }

  // Generate Course schema if courses are present
  if (hasCourses) {
    const courseBlock = pageData.blocks?.find(b => b.type === 'COURSE');
    if (courseBlock) {
      const schema = generateCourseSchema({
        name: courseBlock.title || pageData.title || 'Course',
        description: courseBlock.description || pageData.description || undefined,
        instructorName: profile.displayName || 'Instructor',
        instructorType: profile.company ? 'Organization' : 'Person',
        price: courseBlock.data?.price,
        currency: courseBlock.data?.currency || 'USD'
      });

      return {
        type: 'Course',
        schema
      };
    }
  }

  // Default to Person schema
  const schema = generatePersonSchema({
    name: profile.displayName || 'User',
    jobTitle: profile.title || undefined,
    company: profile.company || undefined,
    url: pageUrl,
    image: profile.avatar || undefined,
    socialLinks: profile.socialLinks || {},
    email: profile.email || undefined,
    bio: profile.bio || undefined
  });

  return {
    type: 'Person',
    schema
  };
}


