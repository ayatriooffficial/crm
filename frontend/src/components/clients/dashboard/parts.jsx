'use client';

import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Field from '@/components/ui/Field';
import DateInput from '@/components/ui/DateInput';
import { controlClass, focusRing } from '@/components/ui/styles';
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileSearchIcon,
  FirstPageIcon,
  LastPageIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
} from '@/components/icons';
import { cx } from '@/lib/cx';

/* ---------- formatting ---------- */

/** "2026-10-08" → "08-10-2026" (the app's dd-mm-yyyy format). */
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}-${m}-${y}`;
}

/** "2024-11-30T12:23" → "30-11-2024 12:23 PM". */
export function formatDateTime(isoDateTime) {
  if (!isoDateTime) return '';
  const [date, time = '00:00'] = isoDateTime.split('T');
  const [h, min] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${formatDate(date)} ${String(hour12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${suffix}`;
}

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatINR = (amount) => INR.format(amount || 0);

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/* ---------- browser helpers ---------- */

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadFile(name, content, type = 'text/plain') {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function toCsv(header, rows) {
  return [header, ...rows].map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

/* ---------- layout pieces ---------- */

/** Plain white rounded panel (the tab content container). */
export function Panel({ className, children, ...rest }) {
  return (
    <section className={cx('rounded-xl bg-white shadow-card', className)} {...rest}>
      {children}
    </section>
  );
}

/** Light grey filter area used on Tasks / Expenses. */
export function FilterArea({ className, children }) {
  return <div className={cx('rounded-xl bg-[#f8f9fb] p-5', className)}>{children}</div>;
}

export function FilterLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-2.5 block text-base font-medium text-ink">
      {children}
    </label>
  );
}

const squareButton = cx('grid size-12 shrink-0 place-items-center rounded-md bg-white transition-colors hover:bg-gray-50', focusRing);

export function RefreshButton({ onClick, label = 'Reset filters' }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cx(squareButton, 'text-muted')}>
      <RefreshIcon size={22} />
    </button>
  );
}

export function ApplyButton({ onClick, label = 'Apply filters' }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cx(squareButton, 'text-brand')}>
      <ArrowRightIcon size={24} strokeWidth={1.75} />
    </button>
  );
}

export function NewButton({ onClick, children = 'New', className }) {
  return (
    <Button onClick={onClick} icon={<PlusIcon size={18} />} className={className}>
      {children}
    </Button>
  );
}

export const softButtonClass = cx(
  'inline-flex h-12 shrink-0 items-center rounded-md bg-brand-soft px-4 text-lg text-brand transition-colors hover:bg-brand-soft-hover disabled:cursor-not-allowed disabled:opacity-60',
  focusRing,
);

/* ---------- table pieces ---------- */

export const thClass = 'whitespace-nowrap px-5 py-5 text-left text-[0.9375rem] font-normal uppercase tracking-wide text-ink-soft';
export const tdClass = 'px-5 py-4 align-middle text-base text-ink';

export function Table({ head, children, minWidth = '48rem' }) {
  return (
    <div className="overflow-x-auto scrollbar-slim">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-divider">
            {head.map((label, index) => (
              <th key={label || index} scope="col" className={thClass}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const PILL_TONES = {
  pending: 'bg-[#fdf3e2] text-[#c48a2c]',
  progress: 'bg-[#e7f1fb] text-[#2b78c2]',
  hold: 'bg-[#f1f2f4] text-[#6b727c]',
  success: 'bg-[#e6f6ec] text-[#1f9a55]',
  danger: 'bg-[#fdeaea] text-[#c62f32]',
  muted: 'bg-[#fdf3e2] text-[#8a8f98]',
};

export function Pill({ tone = 'pending', children }) {
  return <span className={cx('inline-block whitespace-nowrap rounded px-2 py-0.5 text-sm', PILL_TONES[tone])}>{children}</span>;
}

export const STATUS_TONE = { Pending: 'pending', 'In-Progress': 'progress', Hold: 'hold', Completed: 'success' };

export function EmptyState({ children }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-base text-muted">
      <FileSearchIcon size={40} strokeWidth={1.2} className="text-[#9aa1ab]" />
      <p>{children}</p>
    </div>
  );
}

/* ---------- paging ---------- */

export function usePaging(rows, pageSize = 10) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = useMemo(() => rows.slice((current - 1) * pageSize, current * pageSize), [rows, current, pageSize]);
  const from = rows.length ? (current - 1) * pageSize + 1 : 0;
  const to = Math.min(current * pageSize, rows.length);
  return { pageRows, page: current, pageCount, setPage, from, to, total: rows.length };
}

/** "1-10 of 48  |<  <  >  >|" exactly like the original's footer. */
export function Pager({ paging }) {
  const { page, pageCount, setPage, from, to, total } = paging;
  const buttons = [
    ['First page', 1, page === 1, FirstPageIcon],
    ['Previous page', page - 1, page === 1, ChevronLeftIcon],
    ['Next page', page + 1, page === pageCount, ChevronRightIcon],
    ['Last page', pageCount, page === pageCount, LastPageIcon],
  ];
  return (
    <div className="flex items-center justify-end gap-6 pt-5 text-base text-ink-soft">
      <span>
        {from}-{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        {buttons.map(([label, target, disabled, Icon]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={() => setPage(target)}
            className={cx('grid size-10 place-items-center rounded-md text-ink-soft hover:bg-gray-100 disabled:cursor-default disabled:text-[#c4cbd4] disabled:hover:bg-transparent', focusRing)}
          >
            <Icon size={22} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- generic "New …" form dialog ---------- */

const asOptions = (options) => options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));

/**
 * Small data-driven form in a modal. `fields`: [{ name, label, type, options, required, placeholder }]
 * where type is text | number | date | select | multiselect | textarea.
 */
export function FormModal({ title, fields, initial = {}, submitLabel = 'Save', onSubmit, onClose }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, initial[field.name] ?? (field.type === 'multiselect' ? [] : '')])),
  );
  const [errors, setErrors] = useState({});
  const set = (value, name) => setValues((current) => ({ ...current, [name]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    fields.forEach((field) => {
      const value = values[field.name];
      if (field.required && (Array.isArray(value) ? !value.length : !String(value).trim())) nextErrors[field.name] = `${field.label} is required`;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit(values);
  };

  return (
    <Modal title={title} onClose={onClose} panelClassName="max-w-xl">
      <form onSubmit={submit} noValidate>
        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
          {fields.map((field) => {
            const id = `fm-${field.name}`;
            const wide = field.type === 'textarea' || field.type === 'multiselect' || field.wide;
            const invalid = Boolean(errors[field.name]);
            let control;
            if (field.type === 'select' || field.type === 'multiselect') {
              control = (
                <Select
                  id={id}
                  name={field.name}
                  options={asOptions(field.options)}
                  value={values[field.name]}
                  onChange={set}
                  multiple={field.type === 'multiselect'}
                  searchable={field.options.length > 6}
                  invalid={invalid}
                  aria-label={field.label}
                />
              );
            } else if (field.type === 'date') {
              control = <DateInput id={id} name={field.name} value={values[field.name]} onChange={set} invalid={invalid} />;
            } else if (field.type === 'textarea') {
              control = (
                <textarea
                  id={id}
                  value={values[field.name]}
                  onChange={(event) => set(event.target.value, field.name)}
                  placeholder={field.placeholder}
                  rows={3}
                  className={controlClass(invalid, 'block resize-y px-4 py-3')}
                />
              );
            } else {
              control = (
                <input
                  id={id}
                  type={field.type === 'number' ? 'number' : 'text'}
                  inputMode={field.type === 'number' ? 'decimal' : undefined}
                  min={field.type === 'number' ? 0 : undefined}
                  value={values[field.name]}
                  onChange={(event) => set(event.target.value, field.name)}
                  placeholder={field.placeholder}
                  className={controlClass(invalid, 'h-12 px-4')}
                />
              );
            }
            return (
              <Field
                key={field.name}
                id={id}
                label={field.label}
                labelAs={field.type === 'select' || field.type === 'multiselect' ? 'span' : 'label'}
                required={field.required}
                error={errors[field.name]}
                className={cx(wide && 'sm:col-span-2')}
              >
                {control}
              </Field>
            );
          })}
        </div>
        <div className="flex justify-end gap-3 border-t border-divider px-6 py-4">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Yes/No confirmation dialog. */
export function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="px-6 py-5 text-base text-ink-soft">{message}</p>
      <div className="flex justify-end gap-3 border-t border-divider px-6 py-4">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" className="bg-danger hover:bg-[#d23c41] active:bg-[#bf3539]" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/** Search field with the icon in its own segment, as on the Register / Passwords tabs. */
export function SearchBox({ value, onChange, label = 'Search', className }) {
  return (
    <div className={cx('flex h-12 w-full max-w-[27.375rem] overflow-hidden rounded-md border border-line bg-white focus-within:border-focus focus-within:ring-1 focus-within:ring-focus', className)}>
      <span className="grid w-12 shrink-0 place-items-center border-r border-line text-ink">
        <SearchIcon size={16} />
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="min-w-0 flex-1 px-3 text-base text-ink outline-none"
      />
    </div>
  );
}
