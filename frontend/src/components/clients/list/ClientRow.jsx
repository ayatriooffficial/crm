'use client';

import { memo } from 'react';
import Link from 'next/link';
import Popover from '@/components/ui/Popover';
import { AvatarPlaceholder, KebabIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';

const cell = 'px-3 py-2.5 align-middle';

function RowActions({ client, onToggleActive, onDelete }) {
  return (
    <Popover
      label={`Actions for ${client.name}`}
      panelClassName="w-48 py-1"
      trigger={({ triggerProps }) => (
        <button
          type="button"
          {...triggerProps}
          aria-label={`Actions for ${client.name}`}
          className={cx('grid size-9 place-items-center rounded-full text-ink hover:bg-gray-100', focusRing)}
        >
          <KebabIcon size={20} />
        </button>
      )}
    >
      {({ close }) => {
        const item = 'block w-full px-4 py-2.5 text-left text-base hover:bg-gray-50';
        return (
          <>
            <Link href={`/view-client/${client.id}`} onClick={close} className={cx(item, 'text-ink')}>
              View
            </Link>
            <button
              type="button"
              onClick={() => {
                onToggleActive(client.id);
                close();
              }}
              className={cx(item, 'text-ink')}
            >
              Mark as {client.active ? 'inactive' : 'active'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${client.name}?`)) onDelete(client.id);
                close();
              }}
              className={cx(item, 'text-danger')}
            >
              Delete
            </button>
          </>
        );
      }}
    </Popover>
  );
}

/** One table row. Memoised so selecting a row re-renders only that row. */
function ClientRow({ client, columns, typeLabel, tagMap, selected, onSelect, onToggleActive, onDelete }) {
  const [firstTag, ...otherTags] = client.tags.map((value) => tagMap.get(value)).filter(Boolean);
  const digits = client.mobile.replace(/\D/g, '');

  const renderers = {
    photo: () => <AvatarPlaceholder className="size-16" />,
    fileNo: () => client.fileNo,
    name: () => (
      <Link href={`/view-client/${client.id}`} className={cx('rounded text-brand hover:underline', focusRing)}>
        {client.name}
      </Link>
    ),
    type: () => <span className="block max-w-28 truncate">{typeLabel}</span>,
    mobile: () =>
      client.mobile && (
        <span className="flex items-center gap-3 whitespace-nowrap">
          {client.mobile}
          <span className="flex -translate-y-0.5 items-center gap-1.5">
            <a href={`tel:+91${digits}`} aria-label={`Call ${client.name}`} className={cx('rounded text-brand', focusRing)}>
              <PhoneIcon size={18} />
            </a>
            <a
              href={`https://wa.me/91${digits}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`WhatsApp ${client.name}`}
              className={cx('rounded text-[#25a244]', focusRing)}
            >
              <WhatsAppIcon size={18} />
            </a>
          </span>
        </span>
      ),
    group: () => <span className="block max-w-28 truncate">{client.group}</span>,
    tags: () =>
      firstTag && (
        <span className="flex items-center gap-1.5">
          <span className={cx('max-w-28 truncate rounded-sm px-1.5 py-0.5 text-sm', firstTag.chipClass)}>{firstTag.label}</span>
          {otherTags.length > 0 && (
            <span
              title={otherTags.map((tag) => tag.label).join(', ')}
              className="rounded-full bg-[#eef0f3] px-2.5 py-0.5 text-sm text-ink-soft"
            >
              +{otherTags.length}
            </span>
          )}
        </span>
      ),
    status: () => <span className={client.active ? 'text-[#22a05a]' : 'text-muted'}>{client.active ? 'Active' : 'Inactive'}</span>,
    users: () => <span className="block max-w-32 truncate">{client.users.join(', ')}</span>,
  };

  return (
    <tr className={cx('border-b border-divider', selected ? 'bg-[#f5f9ff]' : 'bg-white')}>
      <td className={cx(cell, 'w-12 pl-2.5')}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(client.id)}
          aria-label={`Select ${client.name}`}
          className="size-5 rounded border-line accent-brand"
        />
      </td>
      {columns.map((column) => (
        <td key={column.id} className={cx(cell, 'text-base text-ink')}>
          {renderers[column.id]()}
        </td>
      ))}
      <td className={cx(cell, 'sticky right-0 w-16 bg-inherit text-center')}>
        <RowActions client={client} onToggleActive={onToggleActive} onDelete={onDelete} />
      </td>
    </tr>
  );
}

export default memo(ClientRow);
