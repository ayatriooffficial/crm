'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRightIcon, CloseIcon, EyeOffIcon, KebabIcon, SettingsIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';

const MENU_WIDTH = 224;

/**
 * The ⋮ menu in a column header: sort, hide, manage columns, clear all.
 * Rendered into <body> with fixed positioning, because the table's
 * horizontal scroll container would clip an in-place dropdown.
 */
export default function ColumnMenu({ label, canHide, onSort, onHide, onManage, onClearAll }) {
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const open = position !== null;

  const close = useCallback((restoreFocus = false) => {
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.right - MENU_WIDTH), window.innerWidth - MENU_WIDTH - 8);
    setPosition({ top: rect.bottom + 6, left });
  };

  // Close on outside press, Escape, scroll or resize (the anchor would move away).
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target) && !triggerRef.current?.contains(event.target)) close();
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') close(true);
    };
    const onMove = () => close();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, close]);

  useLayoutEffect(() => {
    if (open) menuRef.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [open]);

  const run = (action) => () => {
    close(true);
    action();
  };

  const items = [
    { label: 'Sort Asc', icon: <ArrowRightIcon size={18} className="-rotate-90" />, action: () => onSort('asc') },
    { label: 'Sort Desc', icon: <ArrowRightIcon size={18} className="rotate-90" />, action: () => onSort('desc') },
    canHide && { label: 'Hide Column', icon: <EyeOffIcon size={18} />, action: onHide },
    { label: 'Manage Columns', icon: <SettingsIcon size={18} />, action: onManage },
    { label: 'Clear All', icon: <CloseIcon size={18} />, action: onClearAll },
  ].filter(Boolean);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label} column options`}
        className={cx('grid size-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-black/5 hover:text-ink', focusRing)}
      >
        <KebabIcon size={18} />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`${label} column options`}
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
            className="clients-module-layer fixed z-50 rounded-lg bg-white py-1.5 normal-case shadow-lg ring-1 ring-black/8"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={run(item.action)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-base text-ink hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                <span className="text-ink-soft">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
