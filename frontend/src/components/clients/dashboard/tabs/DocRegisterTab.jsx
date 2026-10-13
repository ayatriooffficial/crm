'use client';

import { useMemo, useState } from 'react';
import FirmLogo from '@/components/layout/FirmLogo';
import { TODAY } from '@/data/clientDashboard';
import { cx } from '@/lib/cx';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import { EmptyState, FormModal, NewButton, Panel, Pill, SearchBox, Table, formatDate, tdClass } from '../parts';

const FIELDS = [
  { name: 'date', label: 'Date', type: 'date', required: true },
  {
    name: 'docType',
    label: 'Doc. Type',
    type: 'select',
    required: true,
    options: ['DSC - Class-3', 'GST REGISTRATION ALL DOCUMENTS', 'Original PAN Card', 'Bank Statement (Hard copy)', 'Cheque Book', 'Audit File', 'Property Papers'],
  },
  { name: 'category', label: 'Category', type: 'select', options: ['Received', 'Given'], required: true },
  { name: 'returnable', label: 'Return', type: 'select', options: ['Returnable', 'Not Returnable'], required: true },
  { name: 'location', label: 'Location', placeholder: 'e.g. Cabinet A', wide: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default function DocRegisterTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data.register;
    return data.register.filter((row) => [row.docType, row.category, row.location, row.notes].some((value) => value.toLowerCase().includes(needle)));
  }, [data.register, query]);

  const save = (values) => {
    const item = { ...values, returnable: values.returnable === 'Returnable' };
    if (dialog.id) dispatch({ type: 'update', key: 'register', id: dialog.id, patch: item });
    else dispatch({ type: 'add', key: 'register', item: { ...item, id: newId('g') } });
    notify(dialog.id ? 'Register entry updated.' : 'Register entry added.');
    setDialog(null);
  };

  return (
    <Panel className="px-5 py-9 sm:px-[2.375rem]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchBox value={query} onChange={setQuery} label="Search register" />
        <NewButton onClick={() => setDialog({})} />
      </div>

      <div className="mt-8">
        <Table head={['Date', 'Doc. Type', 'Category', 'Return', 'Location', 'Notes', 'Created By']} minWidth="56rem">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => setDialog(row)}
              className="cursor-pointer border-b border-divider last:border-b-0 hover:bg-[#fafbfc]"
            >
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(row.date)}</td>
              <td className={cx(tdClass, 'max-w-[8.5rem] break-words')}>{row.docType}</td>
              <td className={tdClass}>
                <Pill tone={row.category === 'Received' ? 'success' : 'progress'}>{row.category}</Pill>
              </td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{row.returnable ? 'Returnable' : 'Not Returnable'}</td>
              <td className={tdClass}>{row.location}</td>
              <td className={cx(tdClass, 'max-w-[10rem] text-[0.9375rem]')}>{row.notes}</td>
              <td className={tdClass}>
                <span title="CA India" className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-divider">
                  <FirmLogo className="size-8" />
                </span>
              </td>
            </tr>
          ))}
        </Table>
        {!rows.length && <EmptyState>{query ? 'No matching entries' : 'There are no Documents in the register'}</EmptyState>}
      </div>

      {dialog && (
        <FormModal
          title={dialog.id ? 'Edit Register Entry' : 'New Register Entry'}
          fields={FIELDS}
          initial={
            dialog.id
              ? { ...dialog, returnable: dialog.returnable ? 'Returnable' : 'Not Returnable' }
              : { date: TODAY, category: 'Received', returnable: 'Not Returnable' }
          }
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}
    </Panel>
  );
}
