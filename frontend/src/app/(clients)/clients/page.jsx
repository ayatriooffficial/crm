import { Suspense } from 'react';
import ClientsList from '@/components/clients/list/ClientsList';
import { CLIENT_GROUPS } from '@/data/groups';

export const metadata = {
  title: 'Clients',
};

const GROUP_LABELS = Object.fromEntries(CLIENT_GROUPS.map((group) => [group.value, group.label]));

export default function ClientsPage() {
  // useSearchParams (header search → ?q=) needs a Suspense boundary for static rendering.
  return (
    <Suspense>
      <ClientsList groupLabels={GROUP_LABELS} />
    </Suspense>
  );
}
