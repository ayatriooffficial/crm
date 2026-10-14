import { useId } from 'react';
import { cx } from '@/lib/cx';

/**
 * Bordered form block with a plain title. The body is a container-query
 * context so inline fields switch between label-beside and label-above on
 * the block's own width.
 */
export default function FormSection({ title, className, bodyClassName, children }) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={cx('rounded-lg border border-line px-4 py-4', className)}>
      <h2 id={titleId} className="mb-3 text-xl font-medium text-ink">
        {title}
      </h2>
      <div className={cx('@container', bodyClassName)}>{children}</div>
    </section>
  );
}
