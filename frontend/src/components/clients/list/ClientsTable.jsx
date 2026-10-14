'use client';

import { memo, useMemo } from 'react';
import Popover from '@/components/ui/Popover';
import { SettingsIcon, SortIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { CLIENT_TYPES } from '@/data/clientTypes';
import { CLIENT_TAGS } from '@/data/tags';
import ClientRow from './ClientRow';

export const COLUMNS = [
  { id: 'photo', label: 'Photo' },
  { id: 'fileNo', label: 'File No.', sortable: true },
  { id: 'name', label: 'Name', sortable: true },
  { id: 'type', label: 'Type', sortable: true },
  { id: 'mobile', label: 'Mobile' },
  { id: 'group', label: 'Group' },
  { id: 'tags', label: 'Tags' },
  { id: 'status', label: 'Status' },
  { id: 'users', label: 'Users' },
];

const TYPE_LABELS = new Map(CLIENT_TYPES.map((type) => [type.value, type.label]));
const TAG_MAP = new Map(CLIENT_TAGS.map((tag) => [tag.value, tag]));

function ColumnSettings({ hidden, onToggle }) {
  return (
    <Popover
      label="Columns"
      panelClassName="w-56 py-2"
      trigger={({ triggerProps }) => (
        <button
          type="button"
          {...triggerProps}
          aria-label="Choose columns"
          className={cx('grid size-12 place-items-center rounded-md bg-[#eef0f3] text-ink hover:bg-[#e2e5e9]', focusRing)}
        >
          <SettingsIcon size={22} />
        </button>
      )}
    >
      {() => (
        <fieldset>
          <legend className="px-4 pb-1 text-sm text-muted">Show columns</legend>
          {COLUMNS.map((column) => (
            <label key={column.id} className="flex cursor-pointer items-center gap-3 px-4 py-2 text-base text-ink hover:bg-gray-50">
              <input
                type="checkbox"
                checked={!hidden.has(column.id)}
                onChange={() => onToggle(column.id)}
                className="size-4 accent-brand"
              />
              {column.label}
            </label>
          ))}
        </fieldset>
      )}
    </Popover>
  );
}

function ClientsTable({ rows, sort, onSort, selected, onSelect, onSelectAll, hidden, onToggleColumn, onToggleActive, onDelete }) {
  const columns = useMemo(() => COLUMNS.filter((column) => !hidden.has(column.id)), [hidden]);
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));

  return (
    <div className="scrollbar-slim overflow-x-auto">
      <table className="w-full min-w-[62rem] border-collapse">
        <thead>
          <tr className="bg-surface">
            <th scope="col" className="w-12 rounded-l-md py-3 pl-2.5 pr-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                aria-label="Select all clients on this page"
                className="size-5 accent-brand"
              />
            </th>
            {columns.map((column, index) => {
              const direction = sort.key === column.id ? sort.direction : null;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={direction ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={cx(
                    'h-12 whitespace-nowrap px-3 text-left text-sm font-normal uppercase text-ink-soft',
                    index > 0 && 'border-l border-divider',
                  )}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.id)}
                      className={cx('flex w-full items-center justify-between gap-2 rounded uppercase', focusRing)}
                    >
                      {column.label}
                      <SortIcon size={14} strokeWidth={2} className={direction ? 'text-brand' : 'text-muted'} />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
            <th scope="col" className="sticky right-0 w-16 rounded-r-md bg-surface px-2 text-center">
              <ColumnSettings hidden={hidden} onToggle={onToggleColumn} />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className="py-16 text-center text-base text-muted">
                No clients match these filters.
              </td>
            </tr>
          ) : (
            rows.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                columns={columns}
                typeLabel={TYPE_LABELS.get(client.type) ?? ''}
                tagMap={TAG_MAP}
                selected={selected.has(client.id)}
                onSelect={onSelect}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(ClientsTable);
