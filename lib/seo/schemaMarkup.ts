/**
 * Schema.org structured data generation for SEO
 * Supports Person, Organization, Product, Course, and Article schemas
 */

export interface PersonSchema {
  '@context': string;
  '@type': 'Person';
  name: string;
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  url?: string;
  image?: string;
  sameAs?: string[];
  email?: string;
  description?: string;
}

export interface OrganizationSchema {
  '@context': string;
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
    telephone?: string;
  };
  sameAs?: string[];
}

export interface ProductSchema {
  '@context': string;
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string[];
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability?: string;
    url?: string;
  };
  brand?: {
    '@type': 'Brand';
    name: string;
  };
}

export interface CourseSchema {
  '@context': string;
  '@type': 'Course';
  name: string;
  description?: string;
  provider: {
    '@type': 'Organization' | 'Person';
    name: string;
  };
  courseCode?: string;
  educationalLevel?: string;
  teaches?: string;
  image?: string;
  offers?: {
    '@type': 'Offer';
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

export interface ArticleSchema {
  '@context': string;
  '@type': 'Article';
  headline: string;
  description?: string;
  image?: string[];
  author: {
    '@type': 'Person';
    name: string;
  };
  datePublished?: string;
  dateModified?: string;
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
}

/**
 * Generate Person schema markup
 */
export function generatePersonSchema(data: {
  name: string;
  jobTitle?: string;
  company?: string;
  url?: string;
  image?: string;
  socialLinks?: Record<string, string>;
  email?: string;
  bio?: string;
}): PersonSchema {
  const sameAs: string[] = [];
  
  if (data.socialLinks) {
    Object.entries(data.socialLinks).forEach(([platform, handle]) => {
      if (handle) {
        const baseUrls: Record<string, string> = {
          twitter: `https://twitter.com/${handle}`,
          linkedin: `https://linkedin.com/in/${handle}`,
          instagram: `https://instagram.com/${handle}`,
          youtube: `https://youtube.com/@${handle}`,
          facebook: `https://facebook.com/${handle}`,
          github: `https://github.com/${handle}`,
          tiktok: `https://tiktok.com/@${handle}`
        };
        if (baseUrls[platform]) {
          sameAs.push(baseUrls[platform]);
        }
      }
    });
  }

  const schema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    ...(data.jobTitle && { jobTitle: data.jobTitle }),
    ...(data.company && {
      worksFor: {
        '@type': 'Organization',
        name: data.company
      }
    }),
    ...(data.url && { url: data.url }),
    ...(data.image && { image: data.image }),
    ...(data.email && { email: data.email }),
    ...(data.bio && { description: data.bio }),
    ...(sameAs.length > 0 && { sameAs })
  };

  return schema;
}

/**
 * Generate Organization schema markup
 */
export function generateOrganizationSchema(data: {
  name: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  socialLinks?: Record<string, string>;
}): OrganizationSchema {
  const sameAs: string[] = [];
  
  if (data.socialLinks) {
    Object.entries(data.socialLinks).forEach(([platform, handle]) => {
      if (handle) {
        const baseUrls: Record<string, string> = {
          twitter: `https://twitter.com/${handle}`,
          linkedin: `https://linkedin.com/company/${handle}`,
          instagram: `https://instagram.com/${handle}`,
          youtube: `https://youtube.com/@${handle}`,
          facebook: `https://facebook.com/${handle}`
        };
        if (baseUrls[platform]) {
          sameAs.push(baseUrls[platform]);
        }
      }
    });
  }

  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    ...(data.url && { url: data.url }),
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
    ...((data.email || data.phone) && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        ...(data.email && { email: data.email }),
        ...(data.phone && { telephone: data.phone })
      }
    }),
    ...(sameAs.length > 0 && { sameAs })
  };

  return schema;
}

/**
 * Generate Product schema markup
 */
export function generateProductSchema(data: {
  name: string;
  description?: string;
  image?: string | string[];
  price?: number;
  currency?: string;
  availability?: string;
  url?: string;
  brand?: string;
}): ProductSchema {
  const images = Array.isArray(data.image) 
    ? data.image 
    : data.image 
      ? [data.image] 
      : undefined;

  const schema: ProductSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    ...(data.description && { description: data.description }),
    ...(images && { image: images }),
    ...(data.price !== undefined && {
      offers: {
        '@type': 'Offer',
        price: data.price.toString(),
        priceCurrency: data.currency || 'USD',
        ...(data.availability && { availability: data.availability }),
        ...(data.url && { url: data.url })
      }
    }),
    ...(data.brand && {
      brand: {
        '@type': 'Brand',
        name: data.brand
      }
    })
  };

  return schema;
}

/**
 * Generate Course schema markup
 */
export function generateCourseSchema(data: {
  name: string;
  description?: string;
  instructorName: string;
  instructorType?: 'Person' | 'Organization';
  price?: number;
  currency?: string;
  image?: string;
  courseCode?: string;
  level?: string;
  teaches?: string;
}): CourseSchema {
  const schema: CourseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.name,
    ...(data.description && { description: data.description }),
    provider: {
      '@type': data.instructorType || 'Person',
      name: data.instructorName
    },
    ...(data.courseCode && { courseCode: data.courseCode }),
    ...(data.level && { educationalLevel: data.level }),
    ...(data.teaches && { teaches: data.teaches }),
    ...(data.image && { image: data.image }),
    ...(data.price !== undefined && {
      offers: {
        '@type': 'Offer',
        price: data.price.toString(),
        priceCurrency: data.currency || 'USD',
        availability: 'https://schema.org/InStock'
      }
    })
  };

  return schema;
}

/**
 * Generate Article schema markup
 */
export function generateArticleSchema(data: {
  headline: string;
  description?: string;
  image?: string | string[];
  authorName: string;
  datePublished?: string;
  dateModified?: string;
  publisherName?: string;
  publisherLogo?: string;
}): ArticleSchema {
  const images = Array.isArray(data.image) 
    ? data.image 
    : data.image 
      ? [data.image] 
      : undefined;

  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    ...(data.description && { description: data.description }),
    ...(images && { image: images }),
    author: {
      '@type': 'Person',
      name: data.authorName
    },
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
    ...(data.publisherName && {
      publisher: {
        '@type': 'Organization',
        name: data.publisherName,
        ...(data.publisherLogo && {
          logo: {
            '@type': 'ImageObject',
            url: data.publisherLogo
          }
        })
      }
    })
  };

  return schema;
}

/**
 * Convert schema object to JSON-LD script tag content
 */
export function schemaToJsonLd(schema: any): string {
  return JSON.stringify(schema, null, 2);
}


