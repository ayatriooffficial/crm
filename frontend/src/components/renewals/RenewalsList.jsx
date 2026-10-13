'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Select from '@/components/ui/Select';
import Toast from '@/components/ui/Toast';
import FirmLogo from '@/components/layout/FirmLogo';
import { ArrowLeftIcon, CalendarIcon, PlusIcon, SortIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { CLIENTS } from '@/data/clients';
import { RENEWAL_TYPES, TODAY, addDays, buildAllRenewals } from '@/data/clientDashboard';
import {
  ApplyButton,
  EmptyState,
  FormModal,
  Pager,
  RefreshButton,
  downloadFile,
  formatDate,
  softButtonClass,
  tdClass,
  thClass,
  toCsv,
  usePaging,
} from '@/components/clients/dashboard/parts';

const ISSUE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: '365', label: 'Last 12 Months' },
  { value: '730', label: 'Last 2 Years' },
];
const EXPIRY_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'expired', label: 'Expired' },
  { value: '30', label: 'Expiring in 30 Days' },
  { value: '90', label: 'Expiring in 90 Days' },
  { value: '365', label: 'Expiring in 12 Months' },
];

const CLIENT_OPTIONS = CLIENTS.map((client) => ({ value: client.id, label: client.name }));
const CLIENT_NAMES = new Map(CLIENTS.map((client) => [client.id, client.name]));
const TYPE_OPTIONS = RENEWAL_TYPES.map((value) => ({ value, label: value }));

const FIELDS = [
  { name: 'type', label: 'Type', type: 'select', options: RENEWAL_TYPES, required: true },
  { name: 'clientId', label: 'Client', type: 'select', options: CLIENT_OPTIONS, required: true },
  { name: 'issue', label: 'Issue Date', type: 'date', required: true },
  { name: 'expiry', label: 'Expiry Date', type: 'date', required: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

function matchExpiry(expiry, range) {
  if (range === 'all') return true;
  if (range === 'expired') return expiry < TODAY;
  return expiry >= TODAY && expiry <= addDays(TODAY, Number(range));
}

let seq = 0;

export default function RenewalsList({ initialClient = '' }) {
  const start = { type: '', issue: 'all', expiry: 'all', client: CLIENT_NAMES.has(initialClient) ? initialClient : '' };
  const [rows, setRows] = useState(buildAllRenewals);
  const [draft, setDraft] = useState(start);
  const [filters, setFilters] = useState(start);
  const [sort, setSort] = useState({ key: 'expiry', direction: 'asc' });
  const [selected, setSelected] = useState(() => new Set());
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => {
    const list = rows.filter(
      (row) =>
        (!filters.type || row.type === filters.type) &&
        (filters.issue === 'all' || row.issue >= addDays(TODAY, -Number(filters.issue))) &&
        matchExpiry(row.expiry, filters.expiry) &&
        (!filters.client || row.clientId === filters.client),
    );
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => factor * String(a[sort.key]).localeCompare(String(b[sort.key])));
  }, [rows, filters, sort]);
  const paging = usePaging(filtered, 20);

  const setField = (value, name) => setDraft((current) => ({ ...current, [name]: value }));
  const toggleSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  const notify = (message) => setToast({ id: Date.now(), message });

  const exportCsv = () => {
    const source = selected.size ? filtered.filter((row) => selected.has(row.id)) : filtered;
    const csv = toCsv(
      ['Type', 'Client', 'Issue Date', 'Expiry Date', 'Notes', 'Created By'],
      source.map((row) => [row.type, row.clientName, formatDate(row.issue), formatDate(row.expiry), row.notes, row.createdBy]),
    );
    downloadFile('renewals.csv', csv, 'text/csv');
  };

  const save = (values) => {
    const item = { ...values, clientName: CLIENT_NAMES.get(values.clientId) };
    if (dialog.id) setRows((list) => list.map((row) => (row.id === dialog.id ? { ...row, ...item } : row)));
    else setRows((list) => [{ ...item, id: `renewal-new-${(seq += 1)}`, createdBy: 'You' }, ...list]);
    notify(dialog.id ? 'Renewal updated.' : 'Renewal added.');
    setDialog(null);
  };

  const sortable = (key, label) => (
    <th scope="col" className={cx(thClass, 'px-3')}>
      <button type="button" onClick={() => toggleSort(key)} className={cx('flex w-full items-center justify-between gap-2 rounded uppercase', focusRing)}>
        {label}
        <SortIcon size={16} className={cx(sort.key === key ? 'text-brand' : 'text-muted')} />
      </button>
    </th>
  );

  const pageIds = paging.pageRows.map((row) => row.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Back" className={cx('-ml-1.5 grid size-9 place-items-center rounded-md text-ink hover:bg-black/5', focusRing)}>
            <ArrowLeftIcon size={24} strokeWidth={1.75} />
          </Link>
          <h1 className="text-2xl text-ink sm:text-crumb">Renewals</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className={softButtonClass} onClick={() => notify('Import accepts a CSV with Type, Client, Issue Date, Expiry Date.')}>
            Import
          </button>
          <button type="button" className={softButtonClass} onClick={exportCsv} disabled={!filtered.length}>
            Export
          </button>
          <button
            type="button"
            onClick={() => setDialog({})}
            className={cx('inline-flex h-12 items-center gap-2.5 rounded-md bg-brand px-4 text-lg text-white hover:bg-brand-hover', focusRing)}
          >
            <PlusIcon size={18} />
            New
          </button>
        </div>
      </div>

      <section aria-label="Filters" className="rounded-xl bg-white px-5 py-8 shadow-card">
        <div className="flex flex-wrap items-end gap-[1.875rem]">
          <div className="w-full sm:w-[13.875rem]">
            <span className="mb-2.5 block text-base font-medium text-ink">Type</span>
            <Select name="type" options={TYPE_OPTIONS} value={draft.type} onChange={setField} placeholder="Select type" aria-label="Type" />
          </div>
          <div className="w-full sm:w-[21.875rem]">
            <span className="mb-2.5 block text-base font-medium text-ink">Issue Date</span>
            <Select name="issue" options={ISSUE_RANGES} value={draft.issue} onChange={setField} prefix={<CalendarIcon size={22} />} aria-label="Issue Date" />
          </div>
          <div className="w-full sm:w-[21.875rem]">
            <span className="mb-2.5 block text-base font-medium text-ink">Expiry Date</span>
            <Select name="expiry" options={EXPIRY_RANGES} value={draft.expiry} onChange={setField} prefix={<CalendarIcon size={22} />} aria-label="Expiry Date" />
          </div>
          <div className="w-full sm:w-[13.875rem]">
            <span className="mb-2.5 block text-base font-medium text-ink">Client</span>
            <Select name="client" options={CLIENT_OPTIONS} value={draft.client} onChange={setField} searchable aria-label="Client" />
          </div>
          <div className="flex gap-2.5 [&>button]:border [&>button]:border-divider">
            <button
              type="button"
              aria-label="New renewal"
              onClick={() => setDialog({})}
              className={cx('grid size-12 place-items-center rounded-md border border-divider bg-white text-ink hover:bg-gray-50', focusRing)}
            >
              <PlusIcon size={24} />
            </button>
            <RefreshButton onClick={() => { const empty = { type: '', issue: 'all', expiry: 'all', client: '' }; setDraft(empty); setFilters(empty); }} />
            <ApplyButton onClick={() => setFilters(draft)} />
          </div>
        </div>
      </section>

      <section aria-label="Renewals" className="mt-7.5 rounded-xl bg-white px-5 py-10 shadow-card sm:px-[2.375rem]">
        <div className="overflow-x-auto scrollbar-slim">
          <table className="w-full min-w-[56rem] border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb]">
                <th scope="col" className="w-12 px-2.5">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={() =>
                      setSelected((current) => {
                        const next = new Set(current);
                        pageIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
                        return next;
                      })
                    }
                    className="size-5 accent-brand"
                  />
                </th>
                {sortable('type', 'Type')}
                {sortable('clientName', 'Client')}
                {sortable('issue', 'Issue Date')}
                {sortable('expiry', 'Expiry Date')}
                <th scope="col" className={cx(thClass, 'px-3')}>Notes</th>
                <th scope="col" className={cx(thClass, 'px-3')}>Created By</th>
              </tr>
            </thead>
            <tbody>
              {paging.pageRows.map((row) => {
                const expired = row.expiry < TODAY;
                const soon = !expired && row.expiry <= addDays(TODAY, 30);
                return (
                  <tr key={row.id} className={cx('border-b border-divider', selected.has(row.id) && 'bg-[#f5f9ff]')}>
                    <td className="px-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.type} of ${row.clientName}`}
                        checked={selected.has(row.id)}
                        onChange={() =>
                          setSelected((current) => {
                            const next = new Set(current);
                            if (next.has(row.id)) next.delete(row.id);
                            else next.add(row.id);
                            return next;
                          })
                        }
                        className="size-5 accent-brand"
                      />
                    </td>
                    <td className={cx(tdClass, 'px-3')}>
                      <button type="button" onClick={() => setDialog(row)} className={cx('rounded text-left text-brand hover:underline', focusRing)}>
                        {row.type}
                      </button>
                    </td>
                    <td className={cx(tdClass, 'px-3')}>
                      <Link href={`/view-client/${row.clientId}`} className={cx('rounded text-brand hover:underline', focusRing)}>
                        {row.clientName}
                      </Link>
                    </td>
                    <td className={cx(tdClass, 'px-3')}>{formatDate(row.issue)}</td>
                    <td className={cx(tdClass, 'px-3', expired && 'text-danger', soon && 'text-[#d97a14]')}>
                      {formatDate(row.expiry)}
                      {expired && <span className="ml-2 text-sm">(Expired)</span>}
                    </td>
                    <td className={cx(tdClass, 'max-w-[16rem] px-3 text-[0.9375rem]')}>{row.notes}</td>
                    <td className={cx(tdClass, 'px-3')}>
                      <span title={row.createdBy} className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-divider">
                        <FirmLogo className="size-8" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && <EmptyState>There are no Renewals</EmptyState>}
        {filtered.length > 0 && <Pager paging={paging} />}
      </section>

      {dialog && (
        <FormModal
          title={dialog.id ? 'Edit Renewal' : 'New Renewal'}
          fields={FIELDS}
          initial={dialog.id ? dialog : { clientId: filters.client, issue: TODAY, expiry: addDays(TODAY, 365) }}
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
