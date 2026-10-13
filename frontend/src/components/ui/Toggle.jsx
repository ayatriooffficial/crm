'use client';

import { memo } from 'react';
import { cx } from '@/lib/cx';
import { focusRing } from './styles';

/** Switch styled like the screenshots (blue when on, grey outline when off). */
function Toggle({ id, name, checked, onChange, disabled, ...aria }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked, name)}
      className={cx(
        'inline-flex h-6 w-12 shrink-0 items-center rounded-full border transition-colors duration-150 disabled:opacity-50',
        focusRing,
        checked ? 'border-brand bg-brand' : 'border-toggle-off-border bg-toggle-off',
      )}
      {...aria}
    >
      <span
        aria-hidden="true"
        className={cx(
          'size-4 rounded-full transition-transform duration-150',
          checked ? 'translate-x-[1.6875rem] bg-white' : 'translate-x-[0.1875rem] bg-toggle-knob',
        )}
      />
    </button>
  );
}

export default memo(Toggle);
