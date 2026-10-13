'use client';

import { useMemo, useState } from 'react';
import Select from '@/components/ui/Select';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { RECURRING_SERVICES } from '@/data/services';
import { TODAY, addDays } from '@/data/clientDashboard';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import { ApplyButton, EmptyState, FormModal, NewButton, Pager, Panel, Pill, RefreshButton, Table, formatDate, formatINR, tdClass, usePaging } from '../parts';

const STATUSES = ['Draft', 'Sent', 'Accepted', 'Rejected'];
const TONES = { Draft: 'hold', Sent: 'progress', Accepted: 'success', Rejected: 'danger' };

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'validTill', label: 'Valid Till', type: 'date', required: true },
  { name: 'services', label: 'Services', type: 'multiselect', options: RECURRING_SERVICES.map((service) => service.name), required: true },
  { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
  { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
];

export default function QuotationsTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const [dialog, setDialog] = useState(null);

  const rows = useMemo(() => data.quotations.filter((row) => !status || row.status === status), [data.quotations, status]);
  const paging = usePaging(rows, 10);

  const save = (values) => {
    const item = { ...values, amount: Number(values.amount) || 0 };
    if (dialog.id) dispatch({ type: 'update', key: 'quotations', id: dialog.id, patch: item });
    else {
      const number = `QT-${String(data.quotations.length + 101).padStart(3, '0')}`;
      dispatch({ type: 'add', key: 'quotations', prepend: true, item: { ...item, id: newId('q'), number } });
    }
    notify(dialog.id ? 'Quotation updated.' : 'Quotation created.');
    setDialog(null);
  };

  return (
    <Panel className="px-5 py-9 sm:px-[2.375rem]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-44">
          <Select options={STATUSES.map((value) => ({ value, label: value }))} value={draft} onChange={setDraft} placeholder="All" aria-label="Status" />
        </div>
        <RefreshButton onClick={() => { setDraft(''); setStatus(''); }} />
        <ApplyButton onClick={() => setStatus(draft)} />
        <NewButton className="ml-auto" onClick={() => setDialog({})} />
      </div>

      <div className="mt-8">
        <Table head={['Quotation', 'Date', 'Valid Till', 'Services', 'Amount', 'Status']} minWidth="52rem">
          {paging.pageRows.map((row) => (
            <tr key={row.id} className="border-b border-divider">
              <td className={tdClass}>
                <button type="button" onClick={() => setDialog(row)} className={cx('rounded text-brand hover:underline', focusRing)}>
                  {row.number}
                </button>
              </td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(row.date)}</td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(row.validTill)}</td>
              <td className={cx(tdClass, 'max-w-[16rem] text-[0.9375rem]')}>{row.services.join(', ')}</td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatINR(row.amount)}</td>
              <td className={tdClass}>
                <Pill tone={TONES[row.status]}>{row.status}</Pill>
              </td>
            </tr>
          ))}
        </Table>
        {!rows.length && <EmptyState>There are no Quotations</EmptyState>}
        <Pager paging={paging} />
      </div>

      {dialog && (
        <FormModal
          title={dialog.id ? `Quotation ${dialog.number}` : 'New Quotation'}
          fields={FIELDS}
          initial={dialog.id ? { ...dialog, amount: String(dialog.amount) } : { date: TODAY, validTill: addDays(TODAY, 30), status: 'Draft' }}
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}
    </Panel>
  );
}
