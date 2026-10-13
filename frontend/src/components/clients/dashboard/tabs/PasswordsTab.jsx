'use client';

import { useMemo, useRef, useState } from 'react';
import { CopyIcon, EyeIcon, EyeOffIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import { EmptyState, FormModal, NewButton, Panel, SearchBox, Table, copyText, softButtonClass, tdClass } from '../parts';

const PORTALS = ['Income Tax', 'GST', 'TRACES', 'MCA V3', 'EPFO', 'ESIC', 'Professional Tax', 'Other'];

const FIELDS = [
  { name: 'portal', label: 'Login Portal', type: 'select', options: PORTALS, required: true, wide: true },
  { name: 'username', label: 'Username', required: true },
  { name: 'password', label: 'Password', required: true },
];

const iconButton = cx('grid size-8 place-items-center rounded text-brand hover:bg-brand-soft', focusRing);

export default function PasswordsTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(() => new Set());
  const [dialog, setDialog] = useState(null);
  const importRef = useRef(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data.passwords;
    return data.passwords.filter((row) => `${row.portal} ${row.username}`.toLowerCase().includes(needle));
  }, [data.passwords, query]);

  const copy = async (text, what) => notify((await copyText(text)) ? `${what} copied.` : `Couldn't copy ${what.toLowerCase()}.`);

  const toggle = (id) =>
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = (values) => {
    if (dialog.id) dispatch({ type: 'update', key: 'passwords', id: dialog.id, patch: values });
    else dispatch({ type: 'add', key: 'passwords', item: { ...values, id: newId('p') } });
    notify(dialog.id ? 'Password updated.' : 'Password saved.');
    setDialog(null);
  };

  /** CSV import: portal,username,password per line (header optional). */
  const importCsv = async (file) => {
    if (!file) return;
    const lines = (await file.text()).split(/\r?\n/).map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
    const items = lines.filter((cells) => cells.length >= 3 && cells[0] && cells[0].toLowerCase() !== 'portal');
    items.forEach(([portal, username, password]) => dispatch({ type: 'add', key: 'passwords', item: { id: newId('p'), portal, username, password } }));
    notify(items.length ? `${items.length} password${items.length > 1 ? 's' : ''} imported.` : 'No rows found. Use: portal,username,password');
  };

  return (
    <Panel className="px-5 py-9 sm:px-[2.375rem]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchBox value={query} onChange={setQuery} label="Search passwords" />
        <div className="flex gap-2.5">
          <button type="button" onClick={() => importRef.current?.click()} className={softButtonClass} title="CSV with columns: portal, username, password">
            Import
          </button>
          <input ref={importRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { importCsv(event.target.files[0]); event.target.value = ''; }} />
          <NewButton onClick={() => setDialog({})} />
        </div>
      </div>

      <div className="mt-8">
        <Table head={['Login Portal', 'Username', 'Password']} minWidth="40rem">
          {rows.map((row) => {
            const shown = visible.has(row.id);
            return (
              <tr key={row.id} className="border-b border-divider last:border-b-0">
                <td className={tdClass}>
                  <button type="button" onClick={() => setDialog(row)} className={cx('rounded text-brand hover:underline', focusRing)}>
                    {row.portal}
                  </button>
                </td>
                <td className={tdClass}>
                  <span className="inline-flex items-center gap-3">
                    <span className="break-all">{row.username}</span>
                    <button type="button" aria-label="Copy username" onClick={() => copy(row.username, 'Username')} className={iconButton}>
                      <CopyIcon size={18} />
                    </button>
                  </span>
                </td>
                <td className={tdClass}>
                  <span className="inline-flex items-center gap-3">
                    <span className={cx('min-w-[5.5rem] font-mono', !shown && 'tracking-widest')}>{shown ? row.password : '*********'}</span>
                    <button type="button" aria-label="Copy password" onClick={() => copy(row.password, 'Password')} className={iconButton}>
                      <CopyIcon size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label={shown ? 'Hide password' : 'Show password'}
                      aria-pressed={shown}
                      onClick={() => toggle(row.id)}
                      className={cx(iconButton, 'ml-6')}
                    >
                      {shown ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>
        {!rows.length && <EmptyState>{query ? 'No matching passwords' : 'There are no Passwords'}</EmptyState>}
      </div>

      {dialog && (
        <FormModal
          title={dialog.id ? `Edit ${dialog.portal} Login` : 'New Password'}
          fields={FIELDS}
          initial={dialog.id ? dialog : { portal: 'Income Tax', username: data.details.pan }}
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}
    </Panel>
  );
}
