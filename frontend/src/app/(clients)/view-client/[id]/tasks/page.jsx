import TasksTab from '@/components/clients/dashboard/tabs/TasksTab';

/** ?service= and ?status= pre-filter the list (used by the Services tab and the Details stats). */
export default async function ClientTasksPage({ searchParams }) {
  const { service = '', status = '' } = await searchParams;
  return <TasksTab key={`${service}|${status}`} initialService={service} initialStatus={status} />;
}
