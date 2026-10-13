export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Turns a list of labels into `{ value, label }` options with unique values. */
export function toOptions(labels) {
  const seen = new Map();
  return labels.map((label) => {
    const base = slugify(label) || 'option';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { value: count ? `${base}-${count}` : base, label };
  });
}

export const byLabel = (a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' });
