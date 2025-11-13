export function stripHtml(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRichTextEmpty(value: string | null | undefined): boolean {
  return stripHtml(value).length === 0;
}

