'use client';

import { memo } from 'react';
import { cx } from '@/lib/cx';
import Field, { describedBy } from './Field';
import { controlClass } from './styles';

/**
 * Field + native input/textarea. Calls `onChange(value, name)` so parents
 * can pass one stable setter for a whole section and memo keeps
 * untouched fields from re-rendering.
 */
function TextField({
  id,
  name,
  label,
  value,
  onChange,
  required,
  helper,
  error,
  multiline = false,
  format,
  className,
  inputClassName,
  ...inputProps
}) {
  const Control = multiline ? 'textarea' : 'input';

  return (
    <Field id={id} label={label} required={required} helper={helper} error={error} className={className}>
      <Control
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(format ? format(event.target.value) : event.target.value, name)}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, { error, helper })}
        className={controlClass(error, cx(multiline ? 'block min-h-[4.625rem] resize-y px-4 py-3' : 'h-12 px-4', inputClassName))}
        {...(multiline ? { rows: 2 } : { type: 'text' })}
        {...inputProps}
      />
    </Field>
  );
}

export default memo(TextField);
