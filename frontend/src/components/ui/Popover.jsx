'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cx } from '@/lib/cx';

/**
 * Click-to-open panel anchored to its trigger. Closes on outside click,
 * Escape (focus returns to the trigger) or when `close()` is called.
 * `trigger` and `children` are render functions.
 */
export default function Popover({ trigger, children, onOpenChange, panelClassName, align = 'right', label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = useId();

  const setOpenState = useCallback(
    (next) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const close = useCallback(() => setOpenState(false), [setOpenState]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      close();
      rootRef.current?.querySelector('[aria-haspopup]')?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const triggerProps = {
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? panelId : undefined,
    onClick: () => setOpenState(!open),
  };

  return (
    <div ref={rootRef} className="relative">
      {trigger({ open, triggerProps })}
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={label}
          className={cx(
            'absolute top-full z-50 mt-3 overflow-hidden rounded-lg bg-white text-left shadow-lg ring-1 ring-black/8',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}

/** Shared header row for popover panels. */
export function PopoverHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-divider px-4 py-3">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {action}
    </div>
  );
}
