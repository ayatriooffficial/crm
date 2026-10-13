/*
 * Inline SVG icon set (no icon package). All outline icons share a
 * 24×24 grid and inherit `currentColor`, so colour is set with Tailwind
 * text utilities at the call site.
 */

/** Icon sizes are given in px at 16px root and emitted as rem so they scale. */
const toRem = (px) => `${px / 16}rem`;

function Svg({ size = 20, strokeWidth = 1.5, className, children, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: toRem(size), height: toRem(size) }}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---------- Header & generic ---------- */

export const MenuIcon = (p) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg strokeWidth={2} {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Svg>
);

export const ClockIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M18 9.5a6 6 0 1 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 16 18 9.5Z" />
    <path d="M10 21a2.2 2.2 0 0 0 4 0" />
  </Svg>
);

export const HelpIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.6-2.8 4.2" />
    <path d="M12 17.6v.1" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ArrowLeftIcon = (p) => (
  <Svg {...p}>
    <path d="M19 12H5m6-6-6 6 6 6" />
  </Svg>
);

export const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M16 3v4M8 3v4M3.5 10.5h17" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const CheckCircleIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.5 2.7 2.7L16 9.8" />
  </Svg>
);

/** Filled pencil used on the photo "edit" button. */
export const PencilIcon = ({ size = 20, className }) => (
  <svg viewBox="0 0 24 24" style={{ width: toRem(size), height: toRem(size) }} aria-hidden="true" focusable="false" className={className}>
    <path
      fill="currentColor"
      d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25Zm17.7-10.2a1 1 0 0 0 0-1.42l-2.33-2.33a1 1 0 0 0-1.42 0L15.13 5.1l3.75 3.75 1.83-1.8Z"
    />
  </svg>
);

/** Large grey picture placeholder shown in the empty photo box. */
export const ImagePlaceholder = ({ className }) => (
  <svg viewBox="0 0 100 88" aria-hidden="true" focusable="false" className={className} style={{ width: toRem(100), height: toRem(88) }}>
    <rect x="0" y="0" width="100" height="88" rx="10" fill="#cfd4da" />
    <rect x="7" y="7" width="86" height="74" rx="4" fill="#f5f6f8" />
    <circle cx="29" cy="28" r="9" fill="#cfd4da" />
    <path d="M7 72 34 48l15 12 21-21 23 22v16a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4Z" fill="#cfd4da" />
  </svg>
);

export const KebabIcon = (p) => (
  <Svg strokeWidth={2.5} {...p}>
    <path d="M12 5.5v.01M12 12v.01M12 18.5v.01" />
  </Svg>
);

export const RefreshIcon = (p) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v4.5h-4.5" />
  </Svg>
);

export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </Svg>
);

export const SortIcon = (p) => (
  <Svg {...p}>
    <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />
  </Svg>
);

export const BookIcon = (p) => (
  <Svg {...p}>
    <path d="M3 5.5c3-1.5 6-1.5 9 .5 3-2 6-2 9-.5v13c-3-1.5-6-1.5-9 .5-3-2-6-2-9-.5Z" />
    <path d="M12 6v13.5M5.5 9h3.5M5.5 12h3.5M15 9h3.5M15 12h3.5" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);

export const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20.5a7 7 0 0 1 14 0" />
  </Svg>
);

export const GlobeIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z" />
  </Svg>
);

export const ExternalLinkIcon = (p) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Svg>
);

export const FileSearchIcon = (p) => (
  <Svg {...p}>
    <path d="M13 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21H11" />
    <path d="M13 3v4.5h4.5L13 3M17.5 7.5V11M8 9h3M8 12.5h5" />
    <circle cx="16" cy="16" r="3" />
    <path d="m18.2 18.2 2.3 2.3" />
  </Svg>
);

/** Solid phone handset (blue in the original). */
export const PhoneIcon = ({ size = 18, className }) => (
  <svg viewBox="0 0 24 24" style={{ width: toRem(size), height: toRem(size) }} aria-hidden="true" focusable="false" className={className}>
    <path
      fill="currentColor"
      d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z"
    />
  </svg>
);

/** WhatsApp glyph (green outline). */
export const WhatsAppIcon = ({ size = 18, className }) => (
  <svg viewBox="0 0 24 24" style={{ width: toRem(size), height: toRem(size) }} aria-hidden="true" focusable="false" className={className}>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.2Z"
    />
    <path
      fill="currentColor"
      d="M9.1 7.6c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.5l-.5.6c-.1.1-.2.3 0 .5a6 6 0 0 0 2.9 2.5c.2.1.4.1.5-.1l.6-.8c.2-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.3 0 .5-.2 1.2-.8 1.5-.5.3-1.4.5-3.1-.2a9 9 0 0 1-3.8-3.5c-.6-1-.6-1.8-.3-2.4.3-.6.7-1 1-1Z"
    />
  </svg>
);

/** Grey person silhouette used as the default client avatar. */
export const AvatarPlaceholder = ({ className }) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
    <circle cx="32" cy="32" r="32" fill="#e3e6ea" />
    <circle cx="32" cy="25" r="11" fill="#c5cad1" />
    <path d="M11 54a21 21 0 0 1 42 0 31.8 31.8 0 0 1-42 0Z" fill="#c5cad1" />
  </svg>
);

/* ---------- Client dashboard ---------- */

export const ChevronLeftIcon = (p) => (
  <Svg {...p}>
    <path d="m15 6-6 6 6 6" />
  </Svg>
);

export const FirstPageIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6v12M17 6l-6 6 6 6" />
  </Svg>
);

export const LastPageIcon = (p) => (
  <Svg {...p}>
    <path d="M18 6v12M7 6l6 6-6 6" />
  </Svg>
);

export const CopyIcon = (p) => (
  <Svg {...p}>
    <rect x="8" y="8" width="12" height="13" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" />
  </Svg>
);

export const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = (p) => (
  <Svg {...p}>
    <path d="M9.9 5.2A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.5M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Svg>
);

export const DownloadIcon = (p) => (
  <Svg {...p}>
    <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />
  </Svg>
);

export const UploadIcon = (p) => (
  <Svg {...p}>
    <path d="M12 16V4m-5 5 5-5 5 5M5 20h14" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2l1-12M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
  </Svg>
);

export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.6v.1" />
  </Svg>
);

export const RepeatIcon = (p) => (
  <Svg {...p}>
    <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L20 9.5M20 4.5v5h-5M19.5 12a7.5 7.5 0 0 1-13 5.1L4 14.5M4 19.5v-5h5" />
  </Svg>
);

export const FileIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5" />
  </Svg>
);

export const FolderIcon = (p) => (
  <Svg {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </Svg>
);

/* ---------- Sidebar ---------- */

const DashboardIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M10 4v16M10 12h10" />
  </Svg>
);

const TasksIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7.5Z" />
    <path d="M14 3v4.5h4.5M9.5 14l2 2 3.5-4" />
  </Svg>
);

const TodoIcon = (p) => (
  <Svg {...p}>
    <path d="M4 5.5h4v4H4zM4 15h4" />
    <path d="M11.5 6.5H20M11.5 12H20M11.5 17.5H20" />
  </Svg>
);

const ClientsIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20.5a7 7 0 0 1 14 0" />
  </Svg>
);

const RetainersIcon = (p) => (
  <Svg {...p}>
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </Svg>
);

const ServicesIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </Svg>
);

const FinanceIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 8h6M9 11h6M10 8a3 3 0 0 1 0 6H9l4.5 3.5" />
  </Svg>
);

const AttendanceIcon = (p) => (
  <Svg {...p}>
    <path d="M20 11V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
    <path d="M16 3v4M8 3v4M4 11h16" />
    <path d="m19.2 14.3 1.5 1.5-4.6 4.7H14.5v-1.6Z" />
  </Svg>
);

const RenewalsIcon = (p) => (
  <Svg {...p}>
    <path d="M20 10.5V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
    <path d="M16 3v4M8 3v4M4 11h16" />
    <path d="M20.5 17.5a3 3 0 1 1-1-2.2M20.5 14v1.8h-1.8" />
  </Svg>
);

const DocumentsIcon = (p) => (
  <Svg {...p}>
    <path d="M8.5 6.5V5a2 2 0 0 1 2-2H18a2 2 0 0 1 2 2v11.5a2 2 0 0 1-2 2h-1.5" />
    <rect x="4" y="6.5" width="12.5" height="14.5" rx="2" />
  </Svg>
);

const ReportsIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7.5Z" />
    <path d="M14 3v4.5h4.5M9.5 17v-2M12 17v-4M14.5 17v-6" />
  </Svg>
);

const UsersIcon = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <circle cx="12" cy="10" r="2.5" />
    <path d="M8 16.5a4 4 0 0 1 8 0" />
  </Svg>
);

export const SendIcon = (p) => (
  <Svg {...p}>
    <path d="M21 3 3 10.5l7 3 3 7.5Z" />
    <path d="M10 13.5 21 3" />
  </Svg>
);

export const SettingsIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Svg>
);

/** Lookup used by the data-driven sidebar (`icon` key → component). */
export const NAV_ICONS = {
  dashboard: DashboardIcon,
  tasks: TasksIcon,
  todo: TodoIcon,
  clients: ClientsIcon,
  retainers: RetainersIcon,
  services: ServicesIcon,
  finance: FinanceIcon,
  attendance: AttendanceIcon,
  renewals: RenewalsIcon,
  timesheet: ClockIcon,
  documents: DocumentsIcon,
  reports: ReportsIcon,
  users: UsersIcon,
  send: SendIcon,
  settings: SettingsIcon,
  website: GlobeIcon,
};
