'use client';

import { Fragment, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import DateInput from '@/components/ui/DateInput';
import Modal from '@/components/ui/Modal';
import Toggle from '@/components/ui/Toggle';
import { PlusIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { TODAY } from '@/data/clientDashboard';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import { FormModal, Panel, Table, downloadFile, formatDate, formatINR, softButtonClass, tdClass, toCsv } from '../parts';

const ENTRY_FIELDS = [
  { name: 'kind', label: 'Type', type: 'select', options: ['Invoice', 'Receipt'], required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'description', label: 'Particular / Service', placeholder: 'e.g. GSTR-3B Monthly', wide: true },
  { name: 'amount', label: 'Amount (₹)', type: 'number', required: true },
];

export default function LedgerTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const { ledger, client } = data;
  const firstDate = ledger[0]?.date ?? TODAY;

  const [from, setFrom] = useState(firstDate);
  const [to, setTo] = useState(TODAY);
  const [range, setRange] = useState({ from: firstDate, to: TODAY });
  const [showItems, setShowItems] = useState(false);
  const [adding, setAdding] = useState(false);
  const [invoice, setInvoice] = useState(null);

  const { opening, rows, closing } = useMemo(() => {
    const sorted = [...ledger].filter((entry) => entry.kind !== 'Opening Balance').sort((a, b) => a.date.localeCompare(b.date));
    let balance = sorted.filter((entry) => entry.date < range.from).reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
    const openingBalance = balance;
    const inRange = sorted
      .filter((entry) => entry.date >= range.from && entry.date <= range.to)
      .map((entry) => {
        balance += entry.debit - entry.credit;
        return { ...entry, balance };
      });
    return { opening: openingBalance, rows: inRange, closing: balance };
  }, [ledger, range]);

  const totals = rows.reduce((sum, row) => ({ debit: sum.debit + row.debit, credit: sum.credit + row.credit }), { debit: 0, credit: 0 });

  const exportCsv = () => {
    const lines = [
      [formatDate(range.from), 'Opening Balance', 0, 0, opening],
      ...rows.map((row) => [formatDate(row.date), `${row.kind} ${row.number}`, row.debit, row.credit, row.balance]),
      ['', 'Closing Balance', totals.debit, totals.credit, closing],
    ];
    downloadFile(`${client.name} - Ledger.csv`, toCsv(['Date', 'Particular', 'Debit', 'Credit', 'Balance'], lines), 'text/csv');
  };

  const addEntry = (values) => {
    const amount = Number(values.amount) || 0;
    const isInvoice = values.kind === 'Invoice';
    const sameKind = ledger.filter((entry) => entry.kind === values.kind);
    const lastNo = Math.max(0, ...sameKind.map((entry) => Number(entry.number.replace('#', '')) || 0));
    dispatch({
      type: 'add',
      key: 'ledger',
      item: {
        id: newId('l'),
        date: values.date,
        kind: values.kind,
        number: `#${lastNo + 1}`,
        debit: isInvoice ? amount : 0,
        credit: isInvoice ? 0 : amount,
        items: isInvoice ? [{ name: values.description || 'Professional fees', amount }] : [],
      },
    });
    if (values.date > range.to) {
      setTo(values.date);
      setRange((current) => ({ ...current, to: values.date }));
    }
    setAdding(false);
    notify(`${values.kind} added to ledger.`);
  };

  return (
    <Panel className="px-5 py-9 sm:px-[2.375rem] print:shadow-none">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="w-full sm:w-[16.125rem]">
          <DateInput value={from} onChange={setFrom} aria-label="From date" max={to} />
        </div>
        <div className="w-full sm:w-[16.125rem]">
          <DateInput value={to} onChange={setTo} aria-label="To date" min={from} />
        </div>
        <Button onClick={() => setRange({ from, to })} disabled={!from || !to || from > to}>
          Go
        </Button>
        <div className="ml-auto flex gap-2.5">
          <button type="button" onClick={exportCsv} className={softButtonClass}>
            Export
          </button>
          <button type="button" onClick={() => window.print()} className={softButtonClass}>
            Print
          </button>
          <Button aria-label="Add ledger entry" className="w-14 px-0" onClick={() => setAdding(true)} icon={<PlusIcon size={22} />} />
        </div>
      </div>

      <label className="mt-14 flex w-max items-center gap-2.5 print:hidden">
        <Toggle checked={showItems} onChange={setShowItems} aria-label="Show Invoice Items" />
        <span className="text-base text-ink">Show Invoice Items</span>
      </label>

      <div className="mt-8">
        <Table head={['Date', 'Particular', 'Debit', 'Credit', 'Balance']} minWidth="44rem">
          <tr className="border-b border-divider">
            <td className={tdClass}>{formatDate(range.from)}</td>
            <td className={tdClass}>Opening Balance</td>
            <td className={tdClass}>{formatINR(0)}</td>
            <td className={tdClass}>{formatINR(0)}</td>
            <td className={tdClass}>{formatINR(opening)}</td>
          </tr>
          {rows.map((row) => (
            <Fragment key={row.id}>
              <tr className="border-b border-divider">
                <td className={tdClass}>{formatDate(row.date)}</td>
                <td className={tdClass}>
                  {row.kind}{' '}
                  <button
                    type="button"
                    onClick={() => setInvoice(row)}
                    className={cx('ml-1.5 rounded text-brand hover:underline', focusRing)}
                  >
                    {row.number}
                  </button>
                </td>
                <td className={tdClass}>{formatINR(row.debit)}</td>
                <td className={tdClass}>{formatINR(row.credit)}</td>
                <td className={tdClass}>{formatINR(row.balance)}</td>
              </tr>
              {showItems &&
                row.items.map((item, index) => (
                  <tr key={index} className="border-b border-divider bg-[#fafbfc]">
                    <td />
                    <td className="px-5 py-2 pl-10 text-[0.9375rem] text-ink-soft">{item.name}</td>
                    <td className="px-5 py-2 text-[0.9375rem] text-ink-soft">{formatINR(item.amount)}</td>
                    <td colSpan={2} />
                  </tr>
                ))}
            </Fragment>
          ))}
          <tr>
            <td className={tdClass} />
            <td className={cx(tdClass, 'font-medium')}>Closing Balance</td>
            <td className={cx(tdClass, 'font-medium')}>{formatINR(totals.debit)}</td>
            <td className={cx(tdClass, 'font-medium')}>{formatINR(totals.credit)}</td>
            <td className={cx(tdClass, 'font-medium')}>{formatINR(closing)}</td>
          </tr>
        </Table>
      </div>

      {adding && (
        <FormModal
          title="New Ledger Entry"
          fields={ENTRY_FIELDS}
          initial={{ kind: 'Invoice', date: TODAY }}
          onSubmit={addEntry}
          onClose={() => setAdding(false)}
        />
      )}

      {invoice && (
        <Modal title={`${invoice.kind} ${invoice.number}`} description={`${client.name} · ${formatDate(invoice.date)}`} onClose={() => setInvoice(null)} panelClassName="max-w-lg">
          <div className="px-6 py-5">
            {invoice.items.length ? (
              <table className="w-full text-base">
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-divider">
                      <td className="py-2.5 text-ink">{item.name}</td>
                      <td className="py-2.5 text-right text-ink">{formatINR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 font-medium text-ink">Total</td>
                    <td className="pt-3 text-right font-medium text-ink">{formatINR(invoice.debit)}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p className="text-base text-ink">
                Amount received: <span className="font-medium">{formatINR(invoice.credit)}</span>
              </p>
            )}
          </div>
        </Modal>
      )}
    </Panel>
  );
}
