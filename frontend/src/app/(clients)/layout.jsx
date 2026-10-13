/**
 * Clients module (Clients list, New Client, Client Dashboard, Renewals).
 * Its look (font, page background, 80% desktop scale) is scoped to this
 * wrapper so the rest of the app is untouched; see styles/clients.css.
 */
export default function ClientsModuleLayout({ children }) {
  return (
    <div className="clients-module">
      <div className="px-4 pb-12 pt-5 sm:px-6 lg:px-[2.875rem]">{children}</div>
    </div>
  );
}
