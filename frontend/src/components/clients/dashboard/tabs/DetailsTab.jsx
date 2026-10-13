'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Toggle from '@/components/ui/Toggle';
import FirmLogo from '@/components/layout/FirmLogo';
import { ClockIcon, CloseIcon, InfoIcon, PencilIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons';
import { controlClass, focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import { FormModal, Panel, formatDate, formatDateTime, formatINR } from '../parts';

function Stat({ value, label, href, info }) {
  return (
    <Link href={href} className={cx('flex items-baseline gap-3 rounded-md px-5 py-3 hover:bg-[#f8f9fb]', focusRing)}>
      <span className="text-[2.125rem] leading-none text-ink">{value}</span>
      <span className="flex items-center gap-1.5 text-[1.0625rem] text-muted">
        {label}
        {info && (
          <span title={info}>
            <InfoIcon size={17} />
          </span>
        )}
      </span>
    </Link>
  );
}

function BigStat({ value, label, href, info }) {
  return (
    <Panel className="flex">
      <Link href={href} className={cx('flex w-full flex-col justify-center gap-3 rounded-xl px-5 py-5 hover:bg-[#fbfcfd]', focusRing)}>
        <span className="text-[2.375rem] leading-none text-ink">{value}</span>
        <span className="flex items-center gap-1.5 text-[1.0625rem] text-muted">
          {label}
          {info && (
            <span title={info}>
              <InfoIcon size={17} />
            </span>
          )}
        </span>
      </Link>
    </Panel>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-[7.25rem_minmax(0,1fr)] gap-x-3">
      <dt className="text-base text-muted">{label}</dt>
      <dd className="break-words text-base text-ink">{children || '-'}</dd>
    </div>
  );
}

function NotesCard() {
  const { data, dispatch, notify } = useClientDashboard();
  const [text, setText] = useState('');

  const post = () => {
    const value = text.trim();
    if (!value) return;
    const now = new Date();
    const at = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    dispatch({ type: 'add', key: 'notes', prepend: true, item: { id: newId('n'), author: 'You', text: value, at } });
    setText('');
    notify('Note posted.');
  };

  return (
    <Panel aria-labelledby="notes-title" className="flex flex-col">
      <header className="border-b border-divider px-[2.375rem] py-7">
        <h2 id="notes-title" className="text-card-title text-ink">
          Notes
        </h2>
      </header>
      <div className="px-[2.375rem] py-10">
        <label htmlFor="client-note" className="sr-only">
          Write a note
        </label>
        <textarea
          id="client-note"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) post();
          }}
          placeholder="Write a note..."
          rows={4}
          className={controlClass(false, 'block min-h-[7.75rem] resize-y px-4 py-3')}
        />
        <div className="mt-2.5 flex items-start justify-between gap-3">
          <p className="text-sm text-muted">Mention user using @</p>
          <button
            type="button"
            onClick={post}
            disabled={!text.trim()}
            className={cx(
              'h-12 rounded-md px-4 text-lg transition-colors',
              text.trim() ? 'bg-brand-soft text-brand hover:bg-brand-soft-hover' : 'cursor-default bg-[#eef5fd] text-[#9cc0f0]',
              focusRing,
            )}
          >
            Post
          </button>
        </div>

        {data.notes.length > 0 && (
          <ul className="mt-6 space-y-4">
            {data.notes.map((note) => (
              <li key={note.id} className="group rounded-lg bg-[#f8f9fb] px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-muted">
                    <span className="font-medium text-ink-soft">{note.author}</span> · {formatDateTime(note.at)}
                  </p>
                  <button
                    type="button"
                    aria-label="Delete note"
                    onClick={() => dispatch({ type: 'remove', key: 'notes', id: note.id })}
                    className={cx('rounded text-muted opacity-60 hover:text-danger hover:opacity-100', focusRing)}
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-base text-ink">
                  {note.text.split(/(@\w+)/g).map((part, index) =>
                    part.startsWith('@') ? (
                      <span key={index} className="text-brand">
                        {part}
                      </span>
                    ) : (
                      part
                    ),
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

export default function DetailsTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const { client, details, tasks, ledger } = data;
  const [editInvoice, setEditInvoice] = useState(false);
  const base = `/view-client/${client.id}`;

  const counts = useMemo(() => {
    const result = { Pending: 0, 'In-Progress': 0, Hold: 0, Completed: 0, unbilled: 0 };
    tasks.forEach((task) => {
      result[task.status] += 1;
      if (task.kind === 'task' && !task.billed) result.unbilled += 1;
    });
    return result;
  }, [tasks]);

  const balance = useMemo(() => ledger.reduce((sum, entry) => sum + entry.debit - entry.credit, 0), [ledger]);
  const digits = (details.mobile || '').replace(/\D/g, '');

  const setToggle = (field) => (checked) => {
    dispatch({ type: 'details', patch: { [field]: checked } });
    notify('Setting saved.');
  };

  return (
    <div className="space-y-[1.875rem]">
      <div className="grid gap-[1.875rem] md:grid-cols-2 xl:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Panel className="grid grid-cols-2 px-2 py-1 md:col-span-2 xl:col-span-1">
          <div className="border-b border-r border-divider py-2">
            <Stat value={counts.Pending} label="Pending Tasks" href={`${base}/tasks?status=Pending`} />
          </div>
          <div className="border-b border-divider py-2">
            <Stat value={counts.Hold} label="Hold Tasks" href={`${base}/tasks?status=Hold`} />
          </div>
          <div className="border-r border-divider py-2">
            <Stat value={counts['In-Progress']} label="In-Progress Tasks" href={`${base}/tasks?status=In-Progress`} />
          </div>
          <div className="py-2">
            <Stat value={counts.Completed} label="Completed Tasks" href={`${base}/tasks?status=Completed`} />
          </div>
        </Panel>
        <BigStat value={counts.unbilled} label="Unbilled Tasks" href={`${base}/tasks`} info="Tasks for which no invoice has been raised yet" />
        <BigStat value={formatINR(balance)} label="Ledger Balance" href={`${base}/ledger`} />
      </div>

      <div className="grid gap-[1.875rem] xl:grid-cols-[minmax(0,1fr)_22.1875rem]">
        <Panel className="px-5 py-10 sm:px-[2.375rem]">
          <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            <div className="space-y-5">
              <Row label="Status">
                <span className={details.status === 'Active' ? 'text-[#22a05a]' : 'text-muted'}>{details.status}</span>
              </Row>
              <Row label="Type">{details.typeLabel}</Row>
              <Row label={details.dateLabel}>{formatDate(details.date)}</Row>
              <Row label="PAN">{details.pan}</Row>
              {details.gstin && <Row label="GSTIN">{details.gstin}</Row>}
              <Row label="Contact Person">{details.contactPerson}</Row>
              <Row label="Email">
                {details.email && (
                  <a href={`mailto:${details.email}`} className="text-brand hover:underline">
                    {details.email}
                  </a>
                )}
              </Row>
            </div>
            <div className="space-y-5">
              <Row label="Mobile No.">
                {details.mobile && (
                  <span className="flex items-center gap-3">
                    {details.mobile}
                    <a href={`tel:+91${digits}`} aria-label="Call" className={cx('rounded text-brand', focusRing)}>
                      <PhoneIcon size={18} />
                    </a>
                    <a href={`https://wa.me/91${digits}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className={cx('rounded text-[#25a244]', focusRing)}>
                      <WhatsAppIcon size={18} />
                    </a>
                  </span>
                )}
              </Row>
              <Row label="Address">{details.address}</Row>
              <Row label="City">{details.city}</Row>
              <Row label="Pincode">{details.pincode}</Row>
              <Row label="State">{details.state}</Row>
            </div>
          </dl>

          <div className="mt-10 space-y-5">
            <div className="flex items-center gap-2.5">
              <Toggle checked={details.autoInvoice} onChange={setToggle('autoInvoice')} aria-label="Automatic invoice" />
              <span className="text-base text-ink">
                Automatic invoice will be created every {details.invoiceFrequency || 'year'}
              </span>
              <button type="button" aria-label="Edit automatic invoice" onClick={() => setEditInvoice(true)} className={cx('rounded text-brand', focusRing)}>
                <PencilIcon size={16} />
              </button>
            </div>
            <label className="flex items-center gap-2.5">
              <Toggle checked={details.allowNotifications} onChange={setToggle('allowNotifications')} aria-label="Allow Notifications" />
              <span className="text-base text-ink">Allow Notifications</span>
            </label>
            <label className="flex items-center gap-2.5">
              <Toggle checked={details.allowLogin} onChange={setToggle('allowLogin')} aria-label="Allow Login" />
              <span className="text-base text-ink">Allow Login</span>
            </label>
          </div>
        </Panel>

        <NotesCard />
      </div>

      <p className="flex flex-wrap items-center gap-2 text-base text-muted">
        Created by
        <span className="grid size-8 place-items-center rounded-full bg-white ring-1 ring-divider">
          <FirmLogo className="size-7" />
        </span>
        <span className="text-ink-soft">{details.createdBy}</span>
        <span className="ml-2">on</span>
        <ClockIcon size={22} className="text-ink-soft" />
        <span className="text-ink-soft">{formatDateTime(details.createdAt)}</span>
      </p>

      {editInvoice && (
        <FormModal
          title="Automatic Invoice"
          fields={[
            { name: 'invoiceFrequency', label: 'Create invoice every', type: 'select', options: ['month', 'quarter', 'year'], required: true, wide: true },
          ]}
          initial={{ invoiceFrequency: details.invoiceFrequency || 'year' }}
          onSubmit={(values) => {
            dispatch({ type: 'details', patch: { ...values, autoInvoice: true } });
            setEditInvoice(false);
            notify('Automatic invoice schedule updated.');
          }}
          onClose={() => setEditInvoice(false)}
        />
      )}
    </div>
  );
}
