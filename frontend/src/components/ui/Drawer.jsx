'use client';

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/icons';
import { focusRing } from './styles';
import { cx } from '@/lib/cx';

/**
 * Right-hand slide-over panel (What's new, Notifications). Mounted only
 * while open; Escape or the backdrop closes it.
 */
export default function Drawer({ title, headerExtra, onClose, bodyClassName, children }) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
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
    <div className="clients-module-layer fixed inset-0 z-50">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 animate-[fade_150ms_ease-out] bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-[31rem] max-w-full animate-[slide-in_200ms_ease-out] flex-col bg-white shadow-2xl"
      >
        <div className="flex h-18 shrink-0 items-center gap-2 bg-[#f6f8fa] pl-6 pr-4">
          <h2 id={titleId} className="text-[1.375rem] text-ink">
            {title}
          </h2>
          {headerExtra}
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close"
            className={cx('ml-auto grid size-10 place-items-center rounded-md text-ink-soft hover:bg-black/5', focusRing)}
          >
            <CloseIcon size={24} />
          </button>
        </div>
        <div className={cx('scrollbar-slim min-h-0 flex-1 overflow-y-auto overscroll-contain', bodyClassName)}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
