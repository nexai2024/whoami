import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  generatePersonSchema, 
  generateOrganizationSchema,
  generateProductSchema,
  generateCourseSchema,
  schemaToJsonLd 
} from '@/lib/seo/schemaMarkup';

const SEOHead = ({ 
  title, 
  description, 
  ogImage, 
  url, 
  type = 'website',
  schema,
  keywords,
  author
}) => {
  const defaultTitle = 'WhoAmI - Link in Bio Platform';
  const defaultDescription = 'Create your ultimate link-in-bio page with advanced features, analytics, and monetization tools.';
  const defaultImage = 'https://whoami.bio/og-image.jpg';

  // Generate schema markup if provided
  let schemaJsonLd = null;
  if (schema) {
    let schemaData = null;
    
    if (schema.type === 'Person') {
      schemaData = generatePersonSchema(schema.data);
    } else if (schema.type === 'Organization') {
      schemaData = generateOrganizationSchema(schema.data);
    } else if (schema.type === 'Product') {
      schemaData = generateProductSchema(schema.data);
    } else if (schema.type === 'Course') {
      schemaData = generateCourseSchema(schema.data);
    }

    if (schemaData) {
      schemaJsonLd = schemaToJsonLd(schemaData);
    }
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultImage} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content="WhoAmI" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#6366f1" />
      <meta name="author" content={author || "WhoAmI"} />

      {/* Schema.org Structured Data */}
      {schemaJsonLd && (
        <script type="application/ld+json">
          {schemaJsonLd}
        </script>
      )}

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Helmet>
  );
};

export default SEOHead;