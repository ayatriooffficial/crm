import { useId } from 'react';
import { cx } from '@/lib/cx';

/**
 * White panel with a titled header strip, as used by every form section.
 * The body is a container-query context so fields can lay themselves out
 * based on the card's width rather than the viewport (the sidebar
 * collapsing changes card width without changing the viewport).
 */
export default function Card({ title, className, bodyClassName = 'px-5 pt-10 pb-16 sm:px-[2.375rem]', children }) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={cx('rounded-xl bg-white shadow-card', className)}>
      <header className="border-b border-divider px-5 py-7 sm:px-[2.375rem]">
        <h2 id={titleId} className="text-2xl font-medium text-ink sm:text-card-title">
          {title}
        </h2>
      </header>
      <div className={cx('@container', bodyClassName)}>{children}</div>
    </section>
  );
}
