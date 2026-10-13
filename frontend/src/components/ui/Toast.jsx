'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, CloseIcon } from '@/components/icons';

const DISMISS_AFTER_MS = 3500;

/** Single transient confirmation. `toast` is `{ id, message }` or null. */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, DISMISS_AFTER_MS);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed right-4 top-22 z-50 sm:right-6">
      {toast && (
        <div className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-lg border-l-4 border-emerald-500 bg-white px-4 py-3 shadow-lg ring-1 ring-black/5">
          <CheckCircleIcon size={22} className="mt-px shrink-0 text-emerald-600" />
          <p className="text-base text-ink">{toast.message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="-mr-1 grid size-6 shrink-0 place-items-center rounded text-muted hover:text-ink"
          >
            <CloseIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
