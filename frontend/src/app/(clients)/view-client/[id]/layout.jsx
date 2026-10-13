import { notFound } from 'next/navigation';
import ClientDashboardProvider from '@/components/clients/dashboard/ClientDashboardProvider';
import ClientDashboardShell from '@/components/clients/dashboard/ClientDashboardShell';
import { findClient } from '@/data/clientDashboard';
import { CLIENTS } from '@/data/clients';

export function generateStaticParams() {
  return CLIENTS.map((client) => ({ id: client.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const client = findClient(id);
  return { title: client ? `${client.name} | Client Dashboard` : 'Client not found' };
}

/** Client Dashboard: shared header, name card and tabs; each tab is a nested route. */
export default async function ClientDashboardLayout({ params, children }) {
  const { id } = await params;
  if (!findClient(id)) notFound();

  return (
    <ClientDashboardProvider key={id} clientId={id}>
      <ClientDashboardShell>{children}</ClientDashboardShell>
    </ClientDashboardProvider>
  );
}
