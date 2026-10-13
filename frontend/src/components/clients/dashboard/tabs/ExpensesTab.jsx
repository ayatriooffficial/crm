'use client';

import { useMemo, useState } from 'react';
import Select from '@/components/ui/Select';
import { CalendarIcon } from '@/components/icons';
import { controlClass, focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { EXPENSE_CATEGORIES, PAYMENT_MODES, TODAY, addDays } from '@/data/clientDashboard';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import {
  ApplyButton,
  EmptyState,
  FilterArea,
  FilterLabel,
  FormModal,
  NewButton,
  Pager,
  Panel,
  Pill,
  RefreshButton,
  Table,
  formatDate,
  formatINR,
  tdClass,
  usePaging,
} from '../parts';

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '365', label: 'Last 12 Months' },
];

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'category', label: 'Category', type: 'select', options: EXPENSE_CATEGORIES, required: true },
  { name: 'mode', label: 'Mode', type: 'select', options: PAYMENT_MODES, required: true },
  { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const EMPTY = { range: 'all', search: '', category: '' };

export default function ExpensesTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const [dialog, setDialog] = useState(null);

  const rows = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    return data.expenses.filter(
      (row) =>
        (filters.range === 'all' || row.date >= addDays(TODAY, -Number(filters.range))) &&
        (!filters.category || row.category === filters.category) &&
        (!needle || `${row.category} ${row.mode} ${row.notes}`.toLowerCase().includes(needle)),
    );
  }, [data.expenses, filters]);
  const paging = usePaging(rows, 10);
  const setField = (value, name) => setDraft((current) => ({ ...current, [name]: value }));

  const save = (values) => {
    const item = { ...values, amount: Number(values.amount) || 0 };
    if (dialog.id) dispatch({ type: 'update', key: 'expenses', id: dialog.id, patch: item });
    else dispatch({ type: 'add', key: 'expenses', prepend: true, item: { ...item, id: newId('e'), billed: false } });
    notify(dialog.id ? 'Expense updated.' : 'Expense added.');
    setDialog(null);
  };

  return (
    <Panel className="px-5 py-9 sm:px-[2.375rem]">
      <FilterArea>
        <div className="flex flex-wrap items-end gap-5">
          <div className="w-full sm:w-[13.875rem]">
            <FilterLabel>Date</FilterLabel>
            <Select name="range" options={DATE_RANGES} value={draft.range} onChange={setField} prefix={<CalendarIcon size={22} />} aria-label="Date" />
          </div>
          <div className="w-full sm:w-[14.5rem]">
            <FilterLabel htmlFor="expense-search">Search</FilterLabel>
            <input
              id="expense-search"
              value={draft.search}
              onChange={(event) => setField(event.target.value, 'search')}
              onKeyDown={(event) => event.key === 'Enter' && setFilters(draft)}
              className={controlClass(false, 'h-12 px-4')}
            />
          </div>
          <div className="w-full sm:w-[14.625rem]">
            <FilterLabel>Category</FilterLabel>
            <Select name="category" options={EXPENSE_CATEGORIES.map((value) => ({ value, label: value }))} value={draft.category} onChange={setField} separator aria-label="Category" />
          </div>
          <div className="flex gap-2.5 sm:ml-auto">
            <RefreshButton onClick={() => { setDraft(EMPTY); setFilters(EMPTY); }} />
            <ApplyButton onClick={() => setFilters(draft)} />
            <NewButton onClick={() => setDialog({})} />
          </div>
        </div>
      </FilterArea>

      <div className="mt-8">
        <Table head={['Date', 'Category', 'Mode', 'Notes', 'Amount', 'Billing']} minWidth="48rem">
          {paging.pageRows.map((row) => (
            <tr key={row.id} className="border-b border-divider">
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(row.date)}</td>
              <td className={cx(tdClass, 'max-w-[9rem]')}>
                <button type="button" onClick={() => setDialog(row)} className={cx('rounded text-left text-brand hover:underline', focusRing)}>
                  {row.category}
                </button>
              </td>
              <td className={tdClass}>{row.mode}</td>
              <td className={cx(tdClass, 'max-w-[10rem] text-[0.9375rem]')}>{row.notes}</td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatINR(row.amount)}</td>
              <td className={tdClass}>
                <button
                  type="button"
                  title={row.billed ? 'Mark as unbilled' : 'Mark as billed'}
                  onClick={() => dispatch({ type: 'update', key: 'expenses', id: row.id, patch: { billed: !row.billed } })}
                  className={cx('rounded', focusRing)}
                >
                  <Pill tone={row.billed ? 'success' : 'muted'}>{row.billed ? 'Billed' : 'Unbilled'}</Pill>
                </button>
              </td>
            </tr>
          ))}
        </Table>
        {!rows.length && <EmptyState>There are no Expenses</EmptyState>}
        <Pager paging={paging} />
      </div>

      {dialog && (
        <FormModal
          title={dialog.id ? 'Edit Expense' : 'New Expense'}
          fields={FIELDS}
          initial={dialog.id ? { ...dialog, amount: String(dialog.amount) } : { date: TODAY, mode: 'Bank Transfer' }}
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}
    </Panel>
  );
}
