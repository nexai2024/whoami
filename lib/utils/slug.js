// Mock slug generation for demo purposes
const usedSlugs = new Set(['demo-user']);

export async function generateSlug(title, existingSlug = null) {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  if (!baseSlug) {
    baseSlug = 'untitled';
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check for uniqueness
  while (usedSlugs.has(slug) && slug !== existingSlug) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  usedSlugs.add(slug);
  return slug;
}