import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';

/** "‹ › Clients › Add Client". Server component: no client JS. */
export default function ClientBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
      <Link
        href="/clients"
        aria-label="Back to Clients"
        className={cx('-ml-1.5 grid size-8 shrink-0 place-items-center rounded-md text-brand hover:bg-brand-soft', focusRing)}
      >
        <ChevronLeftIcon size={20} strokeWidth={2} />
      </Link>
      <ol className="flex min-w-0 items-center gap-1.5 text-xl">
        <li aria-hidden="true" className="text-ink-soft">
          <ChevronRightIcon size={18} strokeWidth={2} />
        </li>
        <li>
          <Link href="/clients" className={cx('rounded text-brand hover:underline', focusRing)}>
            Clients
          </Link>
        </li>
        <li aria-hidden="true" className="text-ink-soft">
          <ChevronRightIcon size={18} strokeWidth={2} />
        </li>
        <li aria-current="page" className="truncate font-semibold text-ink">
          Add Client
        </li>
      </ol>
    </nav>
  );
}
