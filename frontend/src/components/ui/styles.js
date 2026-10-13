import { cx } from '@/lib/cx';

/** Shared look for text inputs, textareas and select controls. */
export function controlClass(invalid, extra) {
  return cx(
    'w-full rounded-md border bg-white text-base text-ink outline-none transition-[border-color,box-shadow] duration-150',
    'placeholder:text-placeholder disabled:cursor-not-allowed disabled:bg-gray-50',
    invalid
      ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
      : 'border-line hover:border-line-strong focus:border-focus focus:ring-1 focus:ring-focus',
    extra,
  );
}

export const focusRing =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';
