'use client';

import { memo, useState } from 'react';
import Select from '@/components/ui/Select';
import { ArrowRightIcon, PlusIcon, RefreshIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { RECURRING_SERVICES } from '@/data/services';
import { CLIENT_TYPES } from '@/data/clientTypes';
import { CLIENT_GROUPS } from '@/data/groups';

const SERVICE_OPTIONS = RECURRING_SERVICES.map((service) => ({ value: service.id, label: service.name }));
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const EMPTY_FILTERS = { search: '', service: null, type: null, group: null, status: null };

const squareButton = cx(
  'grid size-12 shrink-0 place-items-center rounded-md bg-white shadow-[0_1px_4px_rgb(16_24_40/0.08)] transition-colors hover:bg-gray-50',
  focusRing,
);

const label = 'mb-2.5 block text-base font-medium text-ink';

/**
 * Draft filters live here; they apply on → / Enter, as in the original.
 * The parent only re-renders the table when filters are applied.
 */
function ClientsFilters({ initialSearch = '', onApply }) {
  const [draft, setDraft] = useState({ ...EMPTY_FILTERS, search: initialSearch });
  const [more, setMore] = useState(false);
  const set = (value, field) => setDraft((current) => ({ ...current, [field]: value }));

  const reset = () => {
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
      }}
      className="rounded-xl bg-white px-5 pb-12 pt-7 shadow-card"
    >
      <div className="grid grid-cols-1 items-end gap-x-7.5 gap-y-5 md:grid-cols-[1.35fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="clients-search" className={label}>
            Search
          </label>
          <input
            id="clients-search"
            type="search"
            value={draft.search}
            onChange={(event) => set(event.target.value, 'search')}
            placeholder="Client, File No., Contact Person, Mobile, Email, PAN, GSTIN"
            className="h-12 w-full rounded-md border border-line bg-white px-4 text-base text-ink outline-none placeholder:text-placeholder hover:border-line-strong focus:border-focus focus:ring-1 focus:ring-focus"
          />
        </div>
        <div>
          <span id="clients-service-label" className={label}>
            Recurring Service
          </span>
          <Select
            id="clients-service"
            name="service"
            options={SERVICE_OPTIONS}
            value={draft.service}
            onChange={set}
            searchable
            separator
            aria-labelledby="clients-service-label"
          />
        </div>
        <div>
          <span id="clients-type-label" className={label}>
            Type
          </span>
          <Select
            id="clients-type"
            name="type"
            options={CLIENT_TYPES}
            value={draft.type}
            onChange={set}
            searchable
            separator
            aria-labelledby="clients-type-label"
          />
        </div>
        <div className="flex gap-4 md:ml-7">
          <button
            type="button"
            onClick={() => setMore((value) => !value)}
            aria-expanded={more}
            aria-label={more ? 'Fewer filters' : 'More filters'}
            className={cx(squareButton, 'text-ink')}
          >
            <PlusIcon size={24} className={cx('transition-transform', more && 'rotate-45')} />
          </button>
          <button type="button" onClick={reset} aria-label="Reset filters" className={cx(squareButton, 'text-muted')}>
            <RefreshIcon size={22} />
          </button>
          <button type="submit" aria-label="Apply filters" className={cx(squareButton, 'text-brand')}>
            <ArrowRightIcon size={24} />
          </button>
        </div>
      </div>

      {more && (
        <div className="mt-5 grid grid-cols-1 gap-x-7.5 gap-y-5 md:grid-cols-[1.35fr_1fr_1fr_auto]">
          <div>
            <span id="clients-group-label" className={label}>
              Group
            </span>
            <Select
              id="clients-group"
              name="group"
              options={CLIENT_GROUPS}
              value={draft.group}
              onChange={set}
              searchable
              separator
              aria-labelledby="clients-group-label"
            />
          </div>
          <div>
            <span id="clients-status-label" className={label}>
              Status
            </span>
            <Select
              id="clients-status"
              name="status"
              options={STATUS_OPTIONS}
              value={draft.status}
              onChange={set}
              separator
              aria-labelledby="clients-status-label"
            />
          </div>
        </div>
      )}
    </form>
  );
}

export default memo(ClientsFilters);
