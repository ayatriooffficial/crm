import RenewalsList from '@/components/renewals/RenewalsList';

export const metadata = {
  title: 'Renewals',
};

/** `?client=<id>` pre-selects the client (the Client Dashboard's Renewals tab links here). */
export default async function RenewalsPage({ searchParams }) {
  const { client = '' } = await searchParams;
  return <RenewalsList key={client} initialClient={String(client).split(':')[0]} />;
}
