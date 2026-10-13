/** Placeholder firm logo ("CA India") shown on the account button and firm notifications. */
export default function FirmLogo({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <text x="20" y="22" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1f5fb8" fontFamily="sans-serif">
        CA
      </text>
      <path d="M22.5 13.5 27 10" stroke="#22a05a" strokeWidth="2" strokeLinecap="round" />
      <text x="20" y="29" textAnchor="middle" fontSize="4.5" fill="#1f5fb8" fontFamily="sans-serif" letterSpacing="0.6">
        INDIA
      </text>
    </svg>
  );
}
