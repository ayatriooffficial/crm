import ClientForm from '@/components/clients/ClientForm';
import ClientBreadcrumb from '@/components/clients/ClientBreadcrumb';

export const metadata = {
  title: 'New Client',
};

export default function NewClientPage() {
  // The breadcrumb is rendered on the server and slotted into the client form.
  return <ClientForm breadcrumb={<ClientBreadcrumb />} />;
}
