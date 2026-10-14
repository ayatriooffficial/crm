'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import {
  ArrowRightIcon,
  AvatarPlaceholder,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '@/components/icons';
import { controlClass, focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import ColumnMenu from './ColumnMenu';
import LeadFormModal from './LeadFormModal';
import { TABLE_COLUMNS, loadLeads, saveLeads } from './leadModel';

const PAGE_SIZES = [10, 15, 25, 50];
const SEARCH_FIELDS = ['fullName', 'mobile', 'aadhaarMobile', 'email', 'pan', 'referredBy'];

/* Party Full Name stays first (frozen), then the record dates, then the sheet's columns. */
const COLUMNS = [
  TABLE_COLUMNS[0],
  { key: 'createdAt', label: 'Created On', kind: 'timestamp' },
  { key: 'updatedAt', label: 'Updated On', kind: 'timestamp' },
  ...TABLE_COLUMNS.slice(1),
];
const NAME_KEY = COLUMNS[0].key;

const formatTimestamp = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const formatDob = (value) => value.split('-').reverse().join('-'); // yyyy-mm-dd -> dd-mm-yyyy, as in the sheet

/** Value used for sorting; empty cells sort last either way. */
function sortValue(column, lead) {
  const value = lead[column.key];
  if (!value) return '';
  return column.kind === 'file' ? value.name : String(value);
}

function cellText(column, lead) {
  const value = lead[column.key];
  if (!value) return null;
  if (column.kind === 'file') return value.name;
  if (column.kind === 'secret') return '••••••••';
  if (column.kind === 'date') return formatDob(value);
  if (column.kind === 'timestamp') return formatTimestamp(value);
  return value;
}

/* Spreadsheet look: every cell bordered; checkbox + Party Full Name frozen left, actions frozen right. */
const cellBase = 'border border-divider px-3';
const frozenCheck = 'sticky left-0 z-10 w-12 min-w-12';
const frozenName = 'sticky left-12 z-10 min-w-56';
const frozenActions = 'sticky right-0 z-10 w-24';

/** Leads list: search, a spreadsheet-style table of every field, column menus, paging and the Add/Edit form. */
export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: null, direction: 'asc' });
  const [hidden, setHidden] = useState(() => new Set());
  const [selected, setSelected] = useState(() => new Set());
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null = closed, {} = new lead, lead = edit
  const [managingColumns, setManagingColumns] = useState(false);
  const [toast, setToast] = useState(null);

  // localStorage exists only in the browser, so the list is read after mount.
  useEffect(() => {
    setLeads(loadLeads());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) setStorageFailed(!saveLeads(leads));
  }, [leads, loaded]);

  const visibleColumns = useMemo(() => COLUMNS.filter((column) => !hidden.has(column.key)), [hidden]);
  const [nameColumn, ...otherColumns] = visibleColumns;

  const sorted = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const matches = needle
      ? leads.filter((lead) => SEARCH_FIELDS.some((key) => String(lead[key] ?? '').toLowerCase().includes(needle)))
      : leads;
    const column = COLUMNS.find((c) => c.key === sort.key);
    if (!column) return matches;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...matches].sort((a, b) => {
      const [x, y] = [sortValue(column, a), sortValue(column, b)];
      if (!x || !y) return x ? -1 : y ? 1 : 0;
      return factor * x.localeCompare(y, 'en', { numeric: true, sensitivity: 'base' });
    });
  }, [leads, search, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const from = sorted.length ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, sorted.length);
  const allOnPageSelected = rows.length > 0 && rows.every((lead) => selected.has(lead.id));

  const notify = (message) => setToast({ id: Date.now(), message });
  const dismissToast = useCallback(() => setToast(null), []);
  const closeForm = useCallback(() => setEditing(null), []);

  const saveLead = (values) => {
    const now = new Date().toISOString();
    if (editing?.id) {
      setLeads((list) => list.map((lead) => (lead.id === editing.id ? { ...lead, ...values, updatedAt: now } : lead)));
      notify(`Lead "${values.fullName}" updated.`);
    } else {
      setLeads((list) => [{ ...values, id: crypto.randomUUID(), createdAt: now, updatedAt: now }, ...list]);
      setPage(1);
      notify(`Lead "${values.fullName}" added.`);
    }
    setEditing(null);
  };

  const removeLeads = (ids, message) => {
    if (!window.confirm(message)) return;
    setLeads((list) => list.filter((lead) => !ids.has(lead.id)));
    setSelected((current) => new Set([...current].filter((id) => !ids.has(id))));
  };

  const toggleSelected = (id) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectPage = () =>
    setSelected((current) => {
      const next = new Set(current);
      rows.forEach((lead) => (allOnPageSelected ? next.delete(lead.id) : next.add(lead.id)));
      return next;
    });

  const setColumnHidden = (key, hide) =>
    setHidden((current) => {
      const next = new Set(current);
      if (hide) next.add(key);
      else next.delete(key);
      return next;
    });

  const clearAll = () => {
    setSort({ key: null, direction: 'asc' });
    setHidden(new Set());
  };

  const headerCell = (column, className) => (
    <th key={column.key} scope="col" aria-sort={sortState(sort, column.key)} className={cx(cellBase, 'h-12 bg-surface pr-1 font-medium', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          {column.label}
          {sort.key === column.key && (
            <ArrowRightIcon size={15} className={cx('text-brand', sort.direction === 'asc' ? '-rotate-90' : 'rotate-90')} />
          )}
        </span>
        <ColumnMenu
          label={column.label}
          canHide={column.key !== NAME_KEY}
          onSort={(direction) => setSort({ key: column.key, direction })}
          onHide={() => setColumnHidden(column.key, true)}
          onManage={() => setManagingColumns(true)}
          onClearAll={clearAll}
        />
      </div>
    </th>
  );

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl text-ink sm:text-crumb">Leads ({leads.length})</h1>
        <div className="flex flex-wrap items-center gap-2.5">
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => removeLeads(selected, `Delete ${selected.size} selected lead(s)?`)}
              className={cx('inline-flex h-12 items-center gap-2 rounded-md bg-red-50 px-4 text-lg text-danger hover:bg-red-100', focusRing)}
            >
              <TrashIcon size={18} />
              Delete ({selected.size})
            </button>
          )}
          <div className="relative w-72 max-w-full">
            <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, mobile, email, PAN"
              aria-label="Search leads"
              className={controlClass(false, 'h-12 pl-10 pr-4')}
            />
          </div>
          <button
            type="button"
            onClick={() => setEditing({})}
            className={cx('inline-flex h-12 items-center gap-2.5 rounded-md bg-brand px-4 text-lg text-white hover:bg-brand-hover', focusRing)}
          >
            <PlusIcon size={18} />
            Add
          </button>
        </div>
      </div>

      {storageFailed && (
        <p role="alert" className="mb-4 rounded-md bg-amber-50 px-4 py-3 text-base text-amber-800">
          Leads couldn&apos;t be saved in this browser (storage is full or blocked). They will be lost on reload.
        </p>
      )}

      <section aria-label="Leads" className="rounded-xl bg-white px-5 py-8 shadow-card sm:px-[2.375rem]">
        <div className="scrollbar-slim overflow-x-auto rounded-md">
          <table className="w-max min-w-full border-collapse text-base">
            <thead>
              <tr className="text-left text-ink">
                <th scope="col" className={cx(cellBase, frozenCheck, 'bg-surface')}>
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectPage}
                    disabled={!rows.length}
                    aria-label="Select all leads on this page"
                    className="size-5 accent-brand"
                  />
                </th>
                {headerCell(nameColumn, frozenName)}
                {otherColumns.map((column) => headerCell(column))}
                <th scope="col" className={cx(cellBase, frozenActions, 'bg-surface')}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className={cx(cellBase, 'py-16 text-center text-muted')}>
                    {!loaded ? 'Loading…' : leads.length ? 'No leads match this search.' : 'No rows. Click Add to create a lead.'}
                  </td>
                </tr>
              ) : (
                rows.map((lead) => (
                  <tr key={lead.id} className="group text-ink">
                    <td className={cx(cellBase, frozenCheck, 'bg-white py-2 group-hover:bg-surface')}>
                      <input
                        type="checkbox"
                        checked={selected.has(lead.id)}
                        onChange={() => toggleSelected(lead.id)}
                        aria-label={`Select ${lead.fullName}`}
                        className="size-5 accent-brand"
                      />
                    </td>
                    <td className={cx(cellBase, frozenName, 'bg-white py-2 group-hover:bg-surface')}>
                      <button
                        type="button"
                        onClick={() => setEditing(lead)}
                        className={cx('flex items-center gap-3 rounded text-left text-brand hover:underline', focusRing)}
                      >
                        {lead.photo?.url ? (
                          // Stored data URLs can't go through next/image optimisation.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={lead.photo.url} alt="" className="size-8 shrink-0 rounded-full object-cover" />
                        ) : (
                          <AvatarPlaceholder className="size-8 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">{lead.fullName}</span>
                      </button>
                    </td>
                    {otherColumns.map((column) => {
                      const text = cellText(column, lead);
                      return (
                        <td
                          key={column.key}
                          title={column.kind === 'secret' ? undefined : text ?? undefined}
                          className={cx(cellBase, 'max-w-72 truncate whitespace-nowrap py-2 group-hover:bg-surface')}
                        >
                          {text ?? <span className="text-muted">—</span>}
                        </td>
                      );
                    })}
                    <td className={cx(cellBase, frozenActions, 'bg-white py-2 group-hover:bg-surface')}>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(lead)}
                          aria-label={`Edit ${lead.fullName}`}
                          className={cx('grid size-9 place-items-center rounded-md text-ink-soft hover:bg-brand-soft hover:text-brand', focusRing)}
                        >
                          <PencilIcon size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLeads(new Set([lead.id]), `Delete lead "${lead.fullName}"?`)}
                          aria-label={`Delete ${lead.fullName}`}
                          className={cx('grid size-9 place-items-center rounded-md text-ink-soft hover:bg-red-50 hover:text-danger', focusRing)}
                        >
                          <TrashIcon size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-x-8 gap-y-3 text-base text-ink">
          <label className="flex items-center gap-3 whitespace-nowrap">
            Rows per page:
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className={controlClass(false, 'h-10 w-20 px-2')}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <span>
            {from}–{to} of {sorted.length}
          </span>
          <div className="flex gap-1">
            {[
              ['Previous page', ChevronLeftIcon, currentPage - 1, currentPage === 1],
              ['Next page', ChevronRightIcon, currentPage + 1, currentPage === pageCount],
            ].map(([label, Icon, target, disabled]) => (
              <button
                key={label}
                type="button"
                disabled={disabled}
                onClick={() => setPage(target)}
                aria-label={label}
                className={cx('grid size-10 place-items-center rounded-full text-ink hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40', focusRing)}
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {managingColumns && (
        <Modal title="Manage Columns" onClose={() => setManagingColumns(false)} panelClassName="max-w-md">
          <fieldset className="scrollbar-slim max-h-[60dvh] overflow-y-auto px-6 py-4">
            <legend className="sr-only">Show columns</legend>
            {COLUMNS.map((column) => (
              <label key={column.key} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-base text-ink hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={!hidden.has(column.key)}
                  disabled={column.key === NAME_KEY}
                  onChange={(event) => setColumnHidden(column.key, !event.target.checked)}
                  className="size-4 accent-brand"
                />
                {column.label}
              </label>
            ))}
          </fieldset>
          <div className="flex justify-between gap-2.5 border-t border-divider px-6 py-4">
            <button type="button" onClick={() => setHidden(new Set())} className={cx('rounded text-base text-brand hover:underline', focusRing)}>
              Show all
            </button>
            <button
              type="button"
              onClick={() => setManagingColumns(false)}
              className={cx('h-10 rounded-md bg-brand px-4 text-base text-white hover:bg-brand-hover', focusRing)}
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {editing && <LeadFormModal lead={editing.id ? editing : null} onSave={saveLead} onClose={closeForm} />}
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}

function sortState(sort, key) {
  if (sort.key !== key) return undefined;
  return sort.direction === 'asc' ? 'ascending' : 'descending';
}
