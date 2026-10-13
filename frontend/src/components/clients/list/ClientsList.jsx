'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { CLIENTS } from '@/data/clients';
import ClientsFilters, { EMPTY_FILTERS } from './ClientsFilters';
import ClientsTable from './ClientsTable';

const PAGE_SIZE = 10;

const softButton = cx('inline-flex h-12 items-center rounded-md bg-brand-soft px-4 text-lg text-brand hover:bg-brand-soft-hover', focusRing);

function matches(client, filters) {
  const needle = filters.search.trim().toLowerCase();
  if (needle && ![client.name, client.fileNo, client.mobile, client.group].some((field) => field.toLowerCase().includes(needle))) return false;
  if (filters.service && !client.services.includes(filters.service)) return false;
  if (filters.type && client.type !== filters.type) return false;
  if (filters.group && client.group.toLowerCase() !== filters.groupLabel?.toLowerCase()) return false;
  if (filters.status && client.active !== (filters.status === 'active')) return false;
  return true;
}

function sortRows(rows, { key, direction }) {
  if (!key) return rows;
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => factor * String(a[key]).localeCompare(String(b[key]), 'en', { numeric: true, sensitivity: 'base' }));
}

/** Clients list: filters, sortable table, selection, row actions and paging, all client-side. */
export default function ClientsList({ groupLabels }) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('q') ?? '';

  const [clients, setClients] = useState(CLIENTS);
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, search: initialSearch });
  const [sort, setSort] = useState({ key: null, direction: 'asc' });
  const [selected, setSelected] = useState(() => new Set());
  const [hidden, setHidden] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => sortRows(clients.filter((client) => matches(client, filters)), sort), [clients, filters, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);

  const applyFilters = useCallback(
    (next) => {
      setFilters({ ...next, groupLabel: groupLabels[next.group] });
      setPage(1);
    },
    [groupLabels],
  );

  const toggleSort = useCallback(
    (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' })),
    [],
  );

  const toggleInSet = (setter) => (id) =>
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectRow = useCallback(toggleInSet(setSelected), []);
  const toggleColumn = useCallback(toggleInSet(setHidden), []);

  const selectAll = useCallback(
    () =>
      setSelected((current) => {
        const everySelected = rows.every((row) => current.has(row.id));
        const next = new Set(current);
        rows.forEach((row) => (everySelected ? next.delete(row.id) : next.add(row.id)));
        return next;
      }),
    [rows],
  );

  const toggleActive = useCallback(
    (id) => setClients((list) => list.map((client) => (client.id === id ? { ...client, active: !client.active } : client))),
    [],
  );

  const deleteClient = useCallback((id) => {
    setClients((list) => list.filter((client) => client.id !== id));
    setSelected((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }, []);

  const exportCsv = () => {
    const source = selected.size ? filtered.filter((client) => selected.has(client.id)) : filtered;
    const header = ['File No.', 'Name', 'Type', 'Mobile', 'Group', 'Status'];
    const lines = source.map((c) => [c.fileNo, c.name, c.type, c.mobile, c.group, c.active ? 'Active' : 'Inactive']);
    const csv = [header, ...lines].map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'clients.csv' });
    link.click();
    URL.revokeObjectURL(url);
  };

  const from = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Back to Dashboard"
            className={cx('-ml-1.5 grid size-9 place-items-center rounded-md text-ink hover:bg-black/5', focusRing)}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5m6-6-6 6 6 6" />
            </svg>
          </Link>
          <h1 className="text-2xl text-ink sm:text-crumb">Clients</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={() => window.alert('Import accepts a CSV or Excel file with your client list.')} className={softButton}>
            Import
          </button>
          <button type="button" onClick={exportCsv} className={softButton}>
            Export
          </button>
          <Link
            href="/client/new"
            className={cx('inline-flex h-12 items-center gap-2.5 rounded-md bg-brand px-4 text-lg text-white hover:bg-brand-hover', focusRing)}
          >
            <PlusIcon size={18} />
            New
          </Link>
        </div>
      </div>

      <ClientsFilters key={initialSearch} initialSearch={initialSearch} onApply={applyFilters} />

      <section aria-label="Clients" className="mt-7.5 rounded-xl bg-white px-5 py-10 shadow-card sm:px-[2.375rem]">
        {selected.size > 0 && (
          <p className="mb-3 text-base text-ink-soft">
            {selected.size} selected ·{' '}
            <button type="button" onClick={() => setSelected(new Set())} className="text-brand hover:underline">
              Clear
            </button>
          </p>
        )}
        <ClientsTable
          rows={rows}
          sort={sort}
          onSort={toggleSort}
          selected={selected}
          onSelect={selectRow}
          onSelectAll={selectAll}
          hidden={hidden}
          onToggleColumn={toggleColumn}
          onToggleActive={toggleActive}
          onDelete={deleteClient}
        />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-base text-ink-soft">
          <span>
            Showing {from}–{to} of {filtered.length}
          </span>
          <div className="flex gap-2">
            {[
              ['Previous', currentPage - 1, currentPage === 1],
              ['Next', currentPage + 1, currentPage === pageCount],
            ].map(([label, target, disabled]) => (
              <button
                key={label}
                type="button"
                disabled={disabled}
                onClick={() => setPage(target)}
                className={cx('h-10 rounded-md border border-line px-4 text-ink hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50', focusRing)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
