'use client';

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/icons';
import { focusRing } from './styles';
import { cx } from '@/lib/cx';

/** Minimal accessible dialog rendered into <body>. Mounted only while open. */
export default function Modal({ title, description, onClose, panelClassName = 'max-w-md', divided = true, children }) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="clients-module-layer fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-10 pt-10">
      <div className="fixed inset-0" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cx('relative w-full rounded-xl bg-white shadow-xl', panelClassName)}
      >
        <div className={cx('flex items-start justify-between gap-4 px-6 py-5', divided && 'border-b border-divider')}>
          <div>
            <h2 id={titleId} className="text-[1.375rem] text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-ink-soft">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cx('-mr-2 grid size-9 place-items-center rounded-md text-ink-soft hover:bg-gray-100', focusRing)}
          >
            <CloseIcon size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
