'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PencilIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { RECURRING_SERVICES } from '@/data/services';
import { currentPeriod, serviceFrequency, serviceName } from '@/data/clientDashboard';
import { useClientDashboard } from '../ClientDashboardProvider';
import { EmptyState, FormModal, Panel } from '../parts';

function ServiceCard({ title, action, children }) {
  return (
    <Panel className="flex flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-divider px-5 py-7 sm:px-[2.375rem]">
        <h2 className="text-2xl text-ink sm:text-card-title">{title}</h2>
        {action}
      </header>
      <div className="px-5 pb-10 pt-8 sm:px-[2.375rem]">{children}</div>
    </Panel>
  );
}

const rowClass = 'flex min-h-[3.125rem] items-center justify-between gap-3 border-b border-dashed border-[#9aa1ab]/70 py-2 last:border-b-0';

export default function ServicesTab() {
  const { data, dispatch, notify } = useClientDashboard();
  const { client, services } = data;
  const [editing, setEditing] = useState(false);

  return (
    <div className="grid gap-[1.875rem] lg:grid-cols-2">
      <ServiceCard title="Availed Services">
        {services.availed.length ? (
          <ul>
            {services.availed.map((id) => (
              <li key={id} className={rowClass}>
                <Link
                  href={`/view-client/${client.id}/tasks?service=${id}`}
                  className={cx('rounded text-[1.0625rem] text-brand hover:underline', focusRing)}
                >
                  {serviceName(id)}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>There are no Services</EmptyState>
        )}
      </ServiceCard>

      <ServiceCard
        title="Recurring Services"
        action={
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit recurring services"
            className={cx('grid size-9 place-items-center rounded-md text-brand hover:bg-brand-soft', focusRing)}
          >
            <PencilIcon size={18} />
          </button>
        }
      >
        {services.recurring.length ? (
          <ul>
            {services.recurring.map((id) => {
              const name = serviceName(id);
              return (
                <li key={id} className={rowClass}>
                  <span className="text-[1.0625rem] text-ink">{name}</span>
                  <span className="shrink-0 rounded bg-[#fdf3e2] px-2 py-0.5 text-[0.8125rem] text-[#8a8f98]">
                    {currentPeriod(serviceFrequency(name))}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>There are no Recurring Services</EmptyState>
        )}
      </ServiceCard>

      {editing && (
        <FormModal
          title="Recurring Services"
          fields={[
            {
              name: 'recurring',
              label: 'Services',
              type: 'multiselect',
              options: RECURRING_SERVICES.map((service) => ({ value: service.id, label: service.name })),
            },
          ]}
          initial={{ recurring: services.recurring }}
          onSubmit={({ recurring }) => {
            dispatch({ type: 'recurring', ids: recurring });
            recurring
              .filter((id) => !services.availed.includes(id))
              .forEach((id) => dispatch({ type: 'availed', id }));
            setEditing(false);
            notify('Recurring services updated.');
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
