import { cx } from '@/lib/cx';
import { focusRing } from './styles';

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active',
  secondary: 'border border-line bg-white text-ink hover:bg-gray-50 active:bg-gray-100',
  plain: '',
};

const SIZES = {
  md: 'h-12 gap-2.5 px-4 text-lg',
  sm: 'h-10 gap-2 px-4 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-md font-normal transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-70',
        focusRing,
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
