import { cx } from '@/lib/cx';

export const errorId = (id) => `${id}-error`;
export const helperId = (id) => `${id}-helper`;

/** Label + control + helper/error text. Pure layout, no state. */
export default function Field({ id, label, labelAs = 'label', required, helper, error, className, children }) {
  const Label = labelAs;

  return (
    <div className={className}>
      {label && (
        <Label
          {...(labelAs === 'label' ? { htmlFor: id } : { id: `${id}-label` })}
          className="mb-2.5 block text-base font-medium text-ink"
        >
          {label}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {error ? (
        <p id={errorId(id)} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : (
        helper && (
          <p id={helperId(id)} className={cx('mt-2 text-sm leading-[1.35rem] text-muted')}>
            {helper}
          </p>
        )
      )}
    </div>
  );
}

/** aria-describedby value for a control inside a Field. */
export function describedBy(id, { error, helper }) {
  if (error) return errorId(id);
  if (helper) return helperId(id);
  return undefined;
}
