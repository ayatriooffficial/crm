'use client';

import { memo, useCallback, useId, useState } from 'react';
import Card from '@/components/ui/Card';
import { controlClass, focusRing } from '@/components/ui/styles';
import { CloseIcon, EyeIcon, EyeOffIcon, TrashIcon, UploadIcon } from '@/components/icons';
import { CUSTOMER_FILE_SECTIONS } from '@/data/customerFiles';
import { cx } from '@/lib/cx';
import { isBlankFileRow, toAmount, toUpperAlnum } from './clientFormModel';
import { moveDownOnEnter } from './gridKeyboard';

const NUMERIC_TYPES = new Set(['number', 'currency']);
const cellInput = 'h-9 px-2 text-sm';

/** Formatter for a text-like cell, from the column definition. */
function formatterFor(column) {
  if (NUMERIC_TYPES.has(column.type)) return toAmount;
  if (column.uppercase) return toUpperAlnum;
  return null;
}

/**
 * Promoter, Statutory and Recurring Service grids, shown together under their
 * own headings. Each behaves like the Items grid: a blank line is always
 * waiting at the bottom and Enter moves down a line.
 */
function CustomerFilesCard({ values, dispatch }) {
  const updateRow = useCallback(
    (section, key, field, value) => dispatch({ type: 'updateFileRow', section, key, field, value }),
    [dispatch],
  );
  const removeRow = useCallback((section, key) => dispatch({ type: 'removeFileRow', section, key }), [dispatch]);

  return (
    <Card title="Customer Files" className="xl:col-span-2" bodyClassName="space-y-8 px-5 pt-8 pb-10 sm:px-[2.375rem]">
      {CUSTOMER_FILE_SECTIONS.map((section) => (
        <SectionGrid
          key={section.value}
          section={section}
          rows={values[section.value]}
          onChange={updateRow}
          onRemove={removeRow}
        />
      ))}
    </Card>
  );
}

const SectionGrid = memo(function SectionGrid({ section, rows, onChange, onRemove }) {
  const headingId = useId();
  const { value: sectionId, label, columns } = section;

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="mb-3 text-lg font-medium text-ink">
        {label}
      </h3>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-max border-collapse text-sm" onKeyDown={moveDownOnEnter}>
          <thead>
            <tr className="bg-brand text-left text-white">
              <th scope="col" className="w-10 px-2 py-2.5 text-center font-medium">
                #
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cx('whitespace-nowrap px-2 py-2.5 font-medium', NUMERIC_TYPES.has(column.type) && 'text-right')}
                >
                  {column.label}
                </th>
              ))}
              <th scope="col" className="w-12 px-2 py-2.5">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {rows.map((row, index) => (
              <FileRow
                key={row.key}
                sectionId={sectionId}
                columns={columns}
                row={row}
                index={index}
                onChange={onChange}
                onRemove={onRemove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});

const FileRow = memo(function FileRow({ sectionId, columns, row, index, onChange, onRemove }) {
  const lineNo = index + 1;
  const blank = isBlankFileRow(row);
  const setField = (field, value) => onChange(sectionId, row.key, field, value);

  return (
    <tr className="bg-white">
      <td className="px-2 py-1.5 text-center text-muted">{lineNo}</td>
      {columns.map((column) => {
        const label = `${column.label}, line ${lineNo}`;
        const value = row[column.key];

        if (column.type === 'file') {
          return (
            <td key={column.key} className={cx('px-1 py-1.5', column.width)}>
              <FileCell label={label} file={value} onChange={(file) => setField(column.key, file)} />
            </td>
          );
        }

        const inputProps = {
          'aria-label': label,
          'data-row': index,
          'data-col': column.key,
          value,
          onChange: (next) => setField(column.key, next),
        };

        return (
          <td key={column.key} className={cx('px-1 py-1.5', column.width)}>
            {column.type === 'select' ? (
              <SelectCell {...inputProps} options={column.options} />
            ) : column.type === 'secret' ? (
              <SecretCell {...inputProps} />
            ) : (
              <TextCell {...inputProps} format={formatterFor(column)} maxLength={column.maxLength} numeric={NUMERIC_TYPES.has(column.type)} />
            )}
          </td>
        );
      })}
      <td className="px-1 py-1.5 text-center">
        {!blank && (
          <button
            type="button"
            onClick={() => onRemove(sectionId, row.key)}
            aria-label={`Remove line ${lineNo}`}
            className={cx('grid size-8 place-items-center rounded-md text-muted hover:bg-red-50 hover:text-danger', focusRing)}
          >
            <TrashIcon size={16} />
          </button>
        )}
      </td>
    </tr>
  );
});

function TextCell({ value, onChange, format, numeric, ...rest }) {
  return (
    <input
      {...rest}
      type="text"
      inputMode={numeric ? 'decimal' : undefined}
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(format ? format(event.target.value) : event.target.value)}
      className={controlClass(false, cx(cellInput, numeric && 'text-right tabular-nums'))}
    />
  );
}

/** Dropdown cell; picking a value on the blank last line opens the next one. */
function SelectCell({ value, onChange, options, ...rest }) {
  return (
    <select
      {...rest}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={controlClass(false, cx(cellInput, 'pr-1'))}
    >
      <option value="" />
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Password cell, masked by default with a show/hide toggle. */
function SecretCell({ value, onChange, ...rest }) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOffIcon : EyeIcon;

  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? 'text' : 'password'}
        autoComplete="new-password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass(false, cx(cellInput, 'pr-9'))}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className={cx(
          'absolute inset-y-0 right-1 my-auto grid size-7 place-items-center rounded text-ink-soft hover:bg-black/5 hover:text-ink',
          focusRing,
        )}
      >
        <Icon size={16} />
      </button>
    </div>
  );
}

/** Attach one document; shows its name with a remove button once picked. */
function FileCell({ label, file, onChange }) {
  if (file) {
    return (
      <span className="flex h-9 items-center gap-1 rounded-md border border-line bg-[#f6f8fa] pl-2 text-sm text-ink">
        <span className="min-w-0 flex-1 truncate" title={file.name}>
          {file.name}
        </span>
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={`Remove ${label}`}
          className={cx('grid size-7 shrink-0 place-items-center rounded text-muted hover:text-danger', focusRing)}
        >
          <CloseIcon size={14} />
        </button>
      </span>
    );
  }

  return (
    <label
      className={cx(
        'flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-line text-sm text-ink-soft',
        'hover:border-line-strong hover:text-ink focus-within:border-focus focus-within:ring-1 focus-within:ring-focus',
      )}
    >
      <UploadIcon size={15} />
      Attach
      <input
        type="file"
        aria-label={label}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? '')}
      />
    </label>
  );
}

export default memo(CustomerFilesCard);
