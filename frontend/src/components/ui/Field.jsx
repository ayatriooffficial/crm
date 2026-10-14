import { cx } from '@/lib/cx';

export const errorId = (id) => `${id}-error`;
export const helperId = (id) => `${id}-helper`;

/**
 * Label + control + helper/error text. Pure layout, no state.
 * `inline` puts the label beside a fixed-width control
 * once the surrounding @container is wide enough; narrower, it stacks.
 */
export default function Field({ id, label, labelAs = 'label', required, helper, error, inline = false, className, children }) {
  const Label = labelAs;

  return (
    <div className={cx(inline && '@lg:grid @lg:grid-cols-[minmax(7rem,11.5rem)_1fr] @lg:items-start @lg:gap-x-5', className)}>
      {label && (
        <Label
          {...(labelAs === 'label' ? { htmlFor: id } : { id: `${id}-label` })}
          className={cx('mb-2.5 block text-base font-medium text-ink', inline && '@lg:mb-0 @lg:pt-3 @lg:font-normal')}
        >
          {label}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}
      <div className={cx('min-w-0', inline && '@lg:max-w-[22rem]')}>
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
    </div>
  );
}

/** aria-describedby value for a control inside a Field. */
export function describedBy(id, { error, helper }) {
  if (error) return errorId(id);
  if (helper) return helperId(id);
  return undefined;
}
