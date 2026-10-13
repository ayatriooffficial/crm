'use client';

import { useMemo, useState } from 'react';
import Select from '@/components/ui/Select';
import { RepeatIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import { ApplyButton, EmptyState, FormModal, NewButton, Pager, Panel, Pill, RefreshButton, Table, formatINR, tdClass, usePaging } from '../parts';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'Fully Billed', label: 'Fully Billed' },
  { value: 'Partially Billed', label: 'Partially Billed' },
  { value: 'Unbilled', label: 'Unbilled' },
];

const FIELDS = [
  { name: 'name', label: 'Retainer Name', required: true, wide: true },
  { name: 'period', label: 'Period', type: 'select', options: ['2024-25', '2025-26', '2026-27'], required: true },
  { name: 'frequency', label: 'Billing Frequency', type: 'select', options: ['One-Time', 'Monthly', 'Quarterly', 'Yearly'], required: true },
  { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
  { name: 'billed', label: 'Already Billed (₹)', type: 'number' },
];

export function billingStatus(retainer) {
  if (retainer.billed >= retainer.amount) return 'Fully Billed';
  if (retainer.billed > 0) return 'Partially Billed';
  return 'Unbilled';
}

const STATUS_TONES = { 'Fully Billed': 'success', 'Partially Billed': 'progress', Unbilled: 'muted' };

export default function RetainersTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const [draft, setDraft] = useState('all');
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState(null);

  const rows = useMemo(
    () =>
      data.retainers.filter((retainer) => {
        if (filter === 'all') return true;
        if (filter === 'active') return retainer.active;
        if (filter === 'inactive') return !retainer.active;
        return billingStatus(retainer) === filter;
      }),
    [data.retainers, filter],
  );
  const paging = usePaging(rows, 10);

  const save = (values) => {
    const item = {
      name: values.name.trim(),
      period: values.period,
      frequency: values.frequency,
      recurring: values.frequency !== 'One-Time',
      amount: Number(values.amount) || 0,
      billed: Math.min(Number(values.billed) || 0, Number(values.amount) || 0),
    };
    if (dialog.id) dispatch({ type: 'update', key: 'retainers', id: dialog.id, patch: item });
    else dispatch({ type: 'add', key: 'retainers', prepend: true, item: { ...item, id: newId('r'), active: true } });
    notify(dialog.id ? 'Retainer updated.' : 'Retainer created.');
    setDialog(null);
  };

  return (
    <Panel className="px-5 py-9 sm:px-[2.375rem]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-40">
          <Select options={FILTERS} value={draft} onChange={setDraft} aria-label="Filter retainers" />
        </div>
        <RefreshButton
          onClick={() => {
            setDraft('all');
            setFilter('all');
          }}
        />
        <ApplyButton onClick={() => setFilter(draft)} />
        <NewButton className="ml-auto" onClick={() => setDialog({})} />
      </div>

      <div className="mt-8">
        <Table head={['Retainer', 'Billing Frequency', 'Amount', 'Billing Status']}>
          {paging.pageRows.map((retainer) => {
            const status = billingStatus(retainer);
            const share = retainer.amount ? Math.min(100, (retainer.billed / retainer.amount) * 100) : 0;
            return (
              <tr key={retainer.id} className="border-b border-divider">
                <td className={tdClass}>
                  <button
                    type="button"
                    onClick={() => setDialog(retainer)}
                    className={cx('rounded text-left text-brand hover:underline', focusRing)}
                  >
                    {retainer.name}
                  </button>
                  <div className="text-ink">{retainer.period}</div>
                </td>
                <td className={tdClass}>
                  <span className="inline-flex items-center gap-2">
                    {retainer.frequency}
                    {retainer.recurring && (
                      <span title="Recurring" className="text-[#22a05a]">
                        <RepeatIcon size={16} />
                      </span>
                    )}
                    {!retainer.active && <Pill tone="hold">Inactive</Pill>}
                  </span>
                </td>
                <td className={tdClass}>
                  <div className="inline-block">
                    <span className="text-[0.9375rem]">
                      {formatINR(retainer.billed)} / {formatINR(retainer.amount)}
                    </span>
                    <div className="mt-1 h-1 rounded-full bg-[#e3e8ef]">
                      <div className="h-1 rounded-full bg-brand" style={{ width: `${share}%` }} />
                    </div>
                  </div>
                </td>
                <td className={tdClass}>
                  <Pill tone={STATUS_TONES[status]}>{status}</Pill>
                </td>
              </tr>
            );
          })}
        </Table>
        {!rows.length && <EmptyState>There are no Retainers</EmptyState>}
        <Pager paging={paging} />
      </div>

      {dialog && (
        <FormModal
          title={dialog.id ? 'Edit Retainer' : 'New Retainer'}
          fields={FIELDS}
          initial={dialog.id ? { ...dialog, amount: String(dialog.amount), billed: String(dialog.billed) } : { period: '2026-27', frequency: 'Monthly' }}
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}
    </Panel>
  );
}
