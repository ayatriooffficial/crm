'use client';

import { useMemo, useState } from 'react';
import Select from '@/components/ui/Select';
import { CalendarIcon } from '@/components/icons';
import { focusRing } from '@/components/ui/styles';
import { cx } from '@/lib/cx';
import { TASK_STATUSES, TEAM_USERS_LABELS, TODAY, addDays, currentPeriod, serviceFrequency, serviceName } from '@/data/clientDashboard';
import { newId, useClientDashboard } from '../ClientDashboardProvider';
import {
  ApplyButton,
  EmptyState,
  FilterArea,
  FilterLabel,
  FormModal,
  NewButton,
  Pager,
  Panel,
  Pill,
  RefreshButton,
  STATUS_TONE,
  Table,
  formatDate,
  tdClass,
  usePaging,
} from '../parts';

const DATE_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3', label: 'Last 3 Months' },
  { value: 'this-fy', label: 'This Financial Year' },
];

const TASK_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'task', label: 'Tasks' },
  { value: 'subtask', label: 'Subtasks' },
];

const [Y, M] = TODAY.split('-').map(Number);
const monthStart = (offset) => {
  const index = Y * 12 + (M - 1) + offset;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}-01`;
};

function inRange(date, range) {
  switch (range) {
    case 'this-month':
      return date >= monthStart(0) && date < monthStart(1);
    case 'last-month':
      return date >= monthStart(-1) && date < monthStart(0);
    case 'last-3':
      return date >= monthStart(-2) && date <= TODAY;
    case 'this-fy':
      return date >= `${M >= 4 ? Y : Y - 1}-04-01`;
    default:
      return true;
  }
}

const EMPTY = { range: 'all', service: '', status: '', kind: 'all' };

export default function TasksTab({ initialService = '', initialStatus = '' }) {
  const { data, dispatch, notify } = useClientDashboard();
  const start = { ...EMPTY, service: initialService, status: initialStatus };
  const [draft, setDraft] = useState(start);
  const [filters, setFilters] = useState(start);
  const [dialog, setDialog] = useState(null);

  const serviceOptions = useMemo(
    () => data.services.availed.map((id) => ({ value: id, label: serviceName(id) })),
    [data.services.availed],
  );
  const statusOptions = TASK_STATUSES.map((status) => ({ value: status, label: status }));
  const userOptions = TEAM_USERS_LABELS;

  const rows = useMemo(
    () =>
      data.tasks.filter(
        (task) =>
          inRange(task.date, filters.range) &&
          (!filters.service || task.serviceId === filters.service) &&
          (!filters.status || task.status === filters.status) &&
          (filters.kind === 'all' || task.kind === filters.kind),
      ),
    [data.tasks, filters],
  );
  const paging = usePaging(rows, 20);

  const setDraftField = (value, name) => setDraft((current) => ({ ...current, [name]: value }));

  const save = (values) => {
    const completed = values.status === 'Completed' ? dialog.completed || TODAY : '';
    if (dialog.id) {
      dispatch({
        type: 'update',
        key: 'tasks',
        id: dialog.id,
        patch: { status: values.status, target: values.target, due: values.due, users: values.users, completed },
      });
      notify('Task updated.');
    } else {
      const name = serviceName(values.serviceId);
      dispatch({
        type: 'add',
        key: 'tasks',
        prepend: true,
        item: {
          id: newId('t'),
          kind: 'task',
          date: TODAY,
          serviceId: values.serviceId,
          serviceName: name,
          period: currentPeriod(serviceFrequency(name)),
          title: values.title.trim() || name,
          due: values.due,
          target: values.target,
          completed,
          users: values.users,
          status: values.status,
          billed: false,
        },
      });
      notify('Task created.');
    }
    setDialog(null);
  };

  const fields = dialog?.id
    ? [
        { name: 'status', label: 'Status', type: 'select', options: TASK_STATUSES, required: true },
        { name: 'due', label: 'Due Date', type: 'date' },
        { name: 'target', label: 'Target Date', type: 'date' },
        { name: 'users', label: 'Users', type: 'multiselect', options: userOptions },
      ]
    : [
        { name: 'serviceId', label: 'Service', type: 'select', options: serviceOptions, required: true, wide: true },
        { name: 'title', label: 'Task Name', placeholder: 'Defaults to the service name', wide: true },
        { name: 'due', label: 'Due Date', type: 'date', required: true },
        { name: 'target', label: 'Target Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: TASK_STATUSES, required: true },
        { name: 'users', label: 'Users', type: 'multiselect', options: userOptions },
      ];

  return (
    <Panel className="px-5 py-9 sm:px-[2.375rem]">
      <FilterArea>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-[1.45fr_1.1fr_1.1fr_0.9fr]">
          <div>
            <FilterLabel>Date</FilterLabel>
            <Select
              name="range"
              options={DATE_RANGES}
              value={draft.range}
              onChange={setDraftField}
              prefix={<CalendarIcon size={22} />}
              aria-label="Date"
            />
          </div>
          <div>
            <FilterLabel>Service</FilterLabel>
            <Select name="service" options={serviceOptions} value={draft.service} onChange={setDraftField} searchable separator aria-label="Service" />
          </div>
          <div>
            <FilterLabel>Status</FilterLabel>
            <Select name="status" options={statusOptions} value={draft.status} onChange={setDraftField} separator aria-label="Status" />
          </div>
          <div>
            <FilterLabel>Task Type</FilterLabel>
            <Select name="kind" options={TASK_TYPES} value={draft.kind} onChange={setDraftField} placeholder="" aria-label="Task Type" />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-2.5">
          <RefreshButton
            onClick={() => {
              setDraft(EMPTY);
              setFilters(EMPTY);
              paging.setPage(1);
            }}
          />
          <ApplyButton
            onClick={() => {
              setFilters(draft);
              paging.setPage(1);
            }}
          />
          <NewButton onClick={() => setDialog({})} />
        </div>
      </FilterArea>

      <div className="mt-8">
        <Table head={['Date', 'Task', 'Due Date', 'Target Date', 'Completed On', 'Users', 'Status']} minWidth="58rem">
          {paging.pageRows.map((task) => (
            <tr key={task.id} className="border-b border-divider">
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(task.date)}</td>
              <td className={cx(tdClass, 'min-w-[13rem] max-w-[18rem] py-2.5')}>
                {task.kind === 'subtask' && (
                  <div className="text-sm leading-5 text-muted">
                    {task.serviceName} - {task.period}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setDialog(task)}
                  className={cx('rounded text-left leading-[1.375rem] text-brand hover:underline', focusRing)}
                >
                  {task.title}
                </button>
                {task.kind === 'task' && <div className="leading-[1.375rem] text-ink">{task.period}</div>}
              </td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(task.due)}</td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(task.target)}</td>
              <td className={cx(tdClass, 'whitespace-nowrap')}>{formatDate(task.completed)}</td>
              <td className={cx(tdClass, 'max-w-[10rem] text-[0.9375rem]')}>{task.users.join(', ')}</td>
              <td className={tdClass}>
                <Pill tone={STATUS_TONE[task.status]}>{task.status}</Pill>
              </td>
            </tr>
          ))}
        </Table>
        {!rows.length && <EmptyState>There are no Tasks</EmptyState>}
        <Pager paging={paging} />
      </div>

      {dialog && (
        <FormModal
          title={dialog.id ? `${dialog.title} · ${dialog.period}` : 'New Task'}
          fields={fields}
          initial={dialog.id ? dialog : { status: 'Pending', due: addDays(TODAY, 15) }}
          submitLabel={dialog.id ? 'Update' : 'Create'}
          onSubmit={save}
          onClose={() => setDialog(null)}
        />
      )}
    </Panel>
  );
}
