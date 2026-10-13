'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftIcon, ChevronRightIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { STATES } from '@/data/states';
import { useClientDashboard } from './ClientDashboardProvider';
import { ConfirmModal, FormModal } from './parts';

const TABS = [
  { label: 'Details', path: '' },
  { label: 'Services', path: 'services' },
  { label: 'Retainers', path: 'retainers' },
  { label: 'Tasks', path: 'tasks' },
  { label: 'Documents', path: 'documents' },
  { label: 'Ledger', path: 'ledger' },
  { label: 'Docs. In-Out Register', path: 'doc-register' },
  { label: 'Passwords', path: 'passwords' },
  { label: 'Expenses', path: 'expenses' },
  // In the original app Renewals opens the Renewals module filtered to this client.
  { label: 'Renewals', external: (id) => `/renewals?client=${id}` },
  { label: 'Quotations', path: 'quotations' },
];

const EDIT_FIELDS = [
  { name: 'name', label: 'Client Name', required: true },
  { name: 'contactPerson', label: 'Contact Person', required: true },
  { name: 'mobile', label: 'Mobile No.' },
  { name: 'email', label: 'Email' },
  { name: 'pan', label: 'PAN' },
  { name: 'gstin', label: 'GSTIN' },
  { name: 'address', label: 'Address', type: 'textarea' },
  { name: 'city', label: 'City' },
  { name: 'pincode', label: 'Pincode' },
  { name: 'state', label: 'State', type: 'select', options: STATES.map((state) => state.label), wide: true },
];

const softEdit = cx('inline-flex h-12 items-center rounded-md bg-brand-soft px-4 text-lg text-brand transition-colors hover:bg-brand-soft-hover', focusRing);
const softDelete = cx('inline-flex h-12 items-center rounded-md bg-[#fde8ea] px-4 text-lg text-danger transition-colors hover:bg-[#fbd9dc]', focusRing);

function DashboardTabs({ clientId }) {
  const pathname = usePathname();
  const base = `/view-client/${clientId}`;

  return (
    <nav aria-label="Client sections" className="-mx-1 overflow-x-auto no-scrollbar xl:mx-0 xl:overflow-visible">
      <ul className="flex w-max flex-nowrap xl:w-auto xl:flex-wrap">
        {TABS.map((tab) => {
          const href = tab.external ? tab.external(clientId) : tab.path ? `${base}/${tab.path}` : base;
          const active = !tab.external && pathname === href;
          return (
            <li key={tab.label}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'relative flex h-[3.5625rem] items-center whitespace-nowrap px-[0.9375rem] text-[1.0625rem] transition-colors',
                  active ? 'text-brand' : 'text-ink-soft hover:text-brand',
                  focusRing,
                )}
              >
                {tab.label}
                {active && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-brand" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Breadcrumb + Edit/Delete, the client name card and the tab bar around each tab page. */
export default function ClientDashboardShell({ children }) {
  const { data, dispatch, notify } = useClientDashboard();
  const router = useRouter();
  const [dialog, setDialog] = useState(null);
  const { client, details } = data;

  const saveEdit = (values) => {
    const { name, ...rest } = values;
    dispatch({ type: 'client', patch: { name: name.trim(), mobile: rest.mobile } });
    dispatch({ type: 'details', patch: rest });
    setDialog(null);
    notify('Client details updated.');
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
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
              Client Dashboard
            </li>
          </ol>
        </nav>
        <div className="flex gap-2.5">
          <button type="button" className={softEdit} onClick={() => setDialog('edit')}>
            Edit
          </button>
          <button type="button" className={softDelete} onClick={() => setDialog('delete')}>
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[22.1875rem_minmax(0,1fr)] xl:gap-[1.875rem]">
        <aside className="self-start rounded-xl bg-white px-[2.375rem] py-[3.25rem] shadow-card">
          <h1 className="break-words text-[1.625rem] leading-9 text-ink">{client.name}</h1>
          {client.fileNo && <p className="mt-1 text-base text-muted">File No. {client.fileNo}</p>}
        </aside>

        <div className="min-w-0">
          <DashboardTabs clientId={client.id} />
          <div className="mt-5">{children}</div>
        </div>
      </div>

      {dialog === 'edit' && (
        <FormModal
          title="Edit Client"
          fields={EDIT_FIELDS}
          initial={{ ...details, name: client.name }}
          onSubmit={saveEdit}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'delete' && (
        <ConfirmModal
          title="Delete Client"
          message={`Are you sure you want to delete ${client.name}? All tasks, documents and ledger entries of this client will be removed.`}
          onConfirm={() => {
            setDialog(null);
            router.push('/clients');
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
