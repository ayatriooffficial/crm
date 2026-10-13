/** Joins truthy class names. Tiny replacement for `clsx`. */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
