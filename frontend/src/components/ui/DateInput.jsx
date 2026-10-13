'use client';

import { memo } from 'react';
import { cx } from '@/lib/cx';
import { CalendarIcon } from '@/components/icons';
import { controlClass } from './styles';

/**
 * Native date input dressed as the screenshot's calendar field: icon on
 * the left, empty until a date is chosen, picker opens on click.
 */
function DateInput({ id, name, value, onChange, invalid, ...rest }) {
  const openPicker = (event) => {
    try {
      event.currentTarget.showPicker?.();
    } catch {
      /* showPicker throws if not user-activated; native behaviour still works */
    }
  };

  return (
    <div className="relative">
      <CalendarIcon
        size={22}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
      />
      <input
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value, name)}
        onClick={openPicker}
        aria-invalid={invalid || undefined}
        className={controlClass(
          invalid,
          cx(
            'h-12 pl-12 pr-3 [&::-webkit-calendar-picker-indicator]:hidden',
            !value && 'text-transparent focus:text-ink',
          ),
        )}
        {...rest}
      />
    </div>
  );
}

export default memo(DateInput);
