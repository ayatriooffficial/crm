import Link from 'next/link';
import { ArrowLeftIcon, ChevronRightIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';

/** "← Clients › New Client". Server component: no client JS. */
export default function ClientBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
      <Link
        href="/clients"
        aria-label="Back to Clients"
        className={cx('-ml-1.5 grid size-9 shrink-0 place-items-center rounded-md text-ink hover:bg-black/5', focusRing)}
      >
        <ArrowLeftIcon size={24} strokeWidth={1.75} />
      </Link>
      <ol className="flex min-w-0 items-center gap-1.5 text-2xl sm:text-crumb">
        <li>
          <Link href="/clients" className={cx('rounded text-brand hover:underline', focusRing)}>
            Clients
          </Link>
        </li>
        <li aria-hidden="true" className="text-ink">
          <ChevronRightIcon size={30} strokeWidth={2} />
        </li>
        <li aria-current="page" className="truncate text-ink">
          New Client
        </li>
      </ol>
    </nav>
  );
}
