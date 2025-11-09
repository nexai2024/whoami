import prisma from '../prisma.js';

export async function generateSlug(title, existingSlug = null) {
  let baseSlug = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) {
    baseSlug = 'untitled';
  }

  let slug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness against persisted pages
  while (true) {
    if (slug === existingSlug) {
      break;
    }

    const existingPage = await prisma.page.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existingPage) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}